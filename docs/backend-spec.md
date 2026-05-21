# Backend Specification

## 1. Purpose

The backend is responsible for:

- exposing API endpoints for public recipe reads, recipe suggestions, and admin recipe management
- exposing API endpoints for public gallery reads and admin gallery management
- authenticating and authorizing admin access
- validating requests
- enforcing domain rules
- persisting application data in PostgreSQL through EF Core repositories

The backend is the source of truth for business logic and data integrity.

## 2. Technology Stack

- ASP.NET Core Web API
- C#
- Entity Framework Core
- Npgsql PostgreSQL provider
- PostgreSQL
- Docker Compose
- Swagger / OpenAPI
- xUnit and Testcontainers for tests

## 3. Persistence Strategy

- PostgreSQL is the only active database.
- `RecipeDbContext` owns the EF Core model.
- `EfRecipeRepository` and `EfGalleryRepository` are the only concrete repository implementations.
- Repository interfaces are kept so services stay decoupled from EF Core.
- EF Core migrations manage the PostgreSQL schema.
- `RecipeDbInitializer` applies migrations and seeds recipes/gallery images on startup.

## 4. API Surface

### Public endpoints

- `GET /api/recipes`
- `GET /api/recipes/{slug}`
- `GET /api/gallery`
- `POST /api/recipe-suggestions`
- `GET /health`

### Admin auth endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Admin recipe endpoints

- `GET /api/admin/recipes`
- `GET /api/admin/recipes/{slug}`
- `POST /api/admin/recipes`
- `PUT /api/admin/recipes/{slug}`
- `DELETE /api/admin/recipes/{slug}`

### Admin gallery endpoints

- `GET /api/admin/gallery`
- `POST /api/admin/gallery`
- `DELETE /api/admin/gallery/{id}`

## 5. Domain And Contracts

- `Recipe` contains id, title, slug, description, category, prep time, servings, image URL, published state, ingredients, and steps.
- `GalleryImage` contains id, image URL, alt text, and created timestamp.
- Recipe suggestion contracts contain requested ingredients, servings, maximum time, and a list of suggestion items.
- Admin credentials are configured through application configuration rather than stored as an EF entity.
- API controllers use dedicated request/response DTOs rather than exposing EF entities directly.

## 6. Authentication Strategy

Current MVP approach:

- single bootstrap admin user from configuration
- password hash verification through `AdminPasswordHasher`
- server-side `AdminSessionStore`
- HTTP-only session cookie
- session-bound CSRF token returned by login/me and required for cookie-authenticated admin writes/logout
- login rate limiting
- admin API rate limiting
- optional development API-key fallback

## 7. Error Handling And Observability

- Return `400` for validation errors.
- Return `401` for unauthenticated admin access.
- Return `403` for failed CSRF validation on authenticated admin write/logout requests.
- Return `404` for missing resources.
- Return `409` for slug conflicts.
- Return `429` for rate-limited login/admin requests.
- Use standard ASP.NET Core logging for auth failures, mutations, and database initialization failures.

## 8. Backend Acceptance Criteria

- Public users can fetch published recipes only.
- Public users can fetch gallery images.
- Public users can call the recipe suggestion endpoint.
- Admin can authenticate and manage recipes.
- Admin can manage gallery images.
- Draft recipes remain private.
- Invalid requests are rejected with clear status codes.
- Database schema is managed through PostgreSQL EF Core migrations.
- Backend tests run against PostgreSQL through Testcontainers.
