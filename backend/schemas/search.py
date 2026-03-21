from pydantic import BaseModel

from schemas.candidate import CandidateSchema


class SearchFilters(BaseModel):
    title: str | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None
    keywords: list[str] | None = None
    skills: list[str] | None = None
    languages: list[str] | None = None
    company_name: str | None = None
    hq_location: str | None = None
    domain: str | None = None
    school: str | None = None
    degree: str | None = None
    field_of_study: str | None = None
    years_experience_min: int | None = None
    years_experience_max: int | None = None
    tenure_months_min: int | None = None
    connections_min: int | None = None
    open_to_work: bool | None = None
    is_hiring_manager: bool | None = None
    recently_changed_jobs: bool | None = None


class SearchRequest(BaseModel):
    filters: SearchFilters
    preview_only: bool = True


class SearchResponse(BaseModel):
    candidates: list[CandidateSchema]
    preview_count: int
    total_count: int
