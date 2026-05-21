# TechExtract

A Matrix-themed app that extracts tech skills from job descriptions using AI.

## Quick Start

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables (copy .env.example → .env and fill in values)
export DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/techextract
export SESSION_SECRET=any-long-random-string
export GROQ_API_KEY=your_groq_key   # free at console.groq.com

python wsgi.py
# Runs on http://localhost:8080
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Open http://localhost:5173

## Get a Groq API key (free)
https://console.groq.com → sign up → API Keys → Create

## Database
```bash
psql -U postgres -c "CREATE DATABASE techextract;"
```
Tables are created automatically on first run.
