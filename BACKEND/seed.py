from datetime import date
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.domain import (
    Course, Unit, Skill, Lesson, Exercise, ExerciseType,
    User, UserStats, SkillProgress, ProgressStatus, LessonAttempt, AttemptStatus,
    ExerciseAttempt
)

def seed_db():
    db: Session = SessionLocal()
    try:
        if db.query(Course).first():
            print("Database already seeded. Cleaning up...")
            db.query(ExerciseAttempt).delete()
            db.query(LessonAttempt).delete()
            db.query(SkillProgress).delete()
            db.query(Exercise).delete()
            db.query(Lesson).delete()
            db.query(Skill).delete()
            db.query(Unit).delete()
            db.query(Course).delete()
            db.commit()

        print("Seeding course content...")
        course = Course(name="Japanese for English Speakers", source_language="en", target_language="ja")
        db.add(course)
        db.flush()

        # Unit 1
        unit1 = Unit(course_id=course.id, title="Basics & Greetings", order_index=0, color_theme="purple")
        db.add(unit1)
        db.flush()

        skill1 = Skill(unit_id=unit1.id, title="Hiragana", icon="character", order_index=0, xp_reward_per_lesson=10)
        db.add(skill1)
        db.flush()
        
        skill2 = Skill(unit_id=unit1.id, title="Greetings", icon="hand-wave", order_index=1, xp_reward_per_lesson=10)
        db.add(skill2)
        db.flush()
        
        # Unit 2
        unit2 = Unit(course_id=course.id, title="Vocabulary & Grammar", order_index=1, color_theme="green")
        db.add(unit2)
        db.flush()

        skill3 = Skill(unit_id=unit2.id, title="Vocabulary", icon="book", order_index=0, xp_reward_per_lesson=10)
        db.add(skill3)
        db.flush()

        skill4 = Skill(unit_id=unit2.id, title="Sentences", icon="message", order_index=1, xp_reward_per_lesson=10)
        db.add(skill4)
        db.flush()

        # Lessons
        lesson1 = Lesson(skill_id=skill1.id, order_index=0)
        lesson2 = Lesson(skill_id=skill2.id, order_index=0)
        lesson3 = Lesson(skill_id=skill3.id, order_index=0)
        lesson4 = Lesson(skill_id=skill4.id, order_index=0)
        db.add_all([lesson1, lesson2, lesson3, lesson4])
        db.flush()

        exercises = []
        
        # Helper to generate exercises
        # Test types: Read and Select, Fill in the Blanks, Read and Complete, Listen and Type

        # 1. Lesson 1: Hiragana (10 exercises)
        # Read and Select (multiple_choice)
        for i, (char, wrong) in enumerate([("あ", ["い", "う", "え"]), ("い", ["あ", "う", "え"]), ("う", ["あ", "い", "え"])]):
            exercises.append(Exercise(lesson_id=lesson1.id, order_index=len(exercises), type=ExerciseType.multiple_choice, prompt=f"Select the character for '{char}' (Read and Select)", data={"options": [char] + wrong}, correct_answer=char))
        
        # Fill in the Blanks
        for i, (word, options, correct) in enumerate([("あ_がとう", ["り", "い", "う"], "り"), ("お_よう", ["は", "へ", "ほ"], "は"), ("さ_うなら", ["よ", "や", "ゆ"], "よ")]):
            exercises.append(Exercise(lesson_id=lesson1.id, order_index=len(exercises), type=ExerciseType.fill_blank, prompt="Complete the word (Fill in the Blanks)", data={"sentence": word, "options": options}, correct_answer=[correct]))

        # Read and Complete (fill missing letters)
        for i, (prompt, word, options, correct) in enumerate([("Sushi", "す_", ["し", "き", "ち"], "し"), ("Neko", "ね_", ["こ", "け", "く"], "こ")]):
            exercises.append(Exercise(lesson_id=lesson1.id, order_index=len(exercises), type=ExerciseType.fill_blank, prompt=f"Complete the word: {prompt} (Read and Complete)", data={"sentence": word, "options": options}, correct_answer=[correct]))

        # Listen and Type
        for i, (audio, correct) in enumerate([("A", ["a", "あ"]), ("I", ["i", "い"])]):
            exercises.append(Exercise(lesson_id=lesson1.id, order_index=len(exercises), type=ExerciseType.type_answer, prompt=f"Type what you hear: (Audio: {audio}) (Listen and Type)", data={"placeholder": "Type in romaji or kana"}, correct_answer=correct))

        # 2. Lesson 2: Greetings (10 exercises)
        for i, (greeting, wrong) in enumerate([("おはよう", ["こんにちは", "こんばんは", "さようなら"]), ("こんにちは", ["おはよう", "こんばんは", "ありがとう"])]):
            exercises.append(Exercise(lesson_id=lesson2.id, order_index=len(exercises), type=ExerciseType.multiple_choice, prompt=f"Select the word for '{greeting}' (Read and Select)", data={"options": [greeting] + wrong}, correct_answer=greeting))
            
        for i, (word, options, correct) in enumerate([("こん_ちは", ["に", "は", "ま"], "に"), ("こん_んは", ["ば", "だ", "ぱ"], "ば"), ("あ_がとう", ["り", "き", "み"], "り")]):
            exercises.append(Exercise(lesson_id=lesson2.id, order_index=len(exercises), type=ExerciseType.fill_blank, prompt="Complete the greeting (Fill in the Blanks)", data={"sentence": word, "options": options}, correct_answer=[correct]))

        for i, (prompt, word, options, correct) in enumerate([("Good morning", "おは_う", ["よ", "ゆ", "や"], "よ"), ("Goodbye", "さよ_なら", ["う", "お", "あ"], "う")]):
            exercises.append(Exercise(lesson_id=lesson2.id, order_index=len(exercises), type=ExerciseType.fill_blank, prompt=f"Complete the word: {prompt} (Read and Complete)", data={"sentence": word, "options": options}, correct_answer=[correct]))

        for i, (audio, correct) in enumerate([("Ohayou", ["ohayou", "おはよう"]), ("Arigatou", ["arigatou", "ありがとう"]), ("Konnichiwa", ["konnichiwa", "こんにちは"])]):
            exercises.append(Exercise(lesson_id=lesson2.id, order_index=len(exercises), type=ExerciseType.type_answer, prompt=f"Type what you hear: (Audio: {audio}) (Listen and Type)", data={"placeholder": "Type in romaji or kana"}, correct_answer=correct))

        # 3. Lesson 3: Vocabulary (10 exercises)
        for i, (word, wrong) in enumerate([("すし", ["さし", "そし", "せし"]), ("みず", ["まず", "もず", "むず"]), ("いぬ", ["あぬ", "えぬ", "おぬ"])]):
            exercises.append(Exercise(lesson_id=lesson3.id, order_index=len(exercises), type=ExerciseType.multiple_choice, prompt=f"Select the word for '{word}' (Read and Select)", data={"options": [word] + wrong}, correct_answer=word))
            
        for i, (word, options, correct) in enumerate([("く_ま", ["る", "ら", "ろ"], "る"), ("ほ_", ["ん", "め", "ね"], "ん")]):
            exercises.append(Exercise(lesson_id=lesson3.id, order_index=len(exercises), type=ExerciseType.fill_blank, prompt="Complete the word (Fill in the Blanks)", data={"sentence": word, "options": options}, correct_answer=[correct]))

        for i, (prompt, word, options, correct) in enumerate([("Water", "み_", ["ず", "す", "つ"], "ず"), ("Bird", "と_", ["り", "る", "れ"], "り")]):
            exercises.append(Exercise(lesson_id=lesson3.id, order_index=len(exercises), type=ExerciseType.fill_blank, prompt=f"Complete the word: {prompt} (Read and Complete)", data={"sentence": word, "options": options}, correct_answer=[correct]))

        for i, (audio, correct) in enumerate([("Mizu", ["mizu", "みず"]), ("Neko", ["neko", "ねこ"]), ("Inu", ["inu", "いぬ"])]):
            exercises.append(Exercise(lesson_id=lesson3.id, order_index=len(exercises), type=ExerciseType.type_answer, prompt=f"Type what you hear: (Audio: {audio}) (Listen and Type)", data={"placeholder": "Type in romaji or kana"}, correct_answer=correct))

        # 4. Lesson 4: Sentences (10 exercises)
        for i, (word, wrong) in enumerate([("わたしはがくせいです", ["わたしはせんせいです", "わたしはいしゃです"]), ("これはほんです", ["これはぺんです", "これはつくえです"])]):
            exercises.append(Exercise(lesson_id=lesson4.id, order_index=len(exercises), type=ExerciseType.multiple_choice, prompt=f"Select the correct sentence for '{word}' (Read and Select)", data={"options": [word] + wrong}, correct_answer=word))
            
        for i, (word, options, correct) in enumerate([("わたし_がくせいです", ["は", "が", "を"], "は"), ("すし_たべます", ["を", "が", "に"], "を")]):
            exercises.append(Exercise(lesson_id=lesson4.id, order_index=len(exercises), type=ExerciseType.fill_blank, prompt="Complete the sentence (Fill in the Blanks)", data={"sentence": word, "options": options}, correct_answer=[correct]))

        for i, (prompt, word, options, correct) in enumerate([("I am a student", "わたしはがくせ_です", ["い", "え", "あ"], "い"), ("This is a book", "これはほ_です", ["ん", "め", "ね"], "ん"), ("I drink water", "みずをの_ます", ["み", "ま", "む"], "み")]):
            exercises.append(Exercise(lesson_id=lesson4.id, order_index=len(exercises), type=ExerciseType.fill_blank, prompt=f"Complete the sentence: {prompt} (Read and Complete)", data={"sentence": word, "options": options}, correct_answer=[correct]))

        for i, (audio, correct) in enumerate([("Watashi wa gakusei desu", ["watashi wa gakusei desu", "わたしはがくせいです"]), ("Kore wa hon desu", ["kore wa hon desu", "これはほんです"]), ("Arigatou gozaimasu", ["arigatou gozaimasu", "ありがとうございます"])]):
            exercises.append(Exercise(lesson_id=lesson4.id, order_index=len(exercises), type=ExerciseType.type_answer, prompt=f"Type what you hear: (Audio: {audio}) (Listen and Type)", data={"placeholder": "Type in romaji or kana"}, correct_answer=correct))

        # Add more if we are under 40 (we have 10 + 10 + 10 + 10 = 40)
        db.add_all(exercises)

        print(f"Seeded {len(exercises)} exercises.")

        print("Seeding users...")
        # Check if users exist before adding
        if not db.query(User).first():
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
            
            db.add(LessonAttempt(
                user_id=demo_user.id, lesson_id=lesson2.id, status=AttemptStatus.in_progress, current_exercise_index=0
            ))

            # Leaderboard filler users
            users_data = [
                ("sakura_jp", 500, 15),
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
