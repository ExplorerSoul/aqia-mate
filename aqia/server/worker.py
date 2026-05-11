"""
AQIA Background Worker
======================
Runs as a separate process alongside the FastAPI server.
Picks jobs off the Redis queue and executes them.

Start with:
    python worker.py

Or via rq CLI:
    rq worker aqia --url $REDIS_URL
"""
import os
from dotenv import load_dotenv
from redis import Redis
from rq import Worker, Queue, Connection

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

if __name__ == "__main__":
    redis_conn = Redis.from_url(REDIS_URL)
    with Connection(redis_conn):
        worker = Worker(queues=[Queue("aqia", connection=redis_conn)])
        print(f"✅ RQ Worker started — listening on queue 'aqia' @ {REDIS_URL}")
        worker.work()
