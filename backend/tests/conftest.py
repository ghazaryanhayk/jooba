import os

# Must set env vars BEFORE any app imports so Settings() doesn't fail
os.environ.setdefault('CRUSTDATA_API_KEY', 'test-crustdata-key')
os.environ.setdefault('OPENAI_API_KEY', 'test-openai-key')
os.environ.setdefault('DATABASE_URL', 'sqlite+aiosqlite://')

import pytest
from unittest.mock import AsyncMock

from core import cache
from schemas.candidate import CandidateSchema
from schemas.search import SearchFilters, TitleRow, CountryRow, ExperienceRange


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture()
def sample_candidate() -> CandidateSchema:
    return CandidateSchema(
        name='Alice Smith',
        title='Senior Engineer',
        company='Acme Corp',
        headline='Building things',
        summary='10 years of experience in backend systems',
        avatar_url='https://example.com/alice.jpg',
    )


@pytest.fixture()
def sample_filters() -> SearchFilters:
    return SearchFilters(
        title=[TitleRow(operator='is', value='Software Engineer', timeframe='current')],
        country=[CountryRow(operator='is', value='United States')],
        experience=ExperienceRange(from_='2', to='10'),
    )


@pytest.fixture()
def mock_db():
    from sqlalchemy.ext.asyncio import AsyncSession
    return AsyncMock(spec=AsyncSession)


@pytest.fixture()
def app_with_mock_db(mock_db):
    from main import app
    from db.session import get_db

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    yield app
    app.dependency_overrides.clear()
