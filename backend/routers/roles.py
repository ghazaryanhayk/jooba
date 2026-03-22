import asyncio
import logging
from math import ceil

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from clients.crustdata_client import crustdata_client
from db.models.candidate import Candidate
from db.models.role import Role
from db.models.search import Search, SearchStatus
from db.models.search_candidate import SearchCandidate
from db.session import AsyncSessionLocal, get_db
from schemas.candidate import CandidateSchema
from schemas.role import RoleCandidatesResponse, RoleFiltersResponse, RoleSchema, RolesResponse, RunSearchRequest, RunSearchResponse
from schemas.search import SearchFilters

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/roles', tags=['roles'])

PAGE_SIZE = 20
MAX_CONCURRENCY = 10
BATCH_SLEEP_SECONDS = 10


@router.get('', response_model=RolesResponse)
async def list_roles(db: AsyncSession = Depends(get_db)) -> RolesResponse:
    result = await db.execute(select(Role))
    return RolesResponse(roles=[RoleSchema(id=r.id, name=r.name) for r in result.scalars()])


@router.post('/{role_id}/searches/run', response_model=RunSearchResponse)
async def run_full_search(
    role_id: str,
    request: RunSearchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> RunSearchResponse:
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if role is None:
        raise HTTPException(status_code=404, detail='Role not found')

    await db.execute(
        update(Role).where(Role.id == role_id).values(filters=request.filters.model_dump(by_alias=True))
    )

    search = Search(role_id=role_id, status=SearchStatus.running)
    db.add(search)
    await db.commit()

    background_tasks.add_task(_background_full_search, search.id, request.filters)

    return RunSearchResponse(
        search_id=search.id,
        status=SearchStatus.running.value,
    )

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


async def _background_full_search(search_id: str, filters: SearchFilters) -> None:
    async with AsyncSessionLocal() as db:
        try:
            candidates, total_count = await crustdata_client.search_candidates(
                filters, preview_only=False, page=1,
            )
            print(f'Found {total_count} candidates')
            await _persist_candidates(db, search_id, candidates)

            total_pages = ceil(total_count / PAGE_SIZE)
            print(f'Total pages: {total_pages}')
            if total_pages <= 1:
                await db.execute(
                    update(Search).where(Search.id == search_id).values(status=SearchStatus.completed)
                )
                await db.commit()
                return

            semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

            async def _fetch_page(page: int) -> list[CandidateSchema]:
                print(f'Fetching page {page}')
                async with semaphore:
                    result, _ = await crustdata_client.search_candidates(
                        filters, preview_only=False, page=page,
                    )
                    print(f'Found {len(result)} candidates on page {page}')
                    return result

            remaining_pages = list(range(2, total_pages + 1))
            print(f'Remaining pages: {remaining_pages}')
            for batch_start in range(0, len(remaining_pages), MAX_CONCURRENCY):
                batch = remaining_pages[batch_start:batch_start + MAX_CONCURRENCY]
                results = await asyncio.gather(*[_fetch_page(p) for p in batch])

                all_candidates: list[CandidateSchema] = []
                for page_candidates in results:
                    all_candidates.extend(page_candidates)

                if all_candidates:
                    await _persist_candidates(db, search_id, all_candidates)

                if batch_start + MAX_CONCURRENCY < len(remaining_pages):
                    await asyncio.sleep(BATCH_SLEEP_SECONDS)

                print(f'Batch {batch_start} completed')

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


@router.get('/{role_id}/filters', response_model=RoleFiltersResponse)
async def get_role_filters(
    role_id: str,
    db: AsyncSession = Depends(get_db),
) -> RoleFiltersResponse:
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if role is None:
        raise HTTPException(status_code=404, detail='Role not found')
    return RoleFiltersResponse(filters=role.filters)


@router.get('/{role_id}/candidates', response_model=RoleCandidatesResponse)
async def get_role_candidates(
    role_id: str,
    db: AsyncSession = Depends(get_db),
) -> RoleCandidatesResponse:
    role_result = await db.execute(select(Role).where(Role.id == role_id))
    if role_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail='Role not found')

    search_result = await db.execute(
        select(Search)
        .where(Search.role_id == role_id, Search.status == SearchStatus.completed)
        .order_by(Search.created_at.desc())
        .limit(1)
    )
    search = search_result.scalar_one_or_none()
    if search is None:
        raise HTTPException(status_code=404, detail='No completed search found for this role')

    candidates_result = await db.execute(
        select(Candidate)
        .join(SearchCandidate, SearchCandidate.candidate_id == Candidate.id)
        .where(SearchCandidate.search_id == search.id)
    )
    candidate_rows = candidates_result.scalars().all()

    return RoleCandidatesResponse(
        search_id=search.id,
        candidates=[
            CandidateSchema(
                name=row.name,
                title=row.title,
                company=row.company,
                headline=row.headline,
                summary=row.summary,
                avatar_url=row.avatar_url,
            )
            for row in candidate_rows
        ],
    )
