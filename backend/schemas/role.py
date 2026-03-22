from pydantic import BaseModel

from schemas.candidate import CandidateSchema
from schemas.search import SearchFilters


class RoleSchema(BaseModel):
    id: str
    name: str


class RolesResponse(BaseModel):
    roles: list[RoleSchema]


class RunSearchRequest(BaseModel):
    filters: SearchFilters


class RunSearchResponse(BaseModel):
    search_id: str
    status: str


class SearchStatusResponse(BaseModel):
    status: str


class RoleCandidatesResponse(BaseModel):
    candidates: list[CandidateSchema]
    search_id: str


class RoleFiltersResponse(BaseModel):
    filters: dict | None
