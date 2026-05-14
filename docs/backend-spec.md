# Backend Specification

## 1. Purpose

The backend is responsible for:

- exposing API endpoints for public recipe reads and admin recipe management
- exposing API endpoints for public gallery reads and admin gallery management
- authenticating and authorizing admin access
- validating requests
- enforcing domain rules
- persisting application data through repository abstractions

The backend is the source of truth for business logic and data integrity.

## 2. Technology Stack

- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQLite provider for local relational persistence
- Swagger / OpenAPI
- xUnit for tests

## 3. Backend Goals

- Keep the API small and explicit
- Keep project structure easy to understand
- Enforce business rules centrally
- Make local development simple
- Be straightforward to deploy publicly

## 4. Domain Model

### Recipe

- `Id: Guid`
- `Title: string`
- `Slug: string`
- `Description: string`
- `Ingredients: IReadOnlyList<string>`
- `Steps: IReadOnlyList<string>`
- `PrepTimeMinutes: int`
- `Servings: int`
- `Category: string`
- `ImageUrl: string`
- `IsPublished: bool`

The current recipe domain model does not expose created/updated timestamps.

### GalleryImage

- `Id: Guid`
- `ImageUrl: string`
- `AltText: string`
- `CreatedAtUtc: DateTimeOffset`

### Admin credentials

- `Username: string`
- `PasswordHash: string`

Admin credentials are currently configured through application configuration rather than stored as an EF entity.

## 5. Business Rules

- Recipe title is required.
- Recipe slug is required and unique.
- Ingredients are required.
- Steps are required.
- Prep time must be greater than zero.
- Servings must be positive.
- Only authenticated admin users may access admin endpoints.
- Public recipe endpoints must never expose unpublished recipes.
- Gallery images are publicly readable.
- Gallery image creation requires image URL and alt text.
- Only authenticated admin users may create or delete gallery images.

## 6. API Surface

### Public endpoints

- `GET /api/recipes`
- `GET /api/recipes/{slug}`
- `GET /api/gallery`
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

## 7. Endpoint Behavior

### `GET /api/recipes`

- Returns only published recipes
- Supports optional query parameters:
  - `search`
  - `category`
- Returns published recipes matching the current repository ordering

### `GET /api/recipes/{slug}`

- Returns a single published recipe
- Returns `404` if slug does not exist or recipe is unpublished

### `POST /api/auth/login`

- Validates admin credentials
- Creates authenticated session
- Returns an admin session response suitable for frontend auth flow

### `POST /api/auth/logout`

- Ends authenticated session and deletes the session cookie

### `GET /api/auth/me`

- Returns authenticated admin summary if logged in
- Returns unauthorized otherwise

### `GET /api/admin/recipes`

- Returns all recipes including drafts
- Supports optional `search` and `category` query parameters
- Authentication required

### `GET /api/admin/recipes/{slug}`

- Returns a single recipe by slug
- Authentication required

### `POST /api/admin/recipes`

- Creates a new recipe
- Authentication required

### `PUT /api/admin/recipes/{slug}`

- Updates an existing recipe
- Authentication required

### `DELETE /api/admin/recipes/{slug}`

- Deletes an existing recipe
- Authentication required

### `GET /api/gallery`

- Returns gallery images

### `GET /api/admin/gallery`

- Returns gallery images for admin management
- Authentication required

### `POST /api/admin/gallery`

- Creates a gallery image
- Authentication required

### `DELETE /api/admin/gallery/{id}`

- Deletes a gallery image by Guid id
- Authentication required

## 8. Request and Response Model Direction

Use dedicated DTOs rather than exposing EF entities directly.

### Create/update recipe request

- `title`
- `slug`
- `description`
- `ingredients`
- `steps`
- `prepTimeMinutes`
- `servings`
- `category`
- `imageUrl`
- `isPublished`

### Public and admin recipe response

- `id`
- `title`
- `slug`
- `description`
- `category`
- `prepTimeMinutes`
- `servings`
- `imageUrl`
- `isPublished`
- `ingredients`
- `steps`

### Create gallery image request

- `imageUrl`
- `altText`

### Gallery image response

- `id`
- `imageUrl`
- `altText`
- `createdAtUtc`

## 9. Authentication Strategy

Current MVP approach:

- single bootstrap admin user from configuration
- password hash verification through `AdminPasswordHasher`
- server-side `AdminSessionStore`
- HTTP-only session cookie
- optional development API-key fallback

Why this approach:

- simple enough for a single-admin MVP
- good fit for browser-based admin flows
- keeps auth details centralized in backend infrastructure

## 10. Persistence Strategy

- Repository interfaces isolate persistence from controllers and services.
- Supported modes are `Memory`, `File`, and `Sqlite`.
- Development configuration uses SQLite.
- EF Core migrations manage the SQLite schema.
- Recipe and gallery seed data initialize an empty SQLite database.
- PostgreSQL is a possible future deployment option, not the active implementation.

## 11. Error Handling Rules

- Return `400` for validation errors
- Return `401` for unauthenticated admin access
- Return `403` if authenticated but forbidden
- Return `404` for missing resources
- Return `409` for slug conflicts if applicable
- Return consistent error payloads where the current endpoint supports them

## 12. Logging and Observability

- Use standard ASP.NET Core logging
- Log auth failures at appropriate level without leaking secrets
- Log recipe and gallery mutations
- Log database initialization failure
- Add structured request logging later if needed

## 13. Backend Folder Structure

```text
/backend
  /RecipeApp.Api
    /Controllers
      /Admin
      /Auth
      /Public
      /System
    /Contracts
    /Data
    /Domain
    /Infrastructure
    /Repositories
    /Services
  /RecipeApp.Api.Tests
```

## 14. Non-Functional Backend Requirements

- Clear separation between API contracts and persistence entities
- Reasonable unit/integration test coverage for core logic
- Easy local startup with SQLite
- Safe defaults for auth and validation

## 15. Backend Out of Scope for MVP

- multi-user roles
- refresh tokens
- distributed caching
- event bus or message queue
- image upload storage pipeline
- versioned APIs

## 16. Backend Acceptance Criteria

- Public users can fetch published recipes only.
- Public users can fetch gallery images.
- Admin can authenticate and manage recipes.
- Admin can manage gallery images.
- Draft recipes remain private.
- Invalid requests are rejected with clear status codes.
- Database schema is managed through migrations when SQLite mode is used.
