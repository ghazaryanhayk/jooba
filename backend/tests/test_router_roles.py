"""Tests for /roles/* endpoints with mocked DB session."""

from unittest.mock import AsyncMock, MagicMock, PropertyMock, patch
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient

from db.models.role import Role
from db.models.search import Search, SearchStatus
from db.session import get_db
from main import app


@pytest.fixture()
def mock_db():
    return AsyncMock()


@pytest.fixture(autouse=True)
def _override_db(mock_db):
    async def override():
        yield mock_db

    app.dependency_overrides[get_db] = override
    yield
    app.dependency_overrides.clear()


@pytest.fixture()
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url='http://test')


def _mock_scalars(items):
    """Helper: mock db.execute().scalars() pattern."""
    result = MagicMock()
    result.scalars.return_value = items
    return result


def _mock_scalar_one_or_none(value):
    """Helper: mock db.execute().scalar_one_or_none() pattern."""
    result = MagicMock()
    result.scalar_one_or_none.return_value = value
    return result


# ── list_roles ────────────────────────────────────────────────────

class TestListRoles:
    async def test_empty(self, mock_db, client):
        mock_db.execute = AsyncMock(return_value=_mock_scalars([]))
        async with client:
            resp = await client.get('/roles')
        assert resp.status_code == 200
        assert resp.json()['roles'] == []

    async def test_with_data(self, mock_db, client):
        role = MagicMock(spec=Role)
        role.id = str(uuid4())
        role.name = 'Backend Dev'
        mock_db.execute = AsyncMock(return_value=_mock_scalars([role]))
        async with client:
            resp = await client.get('/roles')
        assert resp.status_code == 200
        assert len(resp.json()['roles']) == 1
        assert resp.json()['roles'][0]['name'] == 'Backend Dev'


# ── create_role ───────────────────────────────────────────────────

class TestCreateRole:
    async def test_creates_role(self, mock_db, client):
        role_id = str(uuid4())

        async def fake_refresh(obj):
            obj.id = role_id
            obj.name = 'New Role'

        mock_db.refresh = AsyncMock(side_effect=fake_refresh)
        async with client:
            resp = await client.post('/roles', json={'name': 'New Role'})
        assert resp.status_code == 201
        assert resp.json()['name'] == 'New Role'
        mock_db.add.assert_called_once()
        mock_db.commit.assert_awaited_once()


# ── run_full_search ───────────────────────────────────────────────

class TestRunFullSearch:
    async def test_role_not_found(self, mock_db, client):
        mock_db.execute = AsyncMock(return_value=_mock_scalar_one_or_none(None))
        async with client:
            resp = await client.post(
                f'/roles/{uuid4()}/searches/run',
                json={'filters': {'title': [{'operator': 'is', 'value': 'Eng', 'timeframe': 'current'}]}},
            )
        assert resp.status_code == 404

    async def test_success(self, mock_db, client):
        role = MagicMock(spec=Role)
        role.id = str(uuid4())
        search_id = str(uuid4())

        call_count = 0

        def mock_add(obj):
            # Simulate DB generating an id on add for Search objects
            if hasattr(obj, 'status') and not obj.id:
                obj.id = search_id

        mock_db.add = MagicMock(side_effect=mock_add)

        async def execute_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return _mock_scalar_one_or_none(role)
            return MagicMock()

        mock_db.execute = AsyncMock(side_effect=execute_side_effect)

        with patch('routers.roles.search_service'):
            async with client:
                resp = await client.post(
                    f'/roles/{role.id}/searches/run',
                    json={'filters': {'title': [{'operator': 'is', 'value': 'Eng', 'timeframe': 'current'}]}},
                )
        assert resp.status_code == 200
        assert resp.json()['search_id'] == search_id
        assert resp.json()['status'] == 'running'


# ── stop_search ───────────────────────────────────────────────────

