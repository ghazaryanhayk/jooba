from enum import Enum

from pydantic import BaseModel


class Tier(str, Enum):
    A = 'A'
    B = 'B'
    C = 'C'
    D = 'D'
    F = 'F'


class ApprovalStatus(BaseModel):
    approved: bool
    reason: str


class CandidateSchema(BaseModel):
    name: str
    title: str
    company: str
    bio: str
    avatar_url: str | None = None
    tier: Tier | None = None
    status: ApprovalStatus | None = None
