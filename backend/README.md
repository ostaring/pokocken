# Backend

ASP.NET Core Web API for Pokocken. The backend exposes public recipe and gallery endpoints, admin endpoints, bootstrap admin auth, PostgreSQL persistence, and local diagnostics.

## Stack

- ASP.NET Core controllers
- .NET 10 SDK
- EF Core with PostgreSQL
- Docker Compose for local backend and database runtime
- xUnit and Testcontainers for tests
- Local `dotnet-ef` tool manifest for migrations

## Structure

```text
backend/
  Dockerfile
  RecipeApp.sln
  RecipeApp.Api/
  RecipeApp.Api.Tests/
```

## Launch

From the repo root:

```bash
docker compose up --build
```

This starts:

- `db` - PostgreSQL on `localhost:5432`
- `backend` - ASP.NET Core API on `http://localhost:5080`

Useful local URLs:

- `http://localhost:5080/health`
- `http://localhost:5080/swagger`

The backend allows the frontend dev origin `http://localhost:5173`.

## Persistence

PostgreSQL is the only active persistence provider.

Configuration lives in:

- `RecipeApp.Api/appsettings.json`
- `RecipeApp.Api/appsettings.Development.json`
- `../docker-compose.yml`

Local connection string:

```text
Host=localhost;Port=5432;Database=pokocken;Username=pokocken;Password=pokocken
```

Docker Compose connection string:

```text
Host=db;Port=5432;Database=pokocken;Username=pokocken;Password=pokocken
```

`RecipeDbInitializer` applies migrations and seed data when the API starts.

## Tests

```bash
cd backend
dotnet build ./RecipeApp.sln
dotnet test ./RecipeApp.sln
```

Backend tests use Testcontainers for PostgreSQL and require Docker to be running.

## Migrations

Restore local tools on a new machine:

```bash
cd backend
dotnet tool restore
```

Create a migration after a model change:

```bash
cd backend
dotnet ef migrations add <MigrationName> --project ./RecipeApp.Api/RecipeApp.Api.csproj --startup-project ./RecipeApp.Api/RecipeApp.Api.csproj --output-dir Data/Migrations
```

Migrations are applied automatically at API startup.

## Admin Access

Current admin auth is intended for local development and education.

Development login:

- username: `admin`
- password: `admin123`

Auth endpoints:

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Optional API-key fallback for manual testing:

```text
X-Admin-Api-Key: dev-admin-key
```

The fallback is controlled by `Admin:AllowApiKeyFallback`. It is disabled in base configuration and enabled for local development and Docker Compose.

## API Overview

Infrastructure:

- `GET /health`

Public endpoints:

- `GET /api/recipes`
- `GET /api/recipes/{slug}`
- `GET /api/gallery`

Admin endpoints:

- `GET /api/admin/recipes`
- `GET /api/admin/recipes/{slug}`
- `POST /api/admin/recipes`
- `PUT /api/admin/recipes/{slug}`
- `DELETE /api/admin/recipes/{slug}`
- `GET /api/admin/gallery`
- `POST /api/admin/gallery`
- `DELETE /api/admin/gallery/{id}`

More architecture details are available in `../docs/backend-architecture.md` and `../docs/system/`.
