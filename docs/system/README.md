# System Documentation

This folder collects architecture and flow documentation for the recipe app.

PlantUML is the main format because the current documentation needs:

- overview diagrams
- sequence diagrams for use cases
- class and responsibility diagrams

Mermaid can still be added later for simpler README-level visuals.

## Contents

- `01-system-overview.puml`
  Describes the main frontend, backend, and storage parts.
- `02-public-recipe-browse-sequence.puml`
  Shows the flow for public recipe list and recipe detail.
- `03-admin-login-and-edit-sequence.puml`
  Shows admin login and create/update recipe.
- `04-backend-class-overview.puml`
  Shows central backend classes and their relationships.
- `05-persistence-modes.puml`
  Shows how the backend can run against memory, file, or SQLite.
- `06-public-list-function-sequence.puml`
  Shows the function chain for the public recipe list.
- `07-public-detail-function-sequence.puml`
  Shows the function chain for public recipe detail and related recipes.
- `08-admin-login-function-sequence.puml`
  Shows the function chain for admin login.
- `09-admin-save-recipe-function-sequence.puml`
  Shows the function chain for admin create/update recipe.
- `10-backend-di-runtime-flow.puml`
  Shows how ASP.NET Core, controllers, service interfaces, services, and repositories are connected at runtime.

## Documented Use Cases

1. Visitor opens the home page or recipe list.
2. Visitor filters recipes and opens a recipe detail page.
3. Visitor opens the gallery page.
4. Admin logs in.
5. Admin fetches recipes in the dashboard.
6. Admin creates or updates a recipe.
7. Admin manages gallery images.
8. Backend chooses repository implementation from configuration.
9. Dependency injection creates the controller and service chain at runtime.

## Diagram Levels

There are two levels of sequence diagrams:

- overview sequences in `02` and `03`
- detailed function sequences in `06` through `09`

The detailed sequences use function names from the code, for example:

- `useRecipesQuery`
- `fetchRecipes`
- `fetchRecipesHttp`
- `GetPublishedRecipes`
- `GetBySlug`
- `useLoginMutation`
- `loginAdminHttp`
- `CreateRecipe`
- `SqliteRecipeRepository.Add`

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
- `backend/RecipeApp.Api/Infrastructure/Auth/AdminAuthorizationFilter.cs`
- `backend/RecipeApp.Api/Repositories/Recipes/IRecipeRepository.cs`
- `backend/RecipeApp.Api/Repositories/Recipes/InMemoryRecipeRepository.cs`
- `backend/RecipeApp.Api/Repositories/Recipes/FileRecipeRepository.cs`
- `backend/RecipeApp.Api/Repositories/Recipes/SqliteRecipeRepository.cs`
- `backend/RecipeApp.Api/Repositories/Gallery/IGalleryRepository.cs`
- `backend/RecipeApp.Api/Repositories/Gallery/InMemoryGalleryRepository.cs`
- `backend/RecipeApp.Api/Repositories/Gallery/FileGalleryRepository.cs`
- `backend/RecipeApp.Api/Repositories/Gallery/SqliteGalleryRepository.cs`
- `backend/RecipeApp.Api/Data/Persistence/RecipeDbContext.cs`
- `backend/RecipeApp.Api/Data/Initialization/RecipeDbInitializer.cs`

## How To Render

Example with PlantUML CLI if installed:

```powershell
cd docs/system
plantuml *.puml
```

If you use VS Code, a PlantUML plugin is also a good option.

## Reading Order

1. Start with `01-system-overview.puml`.
2. Continue with sequence diagrams `02` and `03`.
3. Read `04-backend-class-overview.puml`.
4. Move to the function sequences `06` through `09`.
5. Read `10-backend-di-runtime-flow.puml`.
6. Finish with `05-persistence-modes.puml`.

This gives the whole picture first, then use cases, then implementation and runtime choices.
