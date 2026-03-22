import enum

from sqlalchemy import TIMESTAMP, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class SearchStatus(str, enum.Enum):
    draft = 'draft'
    running = 'running'
    stopped = 'stopped'
    completed = 'completed'
    failed = 'failed'


class Search(Base):
    __tablename__ = 'search'

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default='gen_random_uuid()',
    )
    role_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey('role.id', ondelete='CASCADE'),
        nullable=False,
    )
    status: Mapped[SearchStatus] = mapped_column(
        Enum(SearchStatus, name='search_status'),
        nullable=False,
        default=SearchStatus.draft,
        server_default=SearchStatus.draft.value,
    )
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[str] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
