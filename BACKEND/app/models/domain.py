import enum
from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Enum,
    JSON,
    CheckConstraint,
    UniqueConstraint,
    Index,
    func
)
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base

class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    source_language: Mapped[str] = mapped_column(String, nullable=False)
    target_language: Mapped[str] = mapped_column(String, nullable=False)

    units = relationship("Unit", back_populates="course")


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    color_theme: Mapped[str] = mapped_column(String, nullable=False)

    course = relationship("Course", back_populates="units")
    skills = relationship("Skill", back_populates="unit")


class Skill(Base):
    __tablename__ = "skills"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("units.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    icon: Mapped[str] = mapped_column(String, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    xp_reward_per_lesson: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    lessons_per_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill")

    __table_args__ = (
        Index("idx_skills_unit_id_order_index", "unit_id", "order_index"),
    )


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson")


class ExerciseType(str, enum.Enum):
    multiple_choice = "multiple_choice"
    translate = "translate"
    match_pairs = "match_pairs"
    fill_blank = "fill_blank"
    type_answer = "type_answer"


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[ExerciseType] = mapped_column(Enum(ExerciseType), nullable=False)
    prompt: Mapped[str] = mapped_column(String, nullable=False)
    data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    correct_answer: Mapped[Any] = mapped_column(JSON, nullable=False)

    lesson = relationship("Lesson", back_populates="exercises")

    __table_args__ = (
        Index("idx_exercises_lesson_id_order_index", "lesson_id", "order_index"),
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)

    stats = relationship("UserStats", back_populates="user", uselist=False)
    progress = relationship("SkillProgress", back_populates="user")
    attempts = relationship("LessonAttempt", back_populates="user")


class UserStats(Base):
    __tablename__ = "user_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    hearts: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    max_hearts: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    gems: Mapped[int] = mapped_column(Integer, nullable=False, default=500)
    daily_xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    daily_goal: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    last_activity_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    last_heart_lost_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="stats")

    __table_args__ = (
        CheckConstraint("total_xp >= 0", name="chk_total_xp_positive"),
        CheckConstraint("hearts >= 0 AND hearts <= max_hearts", name="chk_hearts_bound"),
    )


class ProgressStatus(str, enum.Enum):
    locked = "locked"
    available = "available"
    completed = "completed"


class SkillProgress(Base):
    __tablename__ = "skill_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"), nullable=False)
    status: Mapped[ProgressStatus] = mapped_column(Enum(ProgressStatus), nullable=False)
    crown_level: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lessons_completed_in_level: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    xp_earned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="progress")
    skill = relationship("Skill")

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_id_skill_id"),
        CheckConstraint("crown_level >= 0", name="chk_crown_level_positive"),
        CheckConstraint("lessons_completed_in_level >= 0", name="chk_lessons_completed_positive"),
        CheckConstraint("xp_earned >= 0", name="chk_xp_earned_positive"),
    )


class AttemptStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    status: Mapped[AttemptStatus] = mapped_column(Enum(AttemptStatus), nullable=False)
    current_exercise_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    hearts_lost: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    xp_awarded: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="attempts")
    lesson = relationship("Lesson")
    exercise_attempts = relationship("ExerciseAttempt", back_populates="attempt")

    __table_args__ = (
        Index("idx_lesson_attempts_resume", "user_id", "lesson_id", "status"),
        Index("idx_one_active_attempt_per_lesson", "user_id", "lesson_id", unique=True, sqlite_where=Column("status") == "in_progress", postgresql_where=Column("status") == "in_progress"),
        CheckConstraint("current_exercise_index >= 0", name="chk_current_exercise_index_positive"),
        CheckConstraint("hearts_lost >= 0", name="chk_hearts_lost_positive"),
        CheckConstraint("xp_awarded >= 0 OR xp_awarded IS NULL", name="chk_xp_awarded_positive"),
    )


class ExerciseAttempt(Base):
    __tablename__ = "exercise_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_attempt_id: Mapped[int] = mapped_column(Integer, ForeignKey("lesson_attempts.id"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(Integer, ForeignKey("exercises.id"), nullable=False)
    user_answer: Mapped[Any] = mapped_column(JSON, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    answered_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), nullable=False)

    attempt = relationship("LessonAttempt", back_populates="exercise_attempts")
    exercise = relationship("Exercise")
