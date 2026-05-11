#!/bin/bash
# Start both the FastAPI server and RQ worker in the same Render web service.
# The worker runs as a background process alongside uvicorn.
# This avoids needing a separate paid Background Worker service.

# Start RQ worker in background (only if REDIS_URL is set)
if [ -n "$REDIS_URL" ]; then
  echo "Starting RQ worker in background..."
  python worker.py &
  WORKER_PID=$!
  echo "RQ worker started (PID $WORKER_PID)"
else
  echo "REDIS_URL not set — skipping RQ worker (jobs will run synchronously)"
fi

# Start FastAPI (foreground — this is what Render monitors)
echo "Starting uvicorn..."
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
