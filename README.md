# Jooba

## Stack

- **API**: Python 3.12 + FastAPI (`backend/`)
- **Web**: TypeScript + **React 19** + Vite + **Tailwind CSS v4** + [shadcn/ui](https://ui.shadcn.com) (`frontend/`)
- **DB**: PostgreSQL 16 (Docker)

Containers use official **slim** images (`python:…-slim`, `node:…-slim`, `postgres:…-alpine`). That gives you glibc compatibility and small images without maintaining a custom Ubuntu layer.

## Reviewer / local run (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- **Web**: http://localhost:5173 — Vite dev server with hot reload  
- **API**: http://localhost:8000 — Uvicorn with `--reload` (source mounted)  
- **DB**: `localhost:5432` (user/password/db default: `jooba` / `jooba` / `jooba`)

The frontend calls the API through a **Vite proxy**: browser requests go to `/api/*` on port 5173 and are forwarded to the `api` service (see `frontend/vite.config.ts`). That avoids CORS issues during development.

## Optional: run without Docker

Use a local Postgres and run API + Vite on the host; point `DATABASE_URL` and the Vite proxy at your processes.

## Secrets

Do not commit real API keys. Use `.env` (gitignored) and document variables in `.env.example`.
