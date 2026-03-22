from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from clients.crustdata_client import crustdata_client
from db.models.candidate import Candidate
from db.models.role import Role
from db.models.search import Search, SearchStatus
from db.models.search_candidate import SearchCandidate
from db.session import get_db
from schemas.candidate import CandidateSchema
from schemas.role import RoleCandidatesResponse, RoleSchema, RolesResponse, RunSearchRequest, RunSearchResponse

router = APIRouter(prefix='/roles', tags=['roles'])

MAX_CANDIDATES = 20


@router.get('', response_model=RolesResponse)
async def list_roles(db: AsyncSession = Depends(get_db)) -> RolesResponse:
    result = await db.execute(select(Role))
    return RolesResponse(roles=[RoleSchema(id=r.id, name=r.name) for r in result.scalars()])


@router.post('/{role_id}/searches/run', response_model=RunSearchResponse)
async def run_full_search(
    role_id: str,
    request: RunSearchRequest,
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
    await db.flush()

    try:
        candidates_data, total_count = await crustdata_client.search_candidates(
            request.filters,
            preview_only=False,
        )
    except Exception as exc:
        search.status = SearchStatus.failed
        await db.commit()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    candidates_data = candidates_data[:MAX_CANDIDATES]

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
        SearchCandidate(search_id=search.id, candidate_id=row.id)
        for row in candidate_rows
    ])

    search.status = SearchStatus.completed
    await db.commit()

    response_candidates = [
        CandidateSchema(
            name=row.name,
            title=row.title,
            company=row.company,
            headline=row.headline,
            summary=row.summary,
            avatar_url=row.avatar_url,
        )
        for row in candidate_rows
    ]

    return RunSearchResponse(
        search_id=search.id,
        candidates=response_candidates,
        preview_count=len(response_candidates),
        total_count=total_count,
    )


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
