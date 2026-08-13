from datetime import date
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.domain import (
    Course, Unit, Skill, Lesson, Exercise, ExerciseType,
    User, UserStats, SkillProgress, ProgressStatus, LessonAttempt, AttemptStatus
)

def seed_db():
    db: Session = SessionLocal()
    try:
        if db.query(Course).first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding course content...")
        course = Course(name="Spanish for English Speakers", source_language="en", target_language="es")
        db.add(course)
        db.flush()

        unit1 = Unit(course_id=course.id, title="Basics", order_index=0, color_theme="green")
        db.add(unit1)
        db.flush()

        skill1 = Skill(unit_id=unit1.id, title="Greetings", icon="hand-wave", order_index=0, xp_reward_per_lesson=10)
        db.add(skill1)
        db.flush()
        
        skill2 = Skill(unit_id=unit1.id, title="Introductions", icon="user", order_index=1, xp_reward_per_lesson=10)
        db.add(skill2)
        db.flush()

        unit2 = Unit(course_id=course.id, title="Food", order_index=1, color_theme="blue")
        db.add(unit2)
        db.flush()

        skill3 = Skill(unit_id=unit2.id, title="Food", icon="apple", order_index=0, xp_reward_per_lesson=10)
        db.add(skill3)
        db.flush()

        lesson1 = Lesson(skill_id=skill1.id, order_index=0)
        db.add(lesson1)
        db.flush()
        
        lesson2 = Lesson(skill_id=skill2.id, order_index=0)
        db.add(lesson2)
        db.flush()

        # Lesson 1 exercises
        ex1 = Exercise(
            lesson_id=lesson1.id, order_index=0, type=ExerciseType.multiple_choice,
            prompt="Translate: Hello",
            data={"options": ["Hola", "Adiós", "Gracias", "Casa"]},
            correct_answer="Hola"
        )
        ex2 = Exercise(
            lesson_id=lesson1.id, order_index=1, type=ExerciseType.translate,
            prompt="Translate this sentence",
            data={"source_text": "Hello", "word_bank": ["Hola", "Adiós"]},
            correct_answer="Hola"
        )
        ex3 = Exercise(
            lesson_id=lesson1.id, order_index=2, type=ExerciseType.type_answer,
            prompt="Type the translation",
            data={"placeholder": "Type your answer"},
            correct_answer="Hola"
        )
        db.add_all([ex1, ex2, ex3])
        
        # Lesson 2 exercises
        l2_ex1 = Exercise(
            lesson_id=lesson2.id, order_index=0, type=ExerciseType.multiple_choice,
            prompt="Translate: Apple",
            data={"options": ["Manzana", "Naranja", "Plátano"]},
            correct_answer="Manzana"
        )
        l2_ex2 = Exercise(
            lesson_id=lesson2.id, order_index=1, type=ExerciseType.translate,
            prompt="Translate this sentence",
            data={"source_text": "I eat an apple", "word_bank": ["Yo", "como", "una", "manzana"]},
            correct_answer="Yo como una manzana"
        )
        l2_ex3 = Exercise(
            lesson_id=lesson2.id, order_index=2, type=ExerciseType.type_answer,
            prompt="Type the translation",
            data={"placeholder": "Type your answer"},
            correct_answer="Manzana"
        )
        l2_ex4 = Exercise(
            lesson_id=lesson2.id, order_index=3, type=ExerciseType.fill_blank,
            prompt="Fill in the blank",
            data={"sentence": "Yo ___ estudiante", "options": ["soy", "es", "eres"]},
            correct_answer="soy"
        )
        l2_ex5 = Exercise(
            lesson_id=lesson2.id, order_index=4, type=ExerciseType.match_pairs,
            prompt="Match the pairs",
            data={"pairs": [{"left": "Hello", "right": "Hola"}, {"left": "Thanks", "right": "Gracias"}]},
            correct_answer={"pairs": [{"left": "Hello", "right": "Hola"}, {"left": "Thanks", "right": "Gracias"}]}
        )
        db.add_all([l2_ex1, l2_ex2, l2_ex3, l2_ex4, l2_ex5])

        print("Seeding users...")
        demo_user = User(id=1, username="demo_learner")
        db.add(demo_user)
        db.flush()

        demo_stats = UserStats(
            user_id=demo_user.id,
            total_xp=340,
            current_streak=7,
            longest_streak=10,
            hearts=4,
            max_hearts=5,
            gems=500,
            daily_xp=40,
            daily_goal=30,
            last_activity_date=date.today()
        )
        db.add(demo_stats)
        db.flush()

        # Skill Progress for Demo Learner
        db.add(SkillProgress(
            user_id=demo_user.id, skill_id=skill1.id, status=ProgressStatus.completed, crown_level=1, lessons_completed_in_level=1, xp_earned=10
        ))
        db.add(SkillProgress(
            user_id=demo_user.id, skill_id=skill2.id, status=ProgressStatus.available, crown_level=0, lessons_completed_in_level=0, xp_earned=0
        ))
        db.add(SkillProgress(
            user_id=demo_user.id, skill_id=skill3.id, status=ProgressStatus.locked, crown_level=0, lessons_completed_in_level=0, xp_earned=0
        ))
        
        db.add(LessonAttempt(
            user_id=demo_user.id, lesson_id=lesson2.id, status=AttemptStatus.in_progress, current_exercise_index=0
        ))

        # Leaderboard filler users
        users_data = [
            ("maria_es", 500, 15),
            ("john_doe", 200, 2),
            ("polyglot99", 1200, 45),
            ("newbie_22", 50, 0)
        ]
        
        for idx, (uname, xp, streak) in enumerate(users_data, start=2):
            u = User(id=idx, username=uname)
            db.add(u)
            db.flush()
            db.add(UserStats(
                user_id=u.id, total_xp=xp, current_streak=streak, hearts=5, max_hearts=5, gems=100
            ))

        db.commit()
        print("Seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
