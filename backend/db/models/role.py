from sqlalchemy import Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class Role(Base):
    __tablename__ = 'role'

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default='gen_random_uuid()',
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    filters: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
