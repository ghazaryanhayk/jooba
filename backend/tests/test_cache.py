from core import cache


def test_make_key_deterministic():
    assert cache.make_key('a', 'b') == cache.make_key('a', 'b')


def test_make_key_different_inputs():
    assert cache.make_key('a', 'b') != cache.make_key('a', 'c')


def test_make_key_order_independent():
    """make_key uses sort_keys=True so dict order doesn't matter."""
    assert cache.make_key({'b': 2, 'a': 1}) == cache.make_key({'a': 1, 'b': 2})


def test_get_returns_none_for_missing():
    assert cache.get('nonexistent') is None


def test_set_and_get_roundtrip():
    cache.set('key1', {'data': 42})
    assert cache.get('key1') == {'data': 42}


def test_delete_removes_key():
    cache.set('key2', 'value')
    cache.delete('key2')
    assert cache.get('key2') is None


def test_clear_empties_cache():
    cache.set('k1', 1)
    cache.set('k2', 2)
    cache.clear()
    assert cache.get('k1') is None
    assert cache.get('k2') is None
