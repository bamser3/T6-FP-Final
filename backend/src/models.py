from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    extractions = db.relationship("Extraction", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "email": self.email, "username": self.username}


class Extraction(db.Model):
    __tablename__ = "extractions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source = db.Column(db.String(10), nullable=False)
    source_url = db.Column(db.Text, nullable=True)
    raw_text_snippet = db.Column(db.Text, nullable=True)
    skills = db.Column(db.JSON, nullable=False, default=list)
    categories = db.Column(db.JSON, nullable=False, default=dict)
    experience_level = db.Column(db.String(20), nullable=True)
    role_type = db.Column(db.String(30), nullable=True)
    summary = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="extractions")

    def to_dict(self):
        return {
            "id": self.id,
            "source": self.source,
            "source_url": self.source_url,
            "raw_text_snippet": self.raw_text_snippet,
            "skills": self.skills,
            "categories": self.categories,
            "experience_level": self.experience_level,
            "role_type": self.role_type,
            "summary": self.summary,
            "created_at": self.created_at.isoformat(),
        }


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False, index=True)
    skill = db.Column(db.String(100), nullable=False, index=True)
    difficulty = db.Column(db.String(20), nullable=False, index=True)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "skill": self.skill,
            "difficulty": self.difficulty,
            "question": self.question,
            "answer": self.answer,
        }
