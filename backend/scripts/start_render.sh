#!/usr/bin/env bash
set -euo pipefail

echo "Running PayGuard database migrations..."
alembic upgrade head

echo "Preparing PayGuard demo account..."
python scripts/bootstrap_demo.py

echo "Starting PayGuard API..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-10000}"
