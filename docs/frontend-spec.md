# Frontend Specification

## 1. Purpose

The frontend is responsible for:

- rendering the public recipe experience
- rendering the admin interface
- handling navigation and page composition
- validating user input before submitting to the API
- consuming the backend API and presenting clear UI states

The frontend will not own business-critical rules. The backend remains source of truth for authentication, authorization, and persistence.

## 2. Technology Stack

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- Zod
- React Hook Form

## 3. Frontend Goals

- Fast startup and iteration during development
- Clean, responsive UI on desktop and mobile
- Small and understandable component structure
- Clear distinction between public and admin areas
- Stable API integration with typed request/response models

## 4. Information Architecture

### Public routes

- `/`
- `/recipes`
- `/recipes/:slug`

### Admin routes

- `/admin/login`
- `/admin`
- `/admin/recipes/new`
- `/admin/recipes/:id/edit`

## 5. Page Specifications

### Home page

- Show latest published recipes
- Show quick entry points to browse categories
- Highlight search entry

### Recipe listing page

- List published recipes
- Support search by title
- Support filter by category
- Support empty state when no recipes match

### Recipe detail page

- Show title, image, description, ingredients, steps, prep time, servings, and category
- Show only published recipes to public users
- Handle not-found state cleanly

### Admin login page

- Username/password login form
- Error feedback for invalid credentials
- Redirect authenticated users away from login page

### Admin dashboard

- List all recipes including drafts
- Quick actions for create, edit, delete, publish, and unpublish
- Show recipe status clearly

### Admin recipe editor

- Shared create/edit form
- Validate required fields before submit
- Support save as draft
- Support publish toggle
- Show loading, success, and error states

## 6. Component and State Strategy

### Local UI state

Use local component state for:

- input values not managed by forms
- modal visibility
- filter UI state
- transient interaction state

### Form state

Use React Hook Form with Zod for:

- login form
- recipe create form
- recipe edit form

### Server state

Use TanStack Query for:

- fetching published recipes
- fetching recipe details
- fetching admin recipe lists
- mutations for login/logout and recipe CRUD

## 7. Data Contracts Consumed by Frontend

### Public recipe list item

- `id`
- `title`
- `slug`
- `description`
- `category`
- `imageUrl`
- `prepTimeMinutes`
- `servings`

### Recipe detail model

- `id`
- `title`
- `slug`
- `description`
- `ingredients`
- `steps`
- `category`
- `imageUrl`
- `prepTimeMinutes`
- `servings`
- `isPublished`
- `updatedAtUtc`

### Admin recipe model

- includes all recipe detail fields
- includes internal identifier
- includes publish state
- includes created and updated timestamps

## 8. API Interaction Rules

- All API access goes through a dedicated API client layer.
- Components should not build fetch calls inline.
- Query and mutation hooks should be centralized by feature.
- Authentication state should be derived from backend/session behavior, not guessed purely on the client.

## 9. Auth Model

Preferred frontend auth behavior:

- use secure session/cookie-based login if feasible
- keep admin session handling simple
- protect admin routes by checking authenticated session
- redirect unauthenticated users to `/admin/login`

If we later switch to token-based auth, we should keep that change isolated to the API client and route guard layer.

## 10. Styling and UX Principles

- Mobile-first responsive layout
- Clean, editorial recipe-oriented visual design
- Strong readability for ingredients and step lists
- Clear distinction between public browsing and admin workspace
- Accessible forms with labels, errors, and focus states

## 11. Suggested Frontend Folder Structure

```text
/frontend/src
  /app
  /components
  /features
    /recipes
    /admin
    /auth
  /lib
  /pages
  /routes
  /types
```

## 12. Non-Functional Frontend Requirements

- Type-safe TypeScript setup
- Linting and formatting enabled
- No unnecessary global state library in MVP
- Good loading and empty states
- Clear error handling for failed API requests

## 13. Frontend Out of Scope for MVP

- SSR
- localization
- offline mode
- advanced animation system
- image upload pipeline

## 14. Frontend Acceptance Criteria

- A visitor can browse and read published recipes.
- An admin can log in and manage recipes.
- All key pages work on mobile and desktop.
- API failures surface usable UI feedback.
- Form input is validated before submission.
