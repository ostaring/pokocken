# Recipe App Master Specification

## 1. Project Summary

We are building a full-stack recipe web application for family and friends with:

- a public frontend for browsing recipes and gallery images
- an admin interface for managing recipes and gallery images
- a backend API with authentication, authorization, validation, and persistence
- EF Core persistence using PostgreSQL
- Docker Compose for local backend + database runtime

The goal is to keep the product intentionally small at MVP level, while still designing it like a real deployable production-style system.

## 2. Current Technical Decisions

- Frontend: React + TypeScript + Vite
- Backend: ASP.NET Core Web API
- Database: PostgreSQL
- ORM: Entity Framework Core
- Frontend styling: Tailwind CSS
- Frontend server-state management: TanStack Query
- Frontend validation: Zod
- API documentation: Swagger / OpenAPI
- Local backend runtime: Docker Compose
- Backend integration tests: Testcontainers for PostgreSQL

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
- Frontend containerization

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
- Schema management through EF Core migrations

## 6. Local Runtime

Current local setup:

- Frontend runs through Vite on the host machine.
- Backend runs in Docker Compose.
- PostgreSQL runs in Docker Compose with a persistent volume.
- Backend is exposed at `http://localhost:5080`.

## 7. Project Layout

```text
/frontend
/backend
/docs
/tools
/docker-compose.yml
```

## 8. Current Build State

Completed or active:

1. Frontend and backend are scaffolded.
2. Public home, recipe, and gallery pages exist.
3. Admin login, dashboard, recipe editor, and gallery management exist.
4. Backend is controller-based with services, repositories, contracts, domain models, infrastructure, and EF Core PostgreSQL persistence.
5. Backend and PostgreSQL can run through Docker Compose.
6. Backend integration tests target PostgreSQL through Testcontainers.

Likely next work:

1. Containerize the frontend once backend + database runtime is stable.
2. Harden authentication beyond the bootstrap admin/session approach.
3. Add e2e tests once the main user flows settle.
