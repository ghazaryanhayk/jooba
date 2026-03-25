"""Tests for services/ranking_service.py."""

from unittest.mock import AsyncMock, patch

import pytest

from schemas.candidate import ApprovalStatus, CandidateSchema, Tier
from schemas.ranking import RankingRequest, RankingResponse


def _candidate(name='Alice', tier=None, status=None) -> CandidateSchema:
    return CandidateSchema(
        name=name, title='Eng', company='Co', headline='h', summary='s',
        tier=tier, status=status,
    )


class TestRank:
    @pytest.fixture(autouse=True)
    def _patch_client(self):
        with patch('services.ranking_service.openai_client') as mock:
            self.mock_client = mock
            yield

    async def test_calls_client(self):
        candidates = [_candidate()]
        ranked = [_candidate('Alice', tier=Tier.A, status=ApprovalStatus(approved=True, reason='Good'))]
        self.mock_client.rank_candidates = AsyncMock(return_value=ranked)

        from services.ranking_service import rank
        req = RankingRequest(candidates=candidates, general_intuition='find good devs')
        await rank(req)
        self.mock_client.rank_candidates.assert_awaited_once()

    async def test_returns_ranking_response(self):
        ranked = [_candidate('Alice', tier=Tier.A, status=ApprovalStatus(approved=True, reason='r'))]
        self.mock_client.rank_candidates = AsyncMock(return_value=ranked)

        from services.ranking_service import rank
        result = await rank(RankingRequest(candidates=[_candidate()]))
        assert isinstance(result, RankingResponse)

    async def test_counts_tiers_correctly(self):
        ranked = [
            _candidate('A', tier=Tier.A, status=ApprovalStatus(approved=True, reason='r')),
            _candidate('B', tier=Tier.B, status=ApprovalStatus(approved=True, reason='r')),
            _candidate('C', tier=Tier.C, status=ApprovalStatus(approved=False, reason='r')),
            _candidate('D', tier=Tier.D, status=ApprovalStatus(approved=False, reason='r')),
            _candidate('F', tier=Tier.F, status=ApprovalStatus(approved=False, reason='r')),
        ]
        self.mock_client.rank_candidates = AsyncMock(return_value=ranked)

        from services.ranking_service import rank
        result = await rank(RankingRequest(candidates=[_candidate(n) for n in 'ABCDF']))
        assert result.tiers.A == 1
        assert result.tiers.B == 1
        assert result.tiers.C == 1
        assert result.tiers.D == 1
        assert result.tiers.F == 1

    async def test_counts_approval(self):
        ranked = [
            _candidate('A', tier=Tier.A, status=ApprovalStatus(approved=True, reason='r')),
            _candidate('B', tier=Tier.B, status=ApprovalStatus(approved=True, reason='r')),
            _candidate('C', tier=Tier.C, status=ApprovalStatus(approved=False, reason='r')),
        ]
        self.mock_client.rank_candidates = AsyncMock(return_value=ranked)

        from services.ranking_service import rank
        result = await rank(RankingRequest(candidates=[_candidate(n) for n in 'ABC']))
        assert result.stats.approved == 2
        assert result.stats.rejected == 1

    async def test_caches_result(self):
        ranked = [_candidate('A', tier=Tier.A, status=ApprovalStatus(approved=True, reason='r'))]
        self.mock_client.rank_candidates = AsyncMock(return_value=ranked)

        from services.ranking_service import rank
        req = RankingRequest(candidates=[_candidate()])
        await rank(req)
        await rank(req)
        assert self.mock_client.rank_candidates.await_count == 1

    async def test_empty_candidates(self):
        self.mock_client.rank_candidates = AsyncMock(return_value=[])

        from services.ranking_service import rank
        result = await rank(RankingRequest(candidates=[]))
        assert result.candidates == []
        assert result.stats.approved == 0
        assert result.stats.rejected == 0
