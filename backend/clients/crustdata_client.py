import httpx

from core.config import settings
from schemas.candidate import CandidateSchema
from schemas.search import SearchFilters

CRUSTDATA_BASE_URL = 'https://api.crustdata.com'

_TITLE_OPERATOR_MAP = {
    'is': '=',
    'substring': '[.]',
    'fuzzy': '(.)',
    'is_not': '!=',
}

_COUNTRY_OPERATOR_MAP = {
    'is': '=',
    'is_not': '!=',
}


class CrustDataClient:
    def __init__(self) -> None:
        self._headers = {
            'Authorization': f'Token {settings.crustdata_api_key}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

    async def search_candidates(
        self,
        filters: SearchFilters,
        preview_only: bool = True,
    ) -> tuple[list[CandidateSchema], int]:
        payload = _build_search_payload(filters, preview_only)
        async with httpx.AsyncClient(base_url=CRUSTDATA_BASE_URL, timeout=30.0) as client:
            response = await client.post(
                '/screener/persondb/search',
                headers=self._headers,
                json=payload,
            )
            response.raise_for_status()

        data = response.json()
        candidates = [_map_candidate(p) for p in data.get('profiles', [])]
        total_count = data.get('total_count', len(candidates))

        return candidates, total_count


def _build_search_payload(filters: SearchFilters, preview_only: bool) -> dict:
    conditions: list[dict] = []

    title_conditions = [
        {
            'filter_type': 'current_employers.title' if row.timeframe == 'current' else 'employers.title',
            'type': _TITLE_OPERATOR_MAP[row.operator],
            'value': row.value,
        }
        for row in filters.title
        if row.value
    ]
    if len(title_conditions) == 1:
        conditions.append(title_conditions[0])
    elif len(title_conditions) > 1:
        conditions.append({'op': 'or', 'conditions': title_conditions})

    country_conditions = [
        {
            'filter_type': 'location_details.country',
            'type': _COUNTRY_OPERATOR_MAP[row.operator],
            'value': row.value,
        }
        for row in filters.country
        if row.value
    ]
    if len(country_conditions) == 1:
        conditions.append(country_conditions[0])
    elif len(country_conditions) > 1:
        conditions.append({'op': 'or', 'conditions': country_conditions})

    if filters.experience:
        exp = filters.experience
        if exp.from_:
            try:
                conditions.append({
                    'filter_type': 'years_of_experience_raw',
                    'type': '=>',
                    'value': int(exp.from_),
                })
            except ValueError:
                pass
        if exp.to:
            try:
                conditions.append({
                    'filter_type': 'years_of_experience_raw',
                    'type': '=<',
                    'value': int(exp.to),
                })
            except ValueError:
                pass

    return {
        'filters': {'op': 'and', 'conditions': conditions},
        'page': 1,
        'preview': 'true' if preview_only else 'false',
    }


def _map_candidate(profile: dict) -> CandidateSchema:
    employer = (profile.get('current_employers') or [{}])[0]
    return CandidateSchema(
        name=profile.get('name', ''),
        title=employer.get('title', ''),
        company=employer.get('name', ''),
        headline=profile.get('headline', ''),
        summary=profile.get('summary', ''),
        avatar_url=profile.get('profile_picture_permalink'),
    )


crustdata_client = CrustDataClient()
