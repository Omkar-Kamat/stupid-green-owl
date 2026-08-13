#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export API_BASE_URL="${API_BASE_URL:-http://localhost:8000}"

if [ -x ".venv/bin/python" ]; then
  PYTHON=".venv/bin/python"
elif [ -n "${VIRTUAL_ENV:-}" ]; then
  PYTHON="python"
else
  PYTHON="python3"
fi

exec "$PYTHON" scripts/smoke_test.py
