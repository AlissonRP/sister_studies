import os
import random
import operator
from dataclasses import dataclass, field
from typing import Callable

from flask import Flask, jsonify, render_template, request, session

OPERATIONS: dict[str, tuple[str, Callable[[int, int], int]]] = {
    "soma": ("+", operator.add),
    "subtração": ("-", operator.sub),
    "multiplicação": ("×", operator.mul),
    "divisão": ("÷", operator.floordiv),
}

EXERCISE_TYPES = [*OPERATIONS.keys(), "decomposição", "problema"]

CORRECT_MESSAGES = [
    "Uau, você arrasou! 🎀",
    "Perfeito! Você é incrível! 🌸",
    "Isso mesmo! Continue assim! ⭐",
    "Que inteligente! Mandou bem! 🎉",
    "Acertou em cheio! Orgulho total! 💖",
]

WRONG_MESSAGES = [
    "Quase lá! Não desiste, você consegue! 🌷",
    "Errinho sem querer! Bora tentar o próximo! 🍭",
    "Foi mal dessa vez, mas você vai arrasar no próximo! 🎀",
    "Não tem problema! Aprender faz parte! 💪",
    "Continua tentando, você está indo muito bem! 🌸",
]

EXAM_TOTAL = 8
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "static"),
    template_folder=os.path.join(BASE_DIR, "templates"),
)
app.secret_key = os.environ.get("SECRET_KEY", "kitty-local-2025")


@dataclass
class Exercise:
    first_number: int
    second_number: int | None
    operation_name: str
    symbol: str
    correct_answer: int | str
    calculate: Callable[[int, int], int] | None = field(default=None, repr=False)
    correct_terms: list[int] = field(default_factory=list)
    question_text: str | None = None
    badge_text: str | None = None

    @classmethod
    def generate(cls) -> "Exercise":
        exercise_type = random.choice(EXERCISE_TYPES)
        return generate_exercise_by_type(exercise_type)

    def to_dict(self) -> dict:
        return {
            "first_number": self.first_number,
            "second_number": self.second_number,
            "operation_name": self.operation_name,
            "symbol": self.symbol,
            "correct_answer": self.correct_answer,
            "correct_terms": self.correct_terms,
            "question_text": self.question_text,
            "badge_text": self.badge_text or self.operation_name,
        }


def generate_exercise_by_type(exercise_type: str) -> Exercise:
    if exercise_type == "decomposição":
        return generate_decomposition_exercise()

    if exercise_type == "problema":
        return generate_word_problem()

    return generate_operation_exercise(exercise_type)


def generate_decomposition_exercise() -> Exercise:
    first_number = random.randint(1000, 99999)
    terms = decompose_number(first_number)
    return Exercise(
        first_number=first_number,
        second_number=None,
        operation_name="decomposição",
        symbol="=",
        correct_answer=format_decomposition(terms),
        correct_terms=terms,
    )


def generate_operation_exercise(operation_name: str) -> Exercise:
    symbol, calculate = OPERATIONS[operation_name]

    if operation_name == "soma":
        first_number = random.randint(100, 9999)
        second_number = random.randint(100, 9999)

    elif operation_name == "subtração":
        first_number = random.randint(200, 9999)
        second_number = random.randint(1, first_number - 1)

    elif operation_name == "multiplicação":
        first_number = random.randint(2, 999)
        second_number = random.randint(2, 9)

    else:  # divisão
        second_number = random.randint(2, 10)
        quotient = random.randint(10, 999)
        first_number = second_number * quotient

    return Exercise(
        first_number=first_number,
        second_number=second_number,
        operation_name=operation_name,
        symbol=symbol,
        correct_answer=calculate(first_number, second_number),
        calculate=calculate,
    )


def generate_word_problem() -> Exercise:
    operation_name = random.choice(list(OPERATIONS.keys()))
    symbol, calculate = OPERATIONS[operation_name]

    people = ["Maria", "João", "Ana", "Pedro", "Lia", "Davi", "Sofia", "Lucas"]
    items = [
        ("livros", "quantos livros", "comprou", "emprestou"),
        ("maçãs", "quantas maçãs", "comprou", "comeu"),
        ("figurinhas", "quantas figurinhas", "ganhou", "deu"),
        ("lápis", "quantos lápis", "comprou", "usou"),
        ("adesivos", "quantos adesivos", "ganhou", "colou"),
        ("balas", "quantas balas", "comprou", "comeu"),
    ]
    person = random.choice(people)
    item_plural, item_question, gain_verb, loss_verb = random.choice(items)

    if operation_name == "soma":
        first_number = random.randint(3, 35)
        second_number = random.randint(2, 35)
        question_text = (
            f"{person} tinha {first_number} {item_plural} e {gain_verb} mais "
            f"{second_number}. {item_question.capitalize()} {person} tem agora?"
        )

    elif operation_name == "subtração":
        first_number = random.randint(8, 60)
        second_number = random.randint(2, first_number - 1)
        question_text = (
            f"{person} tinha {first_number} {item_plural} e {loss_verb} {second_number}. "
            f"Com {item_question} {person} ficou?"
        )

    elif operation_name == "multiplicação":
        first_number = random.randint(2, 12)
        second_number = random.randint(2, 9)
        question_text = (
            f"{person} organizou {first_number} grupos com {second_number} "
            f"{item_plural} em cada grupo. {item_question.capitalize()} são ao todo?"
        )

    else:  # divisão
        second_number = random.randint(2, 9)
        quotient = random.randint(2, 12)
        first_number = second_number * quotient
        question_text = (
            f"{person} dividiu {first_number} {item_plural} igualmente entre "
            f"{second_number} pessoas. {item_question.capitalize()} cada pessoa recebeu?"
        )

    return Exercise(
        first_number=first_number,
        second_number=second_number,
        operation_name=operation_name,
        symbol=symbol,
        correct_answer=calculate(first_number, second_number),
        calculate=calculate,
        question_text=question_text,
        badge_text=f"problema de {operation_name}",
    )


