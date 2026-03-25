"""Tests for services/search_service.py."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from schemas.candidate import CandidateSchema
from schemas.search import SearchFilters, SearchRequest, SearchResponse, TitleRow


def _make_candidate(name='Alice') -> CandidateSchema:
    return CandidateSchema(
        name=name, title='Eng', company='Co', headline='h', summary='s',
    )


def _make_request(**kwargs) -> SearchRequest:
    defaults = dict(
        filters=SearchFilters(title=[TitleRow(operator='is', value='Eng', timeframe='current')]),
        preview_only=True,
        preview_limit=25,
    )
    defaults.update(kwargs)
    return SearchRequest(**defaults)


# ── search() ──────────────────────────────────────────────────────

class TestSearch:
    @pytest.fixture(autouse=True)
    def _patch_client(self):
        with patch('services.search_service.crustdata_client') as mock:
            self.mock_client = mock
            mock.search_candidates = AsyncMock(return_value=([_make_candidate()], 100, None))
            yield

    async def test_calls_client(self):
        from services.search_service import search
        req = _make_request()
        await search(req)
        self.mock_client.search_candidates.assert_awaited_once()

    async def test_returns_search_response(self):
        from services.search_service import search
        result = await search(_make_request())
        assert isinstance(result, SearchResponse)
        assert result.preview_count == 1
        assert result.total_count == 100

    async def test_caches_result(self):
        from services.search_service import search
        req = _make_request()
        await search(req)
        await search(req)
        # Second call should hit cache, not client
        assert self.mock_client.search_candidates.await_count == 1

    async def test_cache_miss_on_different_request(self):
        from services.search_service import search
        await search(_make_request(preview_limit=25))
        await search(_make_request(preview_limit=50))
        assert self.mock_client.search_candidates.await_count == 2


# ── run_background_search() ───────────────────────────────────────

class TestRunBackgroundSearch:
    async def test_single_page(self):
        from db.models.search import SearchStatus

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = SearchStatus.running
        mock_session.execute = AsyncMock(return_value=mock_result)

        with patch('services.search_service.crustdata_client') as mock_client, \
             patch('services.search_service.AsyncSessionLocal') as mock_session_cls, \
             patch('services.search_service._persist_candidates', new_callable=AsyncMock) as mock_persist:
            mock_client.search_candidates = AsyncMock(return_value=([_make_candidate()], 10, None))
            mock_session_cls.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session_cls.return_value.__aexit__ = AsyncMock(return_value=False)

            from services.search_service import run_background_search
            filters = SearchFilters(title=[TitleRow(operator='is', value='Eng', timeframe='current')])
            await run_background_search('search-id-1', filters)

            mock_persist.assert_awaited_once()
            # Should set status to completed
            assert mock_session.execute.await_count >= 2
            mock_session.commit.assert_awaited()

    async def test_multi_page_with_cursor(self):
        from db.models.search import SearchStatus

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = SearchStatus.running
        mock_session.execute = AsyncMock(return_value=mock_result)

        call_count = 0

        async def search_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return ([_make_candidate('A')], 20, 'cursor-2')
            return ([_make_candidate('B')], 20, None)

        with patch('services.search_service.crustdata_client') as mock_client, \
             patch('services.search_service.AsyncSessionLocal') as mock_session_cls, \
             patch('services.search_service._persist_candidates', new_callable=AsyncMock) as mock_persist, \
             patch('services.search_service.asyncio') as mock_asyncio:
            mock_client.search_candidates = AsyncMock(side_effect=search_side_effect)
            mock_session_cls.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session_cls.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_asyncio.sleep = AsyncMock()

            from services.search_service import run_background_search
            filters = SearchFilters(title=[TitleRow(operator='is', value='Eng', timeframe='current')])
            await run_background_search('search-id-2', filters)

            assert mock_persist.await_count == 2
            mock_asyncio.sleep.assert_awaited_once()

    async def test_stopped_mid_loop(self):
        from db.models.search import SearchStatus

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = SearchStatus.stopped
        mock_session.execute = AsyncMock(return_value=mock_result)

        with patch('services.search_service.crustdata_client') as mock_client, \
             patch('services.search_service.AsyncSessionLocal') as mock_session_cls:
            mock_session_cls.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session_cls.return_value.__aexit__ = AsyncMock(return_value=False)

            from services.search_service import run_background_search
            filters = SearchFilters(title=[TitleRow(operator='is', value='Eng', timeframe='current')])
            await run_background_search('search-id-3', filters)

            # Should return early without calling search
            mock_client.search_candidates.assert_not_called()

    async def test_error_sets_failed(self):
        from db.models.search import SearchStatus

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = SearchStatus.running
        mock_session.execute = AsyncMock(return_value=mock_result)

        with patch('services.search_service.crustdata_client') as mock_client, \
             patch('services.search_service.AsyncSessionLocal') as mock_session_cls:
            mock_client.search_candidates = AsyncMock(side_effect=RuntimeError('API down'))
            mock_session_cls.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session_cls.return_value.__aexit__ = AsyncMock(return_value=False)

            from services.search_service import run_background_search
            filters = SearchFilters(title=[TitleRow(operator='is', value='Eng', timeframe='current')])
            await run_background_search('search-id-4', filters)

            # Should commit the failed status
            mock_session.commit.assert_awaited()

    async def test_persists_candidates(self):
        from db.models.search import SearchStatus

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = SearchStatus.running
        mock_session.execute = AsyncMock(return_value=mock_result)

        with patch('services.search_service.crustdata_client') as mock_client, \
             patch('services.search_service.AsyncSessionLocal') as mock_session_cls, \
             patch('services.search_service._persist_candidates', new_callable=AsyncMock) as mock_persist:
            candidates = [_make_candidate('Alice'), _make_candidate('Bob')]
            mock_client.search_candidates = AsyncMock(return_value=(candidates, 2, None))
            mock_session_cls.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session_cls.return_value.__aexit__ = AsyncMock(return_value=False)

            from services.search_service import run_background_search
            filters = SearchFilters(title=[TitleRow(operator='is', value='Eng', timeframe='current')])
            await run_background_search('search-id-5', filters)

            mock_persist.assert_awaited_once()
            persisted = mock_persist.call_args[0][2]
            assert len(persisted) == 2
