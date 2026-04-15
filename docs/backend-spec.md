# Backend Specification

## 1. Purpose

The backend is responsible for:

- exposing API endpoints for public recipe reads and admin recipe management
- authenticating and authorizing admin access
- validating requests
- enforcing domain rules
- persisting application data in PostgreSQL

The backend is the source of truth for business logic and data integrity.

## 2. Technology Stack

- ASP.NET Core Web API
- C#
- Entity Framework Core
- Npgsql Entity Framework provider
- PostgreSQL
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
- `Ingredients: string`
- `Steps: string`
- `PrepTimeMinutes: int`
- `Servings: int`
- `Category: string`
- `ImageUrl: string?`
- `IsPublished: bool`
- `CreatedAtUtc: DateTime`
- `UpdatedAtUtc: DateTime`

### AdminUser

- `Id: Guid`
- `Username: string`
- `PasswordHash: string`
- `CreatedAtUtc: DateTime`

## 5. Business Rules

- Recipe title is required.
- Recipe slug is required and unique.
- Ingredients are required.
- Steps are required.
- Prep time must be non-negative.
- Servings must be positive.
- Only authenticated admin users may access admin endpoints.
- Public endpoints must never expose unpublished recipes.

## 6. API Surface

### Public endpoints

- `GET /api/recipes`
- `GET /api/recipes/{slug}`

### Admin auth endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Admin recipe endpoints

- `GET /api/admin/recipes`
- `GET /api/admin/recipes/{id}`
- `POST /api/admin/recipes`
- `PUT /api/admin/recipes/{id}`
- `DELETE /api/admin/recipes/{id}`

## 7. Endpoint Behavior

### `GET /api/recipes`

- Returns only published recipes
- Supports optional query parameters:
  - `search`
  - `category`
- Sorted by newest updated or created timestamp in MVP

### `GET /api/recipes/{slug}`

- Returns a single published recipe
- Returns `404` if slug does not exist or recipe is unpublished

### `POST /api/auth/login`

- Validates admin credentials
- Creates authenticated session
- Returns success/failure result suitable for frontend auth flow

### `POST /api/auth/logout`

- Ends authenticated session

### `GET /api/auth/me`

- Returns authenticated admin summary if logged in
- Returns unauthorized otherwise

### `GET /api/admin/recipes`

- Returns all recipes including drafts
- Authentication required

### `GET /api/admin/recipes/{id}`

- Returns a single recipe by internal id
- Authentication required

### `POST /api/admin/recipes`

- Creates a new recipe
- Authentication required

### `PUT /api/admin/recipes/{id}`

- Updates an existing recipe
- Authentication required

### `DELETE /api/admin/recipes/{id}`

- Deletes an existing recipe
- Authentication required

## 8. Request and Response Model Direction

Use dedicated DTOs rather than exposing EF entities directly.

### Create/update recipe request

- `title`
- `description`
- `ingredients`
- `steps`
- `prepTimeMinutes`
- `servings`
- `category`
- `imageUrl`
- `isPublished`

### Public recipe response

- omit admin-only or unnecessary fields where possible
- include stable fields required by the frontend

### Admin recipe response

- include internal identifier
- include status metadata
- include timestamps

## 9. Authentication Strategy

Recommended MVP approach:

- ASP.NET Core cookie authentication
- single admin user seeded initially or created through configuration/bootstrap

Why this approach:

- simpler than rolling JWT for a single-admin MVP
- good fit for browser-based admin flows
- fewer moving parts in the frontend

## 10. Persistence Strategy

- PostgreSQL as primary database
- Entity Framework Core migrations for schema management
- seed one admin account in a controlled way for local/dev startup

## 11. Error Handling Rules

- Return `400` for validation errors
- Return `401` for unauthenticated admin access
- Return `403` if authenticated but forbidden
- Return `404` for missing resources
- Return `409` for slug conflicts if applicable
- Return consistent error payloads

## 12. Logging and Observability

- Use standard ASP.NET Core logging
- Log auth failures at appropriate level without leaking secrets
- Log unhandled exceptions
- Add structured request logging later if needed

## 13. Suggested Backend Folder Structure

```text
/backend
  /Controllers
  /Contracts
  /Domain
  /Infrastructure
  /Services
  /Data
```

## 14. Non-Functional Backend Requirements

- Clear separation between API contracts and persistence entities
- Reasonable unit/integration test coverage for core logic
- Easy local startup against Docker PostgreSQL
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
- Admin can authenticate and manage recipes.
- Draft recipes remain private.
- Invalid requests are rejected with clear status codes.
- Database schema is managed through migrations.
