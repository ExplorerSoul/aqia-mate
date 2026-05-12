from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey,
    DateTime, Float, Index
)
from sqlalchemy.orm import relationship
import datetime
import uuid
from database import Base


def generate_short_id() -> str:
    """8-character lowercase hex ID — e.g. 'a3f9c12b'."""
    return uuid.uuid4().hex[:8]


class User(Base):
    __tablename__ = "users"

    id            = Column(String(8),   primary_key=True, default=generate_short_id)
    email         = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name          = Column(String(255), nullable=True)
    created_at    = Column(DateTime,    default=datetime.datetime.utcnow, nullable=False)

    interviews = relationship("InterviewSession", back_populates="user", lazy="dynamic")
    progress   = relationship("ProgressTracking",  back_populates="user", lazy="dynamic")

    __table_args__ = (
        Index("ix_users_email", "email"),
    )


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id            = Column(String(36),  primary_key=True, default=lambda: uuid.uuid4().hex)
    user_id       = Column(String(8),   ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_category  = Column(String(100), nullable=False)
    overall_score = Column(Integer,     nullable=True)
    started_at    = Column(DateTime,    default=datetime.datetime.utcnow, nullable=False)
    completed_at  = Column(DateTime,    nullable=True)

    user      = relationship("User", back_populates="interviews")
    questions = relationship("QuestionHistory", back_populates="session",
                             cascade="all, delete-orphan", lazy="select")
    analytics = relationship("AnalyticsScore",  back_populates="session",
                             cascade="all, delete-orphan", lazy="select")

    __table_args__ = (
        Index("ix_interview_sessions_user_started", "user_id", "started_at"),
        Index("ix_interview_sessions_user_score",   "user_id", "overall_score"),
    )


class QuestionHistory(Base):
    __tablename__ = "question_history"

    id             = Column(String(36), primary_key=True, default=lambda: uuid.uuid4().hex)
    session_id     = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question_asked = Column(Text,    nullable=False)
    user_answer    = Column(Text,    nullable=True)
    ai_feedback    = Column(Text,    nullable=True)
    score          = Column(Integer, nullable=True)

    session = relationship("InterviewSession", back_populates="questions")

    __table_args__ = (
        Index("ix_question_history_session", "session_id"),
    )


class AnalyticsScore(Base):
    __tablename__ = "analytics_scores"

    id         = Column(String(36), primary_key=True, default=lambda: uuid.uuid4().hex)
    session_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    category   = Column(String(100), nullable=False)
    score      = Column(Integer,     nullable=False)

    session = relationship("InterviewSession", back_populates="analytics")

    __table_args__ = (
        Index("ix_analytics_scores_session", "session_id"),
    )


class ProgressTracking(Base):
    __tablename__ = "progress_tracking"

    id                     = Column(String(36), primary_key=True, default=lambda: uuid.uuid4().hex)
    user_id                = Column(String(8),  ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date_recorded          = Column(DateTime,   default=datetime.datetime.utcnow, nullable=False)
    rolling_average_score  = Column(Float,      nullable=False)
    total_interviews       = Column(Integer,    nullable=False)
    most_improved_category = Column(String(100), nullable=True)

    user = relationship("User", back_populates="progress")

    __table_args__ = (
        Index("ix_progress_tracking_user_date", "user_id", "date_recorded"),
    )
