from pydantic import BaseModel, ConfigDict
from typing import Any

class ExerciseResponse(BaseModel):
    id: int
    type: str
    prompt: str
    data: dict[str, Any]
    
    model_config = ConfigDict(from_attributes=True)

class StartLessonResponse(BaseModel):
    attempt_id: int
    current_exercise_index: int
    hearts_remaining: int
    exercises: list[ExerciseResponse]

class AnswerRequest(BaseModel):
    exercise_id: int
    answer: Any

class AnswerResponse(BaseModel):
    correct: bool
    correct_answer: Any
    hearts_remaining: int
    next_exercise_index: int
    lesson_failed: bool
