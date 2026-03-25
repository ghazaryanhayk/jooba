"""Tests for CrustDataClient with mocked httpx."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import httpx

from schemas.search import SearchFilters, TitleRow


def _filters():
    return SearchFilters(title=[TitleRow(operator='is', value='Eng', timeframe='current')])


def _mock_response(profiles=None, total_count=10, next_cursor=None, status_code=200):
    resp = MagicMock(spec=httpx.Response)
    resp.status_code = status_code
    resp.json.return_value = {
        'profiles': profiles or [],
        'total_count': total_count,
        'next_cursor': next_cursor,
    }
    resp.raise_for_status = MagicMock()
    if status_code >= 400:
        resp.raise_for_status.side_effect = httpx.HTTPStatusError(
            'error', request=MagicMock(), response=resp,
        )
    return resp


class TestCrustDataClient:
    @pytest.fixture(autouse=True)
    def _patch_httpx(self):
        self.mock_post = AsyncMock()
        mock_client_instance = AsyncMock()
        mock_client_instance.post = self.mock_post
        mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
        mock_client_instance.__aexit__ = AsyncMock(return_value=False)

        with patch('clients.crustdata_client.httpx.AsyncClient', return_value=mock_client_instance) as mock_cls:
            self.mock_client_cls = mock_cls
            yield

    async def test_correct_headers_and_url(self):
        self.mock_post.return_value = _mock_response()

        from clients.crustdata_client import crustdata_client
        await crustdata_client.search_candidates(_filters())
        self.mock_post.assert_awaited_once()
        call_kwargs = self.mock_post.call_args
        assert call_kwargs[0][0] == '/screener/persondb/search'
        headers = call_kwargs[1]['headers']
        assert 'Authorization' in headers

    async def test_returns_mapped_candidates(self):
        profiles = [
            {'name': 'Alice', 'headline': 'h', 'summary': 's', 'current_employers': [{'title': 'Eng', 'name': 'Co'}]},
        ]
        self.mock_post.return_value = _mock_response(profiles=profiles)

        from clients.crustdata_client import crustdata_client
        candidates, _, _ = await crustdata_client.search_candidates(_filters())
        assert len(candidates) == 1
        assert candidates[0].name == 'Alice'

    async def test_returns_total_count(self):
        self.mock_post.return_value = _mock_response(total_count=42)

        from clients.crustdata_client import crustdata_client
        _, total, _ = await crustdata_client.search_candidates(_filters())
        assert total == 42

    async def test_returns_next_cursor(self):
        self.mock_post.return_value = _mock_response(next_cursor='abc')

        from clients.crustdata_client import crustdata_client
        _, _, cursor = await crustdata_client.search_candidates(_filters())
        assert cursor == 'abc'

    async def test_empty_profiles(self):
        self.mock_post.return_value = _mock_response(profiles=[])

        from clients.crustdata_client import crustdata_client
        candidates, total, cursor = await crustdata_client.search_candidates(_filters())
        assert candidates == []
        assert cursor is None

    async def test_http_error_raises(self):
        self.mock_post.return_value = _mock_response(status_code=500)

        from clients.crustdata_client import crustdata_client
        with pytest.raises(httpx.HTTPStatusError):
            await crustdata_client.search_candidates(_filters())

    async def test_passes_cursor_in_payload(self):
        self.mock_post.return_value = _mock_response()

        from clients.crustdata_client import crustdata_client
        await crustdata_client.search_candidates(_filters(), cursor='next-page')
        payload = self.mock_post.call_args[1]['json']
        assert payload['cursor'] == 'next-page'
