#!/usr/bin/env bash
# Regenerate DOCS/openapi.json from a running backend (default :8000).
set -euo pipefail

API_BASE="${API_BASE_URL:-http://localhost:8000}"
OUT="${1:-../../DOCS/openapi.json}"

curl -fsS "${API_BASE}/api/v1/openapi.json" -o "$OUT"
echo "Wrote OpenAPI spec to $OUT"
