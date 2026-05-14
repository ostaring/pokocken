# Pokocken

Pokocken is a fullstack recipe app for family and friends. The public app shows recipes and gallery images, while the admin area is used to sign in, create recipes, publish recipes, and manage gallery images.

## Project

- `frontend/` - React, TypeScript, Vite, React Router, TanStack Query, and Tailwind CSS.
- `backend/` - ASP.NET Core API with controllers, services, repositories, EF Core, and PostgreSQL.
- `docs/` - system documentation and architecture notes.

## Requirements

- Git
- Node.js and npm for frontend development
- .NET SDK for backend development and tests
- Docker Desktop with WSL 2 integration for PostgreSQL and Docker Compose

In WSL, `node`, `npm`, and `docker` should come from the Linux/WSL environment:

```bash
which node
which npm
docker version
```

## Launch

Frontend with mock data:

```bash
cd frontend
npm install
npm run dev
```

Backend and PostgreSQL:

```bash
docker compose up --build
```

The backend runs at `http://localhost:5080`, with `/health` and `/swagger`. The frontend usually runs at `http://localhost:5173`.

## Run Fullstack Locally

Start the backend and PostgreSQL with Docker Compose. Then create a local frontend env file:

```bash
cd frontend
cp .env.example .env.local
```

Set:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:5080
```

Start the frontend:

```bash
npm run dev
```

## Tests

```bash
cd frontend
npm run lint
npm run test
npm run build
```

```bash
cd backend
dotnet build ./RecipeApp.sln
dotnet test ./RecipeApp.sln
```

Backend tests use Testcontainers and require Docker to be running.

More details are available in `frontend/README.md`, `backend/README.md`, `docs/backend-architecture.md`, and `docs/system/`.
