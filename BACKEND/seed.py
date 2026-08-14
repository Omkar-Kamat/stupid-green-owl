"""
Demo database reset + seed for local development and release verification.

This script is **not** a partial upsert. Each run wipes all learner/content rows and
recreates a deterministic Japanese demo dataset. Safe to re-run; equivalent to reset/reseed.
"""
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.domain import (
    Course,
    Unit,
    Skill,
    Lesson,
    Exercise,
    ExerciseType,
    User,
    UserStats,
    SkillProgress,
    ProgressStatus,
    LessonAttempt,
    AttemptStatus,
    ExerciseAttempt,
)

# Stable demo user ids (recreated on every run)
DEMO_USER_ID = 1
LEADERBOARD_USERS = [
    (2, "sakura_jp", 500, 15),
    (3, "john_doe", 200, 2),
    (4, "polyglot99", 1200, 45),
    (5, "newbie_22", 50, 0),
]


def reset_demo_database(db: Session) -> None:
    """Delete all content and learner rows so the next seed is deterministic."""
    db.query(ExerciseAttempt).delete()
    db.query(LessonAttempt).delete()
    db.query(SkillProgress).delete()
    db.query(UserStats).delete()
    db.query(Exercise).delete()
    db.query(Lesson).delete()
    db.query(Skill).delete()
    db.query(Unit).delete()
    db.query(Course).delete()
    db.query(User).delete()
    db.commit()


