import pytest
from app.models.domain import Exercise, ExerciseType
from app.services.evaluators import EVALUATORS
from app.core.exceptions import InvalidPayloadError

def test_multiple_choice_evaluator():
    evaluator = EVALUATORS[ExerciseType.multiple_choice]
    ex = Exercise(correct_answer="Hola")
    
    assert evaluator.evaluate(ex, "Hola") is True
    assert evaluator.evaluate(ex, "Adiós") is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, 123)

def test_translate_evaluator():
    evaluator = EVALUATORS[ExerciseType.translate]
    ex = Exercise(correct_answer=["Yo", "soy"])
    
    assert evaluator.evaluate(ex, ["Yo", "soy"]) is True
    assert evaluator.evaluate(ex, ["soy", "Yo"]) is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, "Yo soy")

def test_match_pairs_evaluator():
    evaluator = EVALUATORS[ExerciseType.match_pairs]
    ex = Exercise(correct_answer={"A": "1", "B": "2"})
    
    assert evaluator.evaluate(ex, {"A": "1", "B": "2"}) is True
    assert evaluator.evaluate(ex, {"A": "2", "B": "1"}) is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, "invalid")

def test_fill_blank_evaluator():
    evaluator = EVALUATORS[ExerciseType.fill_blank]
    ex = Exercise(correct_answer=["soy"])
    
    assert evaluator.evaluate(ex, ["soy"]) is True
    assert evaluator.evaluate(ex, ["eres"]) is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, "soy")

def test_type_answer_evaluator():
    evaluator = EVALUATORS[ExerciseType.type_answer]
    ex = Exercise(correct_answer=["Hola", "Hola!"])
    
    assert evaluator.evaluate(ex, "hola") is True
    assert evaluator.evaluate(ex, " HOLA  ") is True
    assert evaluator.evaluate(ex, "Hola!") is True
    assert evaluator.evaluate(ex, "Adiós") is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, 123)
