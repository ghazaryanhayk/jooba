from pydantic import BaseModel

from schemas.candidate import CandidateSchema
from schemas.search import SearchFilters, SearchResponse


class RoleSchema(BaseModel):
    id: str
    name: str


class RolesResponse(BaseModel):
    roles: list[RoleSchema]


class RunSearchRequest(BaseModel):
    filters: SearchFilters


class RunSearchResponse(SearchResponse):
    search_id: str


class RoleCandidatesResponse(BaseModel):
    candidates: list[CandidateSchema]
    search_id: str
