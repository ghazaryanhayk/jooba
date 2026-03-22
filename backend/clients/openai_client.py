from openai import AsyncOpenAI
from pydantic import BaseModel

from core.config import settings
from schemas.candidate import ApprovalStatus, CandidateSchema, Tier


class _RankedItem(BaseModel):
    name: str
    tier: Tier
    approved: bool
    reason: str


class _RankingOutput(BaseModel):
    ranked: list[_RankedItem]


class OpenAIClient:
    def __init__(self) -> None:
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._model = settings.openai_model

    async def rank_candidates(
        self,
        candidates: list[CandidateSchema],
        general_intuition: str = '',
        must_haves: list[str] | None = None,
        nice_to_haves: list[str] | None = None,
    ) -> list[CandidateSchema]:
        if not candidates:
            return []

        must_haves = must_haves or []
        nice_to_haves = nice_to_haves or []

        criteria_parts: list[str] = []
        if general_intuition.strip():
            criteria_parts.append(f'General intuition: {general_intuition.strip()}')
        if must_haves:
            items = '\n'.join(f'  - {item}' for item in must_haves if item.strip())
            if items:
                criteria_parts.append(f'Must haves:\n{items}')
        if nice_to_haves:
            items = '\n'.join(f'  - {item}' for item in nice_to_haves if item.strip())
            if items:
                criteria_parts.append(f'Nice to haves:\n{items}')

        criteria_text = '\n\n'.join(criteria_parts) if criteria_parts else 'No specific criteria provided.'

        candidates_text = '\n'.join(
            f'{i + 1}. Name: {c.name} | Title: {c.title} | Company: {c.company} | Headline: {c.headline} | Summary: {c.summary}'
            for i, c in enumerate(candidates)
        )

        prompt = f"""You are a recruiting assistant. Rank the following candidates based on the given criteria.

Criteria:
{criteria_text}

Candidates:
{candidates_text}

For each candidate assign:
- tier: one of A, B, C, D, F (A = best fit, F = poor fit)
- approved: true if tier is A or B, false otherwise
- reason: one concise sentence explaining the tier assignment

Return results for ALL candidates in the same order."""

        response = await self._client.beta.chat.completions.parse(
            model=self._model,
            messages=[{'role': 'user', 'content': prompt}],
            response_format=_RankingOutput,
        )

        output: _RankingOutput = response.choices[0].message.parsed
        ranked_map = {item.name: item for item in output.ranked}

        result: list[CandidateSchema] = []
        for candidate in candidates:
            ranked_item = ranked_map.get(candidate.name)
            if ranked_item:
                result.append(
                    candidate.model_copy(
                        update={
                            'tier': ranked_item.tier,
                            'status': ApprovalStatus(
                                approved=ranked_item.approved,
                                reason=ranked_item.reason,
                            ),
                        }
                    )
                )
            else:
                result.append(candidate)

        return result


openai_client = OpenAIClient()
