# Recipe App Master Specification

## 1. Project Summary

We are building a full-stack recipe web application for family and friends with:

- a public frontend for browsing recipes
- a public gallery
- an admin interface for managing recipes
- an admin interface for managing gallery images
- a backend API with authentication, authorization, validation, and persistence
- EF Core persistence using SQLite for local development

The goal is to keep the product intentionally small at MVP level, while still designing it like a real deployable production-style system.

## 2. Current Technical Decisions

- Frontend: React + TypeScript + Vite
- Backend: ASP.NET Core Web API
- Active local database: SQLite
- ORM: Entity Framework Core
- Frontend styling: Tailwind CSS
- Frontend server-state management: TanStack Query
- Frontend validation: Zod
- API documentation: Swagger / OpenAPI
- Backend persistence modes: Memory, File, SQLite
- Local fullstack mode: ASP.NET Core API plus Vite frontend

## 3. Product Scope

### MVP

- Public home page
- Public recipe list
- Public recipe detail page
- Public gallery
- Search by title
- Filter by category
- Admin login/logout
- Admin create/edit/delete recipe
- Admin create/delete gallery image
- Draft/published state

### Post-MVP

- Tags
- Image upload storage pipeline
- Markdown or rich-text editing
- Favorites
- Ratings/comments
- Shopping list export

## 4. Core Domain Rules

- Only published recipes are visible publicly.
- Draft recipes are visible only to authenticated admin users.
- Slugs must be unique.
- Gallery images are publicly readable but admin-managed.
- Recipe create/update operations must validate required fields.
- Passwords must be hashed and never stored in plaintext.
- Admin-only endpoints must require authentication.

## 5. System Boundaries

### Frontend owns

- Routing
- Public UI
- Admin UI
- Form handling
- Client-side validation
- Calling backend API
- Displaying loading and error states

### Backend owns

- Authentication and authorization
- Validation of incoming requests
- Business rules
- Slug uniqueness
- Persistence
- API contracts

### Database owns

- Durable storage for recipes
- Durable storage for gallery images
- Schema management through EF Core migrations where relational persistence is used

### Current authentication note

Admin authentication currently uses a configured bootstrap admin account, hashed password verification, an in-memory session store, and an HTTP-only session cookie. A development API-key fallback can be enabled in development configuration.

## 6. Deployment Direction

Current local setup:

- Frontend runs through Vite.
- Backend runs as ASP.NET Core.
- Development persistence uses SQLite at `backend/RecipeApp.Api/App_Data/recipes.db`.

Possible later deployment direction:

- Frontend on Vercel or another static host.
- Backend on Render, Railway, Azure, or similar.
- Database can remain SQLite for simple hosting or move to PostgreSQL when the product needs a managed multi-user database.

## 7. Project Layout

```text
/frontend
/backend
/docs
/tools
```

## 8. Specification Documents

- Frontend specification: [frontend-spec.md](frontend-spec.md)
- Backend specification: [backend-spec.md](backend-spec.md)
- Backend architecture notes: [backend-architecture.md](backend-architecture.md)
- System diagrams: [system/README.md](system/README.md)

## 9. Current Build State

Completed or active:

1. Frontend and backend are scaffolded.
2. Public home, recipe, and gallery pages exist.
3. Admin login, dashboard, recipe editor, and gallery management exist.
4. Backend is controller-based with services, repositories, contracts, domain models, infrastructure, and EF Core SQLite persistence.
5. Frontend and backend are organized into clearer subdirectories.
6. System documentation exists under `docs/system/`.

Likely next work:

1. Decide whether production persistence should stay SQLite or move to PostgreSQL.
2. Harden authentication beyond the bootstrap admin/session approach.
3. Add e2e tests once the main user flows settle.
