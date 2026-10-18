#!/bin/sh
set -eu

api_base_url="${API_BASE_URL:-http://localhost:8000/api}"

escaped_api_base_url=$(printf '%s' "$api_base_url" |
    sed 's/\\/\\\\/g; s/"/\\"/g')

printf 'window.__APP_CONFIG__ = { apiBaseUrl: "%s" };\n' \
    "$escaped_api_base_url" \
    > /usr/share/nginx/html/runtime-config.js

exec "$@"