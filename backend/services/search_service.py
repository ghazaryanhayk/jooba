import asyncio
import logging

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from clients.crustdata_client import crustdata_client
from core import cache
from db.models.candidate import Candidate
from db.models.search import Search, SearchStatus
from db.models.search_candidate import SearchCandidate
from db.session import AsyncSessionLocal
from schemas.candidate import CandidateSchema
from schemas.search import SearchFilters, SearchRequest, SearchResponse

logger = logging.getLogger(__name__)

RATE_LIMIT_SLEEP = 1.0


async def search(request: SearchRequest) -> SearchResponse:
    cache_key = cache.make_key('search', request.model_dump())
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    candidates, total_count, cursor = await crustdata_client.search_candidates(
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


async def _persist_candidates(
    db: AsyncSession,
    search_id: str,
    candidates_data: list[CandidateSchema],
) -> None:
    candidate_rows = [
        Candidate(
            name=c.name,
            title=c.title,
            company=c.company,
            headline=c.headline,
            summary=c.summary,
            avatar_url=c.avatar_url,
        )
        for c in candidates_data
    ]
    db.add_all(candidate_rows)
    await db.flush()

    db.add_all([
        SearchCandidate(search_id=search_id, candidate_id=row.id)
        for row in candidate_rows
    ])
    await db.commit()


async def run_background_search(search_id: str, filters: SearchFilters) -> None:
    async with AsyncSessionLocal() as db:
        try:
            cursor: str | None = None
            while True:
                status_result = await db.execute(select(Search.status).where(Search.id == search_id))
                current_status = status_result.scalar_one()
                if current_status != SearchStatus.running:
                    return

                candidates, _total_count, next_cursor = await crustdata_client.search_candidates(
                    filters, preview_only=False, cursor=cursor,
                )
                if candidates:
                    await _persist_candidates(db, search_id, candidates)

                cursor = next_cursor
                if not cursor:
                    break

                await asyncio.sleep(RATE_LIMIT_SLEEP)

            await db.execute(
                update(Search).where(Search.id == search_id).values(status=SearchStatus.completed)
            )
            await db.commit()

        except Exception:
            logger.exception('Background search %s failed', search_id)
            await db.execute(
                update(Search).where(Search.id == search_id).values(status=SearchStatus.failed)
            )
            await db.commit()