class TestStopSearch:
    async def test_not_found(self, mock_db, client):
        mock_db.execute = AsyncMock(return_value=_mock_scalar_one_or_none(None))
        async with client:
            resp = await client.post(f'/roles/{uuid4()}/searches/{uuid4()}/stop')
        assert resp.status_code == 404

    async def test_not_running(self, mock_db, client):
        search = MagicMock(spec=Search)
        search.status = SearchStatus.completed
        mock_db.execute = AsyncMock(return_value=_mock_scalar_one_or_none(search))
        async with client:
            resp = await client.post(f'/roles/{uuid4()}/searches/{uuid4()}/stop')
        assert resp.status_code == 200
        assert resp.json()['status'] == 'completed'

    async def test_success(self, mock_db, client):
        search = MagicMock(spec=Search)
        search.status = SearchStatus.running

        call_count = 0

        async def execute_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return _mock_scalar_one_or_none(search)
            return MagicMock()

        mock_db.execute = AsyncMock(side_effect=execute_side_effect)
        async with client:
            resp = await client.post(f'/roles/{uuid4()}/searches/{uuid4()}/stop')
        assert resp.status_code == 200
        assert resp.json()['status'] == 'stopped'


# ── get_search_status ─────────────────────────────────────────────

class TestGetSearchStatus:
    async def test_not_found(self, mock_db, client):
        mock_db.execute = AsyncMock(return_value=_mock_scalar_one_or_none(None))
        async with client:
            resp = await client.get(f'/roles/{uuid4()}/searches/{uuid4()}/status')
        assert resp.status_code == 404

    async def test_success(self, mock_db, client):
        search = MagicMock(spec=Search)
        search.status = SearchStatus.running
        mock_db.execute = AsyncMock(return_value=_mock_scalar_one_or_none(search))
        async with client:
            resp = await client.get(f'/roles/{uuid4()}/searches/{uuid4()}/status')
        assert resp.status_code == 200
        assert resp.json()['status'] == 'running'


# ── get_role_filters ──────────────────────────────────────────────

class TestGetRoleFilters:
    async def test_not_found(self, mock_db, client):
        mock_db.execute = AsyncMock(return_value=_mock_scalar_one_or_none(None))
        async with client:
            resp = await client.get(f'/roles/{uuid4()}/filters')
        assert resp.status_code == 404

    async def test_success(self, mock_db, client):
        role = MagicMock(spec=Role)
        role.filters = {'title': [{'operator': 'is', 'value': 'Eng', 'timeframe': 'current'}]}
        mock_db.execute = AsyncMock(return_value=_mock_scalar_one_or_none(role))
        async with client:
            resp = await client.get(f'/roles/{uuid4()}/filters')
        assert resp.status_code == 200
        assert resp.json()['filters'] is not None


# ── get_role_candidates ───────────────────────────────────────────

class TestGetRoleCandidates:
    async def test_role_not_found(self, mock_db, client):
        mock_db.execute = AsyncMock(return_value=_mock_scalar_one_or_none(None))
        async with client:
            resp = await client.get(f'/roles/{uuid4()}/candidates')
        assert resp.status_code == 404

    async def test_no_completed_search(self, mock_db, client):
        role = MagicMock(spec=Role)
        call_count = 0

        async def execute_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return _mock_scalar_one_or_none(role)
            return _mock_scalar_one_or_none(None)

        mock_db.execute = AsyncMock(side_effect=execute_side_effect)
        async with client:
            resp = await client.get(f'/roles/{uuid4()}/candidates')
        assert resp.status_code == 404
        assert 'No completed search' in resp.json()['detail']

    async def test_success(self, mock_db, client):
        role = MagicMock(spec=Role)
        search = MagicMock(spec=Search)
        search.id = str(uuid4())

        candidate_row = MagicMock()
        candidate_row.name = 'Alice'
        candidate_row.title = 'Eng'
        candidate_row.company = 'Co'
        candidate_row.headline = 'h'
        candidate_row.summary = 's'
        candidate_row.avatar_url = None

        call_count = 0

        async def execute_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return _mock_scalar_one_or_none(role)
            if call_count == 2:
                return _mock_scalar_one_or_none(search)
            result = MagicMock()
            result.scalars.return_value.all.return_value = [candidate_row]
            return result

        mock_db.execute = AsyncMock(side_effect=execute_side_effect)
        async with client:
            resp = await client.get(f'/roles/{uuid4()}/candidates')
        assert resp.status_code == 200
        data = resp.json()
        assert data['search_id'] == search.id
        assert len(data['candidates']) == 1
        assert data['candidates'][0]['name'] == 'Alice'
