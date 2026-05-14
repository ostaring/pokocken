# Pokocken

Pokocken ar en fullstack-receptapp for familj och vanner. Den publika delen visar recept och galleri, medan adminytan anvands for att logga in, skapa recept, publicera recept och hantera galleribilder.

## Projekt

- `frontend/` - React, TypeScript, Vite, React Router, TanStack Query och Tailwind CSS.
- `backend/` - ASP.NET Core API med controllers, services, repositories, EF Core och PostgreSQL.
- `docs/` - systemdokumentation och arkitekturanteckningar.

## Systemkrav

- Git
- Node.js och npm for frontend
- .NET SDK for backend och tester
- Docker Desktop med WSL 2-integration for PostgreSQL och Docker Compose

I WSL bor `node`, `npm` och `docker` komma fran Linux/WSL-miljon:

```bash
which node
which npm
docker version
```

## Launch

Frontend med mockdata:

```bash
cd frontend
npm install
npm run dev
```

Backend och PostgreSQL:

```bash
docker compose up --build
```

Backend finns pa `http://localhost:5080`, med `/health` och `/swagger`. Frontend finns normalt pa `http://localhost:5173`.

## Kora Fullstack

Starta backend och PostgreSQL med Docker Compose. Skapa sedan en lokal frontend-env:

```bash
cd frontend
cp .env.example .env.local
```

Satt:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:5080
```

Starta frontend:

```bash
npm run dev
```

## Tester

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

Backendtesterna anvander Testcontainers och kraver att Docker ar igang.

Mer detaljer finns i `frontend/README.md`, `backend/README.md`, `docs/backend-architecture.md` och `docs/system/`.
