from pydantic import BaseModel

from schemas.candidate import CandidateSchema


class RankingRequest(BaseModel):
    candidates: list[CandidateSchema]
    general_intuition: str = ''
    must_haves: list[str] = []
    nice_to_haves: list[str] = []


class TierCounts(BaseModel):
    A: int = 0
    B: int = 0
    C: int = 0
    D: int = 0
    F: int = 0


class ApprovalStats(BaseModel):
    approved: int
    rejected: int


class RankingResponse(BaseModel):
    candidates: list[CandidateSchema]
    preview_count: int
    total_count: int
    stats: ApprovalStats
    tiers: TierCounts
