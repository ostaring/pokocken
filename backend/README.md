# Backend

ASP.NET Core Web API for the recipe app.

## Stack

- ASP.NET Core minimal API
- .NET 10 SDK
- xUnit for tests
- in-memory repository for the current bootstrap phase

## Project Structure

```text
backend/
  RecipeApp.sln
  README.md
  RecipeApp.Api/
  RecipeApp.Api.Tests/
```

## Current Scope

Current backend implementation includes:

- in-memory recipe repository
- cookie-based bootstrap auth endpoints for admin
- public `GET /api/recipes`
- public `GET /api/recipes/{slug}`
- admin-protected `GET /api/admin/recipes`
- admin-protected `GET /api/admin/recipes/{slug}`
- admin-protected `POST /api/admin/recipes`
- admin-protected `PUT /api/admin/recipes/{slug}`
- admin-protected `DELETE /api/admin/recipes/{slug}`
- Swagger in development
- xUnit test project for service and endpoint behavior

## Local Development

The development launch profile is configured for:

- `http://localhost:5080`

This matches the frontend default in `frontend/.env.example`.

### Start The API

From the repo root:

```powershell
cd backend
dotnet run --project .\RecipeApp.Api\RecipeApp.Api.csproj
```

Swagger is available at:

- `http://localhost:5080/swagger`

### Run Tests

```powershell
cd backend
dotnet test .\RecipeApp.sln
```

## Admin Access

Current admin auth is bootstrapped in two ways:

- preferred for frontend: `POST /api/auth/login` with the development credentials below
- fallback for manual/API testing: send header `X-Admin-Api-Key: dev-admin-key`

Development credentials:

- username: `admin`
- password: `admin123`

Auth endpoints:

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

This is still a temporary bootstrap solution before proper production auth.

## API Overview

### Public endpoints

- `GET /api/recipes`
- `GET /api/recipes/{slug}`

### Admin endpoints

- `GET /api/admin/recipes`
- `GET /api/admin/recipes/{slug}`
- `POST /api/admin/recipes`
- `PUT /api/admin/recipes/{slug}`
- `DELETE /api/admin/recipes/{slug}`

## Recipe Payload Shape

`POST /api/admin/recipes` and `PUT /api/admin/recipes/{slug}` currently use this payload shape:

```json
{
  "title": "Herby potato salad",
  "slug": "herby-potato-salad",
  "description": "Warm potatoes with herbs and mustard dressing.",
  "category": "Lunch",
  "prepTimeMinutes": 30,
  "servings": 4,
  "imageUrl": "https://example.com/potato-salad.jpg",
  "isPublished": false,
  "ingredients": ["1 kg potatoes", "Parsley", "Mustard"],
  "steps": ["Boil potatoes.", "Dress and toss."]
}
```

## Next Steps

- replace in-memory storage with EF Core + PostgreSQL
- switch admin protection from API key to real auth
- connect frontend HTTP mode to these endpoints
