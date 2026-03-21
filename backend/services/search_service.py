from core import cache
from clients.crustdata_client import crustdata_client
from schemas.search import SearchRequest, SearchResponse


async def search(request: SearchRequest) -> SearchResponse:
    cache_key = cache.make_key('search', request.model_dump())
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    candidates, total_count = await crustdata_client.search_candidates(
        filters=request.filters,
        preview_only=request.preview_only,
    )

    result = SearchResponse(
        candidates=candidates,
        preview_count=len(candidates),
        total_count=total_count,
    )

    cache.set(cache_key, result)
    return result
