"""Tests for _build_search_payload — the most complex pure function in the backend."""

from clients.crustdata_client import _build_search_payload
from schemas.search import SearchFilters, TitleRow, CountryRow, ExperienceRange


def _filters(**kwargs) -> SearchFilters:
    return SearchFilters(**kwargs)


# ── Title filter ──────────────────────────────────────────────────

class TestTitleOperators:
    def test_is_current(self):
        f = _filters(title=[TitleRow(operator='is', value='Engineer', timeframe='current')])
        payload = _build_search_payload(f, True)
        cond = payload['filters']['conditions'][0]
        assert cond['filter_type'] == 'current_employers.title'
        assert cond['type'] == '='
        assert cond['value'] == 'Engineer'

    def test_is_ever(self):
        f = _filters(title=[TitleRow(operator='is', value='Manager', timeframe='ever')])
        cond = _build_search_payload(f, True)['filters']['conditions'][0]
        assert cond['filter_type'] == 'employers.title'

    def test_is_past(self):
        f = _filters(title=[TitleRow(operator='is', value='CTO', timeframe='past')])
        cond = _build_search_payload(f, True)['filters']['conditions'][0]
        assert cond['filter_type'] == 'employers.title'

    def test_substring_operator(self):
        f = _filters(title=[TitleRow(operator='substring', value='Eng', timeframe='current')])
        cond = _build_search_payload(f, True)['filters']['conditions'][0]
        assert cond['type'] == '[.]'

    def test_fuzzy_operator(self):
        f = _filters(title=[TitleRow(operator='fuzzy', value='Eng', timeframe='current')])
        cond = _build_search_payload(f, True)['filters']['conditions'][0]
        assert cond['type'] == '(.)'

    def test_is_not_operator(self):
        f = _filters(title=[TitleRow(operator='is_not', value='Intern', timeframe='current')])
        cond = _build_search_payload(f, True)['filters']['conditions'][0]
        assert cond['type'] == '!='


class TestTitleGrouping:
    def test_multiple_titles_wrapped_in_or(self):
        f = _filters(title=[
            TitleRow(operator='is', value='A', timeframe='current'),
            TitleRow(operator='is', value='B', timeframe='current'),
        ])
        cond = _build_search_payload(f, True)['filters']['conditions'][0]
        assert cond['op'] == 'or'
        assert len(cond['conditions']) == 2

    def test_empty_value_skipped(self):
        f = _filters(title=[TitleRow(operator='is', value='', timeframe='current')])
        assert _build_search_payload(f, True)['filters']['conditions'] == []

    def test_mixed_empty_and_valid(self):
        f = _filters(title=[
            TitleRow(operator='is', value='', timeframe='current'),
            TitleRow(operator='is', value='Dev', timeframe='current'),
        ])
        conds = _build_search_payload(f, True)['filters']['conditions']
        assert len(conds) == 1
        assert conds[0]['value'] == 'Dev'


# ── Country filter ────────────────────────────────────────────────

class TestCountryFilter:
    def test_single_country(self):
        f = _filters(country=[CountryRow(operator='is', value='US')])
        cond = _build_search_payload(f, True)['filters']['conditions'][0]
        assert cond['filter_type'] == 'location_details.country'
        assert cond['type'] == '='

    def test_is_not_country(self):
        f = _filters(country=[CountryRow(operator='is_not', value='CN')])
        cond = _build_search_payload(f, True)['filters']['conditions'][0]
        assert cond['type'] == '!='

    def test_multiple_countries_wrapped_in_or(self):
        f = _filters(country=[
            CountryRow(operator='is', value='US'),
            CountryRow(operator='is', value='UK'),
        ])
        cond = _build_search_payload(f, True)['filters']['conditions'][0]
        assert cond['op'] == 'or'
        assert len(cond['conditions']) == 2

    def test_empty_country_skipped(self):
        f = _filters(country=[CountryRow(operator='is', value='')])
        assert _build_search_payload(f, True)['filters']['conditions'] == []


# ── Experience filter ─────────────────────────────────────────────

class TestExperienceFilter:
    def test_from_only(self):
        f = _filters(experience=ExperienceRange(from_='3'))
        conds = _build_search_payload(f, True)['filters']['conditions']
        assert len(conds) == 1
        assert conds[0]['type'] == '=>'
        assert conds[0]['value'] == 3

    def test_to_only(self):
        f = _filters(experience=ExperienceRange(to='8'))
        conds = _build_search_payload(f, True)['filters']['conditions']
        assert len(conds) == 1
        assert conds[0]['type'] == '=<'
        assert conds[0]['value'] == 8

    def test_from_and_to(self):
        f = _filters(experience=ExperienceRange(from_='2', to='10'))
        conds = _build_search_payload(f, True)['filters']['conditions']
        assert len(conds) == 2

    def test_non_numeric_from_ignored(self):
        f = _filters(experience=ExperienceRange(from_='abc'))
        assert _build_search_payload(f, True)['filters']['conditions'] == []

    def test_non_numeric_to_ignored(self):
        f = _filters(experience=ExperienceRange(to='xyz'))
        assert _build_search_payload(f, True)['filters']['conditions'] == []


# ── Payload-level flags ───────────────────────────────────────────

class TestPayloadFlags:
    def test_preview_true(self):
        payload = _build_search_payload(_filters(), True)
        assert payload['preview'] == 'true'

    def test_preview_false(self):
        payload = _build_search_payload(_filters(), False)
        assert payload['preview'] == 'false'

    def test_cursor_included_when_provided(self):
        payload = _build_search_payload(_filters(), True, cursor='abc123')
        assert payload['cursor'] == 'abc123'

    def test_cursor_absent_when_none(self):
        payload = _build_search_payload(_filters(), True)
        assert 'cursor' not in payload

    def test_limit_passthrough(self):
        payload = _build_search_payload(_filters(), True, preview_limit=50)
        assert payload['limit'] == 50


# ── Combined filters ──────────────────────────────────────────────

def test_combined_title_country_experience(sample_filters):
    payload = _build_search_payload(sample_filters, True)
    conds = payload['filters']['conditions']
    # title (1 condition), country (1 condition), experience from (1), experience to (1)
    assert len(conds) == 4
