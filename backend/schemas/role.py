from pydantic import BaseModel

from schemas.candidate import CandidateSchema
from schemas.search import SearchFilters, SearchResponse


class RunSearchRequest(BaseModel):
    filters: SearchFilters


class RunSearchResponse(SearchResponse):
    search_id: str


class RoleCandidatesResponse(BaseModel):
    candidates: list[CandidateSchema]
    search_id: str