def seed_db() -> None:
    db: Session = SessionLocal()
    try:
        print("Resetting demo database...")
        reset_demo_database(db)

        print("Seeding course content...")
        course = Course(
            name="Japanese for English Speakers",
            source_language="en",
            target_language="ja",
        )
        db.add(course)
        db.flush()

        unit1 = Unit(
            course_id=course.id,
            title="Basics & Greetings",
            order_index=0,
            color_theme="purple",
        )
        unit2 = Unit(
            course_id=course.id,
            title="Vocabulary & Grammar",
            order_index=1,
            color_theme="green",
        )
        db.add_all([unit1, unit2])
        db.flush()

        skill1 = Skill(
            unit_id=unit1.id,
            title="Hiragana",
            icon="character",
            order_index=0,
            xp_reward_per_lesson=10,
        )
        skill2 = Skill(
            unit_id=unit1.id,
            title="Greetings",
            icon="hand-wave",
            order_index=1,
            xp_reward_per_lesson=10,
        )
        skill3 = Skill(
            unit_id=unit2.id,
            title="Vocabulary",
            icon="book",
            order_index=0,
            xp_reward_per_lesson=10,
        )
        skill4 = Skill(
            unit_id=unit2.id,
            title="Sentences",
            icon="message",
            order_index=1,
            xp_reward_per_lesson=10,
        )
        db.add_all([skill1, skill2, skill3, skill4])
        db.flush()

        lesson1 = Lesson(skill_id=skill1.id, order_index=0)
        lesson2 = Lesson(skill_id=skill2.id, order_index=0)
        lesson3 = Lesson(skill_id=skill3.id, order_index=0)
        lesson4 = Lesson(skill_id=skill4.id, order_index=0)
        db.add_all([lesson1, lesson2, lesson3, lesson4])
        db.flush()

        # Add more units and skills to satisfy "increase number of units and sections, each section contains 5 units"
        # We treat "sections" as Units and "units" as Skills for our schema.
        # We already have unit1 (2 skills) and unit2 (2 skills). We will add 3 more skills to them, and then add 3 more units with 5 skills each.
        extra_skills = []
        for u in [unit1, unit2]:
            for i in range(2, 5):
                skill = Skill(
                    unit_id=u.id,
                    title=f"Extra Skill {u.order_index + 1}.{i + 1}",
                    icon="book",
                    order_index=i,
                    xp_reward_per_lesson=10,
                )
                db.add(skill)
                extra_skills.append(skill)
        db.flush()

        for u_idx in range(2, 5):
            unit = Unit(
                course_id=course.id,
                title=f"Advanced Unit {u_idx + 1}",
                order_index=u_idx,
                color_theme="blue",
            )
            db.add(unit)
            db.flush()
            for s_idx in range(5):
                skill = Skill(
                    unit_id=unit.id,
                    title=f"Skill {u_idx + 1}.{s_idx + 1}",
                    icon="book",
                    order_index=s_idx,
                    xp_reward_per_lesson=10,
                )
                db.add(skill)
                extra_skills.append(skill)
        db.flush()
        
        # Give them dummy lessons
        extra_lessons = []
        for skill in extra_skills:
            l = Lesson(skill_id=skill.id, order_index=0)
            db.add(l)
            extra_lessons.append(l)
        db.flush()

        import random

        exercises: list[Exercise] = []
        pool: list[dict] = []

        pool.extend([
            dict(type=ExerciseType.multiple_choice, prompt="Select the character for 'あ'", data={"options": ["あ", "い", "う", "え"]}, correct_answer="あ"),
            dict(type=ExerciseType.multiple_choice, prompt="Select the character for 'い'", data={"options": ["あ", "い", "う", "え"]}, correct_answer="い"),
            dict(type=ExerciseType.fill_blank, prompt="Complete the word", data={"sentence": "あ_がとう", "options": ["り", "い", "う"]}, correct_answer=["り"]),
            dict(type=ExerciseType.translate, prompt="Translate: Thank you", data={"word_bank": ["ありがとう", "こんにちは", "さようなら", "おはよう"], "expected_word_count": 1}, correct_answer=["ありがとう"]),
            dict(type=ExerciseType.fill_blank, prompt="Complete the word: Sushi", data={"sentence": "す_", "options": ["し", "き", "ち"]}, correct_answer=["し"]),
            dict(type=ExerciseType.multiple_choice, prompt="Select the character for 'う'", data={"options": ["あ", "い", "う", "え"]}, correct_answer="う"),
            dict(type=ExerciseType.translate, prompt="Translate: Good afternoon", data={"word_bank": ["こんにちは", "おはよう", "さようなら", "ありがとう"], "expected_word_count": 1}, correct_answer=["こんにちは"]),
            dict(type=ExerciseType.translate, prompt="Translate: Good morning", data={"word_bank": ["おはよう", "さようなら", "こんにちは"], "expected_word_count": 1}, correct_answer=["おはよう"]),
        ])

        for greeting, wrong in [
            ("おはよう", ["こんにちは", "こんばんは", "さようなら"]),
            ("こんにちは", ["おはよう", "こんばんは", "ありがとう"]),
        ]:
            pool.append(dict(type=ExerciseType.multiple_choice, prompt=f"Select the word for '{greeting}'", data={"options": [greeting] + wrong}, correct_answer=greeting))

        # Lesson 1 — exactly 5 exercises matching the updated smoke_test.py
        lesson1_data = [
            dict(type=ExerciseType.multiple_choice, prompt="Select the character for 'あ'", data={"options": ["あ", "い", "う", "え"]}, correct_answer="あ"),
            dict(type=ExerciseType.fill_blank, prompt="Complete the word", data={"sentence": "あ_がとう", "options": ["り", "い", "う"]}, correct_answer=["り"]),
            dict(type=ExerciseType.translate, prompt="Translate: Thank you", data={"word_bank": ["ありがとう", "こんにちは", "さようなら", "おはよう"], "expected_word_count": 1}, correct_answer=["ありがとう"]),
            dict(type=ExerciseType.multiple_choice, prompt="Select the character for 'い'", data={"options": ["あ", "い", "う", "え"]}, correct_answer="い"),
            dict(type=ExerciseType.fill_blank, prompt="Complete the word: Sushi", data={"sentence": "す_", "options": ["し", "き", "ち"]}, correct_answer=["し"]),
        ]

        for i, data in enumerate(lesson1_data):
            exercises.append(Exercise(lesson_id=lesson1.id, order_index=i, **data))

        all_other_lessons = [lesson2, lesson3, lesson4] + extra_lessons
        for lesson in all_other_lessons:
            sampled = random.sample(pool, 5)
            for i, data in enumerate(sampled):
                exercises.append(Exercise(lesson_id=lesson.id, order_index=i, **data))

        db.add_all(exercises)
        print(f"Seeded {len(exercises)} exercises across {1 + len(all_other_lessons)} lessons.")

        print("Seeding demo users and progress...")
        demo_user = User(id=DEMO_USER_ID, username="demo_learner")
        db.add(demo_user)
        db.flush()

        db.add(
            UserStats(
                user_id=demo_user.id,
                total_xp=340,
                current_streak=100,
                longest_streak=100,
                hearts=4,
                max_hearts=5,
                gems=500,
                daily_xp=40,
                daily_goal=30,
                last_activity_date=date.today() - timedelta(days=1),
            )
        )

        db.add(
            SkillProgress(
                user_id=demo_user.id,
                skill_id=skill1.id,
                status=ProgressStatus.completed,
                crown_level=1,
                lessons_completed_in_level=1,
                xp_earned=10,
            )
        )
        db.add(
            SkillProgress(
                user_id=demo_user.id,
                skill_id=skill2.id,
                status=ProgressStatus.available,
                crown_level=0,
                lessons_completed_in_level=0,
                xp_earned=0,
            )
        )
        db.add(
            LessonAttempt(
                user_id=demo_user.id,
                lesson_id=lesson2.id,
                status=AttemptStatus.in_progress,
                current_exercise_index=0,
            )
        )

        for user_id, username, xp, streak in LEADERBOARD_USERS:
            db.add(User(id=user_id, username=username))
            db.flush()
            db.add(
                UserStats(
                    user_id=user_id,
                    total_xp=xp,
                    current_streak=streak,
                    hearts=5,
                    max_hearts=5,
                    gems=100,
                )
            )

        db.commit()
        print("Seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
