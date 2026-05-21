# TechExtract — Job Skill Extractor & Flashcard Generator

Paste a job description (or URL) → Groq AI extracts every tech skill → Study with flip-card flashcards from a 115+ Q&A database. Green hacker/Matrix aesthetic.

## Structure

```
frontend/   — React + Vite app (deploy to Vercel, Netlify, etc.)
backend/    — Express API server (deploy to Render, Railway, Fly.io, etc.)
openapi.yaml — API contract
```

## Quick Start

### Backend

```bash
cd backend
npm install
# Set env vars:
#   PORT=5000
#   GROQ_API_KEY=your_key_from_console.groq.com
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# Set env var:
#   VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `GROQ_API_KEY` | backend | From https://console.groq.com (free) |
| `PORT` | backend | Server port (default 5000) |
| `VITE_API_BASE_URL` | frontend | Full URL to backend /api |

## Features

- **Extract from text** — paste any job description
- **Extract from URL** — scrapes job posting pages
- **Skill categories** — languages, frameworks, databases, cloud, tools, methodologies
- **115+ flashcards** — JS, TS, React, Node, Python, SQL, Docker, AWS, security, system design, and more
- **3D flip animation** — click or press Space
- **Keyboard nav** — ← → arrow keys, Space to flip
- **Filter by difficulty** — beginner / intermediate / advanced
- **Browse & search** — full Q&A database with category sidebar
