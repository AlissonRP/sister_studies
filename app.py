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

EXAM_TOTAL = 5
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
    second_number: int
    operation_name: str
    symbol: str
    correct_answer: int
    calculate: Callable[[int, int], int] = field(repr=False)

    @classmethod
    def generate(cls) -> "Exercise":
        operation_name = random.choice(list(OPERATIONS.keys()))
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

        correct_answer = calculate(first_number, second_number)

        return cls(
            first_number=first_number,
            second_number=second_number,
            operation_name=operation_name,
            symbol=symbol,
            correct_answer=correct_answer,
            calculate=calculate,
        )

    def to_dict(self) -> dict:
        return {
            "first_number": self.first_number,
            "second_number": self.second_number,
            "operation_name": self.operation_name,
            "symbol": self.symbol,
            "correct_answer": self.correct_answer,
        }


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
    exercise = Exercise.generate()
    session["current_exercise"] = exercise.to_dict()
    return jsonify({"exercise": exercise.to_dict()})


@app.route("/api/exam/answer", methods=["POST"])
def exam_answer():
    body = request.get_json()
    given_answer = body.get("answer")
    time_spent = body.get("time_spent", 0)
    exercise = session.get("current_exercise")

    if exercise is None:
        return jsonify({"error": "Nenhum exercício ativo."}), 400

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