"""Tests for POST /ranking/run endpoint."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
from schemas.candidate import ApprovalStatus, CandidateSchema, Tier
from schemas.ranking import ApprovalStats, RankingResponse, TierCounts


@pytest.fixture()
def _patch_rank():
    with patch('services.ranking_service.rank', new_callable=AsyncMock) as mock:
        yield mock


async def test_success_200(_patch_rank):
    _patch_rank.return_value = RankingResponse(
        candidates=[
            CandidateSchema(
                name='Alice', title='Eng', company='Co', headline='h', summary='s',
                tier=Tier.A, status=ApprovalStatus(approved=True, reason='Good'),
            ),
        ],
        preview_count=1,
        total_count=1,
        stats=ApprovalStats(approved=1, rejected=0),
        tiers=TierCounts(A=1),
    )
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        resp = await client.post('/ranking/run', json={
            'candidates': [
                {'name': 'Alice', 'title': 'Eng', 'company': 'Co', 'headline': 'h', 'summary': 's'},
            ],
        })
    assert resp.status_code == 200
    data = resp.json()
    assert data['tiers']['A'] == 1


async def test_validation_error_422():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        resp = await client.post('/ranking/run', json={})
    assert resp.status_code == 422


async def test_service_error_502(_patch_rank):
    _patch_rank.side_effect = RuntimeError('openai down')
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        resp = await client.post('/ranking/run', json={
            'candidates': [
                {'name': 'Alice', 'title': 'Eng', 'company': 'Co', 'headline': 'h', 'summary': 's'},
            ],
        })
    assert resp.status_code == 502
