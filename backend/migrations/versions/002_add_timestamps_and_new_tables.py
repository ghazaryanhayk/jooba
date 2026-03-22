"""add timestamps to role; add candidate, search, search_candidate tables

Revision ID: 002
Revises: 001
Create Date: 2026-03-22

"""
from typing import Sequence, Union

from alembic import op

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE role ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()")
    op.execute("ALTER TABLE role ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()")

    op.execute("""
        CREATE TABLE IF NOT EXISTS candidate (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            headline TEXT NOT NULL,
            summary TEXT NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE search_status AS ENUM ('draft', 'running', 'stopped', 'completed', 'failed');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS search (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE,
            status search_status NOT NULL DEFAULT 'draft',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS search_candidate (
            search_id UUID NOT NULL REFERENCES search(id) ON DELETE CASCADE,
            candidate_id UUID NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
            PRIMARY KEY (search_id, candidate_id)
        )
    """)


def downgrade() -> None:
    op.execute('DROP TABLE IF EXISTS search_candidate')
    op.execute('DROP TABLE IF EXISTS search')
    op.execute('DROP TYPE IF EXISTS search_status')
    op.execute('DROP TABLE IF EXISTS candidate')
    op.execute('ALTER TABLE role DROP COLUMN IF EXISTS updated_at')
    op.execute('ALTER TABLE role DROP COLUMN IF EXISTS created_at')
