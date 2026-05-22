from flask import Flask, jsonify
from flask_cors import CORS
from .extensions import db
from .routes.auth import auth_bp
from .routes.extract import extract_bp
from .routes.flashcards import flashcards_bp
from .routes.extractions import extractions_bp
import os


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get("SESSION_SECRET", "dev-secret-change-in-prod")

    db_url = os.environ.get("DATABASE_URL", "")

    if not db_url:
        raise RuntimeError(
            "\n\n[ERROR] DATABASE_URL is not set.\n"
            "Create a .env file in the backend folder with:\n\n"
            "  DATABASE_URL=postgresql://user:password@localhost:5432/flashcard_db\n"
            "  SESSION_SECRET=your-secret-key\n"
            "  GROQ_API_KEY=your-groq-key\n"
        )

    # Normalise legacy postgres:// scheme
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    engine_options = {}
    try:
        import psycopg2  # noqa: F401
    except ImportError:
        from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
        parsed = urlparse(db_url)
        params = parse_qs(parsed.query)
        ssl_required = params.pop("sslmode", ["disable"])[0] == "require"
        params.pop("channel_binding", None)
        new_query = urlencode({k: v[0] for k, v in params.items()})
        db_url = urlunparse(parsed._replace(scheme="postgresql+pg8000", query=new_query))
        if ssl_required:
            import ssl as _ssl
            ctx = _ssl.create_default_context()
            engine_options["connect_args"] = {"ssl_context": ctx}

    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    if engine_options:
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = engine_options
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = False

    CORS(app, supports_credentials=True, origins="*")
    db.init_app(app)

    app.register_blueprint(auth_bp,        url_prefix="/api/auth")
    app.register_blueprint(extract_bp,     url_prefix="/api/extract")
    app.register_blueprint(flashcards_bp,  url_prefix="/api/flashcards")
    app.register_blueprint(extractions_bp, url_prefix="/api/extractions")

    @app.get("/healthz")
    @app.get("/api/healthz")
    def health():
        return {"status": "ok"}

    # Global 401 handler — return JSON not HTML
    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Authentication required"}), 401

    return app
