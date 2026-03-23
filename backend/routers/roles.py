from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.candidate import Candidate
from db.models.role import Role
from db.models.search import Search, SearchStatus
from db.models.search_candidate import SearchCandidate
from db.session import get_db
from schemas.candidate import CandidateSchema
from schemas.role import CreateRoleRequest, RoleCandidatesResponse, RoleFiltersResponse, RoleSchema, RolesResponse, RunSearchRequest, RunSearchResponse, SearchStatusResponse
from services import search_service

router = APIRouter(prefix='/roles', tags=['roles'])


@router.get('', response_model=RolesResponse)
async def list_roles(db: AsyncSession = Depends(get_db)) -> RolesResponse:
    result = await db.execute(select(Role))
    return RolesResponse(roles=[RoleSchema(id=r.id, name=r.name) for r in result.scalars()])


@router.post('', response_model=RoleSchema, status_code=201)
async def create_role(request: CreateRoleRequest, db: AsyncSession = Depends(get_db)) -> RoleSchema:
    role = Role(name=request.name)
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return RoleSchema(id=role.id, name=role.name)


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

    background_tasks.add_task(search_service.run_background_search, search.id, request.filters)

    return RunSearchResponse(
        search_id=search.id,
        status=SearchStatus.running.value,
    )


@router.post('/{role_id}/searches/{search_id}/stop', response_model=SearchStatusResponse)
async def stop_search(
    role_id: str,
    search_id: str,
    db: AsyncSession = Depends(get_db),
) -> SearchStatusResponse:
    result = await db.execute(
        select(Search).where(Search.id == search_id, Search.role_id == role_id)
    )
    search = result.scalar_one_or_none()
    if search is None:
        raise HTTPException(status_code=404, detail='Search not found')
    if search.status != SearchStatus.running:
        return SearchStatusResponse(status=search.status.value)
    await db.execute(
        update(Search).where(Search.id == search_id).values(status=SearchStatus.stopped)
    )
    await db.commit()
    return SearchStatusResponse(status=SearchStatus.stopped.value)


@router.get('/{role_id}/searches/{search_id}/status', response_model=SearchStatusResponse)
async def get_search_status(
    role_id: str,
    search_id: str,
    db: AsyncSession = Depends(get_db),
) -> SearchStatusResponse:
    result = await db.execute(
        select(Search).where(Search.id == search_id, Search.role_id == role_id)
    )
    search = result.scalar_one_or_none()
    if search is None:
        raise HTTPException(status_code=404, detail='Search not found')
    return SearchStatusResponse(status=search.status.value)


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
