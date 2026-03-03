from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
import datetime
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    interviews = relationship("InterviewSession", back_populates="user")
    progress = relationship("ProgressTracking", back_populates="user")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    job_category = Column(String, nullable=False)  # e.g., "Frontend Developer"
    overall_score = Column(Integer, nullable=True) # Final score 0-100
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="interviews")
    questions = relationship("QuestionHistory", back_populates="session")
    analytics = relationship("AnalyticsScore", back_populates="session")

class QuestionHistory(Base):
    __tablename__ = "question_history"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String, ForeignKey("interview_sessions.id"))
    question_asked = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)  # Score for this specific answer
    
    session = relationship("InterviewSession", back_populates="questions")

class AnalyticsScore(Base):
    __tablename__ = "analytics_scores"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String, ForeignKey("interview_sessions.id"))
    category = Column(String, nullable=False) # e.g., "Communication", "Technical Accuracy"
    score = Column(Integer, nullable=False)
    
    session = relationship("InterviewSession", back_populates="analytics")

class ProgressTracking(Base):
    __tablename__ = "progress_tracking"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    date_recorded = Column(DateTime, default=datetime.datetime.utcnow)
    rolling_average_score = Column(Float, nullable=False)
    total_interviews = Column(Integer, nullable=False)
    most_improved_category = Column(String, nullable=True)
    
    user = relationship("User", back_populates="progress")
