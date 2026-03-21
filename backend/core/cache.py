import hashlib
import json
from typing import Any

from cachetools import TTLCache

from core.config import settings

_cache: TTLCache = TTLCache(
    maxsize=settings.cache_max_size,
    ttl=settings.cache_ttl_seconds,
)


def get(key: str) -> Any | None:
    return _cache.get(key)


def set(key: str, value: Any) -> None:
    _cache[key] = value


def delete(key: str) -> None:
    _cache.pop(key, None)


def clear() -> None:
    _cache.clear()


def make_key(*parts: Any) -> str:
    raw = json.dumps(parts, sort_keys=True, default=str)
    return hashlib.sha256(raw.encode()).hexdigest()
