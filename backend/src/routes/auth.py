from flask import Blueprint, request, jsonify, session
from ..extensions import db
from ..models import User
from functools import wraps
<<<<<<< HEAD
import jwt
import os
from datetime import datetime, timezone, timedelta

auth_bp = Blueprint("auth", __name__)

SECRET_KEY = os.environ.get("SESSION_SECRET", "dev-secret-change-in-prod")
TOKEN_EXPIRY_DAYS = 30


def _make_token(user_id: int) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

=======

auth_bp = Blueprint("auth", __name__)

>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
<<<<<<< HEAD
        # 1. Try Bearer token (persistent login)
        user_id = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get("sub")
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired, please log in again"}), 401
            except jwt.InvalidTokenError:
                pass  # fall through to session

        # 2. Fall back to session cookie
        if not user_id:
            user_id = session.get("user_id")

        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

=======
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
        user = User.query.get(user_id)
        if not user:
            session.clear()
            return jsonify({"error": "User not found"}), 401
<<<<<<< HEAD

=======
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
        return f(user, *args, **kwargs)
    return decorated


<<<<<<< HEAD
# ── Register ──────────────────────────────────────────────────────────────────
@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email    = (data.get("email")    or "").strip().lower()
    username = (data.get("username") or "").strip()
    password =  data.get("password") or ""
=======
@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8

    if not email or not username or not password:
        return jsonify({"error": "email, username, and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    user = User(email=email, username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id
<<<<<<< HEAD
    token = _make_token(user.id)
    return jsonify({"success": True, "user": user.to_dict(), "token": token}), 201


# ── Login ─────────────────────────────────────────────────────────────────────
@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email    = (data.get("email")    or "").strip().lower()
    password =  data.get("password") or ""
=======
    return jsonify({"success": True, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_id"] = user.id
<<<<<<< HEAD
    token = _make_token(user.id)
    return jsonify({"success": True, "user": user.to_dict(), "token": token})


# ── Logout ────────────────────────────────────────────────────────────────────
=======
    return jsonify({"success": True, "user": user.to_dict()})


>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"success": True})


<<<<<<< HEAD
# ── Current user ──────────────────────────────────────────────────────────────
=======
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
@auth_bp.get("/me")
@login_required
def me(current_user):
    return jsonify({"success": True, "user": current_user.to_dict()})
<<<<<<< HEAD


# ── Update profile (username / email / password) ──────────────────────────────
@auth_bp.put("/me")
@login_required
def update_me(current_user):
    data = request.get_json(silent=True) or {}

    new_email    = (data.get("email")    or "").strip().lower() or None
    new_username = (data.get("username") or "").strip()         or None
    new_password =  data.get("password") or None
    current_password = data.get("current_password") or ""

    # Require current password to make any change
    if not current_user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 403

    if new_email and new_email != current_user.email:
        if User.query.filter(User.email == new_email, User.id != current_user.id).first():
            return jsonify({"error": "Email already in use"}), 409
        current_user.email = new_email

    if new_username and new_username != current_user.username:
        if User.query.filter(User.username == new_username, User.id != current_user.id).first():
            return jsonify({"error": "Username already taken"}), 409
        current_user.username = new_username

    if new_password:
        if len(new_password) < 6:
            return jsonify({"error": "New password must be at least 6 characters"}), 400
        current_user.set_password(new_password)

    db.session.commit()
    # Re-issue token in case email/username changed
    token = _make_token(current_user.id)
    return jsonify({"success": True, "user": current_user.to_dict(), "token": token})


# ── Delete account ────────────────────────────────────────────────────────────
@auth_bp.delete("/me")
@login_required
def delete_me(current_user):
    data = request.get_json(silent=True) or {}
    password = data.get("password") or ""

    if not current_user.check_password(password):
        return jsonify({"error": "Password is incorrect"}), 403

    db.session.delete(current_user)
    db.session.commit()
    session.clear()
    return jsonify({"success": True, "message": "Account deleted"})
=======
>>>>>>> 32a8c637a5fefa3de0db62ac8676f127794edeb8
