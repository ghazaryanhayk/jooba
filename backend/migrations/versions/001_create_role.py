"""create role table

Revision ID: 001
Revises:
Create Date: 2026-03-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS pgcrypto')
    op.create_table(
        'role',
        sa.Column(
            'id',
            UUID(as_uuid=False),
            primary_key=True,
            server_default=sa.text('gen_random_uuid()'),
            nullable=False,
        ),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('filters', JSONB(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('role')
