from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Extraction
from ..routes.auth import login_required

extractions_bp = Blueprint("extractions", __name__)


@extractions_bp.get("/")
@login_required
def list_extractions(current_user):
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = int(request.args.get("offset", 0))

    query = Extraction.query.filter_by(user_id=current_user.id).order_by(
        Extraction.created_at.desc()
    )
    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return jsonify({
        "success": True,
        "total": total,
        "offset": offset,
        "limit": limit,
        "extractions": [e.to_dict() for e in items],
    })


@extractions_bp.get("/<int:extraction_id>")
@login_required
def get_extraction(current_user, extraction_id: int):
    extraction = Extraction.query.get_or_404(extraction_id)
    if extraction.user_id != current_user.id:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"success": True, "extraction": extraction.to_dict()})


@extractions_bp.put("/<int:extraction_id>")
@login_required
def update_extraction(current_user, extraction_id: int):
    extraction = Extraction.query.get_or_404(extraction_id)
    if extraction.user_id != current_user.id:
        return jsonify({"error": "Not found"}), 404

    data = request.get_json(silent=True) or {}
    if "summary" in data:
        extraction.summary = data["summary"]
    if "skills" in data and isinstance(data["skills"], list):
        extraction.skills = data["skills"]
    if "categories" in data and isinstance(data["categories"], dict):
        extraction.categories = data["categories"]

    db.session.commit()
    return jsonify({"success": True, "extraction": extraction.to_dict()})


@extractions_bp.delete("/<int:extraction_id>")
@login_required
def delete_extraction(current_user, extraction_id: int):
    extraction = Extraction.query.get_or_404(extraction_id)
    if extraction.user_id != current_user.id:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(extraction)
    db.session.commit()
    return jsonify({"success": True, "message": "Extraction deleted"})
