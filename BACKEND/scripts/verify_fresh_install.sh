#!/usr/bin/env bash
set -euo pipefail

# Ensure we are in the BACKEND directory
cd "$(dirname "$0")/.."

echo "==> Verifying Fresh Install <=="
source venv/bin/activate

echo "Removing existing database..."
rm -f duolingo.db

echo "Running migrations..."
alembic upgrade head

echo "Running seed script..."
python seed.py

echo "Running pytest..."
PYTHONPATH=. pytest -q

echo "Starting server to check health..."
uvicorn app.main:app --port 8001 &
PID=$!

sleep 2

echo "Checking health endpoint..."
curl -fsS http://localhost:8001/health-check

echo ""
echo "Cleaning up..."
kill $PID

echo "==> Verification Complete: FRESH INSTALL WORKS <=="
