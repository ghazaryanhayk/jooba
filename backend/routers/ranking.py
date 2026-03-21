from fastapi import APIRouter, HTTPException

from schemas.ranking import RankingRequest, RankingResponse
from services import ranking_service

router = APIRouter(prefix='/ranking', tags=['ranking'])


@router.post('/run', response_model=RankingResponse)
async def run_ranking(request: RankingRequest) -> RankingResponse:
    try:
        return await ranking_service.rank(request)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
