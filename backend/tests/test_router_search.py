"""Tests for POST /search endpoint."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
from schemas.candidate import CandidateSchema
from schemas.search import SearchResponse


@pytest.fixture()
def _patch_search():
    with patch('services.search_service.search', new_callable=AsyncMock) as mock:
        yield mock


async def test_success_200(_patch_search):
    _patch_search.return_value = SearchResponse(
        candidates=[
            CandidateSchema(name='Alice', title='Eng', company='Co', headline='h', summary='s'),
        ],
        preview_count=1,
        total_count=100,
    )
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        resp = await client.post('/search', json={
            'filters': {'title': [{'operator': 'is', 'value': 'Eng', 'timeframe': 'current'}]},
        })
    assert resp.status_code == 200
    data = resp.json()
    assert data['preview_count'] == 1
    assert len(data['candidates']) == 1


async def test_validation_error_422():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        resp = await client.post('/search', json={})
    assert resp.status_code == 422


async def test_service_error_502(_patch_search):
    _patch_search.side_effect = RuntimeError('upstream down')
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        resp = await client.post('/search', json={
            'filters': {'title': [{'operator': 'is', 'value': 'Eng', 'timeframe': 'current'}]},
        })
    assert resp.status_code == 502
