import os
import json
import requests
from bs4 import BeautifulSoup
from flask import Blueprint, request, jsonify, session
from groq import Groq
from ..extensions import db
from ..models import Extraction, User
from ..routes.auth import login_required

extract_bp = Blueprint("extract", __name__)


def get_groq_client() -> Groq:
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise RuntimeError("GROQ_API_KEY is not configured. Please add it to your environment secrets.")
    return Groq(api_key=key)


def scrape_url(url: str) -> str:
    resp = requests.get(
        url,
        timeout=10,
        headers={"User-Agent": "Mozilla/5.0 (compatible; TechExtract/1.0)"},
    )
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    text = soup.get_text(separator=" ")
    return " ".join(text.split())[:8000]


def extract_tech_skills(text: str, groq: Groq) -> dict:
    system_prompt = (
        "You are a precision tech skills extractor. Analyze job descriptions and return ONLY a JSON object.\n"
        "Extract all technical skills, tools, frameworks, languages, platforms, and methodologies.\n\n"
        "Return this exact JSON structure:\n"
        '{\n'
        '  "skills": ["skill1", "skill2", ...],\n'
        '  "categories": {\n'
        '    "languages": [],\n'
        '    "frameworks": [],\n'
        '    "databases": [],\n'
        '    "cloud": [],\n'
        '    "tools": [],\n'
        '    "methodologies": [],\n'
        '    "other": []\n'
        '  },\n'
        '  "experience_level": "junior|mid|senior|lead",\n'
        '  "role_type": "frontend|backend|fullstack|devops|data|mobile|other",\n'
        '  "summary": "one sentence summary of the role"\n'
        "}\n\nBe thorough. Return ONLY valid JSON, no markdown, no explanation."
    )

    completion = groq.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Extract all tech skills from this job description:\n\n{text}"},
        ],
        temperature=0.1,
        max_tokens=2048,
    )

    raw = (completion.choices[0].message.content or "{}").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        import re
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            return json.loads(match.group(0))
        raise ValueError("Failed to parse Groq response as JSON")


def _save_extraction(result: dict, source: str, user_id,
                     source_url=None, text=None):
    if user_id is None:
        return
    extraction = Extraction(
        user_id=user_id,
        source=source,
        source_url=source_url,
        raw_text_snippet=(text or "")[:500] if text else None,
        skills=result.get("skills", []),
        categories=result.get("categories", {}),
        experience_level=result.get("experience_level"),
        role_type=result.get("role_type"),
        summary=result.get("summary"),
    )
    db.session.add(extraction)
    db.session.commit()


@extract_bp.post("/text")
def extract_text():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if len(text) < 20:
        return jsonify({"error": "Text is too short. Paste a full job description."}), 400

    try:
        groq = get_groq_client()
        result = extract_tech_skills(text[:8000], groq)
        _save_extraction(result, "text", session.get("user_id"), text=text)
        return jsonify({"success": True, "source": "text", **result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@extract_bp.post("/url")
def extract_url():
    data = request.get_json(silent=True) or {}
    url = (data.get("url") or "").strip()
    if not url.startswith("http"):
        return jsonify({"error": "Invalid URL. Must start with http:// or https://"}), 400

    try:
        groq = get_groq_client()
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500

    try:
        text = scrape_url(url)
    except Exception as e:
        return jsonify({"error": f"Could not fetch URL: {e}. Try pasting the text directly."}), 400

    if len(text) < 50:
        return jsonify({"error": "Could not extract content from URL. Try pasting the text directly."}), 400

    try:
        result = extract_tech_skills(text, groq)
        _save_extraction(result, "url", session.get("user_id"), source_url=url, text=text)
        return jsonify({"success": True, "source": "url", "url": url, **result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
