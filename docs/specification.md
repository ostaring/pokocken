# Recipe App Master Specification

## 1. Project Summary

We will build a full-stack recipe web application with:

- a public frontend for browsing recipes
- an admin interface for managing recipes
- a backend API with authentication and persistence
- a PostgreSQL database

The goal is to keep the product intentionally small at MVP level, while still designing it like a real deployable production-style system.

## 2. Locked Technical Decisions

- Frontend: React + TypeScript + Vite
- Backend: ASP.NET Core Web API
- Database: PostgreSQL
- ORM: Entity Framework Core
- Frontend styling: Tailwind CSS
- Frontend server-state management: TanStack Query
- Frontend validation: Zod
- API documentation: Swagger / OpenAPI
- Local database runtime: Docker Compose

## 3. Product Scope

### MVP

- Public recipe list
- Public recipe detail page
- Search by title
- Filter by category
- Admin login/logout
- Admin create/edit/delete recipe
- Draft/published state

### Post-MVP

- Tags
- Image upload
- Markdown or rich-text editing
- Favorites
- Ratings/comments
- Shopping list export

## 4. Core Domain Rules

- Only published recipes are visible publicly.
- Draft recipes are visible only to authenticated admin users.
- Slugs must be unique.
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
- Durable storage for admin users
- Timestamps and relational integrity

## 6. Deployment Direction

Preferred setup:

- Frontend on Vercel
- Backend on Render or Railway
- PostgreSQL on Render, Railway, or Neon

This gives us a straightforward route to external access without overcomplicating the first version.

## 7. Project Layout

```text
/frontend
/backend
/docs
/docker-compose.yml
```

## 8. Specification Documents

- Frontend specification: [frontend-spec.md](C:/Users/Oscar/Documents/New%20project/docs/frontend-spec.md)
- Backend specification: [backend-spec.md](C:/Users/Oscar/Documents/New%20project/docs/backend-spec.md)

## 9. Build Order

1. Scaffold frontend and backend
2. Add PostgreSQL and database wiring
3. Implement recipe and auth backend
4. Build public frontend pages
5. Build admin frontend
6. Connect deployment