def decompose_number(number: int) -> list[int]:
    digits = [int(digit) for digit in str(number)]
    places = range(len(digits) - 1, -1, -1)
    return [digit * (10**place) for digit, place in zip(digits, places) if digit > 0]


def format_decomposition(terms: list[int]) -> str:
    return "+".join(str(term) for term in terms)


def normalize_decomposition_answer(answer: object) -> list[int] | None:
    if isinstance(answer, list):
        parts = [str(part).strip() for part in answer]
    else:
        if not isinstance(answer, str):
            answer = str(answer)
        parts = answer.replace(" ", "").split("+")

    if not parts or any(part == "" for part in parts):
        return None

    try:
        return [int(part) for part in parts]
    except ValueError:
        return None


def build_exam_plan() -> list[str]:
    direct_operations = list(OPERATIONS.keys())
    problem_slots = ["problema", "problema"]
    decomposition_slots = ["decomposição", "decomposição"]
    plan = direct_operations + problem_slots + decomposition_slots
    random.shuffle(plan)
    return plan


def get_or_init_score() -> dict:
    if "score" not in session:
        session["score"] = {"correct": 0, "total": 0}
    return session["score"]


@app.route("/")
def index():
    get_or_init_score()
    return render_template("index.html")


@app.route("/api/exercise")
def new_exercise():
    exercise = Exercise.generate()
    session["current_exercise"] = exercise.to_dict()
    score = get_or_init_score()
    return jsonify({"exercise": exercise.to_dict(), "score": score})


@app.route("/api/answer", methods=["POST"])
def check_answer():
    body = request.get_json()
    given_answer = body.get("answer")
    exercise = session.get("current_exercise")

    if exercise is None:
        return jsonify({"error": "Nenhum exercício ativo."}), 400

    if exercise["operation_name"] == "decomposição":
        given_terms = normalize_decomposition_answer(given_answer)
        if given_terms is None:
            return jsonify({"error": "Resposta inválida."}), 400
        is_correct = given_terms == exercise["correct_terms"]
    else:
        try:
            given_answer = int(given_answer)
        except (TypeError, ValueError):
            return jsonify({"error": "Resposta inválida."}), 400
        is_correct = given_answer == exercise["correct_answer"]

    score = get_or_init_score()
    score["total"] += 1
    if is_correct:
        score["correct"] += 1
    session["score"] = score
    session.modified = True

    message = (
        random.choice(CORRECT_MESSAGES)
        if is_correct
        else random.choice(WRONG_MESSAGES)
    )

    return jsonify(
        {
            "correct": is_correct,
            "correct_answer": exercise["correct_answer"],
            "message": message,
            "score": score,
        }
    )


@app.route("/api/exam/question", methods=["GET"])
def exam_question():
    if request.args.get("start") == "1" or "exam_plan" not in session:
        session["exam_plan"] = build_exam_plan()
        session["exam_question_index"] = 0

    exam_plan = session.get("exam_plan", build_exam_plan())
    question_index = session.get("exam_question_index", 0)

    if question_index >= len(exam_plan):
        session["exam_plan"] = build_exam_plan()
        session["exam_question_index"] = 0
        exam_plan = session["exam_plan"]
        question_index = 0

    exercise = generate_exercise_by_type(exam_plan[question_index])
    session["current_exercise"] = exercise.to_dict()
    session["exam_question_index"] = question_index + 1
    session.modified = True
    return jsonify({"exercise": exercise.to_dict()})


@app.route("/api/exam/answer", methods=["POST"])
def exam_answer():
    body = request.get_json()
    given_answer = body.get("answer")
    time_spent = body.get("time_spent", 0)
    exercise = session.get("current_exercise")

    if exercise is None:
        return jsonify({"error": "Nenhum exercício ativo."}), 400

    if exercise["operation_name"] == "decomposição":
        given_terms = normalize_decomposition_answer(given_answer)
        if given_terms is None:
            return jsonify({"error": "Resposta inválida."}), 400
        is_correct = given_terms == exercise["correct_terms"]
    else:
        try:
            given_answer = int(given_answer)
        except (TypeError, ValueError):
            return jsonify({"error": "Resposta inválida."}), 400
        is_correct = given_answer == exercise["correct_answer"]

    return jsonify(
        {
            "correct": is_correct,
            "correct_answer": exercise["correct_answer"],
            "time_spent": time_spent,
        }
    )


@app.route("/api/score/reset", methods=["POST"])
def reset_score():
    session["score"] = {"correct": 0, "total": 0}
    return jsonify({"score": session["score"]})


if __name__ == "__main__":
    app.run(debug=True)
