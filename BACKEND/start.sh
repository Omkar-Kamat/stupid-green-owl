#!/bin/bash
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Seeding the database..."
python seed.py

echo "Starting Uvicorn server..."
# Render sets the PORT environment variable; use it or default to 8000
PORT=${PORT:-8000}
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
