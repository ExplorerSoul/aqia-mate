"""
Queue client — initialised once at app startup.
Falls back gracefully to synchronous execution if Redis is unavailable
(e.g. local dev without Redis running).
"""
import os
import logging

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "")  # empty = no queue configured

_redis_conn = None
_queue = None


def get_queue():
    """Return the RQ Queue, or None if Redis is not configured/reachable."""
    global _redis_conn, _queue
    if _queue is not None:
        return _queue
    if not REDIS_URL:
        return None
    try:
        from redis import Redis
        from rq import Queue
        _redis_conn = Redis.from_url(REDIS_URL, socket_connect_timeout=2)
        _redis_conn.ping()  # fail fast if unreachable
        _queue = Queue("aqia", connection=_redis_conn)
        logger.info(f"✅ Redis queue connected: {REDIS_URL}")
        return _queue
    except Exception as e:
        logger.warning(f"⚠️  Redis unavailable ({e}). Jobs will run synchronously.")
        return None


def enqueue_or_run(func, *args, **kwargs):
    """
    Enqueue func(*args, **kwargs) on the Redis queue.
    If Redis is not available, run it synchronously in the request thread.
    Returns (job_id | None, result | None).
    """
    q = get_queue()
    if q is not None:
        job = q.enqueue(func, *args, **kwargs, job_timeout=120)
        return job.id, None
    else:
        # Synchronous fallback — no Redis needed in dev
        result = func(*args, **kwargs)
        return None, result
