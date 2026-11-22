#!/bin/sh
set -eu
cd /app
# Reinstall only when manifests or the Node runtime change.
fingerprint="$(cat package.json package-lock.json; node --version; uname -m)"
fingerprint="$(printf '%s' "$fingerprint" | sha256sum | cut -d ' ' -f 1)"
marker="node_modules/.weather-dependencies"
if [ ! -f "$marker" ] || [ "$(cat "$marker")" != "$fingerprint" ] || [ ! -x node_modules/.bin/vite ]; then
  npm ci
  printf '%s' "$fingerprint" > "$marker"
fi
exec "$@"
