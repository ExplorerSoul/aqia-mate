"""
AQIA Background Jobs
====================
Functions in this file are enqueued by the API and executed by the RQ worker.
Each function must be importable at the top level (no closures / lambdas).

Current jobs:
  - save_interview_job   : persist a completed interview + Q&A to the DB
"""
import os
import datetime
from dotenv import load_dotenv

load_dotenv()


def save_interview_job(
    user_id: str,
    job_category: str,
    overall_score: int | None,
    questions: list[dict],
    analytics_scores: dict | None,
) -> dict:
    """
    Persist a completed interview session to the database.
    Runs inside the RQ worker process — has its own DB session.

    Parameters mirror InterviewCreate pydantic model fields so the API
    can pass plain dicts (JSON-serialisable) to the queue.
    """
    # Import here so the worker process initialises its own engine/session
    from database import SessionLocal
    import models

    db = SessionLocal()
    try:
        session = models.InterviewSession(
            user_id=user_id,
            job_category=job_category,
            overall_score=overall_score,
            completed_at=datetime.datetime.utcnow(),
        )
        db.add(session)
        db.flush()  # get session.id before children

        for q in questions:
            db.add(models.QuestionHistory(
                session_id=session.id,
                question_asked=q.get("question_asked", ""),
                user_answer=q.get("user_answer"),
                ai_feedback=q.get("ai_feedback"),
                score=q.get("score"),
            ))

        if analytics_scores:
            for category, score in analytics_scores.items():
                if score is not None:
                    db.add(models.AnalyticsScore(
                        session_id=session.id,
                        category=category,
                        score=int(score),
                    ))

        db.commit()
        return {"status": "ok", "session_id": session.id}

    except Exception as exc:
        db.rollback()
        raise exc
    finally:
        db.close()
