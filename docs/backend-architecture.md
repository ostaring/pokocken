# Backend Architecture

This document describes how the backend layers are connected after the PostgreSQL persistence consolidation.

## Overview

The backend is split into clear layers:

- `Controllers`
  Receive HTTP requests, map routes, read request data, and return HTTP responses.
- `Services`
  Contain business logic and work behind service interfaces such as `IRecipeService` and `IGalleryService`.
- `Repositories`
  Contain EF Core persistence logic behind `IRecipeRepository` and `IGalleryRepository`.
- `Data`
  Contains `RecipeDbContext`, EF entities, mappers, migrations, and database initialization.
- `Infrastructure`
  Contains admin auth, authorization filters, password hashing, session storage, and request validation.
- `Contracts`
  Contains request/response DTOs between the API and the client.
- `Domain`
  Contains the domain records used by services and repositories.

## Runtime Path

`Program.cs` always registers PostgreSQL-backed persistence:

```csharp
builder.Services.AddDbContext<RecipeDbContext>(options =>
{
    options.UseNpgsql(databaseConnectionString);
});
builder.Services.AddScoped<IRecipeRepository, EfRecipeRepository>();
builder.Services.AddScoped<IGalleryRepository, EfGalleryRepository>();
builder.Services.AddScoped<RecipeDbInitializer>();
```

Runtime flow:

```text
HTTP request
-> Controller
-> Service interface
-> Service
-> Repository interface
-> EF repository
-> RecipeDbContext
-> PostgreSQL
```

`RecipeDbInitializer` runs at startup, applies migrations, and seeds recipes/gallery images if the database is empty.

## Testing Architecture

- Service tests use small in-test repository doubles for focused business-logic coverage.
- Repository, initializer, and endpoint tests use PostgreSQL through Testcontainers.
- The test host injects a Testcontainers connection string through `ConnectionStrings:RecipesDb`.

## Important Code Points

- [backend/RecipeApp.Api/Program.cs](../backend/RecipeApp.Api/Program.cs)
- [backend/RecipeApp.Api/Repositories/Recipes/EfRecipeRepository.cs](../backend/RecipeApp.Api/Repositories/Recipes/EfRecipeRepository.cs)
- [backend/RecipeApp.Api/Repositories/Gallery/EfGalleryRepository.cs](../backend/RecipeApp.Api/Repositories/Gallery/EfGalleryRepository.cs)
- [backend/RecipeApp.Api/Data/Persistence/RecipeDbContext.cs](../backend/RecipeApp.Api/Data/Persistence/RecipeDbContext.cs)
- [backend/RecipeApp.Api/Data/Initialization/RecipeDbInitializer.cs](../backend/RecipeApp.Api/Data/Initialization/RecipeDbInitializer.cs)
- [backend/RecipeApp.Api.Tests/Testing/PostgresTestDatabase.cs](../backend/RecipeApp.Api.Tests/Testing/PostgresTestDatabase.cs)

## Diagrams

See also:

- [docs/system/10-backend-di-runtime-flow.puml](system/10-backend-di-runtime-flow.puml)
- [docs/system/04-backend-class-overview.puml](system/04-backend-class-overview.puml)
