import random
from flask import Blueprint, request, jsonify
from ..models import Question
from ..extensions import db
<<<<<<< HEAD
from ..routes.auth import login_required
=======
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
from sqlalchemy import func

flashcards_bp = Blueprint("flashcards", __name__)


@flashcards_bp.get("/")
<<<<<<< HEAD
@login_required
def get_flashcards(current_user):
=======
def get_flashcards():
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
    skills_param = request.args.get("skills", "")
    category = request.args.get("category", "")
    difficulty = request.args.get("difficulty", "")
    limit = min(int(request.args.get("limit", 20)), 200)
    offset = int(request.args.get("offset", 0))
    shuffle = request.args.get("shuffle", "true").lower() != "false"

    query = Question.query

    if skills_param:
        skills_list = [s.strip().lower() for s in skills_param.split(",") if s.strip()]
        query = query.filter(Question.skill.in_(skills_list))

    if category:
        query = query.filter(func.lower(Question.category) == category.lower())

    if difficulty:
        query = query.filter(Question.difficulty == difficulty)

    total = query.count()

    if shuffle:
        query = query.order_by(func.random())
    else:
        query = query.order_by(Question.id)

    questions = query.offset(offset).limit(limit).all()

    return jsonify({
        "success": True,
        "total": total,
        "offset": offset,
        "limit": limit,
        "questions": [q.to_dict() for q in questions],
    })


@flashcards_bp.get("/categories")
<<<<<<< HEAD
@login_required
def get_categories(current_user):
=======
def get_categories():
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
    rows = db.session.query(Question.category).distinct().order_by(Question.category).all()
    categories = [r[0] for r in rows]
    return jsonify({"success": True, "categories": categories})


@flashcards_bp.get("/stats")
<<<<<<< HEAD
@login_required
def get_stats(current_user):
=======
def get_stats():
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
    total = Question.query.count()
    rows = (
        db.session.query(Question.category, func.count(Question.id))
        .group_by(Question.category)
        .order_by(Question.category)
        .all()
    )
    breakdown = [{"category": cat, "count": count} for cat, count in rows]
    return jsonify({"success": True, "total": total, "breakdown": breakdown})


@flashcards_bp.get("/<int:question_id>")
<<<<<<< HEAD
@login_required
def get_question(current_user, question_id: int):
=======
def get_question(question_id: int):
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
    question = Question.query.get(question_id)
    if not question:
        return jsonify({"error": "Question not found"}), 404
    return jsonify({"success": True, "question": question.to_dict()})
