#!/bin/bash
# Render sets CWD to the rootDir (aqia/).
# We need to cd into server/ before running anything.

cd "$(dirname "$0")"   # cd into server/
echo "Working directory: $(pwd)"

# Start RQ worker in background (only if REDIS_URL is set)
if [ -n "$REDIS_URL" ]; then
  echo "Starting RQ worker in background..."
  python worker.py &
  echo "RQ worker started (PID $!)"
else
  echo "REDIS_URL not set — skipping RQ worker (jobs run synchronously)"
fi

# Start FastAPI (foreground — Render monitors this process)
echo "Starting uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
