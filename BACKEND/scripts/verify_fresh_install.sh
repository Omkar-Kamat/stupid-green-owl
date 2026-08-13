#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

VENV_DIR="${VENV_DIR:-.venv}"
export API_BASE_URL="${API_BASE_URL:-http://localhost:8001}"

echo "==> Fresh install verification <=="

if [ ! -d "$VENV_DIR" ]; then
  echo "Creating virtualenv at $VENV_DIR..."
  python3 -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"

echo "Installing dependencies..."
pip install -q -r requirements.txt

echo "Removing existing database..."
rm -f duolingo.db

echo "Running migrations (upgrade head)..."
alembic upgrade head

echo "Running demo reset seed..."
python seed.py

echo "Running pytest..."
PYTHONPATH=. pytest -q

echo "Testing migration downgrade → upgrade..."
alembic downgrade base
alembic upgrade head
python seed.py

echo "Starting server for smoke test on ${API_BASE_URL}..."
PORT="${API_BASE_URL##*:}"
uvicorn app.main:app --port "$PORT" &
PID=$!
cleanup() {
  kill "$PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "Waiting for server..."
for _ in $(seq 1 30); do
  if curl -fsS "${API_BASE_URL}/health-check" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
curl -fsS "${API_BASE_URL}/health-check" >/dev/null

echo "Running end-to-end smoke test..."
bash scripts/smoke_test.sh

echo "==> Fresh install verification passed <=="
