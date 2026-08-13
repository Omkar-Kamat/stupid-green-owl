from abc import ABC, abstractmethod
from typing import Any
from app.models.domain import Exercise, ExerciseType

class AnswerEvaluator(ABC):
    @abstractmethod
    def evaluate(self, exercise: Exercise, submitted_answer: Any) -> bool:
        pass

class MultipleChoiceEvaluator(AnswerEvaluator):
    def evaluate(self, exercise: Exercise, submitted_answer: Any) -> bool:
        if not isinstance(submitted_answer, str):
            return False
        return exercise.correct_answer == submitted_answer

class TranslateEvaluator(AnswerEvaluator):
    def evaluate(self, exercise: Exercise, submitted_answer: Any) -> bool:
        if not isinstance(submitted_answer, list):
            return False
        return exercise.correct_answer == submitted_answer

class MatchPairsEvaluator(AnswerEvaluator):
    def evaluate(self, exercise: Exercise, submitted_answer: Any) -> bool:
        if not isinstance(submitted_answer, dict):
            return False
        return exercise.correct_answer == submitted_answer

class FillBlankEvaluator(AnswerEvaluator):
    def evaluate(self, exercise: Exercise, submitted_answer: Any) -> bool:
        if not isinstance(submitted_answer, list):
            return False
        return exercise.correct_answer == submitted_answer

class TypeAnswerEvaluator(AnswerEvaluator):
    def evaluate(self, exercise: Exercise, submitted_answer: Any) -> bool:
        if not isinstance(submitted_answer, str):
            return False
        
        submitted = submitted_answer.strip().lower()
        if not isinstance(exercise.correct_answer, list):
            return False
        
        accepted = [str(ans).strip().lower() for ans in exercise.correct_answer]
        return submitted in accepted

EVALUATORS: dict[ExerciseType, AnswerEvaluator] = {
    ExerciseType.multiple_choice: MultipleChoiceEvaluator(),
    ExerciseType.translate: TranslateEvaluator(),
    ExerciseType.match_pairs: MatchPairsEvaluator(),
    ExerciseType.fill_blank: FillBlankEvaluator(),
    ExerciseType.type_answer: TypeAnswerEvaluator(),
}
