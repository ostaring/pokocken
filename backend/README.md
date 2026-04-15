# Backend

ASP.NET Core Web API for the recipe app.

## Current Scope

Current backend implementation includes:

- in-memory recipe repository
- public `GET /api/recipes`
- public `GET /api/recipes/{slug}`
- admin-protected `GET /api/admin/recipes`
- admin-protected `GET /api/admin/recipes/{slug}`
- Swagger in development
- xUnit test project for recipe service behavior and API auth

## Expected Local URL

The development launch profile is configured for:

- `http://localhost:5080`

This matches the frontend default in `frontend/.env.example`.

## Run

From the repo root:

```powershell
cd backend
dotnet run --project .\RecipeApp.Api\RecipeApp.Api.csproj
```

## Run Tests

```powershell
cd backend
dotnet test .\RecipeApp.sln
```

## Admin Access

Current admin protection is intentionally simple for the MVP backend bootstrap:

- send header `X-Admin-Api-Key: dev-admin-key`

This is only a bootstrap mechanism so we can wire frontend and backend end-to-end. We can replace it later with cookie auth.

## Next Steps

- add admin recipe CRUD endpoints
- replace in-memory storage with EF Core + PostgreSQL
