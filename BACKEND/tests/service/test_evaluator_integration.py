import pytest
from app.models.domain import Exercise, ExerciseType
from app.services.evaluators import EVALUATORS
from app.core.exceptions import InvalidPayloadError

def test_seeded_multiple_choice():
    evaluator = EVALUATORS[ExerciseType.multiple_choice]
    ex = Exercise(correct_answer="Manzana")
    assert evaluator.evaluate(ex, "Manzana") is True
    assert evaluator.evaluate(ex, "Naranja") is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, ["Manzana"])

def test_seeded_translate():
    evaluator = EVALUATORS[ExerciseType.translate]
    ex = Exercise(correct_answer=["Yo", "como", "una", "manzana"])
    assert evaluator.evaluate(ex, ["Yo", "como", "una", "manzana"]) is True
    assert evaluator.evaluate(ex, ["Yo", "como"]) is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, "Yo como una manzana")

def test_seeded_type_answer():
    evaluator = EVALUATORS[ExerciseType.type_answer]
    ex = Exercise(correct_answer=["Manzana"])
    assert evaluator.evaluate(ex, "manzana") is True
    assert evaluator.evaluate(ex, " manzana ") is True
    assert evaluator.evaluate(ex, "naranja") is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, ["Manzana"])

def test_seeded_fill_blank():
    evaluator = EVALUATORS[ExerciseType.fill_blank]
    ex = Exercise(correct_answer=["soy"])
    assert evaluator.evaluate(ex, ["soy"]) is True
    assert evaluator.evaluate(ex, ["es"]) is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, "soy")

def test_seeded_match_pairs():
    evaluator = EVALUATORS[ExerciseType.match_pairs]
    ans = {"pairs": [{"left": "Hello", "right": "Hola"}, {"left": "Thanks", "right": "Gracias"}]}
    ex = Exercise(correct_answer=ans)
    assert evaluator.evaluate(ex, ans) is True
    assert evaluator.evaluate(ex, {"pairs": [{"left": "Hello", "right": "Gracias"}]}) is False
    with pytest.raises(InvalidPayloadError):
        evaluator.evaluate(ex, [{"left": "Hello", "right": "Hola"}])
