# Frontend Specification

## 1. Purpose

The frontend is responsible for:

- rendering the public recipe experience
- rendering the public gallery
- rendering the admin interface
- handling navigation and page composition
- validating user input before submitting to the API
- consuming the backend API and presenting clear UI states

The frontend will not own business-critical rules. The backend remains the source of truth for authentication, authorization, and persistence.

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
- `/gallery`
- `/recipes`
- `/recipes/:slug`

### Admin routes

- `/admin/login`
- `/admin`
- `/admin/gallery`
- `/admin/recipes/new`
- `/admin/recipes/:id/edit`

The admin editor route still uses `:id` on the client. In HTTP mode the API adapter resolves that id to the current recipe slug before calling the backend update/delete endpoints.

## 5. Page Specifications

### Home page

- Show latest published recipes
- Show quick entry points to browse categories
- Highlight search entry

### Gallery page

- Show public gallery images
- Support loading, empty, and error states
- Use backend API data in HTTP mode and fixtures in mock mode

### Recipe listing page

- List published recipes
- Support search by title
- Support filter by category
- Support empty state when no recipes match

### Recipe detail page

- Show title, image, description, ingredients, steps, prep time, servings, and category
- Show only published recipes to public users in HTTP mode
- Handle not-found state cleanly

### Admin login page

- Username/password login form
- Error feedback for invalid credentials
- Redirect authenticated users away from login page

### Admin dashboard

- List all recipes including drafts
- Quick actions for create, edit, delete, publish, and unpublish
- Show recipe status clearly

### Admin gallery page

- List gallery images
- Allow admin to add gallery image URL and alt text
- Allow admin to delete gallery images
- Show loading and error states

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
- fetching gallery images
- mutations for login/logout and recipe CRUD
- mutations for gallery create/delete

## 7. Data Contracts Consumed by Frontend

### Recipe summary

- `id`
- `title`
- `slug`
- `description`
- `category`
- `imageUrl`
- `prepTimeMinutes`
- `servings`
- `isPublished`

### Recipe detail model

- all recipe summary fields
- `ingredients`
- `steps`

### Gallery image model

- `id`
- `imageUrl`
- `altText`
- `createdAtUtc`

## 8. API Interaction Rules

- All API access goes through a dedicated API client layer.
- Components should not build fetch calls inline.
- Query and mutation hooks should be centralized by feature.
- Authentication state should be derived from backend/session behavior, not guessed purely on the client.
- API access can run in `mock` mode or `http` mode through `VITE_API_MODE`.

## 9. Auth Model

Current frontend auth behavior:

- use backend session-cookie login in HTTP mode
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

## 11. Frontend Folder Structure

```text
/frontend/src
  /app
  /components
    /layout
  /features
    /auth
    /gallery
    /recipes
  /lib
    /api
    /config
    /query
  /pages
    /admin
    /public
    /system
  /routes
    /admin
    /app
  /test
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
- A visitor can view gallery images.
- An admin can log in and manage recipes.
- An admin can manage gallery images.
- All key pages work on mobile and desktop.
- API failures surface usable UI feedback.
- Form input is validated before submission.
