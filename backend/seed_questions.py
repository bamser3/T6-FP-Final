#!/usr/bin/env python3
"""
seed_questions.py — Populate the PostgreSQL `questions` table from questions_seed.json

Usage:
    1. Place this file inside your `backend/` folder.
    2. Make sure your .env file is set up (DATABASE_URL, etc.).
    3. Run:
           cd backend
           python seed_questions.py

The script is idempotent: it skips insertion if questions already exist,
or you can pass --force to clear and re-seed.
"""

import sys
import os
import json
import argparse

# ── Load .env if present ─────────────────────────────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass  # python-dotenv not installed — rely on env vars being set already

# ── Parse args ───────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="Seed flashcard questions into PostgreSQL")
parser.add_argument(
    "--force",
    action="store_true",
    help="Delete all existing questions before re-seeding",
)
parser.add_argument(
    "--seed-file",
    default=None,
    help="Path to questions_seed.json (auto-detected if omitted)",
)
args = parser.parse_args()

# ── Locate seed file ──────────────────────────────────────────────────────────
HERE = os.path.dirname(os.path.abspath(__file__))

CANDIDATE_PATHS = [
    args.seed_file,
    os.path.join(HERE, "questions_seed.json"),
    os.path.join(HERE, "..", "attached_assets", "mazeh_extracted", "techextract", "backend", "questions_seed.json"),
    os.path.join(HERE, "src", "questions_seed.json"),
]

seed_path = None
for p in CANDIDATE_PATHS:
    if p and os.path.isfile(p):
        seed_path = os.path.abspath(p)
        break

if not seed_path:
    print("[ERROR] Could not find questions_seed.json. Pass --seed-file <path> explicitly.")
    sys.exit(1)

print(f"[INFO] Using seed file: {seed_path}")

with open(seed_path, encoding="utf-8") as f:
    questions_data = json.load(f)

print(f"[INFO] {len(questions_data)} questions loaded from seed file.")

# ── Bootstrap Flask app ───────────────────────────────────────────────────────
sys.path.insert(0, HERE)

try:
    from src.app import create_app
    from src.models import Question
    from src.extensions import db
except ImportError as e:
    print(f"[ERROR] Could not import app: {e}")
    print("Make sure you run this script from the backend/ directory.")
    sys.exit(1)

app = create_app()

with app.app_context():
    # Create tables if they don't exist yet
    db.create_all()

    existing = Question.query.count()

    if existing > 0 and not args.force:
        print(f"[INFO] {existing} questions already exist in the database.")
        print("[INFO] Use --force to clear and re-seed. Exiting without changes.")
        sys.exit(0)

    if args.force and existing > 0:
        print(f"[WARN] --force specified. Deleting {existing} existing questions...")
        Question.query.delete()
        db.session.commit()
        print("[INFO] Existing questions deleted.")

    # ── Insert questions ──────────────────────────────────────────────────────
    inserted = 0
    skipped = 0

    for item in questions_data:
        # Validate required fields
        missing = [k for k in ("category", "skill", "difficulty", "question", "answer") if not item.get(k)]
        if missing:
            print(f"[WARN] Skipping record (missing fields: {missing}): {item}")
            skipped += 1
            continue

        q = Question(
            category=item["category"].strip(),
            skill=item["skill"].strip(),
            difficulty=item["difficulty"].strip().lower(),
            question=item["question"].strip(),
            answer=item["answer"].strip(),
        )
        db.session.add(q)
        inserted += 1

    db.session.commit()
    print(f"[OK] Inserted {inserted} questions ({skipped} skipped).")

    # ── Summary ───────────────────────────────────────────────────────────────
    total = Question.query.count()
    print(f"[OK] Total questions in database: {total}")

    from sqlalchemy import func
    breakdown = (
        db.session.query(Question.category, func.count(Question.id))
        .group_by(Question.category)
        .order_by(Question.category)
        .all()
    )
    print("\nCategory breakdown:")
    for cat, count in breakdown:
        print(f"  {cat:<30} {count} questions")