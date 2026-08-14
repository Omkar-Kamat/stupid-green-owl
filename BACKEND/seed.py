"""
Demo database reset + seed for local development and release verification.

This script is **not** a partial upsert. Each run wipes all learner/content rows and
recreates a deterministic Japanese demo dataset. Safe to re-run; equivalent to reset/reseed.
"""
from datetime import date

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

        exercises: list[Exercise] = []

        # Lesson 1 — includes all five exercise types (used by smoke_test.py)
        exercises.extend(
            [
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=0,
                    type=ExerciseType.multiple_choice,
                    prompt="Select the character for 'あ'",
                    data={"options": ["あ", "い", "う", "え"]},
                    correct_answer="あ",
                ),
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=1,
                    type=ExerciseType.multiple_choice,
                    prompt="Select the character for 'い'",
                    data={"options": ["あ", "い", "う", "え"]},
                    correct_answer="い",
                ),
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=2,
                    type=ExerciseType.fill_blank,
                    prompt="Complete the word",
                    data={"sentence": "あ_がとう", "options": ["り", "い", "う"]},
                    correct_answer=["り"],
                ),
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=3,
                    type=ExerciseType.translate,
                    prompt="Translate: Thank you",
                    data={
                        "word_bank": ["ありがとう", "こんにちは", "さようなら", "おはよう"],
                        "expected_word_count": 1,
                    },
                    correct_answer=["ありがとう"],
                ),
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=4,
                    type=ExerciseType.match_pairs,
                    prompt="Match the pairs",
                    data={
                        "pairs": [
                            {"id": "p1", "left": "Hello"},
                            {"id": "p2", "left": "Thank you"},
                        ],
                        "right_options": [
                            {"id": "r1", "right": "こんにちは"},
                            {"id": "r2", "right": "ありがとう"},
                        ],
                    },
                    correct_answer={"p1": "r1", "p2": "r2"},
                ),
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=5,
                    type=ExerciseType.type_answer,
                    prompt="Type what you hear: A",
                    data={"placeholder": "Type in romaji or kana"},
                    correct_answer=["a", "あ"],
                ),
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=6,
                    type=ExerciseType.fill_blank,
                    prompt="Complete the word: Sushi",
                    data={"sentence": "す_", "options": ["し", "き", "ち"]},
                    correct_answer=["し"],
                ),
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=7,
                    type=ExerciseType.multiple_choice,
                    prompt="Select the character for 'う'",
                    data={"options": ["あ", "い", "う", "え"]},
                    correct_answer="う",
                ),
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=8,
                    type=ExerciseType.translate,
                    prompt="Translate: Good afternoon",
                    data={
                        "word_bank": ["こんにちは", "おはよう", "さようなら", "ありがとう"],
                        "expected_word_count": 1,
                    },
                    correct_answer=["こんにちは"],
                ),
                Exercise(
                    lesson_id=lesson1.id,
                    order_index=9,
                    type=ExerciseType.type_answer,
                    prompt="Type what you hear: I",
                    data={"placeholder": "Type in romaji or kana"},
                    correct_answer=["i", "い"],
                ),
            ]
        )

        # Lesson 2 — Greetings
        for greeting, wrong in [
            ("おはよう", ["こんにちは", "こんばんは", "さようなら"]),
            ("こんにちは", ["おはよう", "こんばんは", "ありがとう"]),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson2.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson2.id]),
                    type=ExerciseType.multiple_choice,
                    prompt=f"Select the word for '{greeting}'",
                    data={"options": [greeting] + wrong},
                    correct_answer=greeting,
                )
            )
        for word, options, correct in [
            ("こん_ちは", ["に", "は", "ま"], "に"),
            ("こん_んは", ["ば", "だ", "ぱ"], "ば"),
            ("あ_がとう", ["り", "き", "み"], "り"),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson2.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson2.id]),
                    type=ExerciseType.fill_blank,
                    prompt="Complete the greeting",
                    data={"sentence": word, "options": options},
                    correct_answer=[correct],
                )
            )
        for prompt, word, options, correct in [
            ("Good morning", "おは_う", ["よ", "ゆ", "や"], "よ"),
            ("Goodbye", "さよ_なら", ["う", "お", "あ"], "う"),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson2.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson2.id]),
                    type=ExerciseType.fill_blank,
                    prompt=f"Complete the word: {prompt}",
                    data={"sentence": word, "options": options},
                    correct_answer=[correct],
                )
            )
        for audio, correct in [
            ("Ohayou", ["ohayou", "おはよう"]),
            ("Arigatou", ["arigatou", "ありがとう"]),
            ("Konnichiwa", ["konnichiwa", "こんにちは"]),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson2.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson2.id]),
                    type=ExerciseType.type_answer,
                    prompt=f"Type what you hear: (Audio: {audio})",
                    data={"placeholder": "Type in romaji or kana"},
                    correct_answer=correct,
                )
            )

        # Lesson 3 — Vocabulary (includes translate + match_pairs)
        for word, wrong in [
            ("すし", ["さし", "そし", "せし"]),
            ("みず", ["まず", "もず", "むず"]),
            ("いぬ", ["あぬ", "えぬ", "おぬ"]),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson3.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson3.id]),
                    type=ExerciseType.multiple_choice,
                    prompt=f"Select the word for '{word}'",
                    data={"options": [word] + wrong},
                    correct_answer=word,
                )
            )
        exercises.append(
            Exercise(
                lesson_id=lesson3.id,
                order_index=len([e for e in exercises if e.lesson_id == lesson3.id]),
                type=ExerciseType.translate,
                prompt="Translate: water",
                data={"word_bank": ["みず", "すし", "いぬ", "ねこ"], "expected_word_count": 1},
                correct_answer=["みず"],
            )
        )
        exercises.append(
            Exercise(
                lesson_id=lesson3.id,
                order_index=len([e for e in exercises if e.lesson_id == lesson3.id]),
                type=ExerciseType.match_pairs,
                prompt="Match animal names",
                data={
                    "pairs": [
                        {"id": "p1", "left": "Cat"},
                        {"id": "p2", "left": "Dog"},
                    ],
                    "right_options": [
                        {"id": "r1", "right": "ねこ"},
                        {"id": "r2", "right": "いぬ"},
                    ],
                },
                correct_answer={"p1": "r1", "p2": "r2"},
            )
        )
        for word, options, correct in [
            ("く_ま", ["る", "ら", "ろ"], "る"),
            ("ほ_", ["ん", "め", "ね"], "ん"),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson3.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson3.id]),
                    type=ExerciseType.fill_blank,
                    prompt="Complete the word",
                    data={"sentence": word, "options": options},
                    correct_answer=[correct],
                )
            )
        for prompt, word, options, correct in [
            ("Water", "み_", ["ず", "す", "つ"], "ず"),
            ("Bird", "と_", ["り", "る", "れ"], "り"),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson3.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson3.id]),
                    type=ExerciseType.fill_blank,
                    prompt=f"Complete the word: {prompt}",
                    data={"sentence": word, "options": options},
                    correct_answer=[correct],
                )
            )
        for audio, correct in [
            ("Mizu", ["mizu", "みず"]),
            ("Neko", ["neko", "ねこ"]),
            ("Inu", ["inu", "いぬ"]),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson3.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson3.id]),
                    type=ExerciseType.type_answer,
                    prompt=f"Type what you hear: (Audio: {audio})",
                    data={"placeholder": "Type in romaji or kana"},
                    correct_answer=correct,
                )
            )

        # Lesson 4 — Sentences
        for word, wrong in [
            ("わたしはがくせいです", ["わたしはせんせいです", "わたしはいしゃです"]),
            ("これはほんです", ["これはぺんです", "これはつくえです"]),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson4.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson4.id]),
                    type=ExerciseType.multiple_choice,
                    prompt=f"Select the correct sentence",
                    data={"options": [word] + wrong},
                    correct_answer=word,
                )
            )
        exercises.append(
            Exercise(
                lesson_id=lesson4.id,
                order_index=len([e for e in exercises if e.lesson_id == lesson4.id]),
                type=ExerciseType.translate,
                prompt="Translate: I am a student",
                data={"word_bank": ["わたし", "は", "がくせい", "です", "ほん"], "expected_word_count": 4},
                correct_answer=["わたし", "は", "がくせい", "です"],
            )
        )
        for word, options, correct in [
            ("わたし_がくせいです", ["は", "が", "を"], "は"),
            ("すし_たべます", ["を", "が", "に"], "を"),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson4.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson4.id]),
                    type=ExerciseType.fill_blank,
                    prompt="Complete the sentence",
                    data={"sentence": word, "options": options},
                    correct_answer=[correct],
                )
            )
        for prompt, word, options, correct in [
            ("I am a student", "わたしはがくせ_です", ["い", "え", "あ"], "い"),
            ("This is a book", "これはほ_です", ["ん", "め", "ね"], "ん"),
            ("I drink water", "みずをの_ます", ["み", "ま", "む"], "み"),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson4.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson4.id]),
                    type=ExerciseType.fill_blank,
                    prompt=f"Complete the sentence: {prompt}",
                    data={"sentence": word, "options": options},
                    correct_answer=[correct],
                )
            )
        for audio, correct in [
            ("Watashi wa gakusei desu", ["watashi wa gakusei desu", "わたしはがくせいです"]),
            ("Kore wa hon desu", ["kore wa hon desu", "これはほんです"]),
            ("Arigatou gozaimasu", ["arigatou gozaimasu", "ありがとうございます"]),
        ]:
            exercises.append(
                Exercise(
                    lesson_id=lesson4.id,
                    order_index=len([e for e in exercises if e.lesson_id == lesson4.id]),
                    type=ExerciseType.type_answer,
                    prompt=f"Type what you hear: (Audio: {audio})",
                    data={"placeholder": "Type in romaji or kana"},
                    correct_answer=correct,
                )
            )

        db.add_all(exercises)
        print(f"Seeded {len(exercises)} exercises across 4 lessons.")

        print("Seeding demo users and progress...")
        demo_user = User(id=DEMO_USER_ID, username="demo_learner")
        db.add(demo_user)
        db.flush()

        db.add(
            UserStats(
                user_id=demo_user.id,
                total_xp=340,
                current_streak=7,
                longest_streak=10,
                hearts=4,
                max_hearts=5,
                gems=500,
                daily_xp=40,
                daily_goal=30,
                last_activity_date=date.today(),
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
