from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class SearchCandidate(Base):
    __tablename__ = 'search_candidate'

    search_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey('search.id', ondelete='CASCADE'),
        primary_key=True,
    )
    candidate_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey('candidate.id', ondelete='CASCADE'),
        primary_key=True,
    )
