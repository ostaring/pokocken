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
- Docker Desktop with WSL 2 integration for the full Docker Compose stack

In WSL, `node`, `npm`, and `docker` should come from the Linux/WSL environment:

```bash
which node
which npm
docker version
```

## Launch

Create a local environment file first:

```bash
cp .env.example .env
```

Set local values in `.env`. Generate an admin password hash with:

```bash
cd backend
dotnet run --project RecipeApp.Api -- hash-admin-password "your-local-admin-password"
```

Wrap the generated `ADMIN_PASSWORD_HASH` in single quotes in `.env`, because PBKDF2 hashes contain `$` characters.

Frontend with mock data:

```bash
cd frontend
npm install
npm run dev
```

Full stack with Docker Compose:

```bash
docker compose up --build
```

This starts:

- frontend at `http://localhost:5173`
- backend at `http://localhost:5080`
- PostgreSQL on `localhost:5432`

Backend diagnostics are available at `http://localhost:5080/health` and `http://localhost:5080/swagger`.

## Run Fullstack Locally

For local frontend development with Vite, start only the backend and PostgreSQL with Docker Compose:

```bash
docker compose up --build db backend
```

Then create a local frontend env file:

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
