"""
AQIA Background Jobs
====================
Functions enqueued by the API and executed by the RQ worker (or run
synchronously when Redis is unavailable).

Jobs:
  - save_interview_job : persist a completed interview + Q&A + analytics
                         + update progress_tracking for the user
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

    Writes to:
      - interview_sessions   (one row)
      - question_history     (one row per question)
      - analytics_scores     (one row per category)
      - progress_tracking    (one row — rolling stats for the user)

    All linked by user_id (8-char hex) as the single bridge key.
    """
    from database import SessionLocal
    import models
    from sqlalchemy import func

    db = SessionLocal()
    try:
        # ── 1. Interview session ──────────────────────────────────────────────
        session = models.InterviewSession(
            user_id=user_id,
            job_category=job_category,
            overall_score=overall_score,
            completed_at=datetime.datetime.utcnow(),
        )
        db.add(session)
        db.flush()  # get session.id before inserting children

        # ── 2. Question history ───────────────────────────────────────────────
        for q in questions:
            db.add(models.QuestionHistory(
                session_id=session.id,
                question_asked=q.get("question_asked", ""),
                user_answer=q.get("user_answer"),
                ai_feedback=q.get("ai_feedback"),
                score=q.get("score"),
            ))

        # ── 3. Analytics scores ───────────────────────────────────────────────
        if analytics_scores:
            for category, score in analytics_scores.items():
                if score is not None:
                    db.add(models.AnalyticsScore(
                        session_id=session.id,
                        category=category,
                        score=int(score),
                    ))

        # ── 4. Progress tracking — recompute rolling stats for this user ──────
        if overall_score is not None:
            agg = (
                db.query(
                    func.count(models.InterviewSession.id).label("total"),
                    func.avg(models.InterviewSession.overall_score).label("avg"),
                )
                .filter(
                    models.InterviewSession.user_id == user_id,
                    models.InterviewSession.overall_score.isnot(None),
                )
                .one()
            )
            # Include the current session in the count (it's already flushed)
            total = (agg.total or 0)
            rolling_avg = float(agg.avg) if agg.avg else float(overall_score)

            # Find the most-improved category by comparing latest vs previous session
            most_improved = _get_most_improved_category(db, user_id, analytics_scores)

            db.add(models.ProgressTracking(
                user_id=user_id,
                date_recorded=datetime.datetime.utcnow(),
                rolling_average_score=round(rolling_avg, 2),
                total_interviews=total,
                most_improved_category=most_improved,
            ))

        db.commit()
        return {"status": "ok", "session_id": session.id}

    except Exception as exc:
        db.rollback()
        raise exc
    finally:
        db.close()


def _get_most_improved_category(db, user_id: str, current_scores: dict) -> str | None:
    """
    Compare current analytics scores against the previous session's scores.
    Return the category with the biggest positive improvement.
    """
    import models

    # Get the previous session's analytics
    prev_session = (
        db.query(models.InterviewSession)
        .filter(
            models.InterviewSession.user_id == user_id,
            models.InterviewSession.overall_score.isnot(None),
        )
        .order_by(models.InterviewSession.started_at.desc())
        .offset(1)  # skip the current one (already flushed)
        .first()
    )

    if not prev_session:
        return None

    prev_analytics = {a.category: a.score for a in prev_session.analytics}
    if not prev_analytics:
        return None

    best_category = None
    best_improvement = 0

    for category, score in current_scores.items():
        if score is None:
            continue
        prev_score = prev_analytics.get(category)
        if prev_score is not None:
            improvement = int(score) - prev_score
            if improvement > best_improvement:
                best_improvement = improvement
                best_category = category

    return best_category
