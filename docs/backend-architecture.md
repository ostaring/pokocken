# Backend Architecture

This document describes how the backend layers are connected after the controller and interface-based dependency injection refactor.

## Overview

The backend is split into clear layers:

- `Controllers`
  Receive HTTP requests, map routes, read request data, and return HTTP responses.
- `Services`
  Contain business logic and work behind service interfaces such as `IRecipeService` and `IGalleryService`.
- `Repositories`
  Contain persistence logic and abstract memory, file, and SQLite storage behind interfaces such as `IRecipeRepository` and `IGalleryRepository`.
- `Data`
  Contains the EF Core context, entities, mapping, migrations, and database initialization.
- `Infrastructure`
  Contains cross-cutting technical pieces such as admin auth, authorization filters, password hashing, session storage, and request validation.
- `Contracts`
  Contains request/response DTOs between the API and the client.
- `Domain`
  Contains the domain records used by services and repositories.

## How `Program.cs` Wires The App

The important part of [backend/RecipeApp.Api/Program.cs](../backend/RecipeApp.Api/Program.cs) is that relationships are registered in the DI container instead of manually constructing the object graph with `new`.

Example:

```csharp
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<IGalleryService, GalleryService>();
builder.Services.AddScoped<IRecipeRepository, SqliteRecipeRepository>();
builder.Services.AddControllers();
```

That means:

1. If something asks for `IRecipeService`, create a `RecipeService`.
2. If something asks for `IRecipeRepository`, create the repository implementation selected by persistence configuration.
3. The controller system is enabled through `AddControllers()`.
4. Routes are connected through `app.MapControllers()`.

## Persistence Modes

`Program.cs` selects repository implementations from `Persistence:Mode`:

- `Sqlite`
  Registers `RecipeDbContext`, `SqliteRecipeRepository`, `SqliteGalleryRepository`, and `RecipeDbInitializer`.
- `File`
  Registers file-backed recipe and gallery repositories.
- Any other value
  Registers in-memory recipe and gallery repositories.

Development configuration currently uses `Sqlite`; base `appsettings.json` defaults to `Memory`.

## Runtime Flow

When an HTTP request arrives, this happens in practice:

1. ASP.NET matches the request to a controller route.
2. The framework creates the correct controller.
3. The controller constructor declares which dependencies it needs.
4. The DI container creates those dependencies recursively.
5. When the object graph is ready, the action method runs.

Example for admin recipes in SQLite mode:

```text
HTTP request
-> AdminRecipesController
-> IRecipeService
-> RecipeService
-> IRecipeRepository
-> SqliteRecipeRepository
-> RecipeDbContext
```

Example for admin gallery in SQLite mode:

```text
HTTP request
-> AdminGalleryController
-> IGalleryService
-> GalleryService
-> IGalleryRepository
-> SqliteGalleryRepository
-> RecipeDbContext
```

## Controller Dependencies

Controllers depend on interfaces, not concrete service implementations.

Instead of:

```csharp
private readonly RecipeService _recipeService;
```

they use:

```csharp
private readonly IRecipeService _recipeService;
```

That keeps controllers aware of what the service can do, not exactly how it does it.

## Why This Is Useful

- looser coupling between layers
- simpler implementation swaps later
- clearer contracts per domain
- more idiomatic ASP.NET Core architecture
- easier to understand the object graph as the project grows

## Important Code Points

- [backend/RecipeApp.Api/Program.cs](../backend/RecipeApp.Api/Program.cs)
- [backend/RecipeApp.Api/Controllers/Admin/Recipes/AdminRecipesController.cs](../backend/RecipeApp.Api/Controllers/Admin/Recipes/AdminRecipesController.cs)
- [backend/RecipeApp.Api/Controllers/Admin/Gallery/AdminGalleryController.cs](../backend/RecipeApp.Api/Controllers/Admin/Gallery/AdminGalleryController.cs)
- [backend/RecipeApp.Api/Controllers/Auth/AuthController.cs](../backend/RecipeApp.Api/Controllers/Auth/AuthController.cs)
- [backend/RecipeApp.Api/Services/Recipes/IRecipeService.cs](../backend/RecipeApp.Api/Services/Recipes/IRecipeService.cs)
- [backend/RecipeApp.Api/Services/Recipes/RecipeService.cs](../backend/RecipeApp.Api/Services/Recipes/RecipeService.cs)
- [backend/RecipeApp.Api/Services/Gallery/IGalleryService.cs](../backend/RecipeApp.Api/Services/Gallery/IGalleryService.cs)
- [backend/RecipeApp.Api/Services/Gallery/GalleryService.cs](../backend/RecipeApp.Api/Services/Gallery/GalleryService.cs)
- [backend/RecipeApp.Api/Repositories/Recipes/IRecipeRepository.cs](../backend/RecipeApp.Api/Repositories/Recipes/IRecipeRepository.cs)
- [backend/RecipeApp.Api/Repositories/Recipes/SqliteRecipeRepository.cs](../backend/RecipeApp.Api/Repositories/Recipes/SqliteRecipeRepository.cs)
- [backend/RecipeApp.Api/Repositories/Gallery/IGalleryRepository.cs](../backend/RecipeApp.Api/Repositories/Gallery/IGalleryRepository.cs)
- [backend/RecipeApp.Api/Repositories/Gallery/SqliteGalleryRepository.cs](../backend/RecipeApp.Api/Repositories/Gallery/SqliteGalleryRepository.cs)
- [backend/RecipeApp.Api/Data/Persistence/RecipeDbContext.cs](../backend/RecipeApp.Api/Data/Persistence/RecipeDbContext.cs)

## Diagrams

See also:

- [docs/system/10-backend-di-runtime-flow.puml](system/10-backend-di-runtime-flow.puml)
- [docs/system/04-backend-class-overview.puml](system/04-backend-class-overview.puml)
- [docs/system/05-persistence-modes.puml](system/05-persistence-modes.puml)
