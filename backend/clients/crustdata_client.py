import httpx

from core.config import settings
from schemas.candidate import CandidateSchema
from schemas.search import SearchFilters

CRUSTDATA_BASE_URL = 'https://api.crustdata.com'


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

    if filters.title:
        conditions.append({'column': 'current_employers.title', 'type': '(.)', 'value': filters.title})
    if filters.country:
        conditions.append({'column': 'location_details.country', 'type': '=', 'value': filters.country})
    if filters.state:
        conditions.append({'column': 'location_details.state', 'type': '=', 'value': filters.state})
    if filters.city:
        conditions.append({'column': 'location_details.city', 'type': '=', 'value': filters.city})
    if filters.skills:
        conditions.append({'column': 'skills', 'type': 'in', 'value': filters.skills})
    if filters.keywords:
        conditions.append({'column': 'headline', 'type': '(.)', 'value': ' '.join(filters.keywords)})
    if filters.company_name:
        conditions.append({'column': 'current_employers.name', 'type': '(.)', 'value': filters.company_name})
    if filters.recently_changed_jobs is not None:
        conditions.append({'column': 'recently_changed_jobs', 'type': '=', 'value': filters.recently_changed_jobs})

    return {
        'filters': {'op': 'and', 'conditions': conditions},
        'page': 1,
        'preview': True,
    }


def _map_candidate(profile: dict) -> CandidateSchema:
    employer = (profile.get('current_employers') or [{}])[0]
    return CandidateSchema(
        name=profile.get('name', ''),
        title=employer.get('title', ''),
        company=employer.get('name', ''),
        bio=profile.get('headline') or profile.get('region', ''),
        avatar_url=profile.get('profile_picture_url'),
    )


crustdata_client = CrustDataClient()
