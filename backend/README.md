# Backend

ASP.NET Core Web API for the recipe app.

## Current Scope

Current backend implementation includes:

- in-memory recipe repository
- public `GET /api/recipes`
- public `GET /api/recipes/{slug}`
- Swagger in development
- xUnit test project for recipe service behavior

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

## Important Note

The current machine does not appear to have a usable `.NET SDK` installed yet, so I have set up the backend project structure and code manually. The files are ready for normal `dotnet run` and `dotnet test` usage as soon as the SDK is installed.

## Next Steps

- add admin auth endpoints
- add admin recipe CRUD endpoints
- replace in-memory storage with EF Core + PostgreSQL
