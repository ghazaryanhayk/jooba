"""Tests for OpenAIClient with mocked OpenAI SDK."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from schemas.candidate import ApprovalStatus, CandidateSchema, Tier


def _candidate(name='Alice') -> CandidateSchema:
    return CandidateSchema(
        name=name, title='Eng', company='Co', headline='h', summary='s',
    )


def _mock_openai_response(ranked_items):
    """Build a mock response matching the structure of beta.chat.completions.parse()."""
    output = MagicMock()
    output.ranked = ranked_items
    choice = MagicMock()
    choice.message.parsed = output
    response = MagicMock()
    response.choices = [choice]
    return response


class TestOpenAIClient:
    @pytest.fixture(autouse=True)
    def _setup_client(self):
        from clients.openai_client import openai_client
        self.client = openai_client
        self._original = self.client._client
        self.mock_sdk = AsyncMock()
        self.client._client = self.mock_sdk
        yield
        self.client._client = self._original

    async def test_empty_list_short_circuits(self):
        result = await self.client.rank_candidates([])
        assert result == []
        self.mock_sdk.beta.chat.completions.parse.assert_not_awaited()

    async def test_calls_parse(self):
        item = MagicMock(name='Alice', tier=Tier.A, approved=True, reason='Great fit')
        item.name = 'Alice'
        self.mock_sdk.beta.chat.completions.parse = AsyncMock(
            return_value=_mock_openai_response([item]),
        )

        await self.client.rank_candidates([_candidate()])
        self.mock_sdk.beta.chat.completions.parse.assert_awaited_once()

    async def test_maps_results_to_candidates(self):
        item = MagicMock()
        item.name = 'Alice'
        item.tier = Tier.A
        item.approved = True
        item.reason = 'Great fit'
        self.mock_sdk.beta.chat.completions.parse = AsyncMock(
            return_value=_mock_openai_response([item]),
        )

        result = await self.client.rank_candidates([_candidate()])
        assert len(result) == 1
        assert result[0].tier == Tier.A
        assert result[0].status.approved is True
        assert result[0].status.reason == 'Great fit'

    async def test_unmatched_name_preserved(self):
        item = MagicMock()
        item.name = 'Bob'  # Doesn't match 'Alice'
        item.tier = Tier.B
        item.approved = True
        item.reason = 'ok'
        self.mock_sdk.beta.chat.completions.parse = AsyncMock(
            return_value=_mock_openai_response([item]),
        )

        result = await self.client.rank_candidates([_candidate('Alice')])
        assert len(result) == 1
        assert result[0].tier is None  # Unmatched, no tier assigned

    async def test_prompt_includes_criteria(self):
        item = MagicMock()
        item.name = 'Alice'
        item.tier = Tier.A
        item.approved = True
        item.reason = 'r'
        self.mock_sdk.beta.chat.completions.parse = AsyncMock(
            return_value=_mock_openai_response([item]),
        )

        await self.client.rank_candidates(
            [_candidate()],
            general_intuition='find senior devs',
            must_haves=['Python', 'FastAPI'],
            nice_to_haves=['React'],
        )

        call_args = self.mock_sdk.beta.chat.completions.parse.call_args
        messages = call_args[1]['messages']
        prompt = messages[0]['content']
        assert 'find senior devs' in prompt
        assert 'Python' in prompt
        assert 'FastAPI' in prompt
        assert 'React' in prompt
