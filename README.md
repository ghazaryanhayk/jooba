# Jooba

## Stack

- **API**: Python 3.12 + FastAPI (`backend/`)
- **Web**: TypeScript + **React 19** + Vite + **Tailwind CSS v4** + [shadcn/ui](https://ui.shadcn.com) (`frontend/`)
- **DB**: PostgreSQL 16 (Docker)

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24+

## Quick start

**1. Copy the root env file**

```bash
cp .env.example .env
```

**2. Copy the backend env file and fill in your API keys**

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and set your keys:

```env
CRUSTDATA_API_KEY=your_crustdata_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

These are required — the API will not start without them.

**3. Build and start all services**

```bash
docker compose up --build
```

On first run this builds the images, runs Alembic migrations, and seeds the database automatically.

## Services

| Service | URL | Notes |
|---------|-----|-------|
| Web | http://localhost:5173 | Vite dev server with hot reload |
| API | http://localhost:8000 | Uvicorn with `--reload` (source mounted) |
| API docs | http://localhost:8000/docs | Interactive Swagger UI |
| DB | `localhost:5432` | Default credentials: `jooba` / `jooba` / `jooba` |

The frontend calls the API through a **Vite proxy**: browser requests to `/api/*` on port 5173 are forwarded to the `api` service, avoiding CORS issues during development.

## Environment variables

### Root `.env` (compose, ports, DB)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `jooba` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `jooba` | PostgreSQL password |
| `POSTGRES_DB` | `jooba` | PostgreSQL database name |
| `POSTGRES_PORT` | `5432` | Host port for the DB container |
| `DATABASE_URL` | `postgresql://jooba:jooba@db:5432/jooba` | Full connection string used by the API |
| `API_PORT` | `8000` | Host port for the API container |
| `WEB_PORT` | `5173` | Host port for the web container |
| `VITE_API_URL` | `http://localhost:8000` | API base URL (reference; browser goes via Vite proxy) |

### `backend/.env` (API keys and settings)

| Variable | Default | Description |
|----------|---------|-------------|
| `CRUSTDATA_API_KEY` | — | **Required.** CrustData API key |
| `OPENAI_API_KEY` | — | **Required.** OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o` | OpenAI model used for ranking |
| `CACHE_TTL_SECONDS` | `600` | In-memory cache TTL in seconds |
| `CACHE_MAX_SIZE` | `500` | Maximum number of cached entries |

## Secrets

Do not commit real API keys. Use `.env` and `backend/.env` (both gitignored) and document variables in the corresponding `.env.example` files.
