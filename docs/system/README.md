# System Documentation

This folder collects architecture and flow documentation for the recipe app.

PlantUML is the main format because the current documentation needs:

- overview diagrams
- sequence diagrams for use cases
- class and responsibility diagrams

## Contents

- `01-system-overview.puml`
  Describes the main frontend, backend, and PostgreSQL storage parts.
- `02-public-recipe-browse-sequence.puml`
  Shows the flow for public recipe list and recipe detail.
- `03-admin-login-and-edit-sequence.puml`
  Shows admin login and create/update recipe.
- `04-backend-class-overview.puml`
  Shows central backend classes and their relationships.
- `05-persistence-modes.puml`
  Shows the current PostgreSQL-only persistence path.
- `06-public-list-function-sequence.puml`
  Shows the function chain for the public recipe list.
- `07-public-detail-function-sequence.puml`
  Shows the function chain for public recipe detail and related recipes.
- `08-admin-login-function-sequence.puml`
  Shows the function chain for admin login.
- `09-admin-save-recipe-function-sequence.puml`
  Shows the function chain for admin create/update recipe.
- `10-backend-di-runtime-flow.puml`
  Shows how ASP.NET Core, controllers, service interfaces, services, EF repositories, DbContext, and PostgreSQL are connected at runtime.

## Important Code Points

Frontend:

- `frontend/src/routes/app/AppRoutes.tsx`
- `frontend/src/features/recipes/hooks/recipe-hooks.ts`
- `frontend/src/features/auth/hooks/auth-hooks.ts`
- `frontend/src/features/gallery/hooks/gallery-hooks.ts`
- `frontend/src/lib/api/recipes/recipes.ts`
- `frontend/src/lib/api/auth/auth.ts`
- `frontend/src/lib/api/gallery/gallery.ts`

Backend:

- `backend/RecipeApp.Api/Program.cs`
- `backend/RecipeApp.Api/Controllers/Admin/Recipes/AdminRecipesController.cs`
- `backend/RecipeApp.Api/Controllers/Admin/Gallery/AdminGalleryController.cs`
- `backend/RecipeApp.Api/Controllers/Auth/AuthController.cs`
- `backend/RecipeApp.Api/Services/Recipes/IRecipeService.cs`
- `backend/RecipeApp.Api/Services/Recipes/RecipeService.cs`
- `backend/RecipeApp.Api/Services/Gallery/IGalleryService.cs`
- `backend/RecipeApp.Api/Services/Gallery/GalleryService.cs`
- `backend/RecipeApp.Api/Repositories/Recipes/EfRecipeRepository.cs`
- `backend/RecipeApp.Api/Repositories/Gallery/EfGalleryRepository.cs`
- `backend/RecipeApp.Api/Data/Persistence/RecipeDbContext.cs`
- `backend/RecipeApp.Api/Data/Initialization/RecipeDbInitializer.cs`
- `backend/RecipeApp.Api.Tests/Testing/PostgresTestDatabase.cs`

## How To Render

Example with PlantUML CLI if installed:

```powershell
cd docs/system
plantuml *.puml
```

## Reading Order

1. Start with `01-system-overview.puml`.
2. Continue with sequence diagrams `02` and `03`.
3. Read `04-backend-class-overview.puml`.
4. Read `05-persistence-modes.puml` and `10-backend-di-runtime-flow.puml`.
5. Move to the function sequences `06` through `09`.
