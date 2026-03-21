#!/bin/sh
set -e
cd /app

LOCK_HASH_FILE="node_modules/.jooba-lock-hash"
HASH=""
if [ -f package-lock.json ]; then
  HASH=$(sha256sum package-lock.json | awk '{print $1}')
fi
OLD=$(cat "$LOCK_HASH_FILE" 2>/dev/null || echo "")

STALE=0
[ ! -d node_modules ] && STALE=1
# Recover from stale node_modules volume (e.g. deps added after first compose up)
[ -d node_modules ] && [ ! -d node_modules/@tailwindcss/vite ] && STALE=1

if [ "$STALE" = 1 ] || [ "$HASH" != "$OLD" ]; then
  npm install
  mkdir -p node_modules
  [ -n "$HASH" ] && echo "$HASH" > "$LOCK_HASH_FILE"
fi

exec "$@"
