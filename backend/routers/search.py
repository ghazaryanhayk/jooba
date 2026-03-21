from fastapi import APIRouter, HTTPException

from schemas.search import SearchRequest, SearchResponse
from services import search_service

router = APIRouter(prefix='/search', tags=['search'])


@router.post('', response_model=SearchResponse)
async def run_search(request: SearchRequest) -> SearchResponse:
    try:
        return await search_service.search(request)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
