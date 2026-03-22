from openai import AsyncOpenAI
from pydantic import BaseModel

from core.config import settings
from schemas.candidate import ApprovalStatus, CandidateSchema, Tier
from schemas.ranking import RankingCriteria


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
        criteria: list[RankingCriteria],
    ) -> list[CandidateSchema]:
        if not candidates:
            return []

        criteria_text = '\n'.join(
            f'- {c.description} (weight: {c.weight})' for c in criteria
        )

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

        response = await self._client.beta.parsers.parse(
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
