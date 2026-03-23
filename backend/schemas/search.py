from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from schemas.candidate import CandidateSchema


class TitleRow(BaseModel):
    operator: Literal['is', 'is_not', 'fuzzy', 'substring']
    value: str
    timeframe: Literal['current', 'ever', 'past']


class CountryRow(BaseModel):
    operator: Literal['is', 'is_not']
    value: str


class ExperienceRange(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    from_: str | None = Field(None, alias='from')
    to: str | None = None


class SearchFilters(BaseModel):
    title: list[TitleRow] = []
    country: list[CountryRow] = []
    experience: ExperienceRange | None = None


class SearchRequest(BaseModel):
    filters: SearchFilters
    preview_only: bool = True
    preview_limit: int = 25


class SearchResponse(BaseModel):
    candidates: list[CandidateSchema]
    preview_count: int
    total_count: int
