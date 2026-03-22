from pydantic import BaseModel

from schemas.search import SearchFilters, SearchResponse


class RunSearchRequest(BaseModel):
    filters: SearchFilters


class RunSearchResponse(SearchResponse):
    search_id: str
