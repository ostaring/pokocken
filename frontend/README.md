# Frontend

React frontend for Pokocken. It contains the public home recipe discovery view, recipe detail pages, gallery page, recipe suggestion page, plus the admin UI for login, recipe management, publishing, and gallery management.

## Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- Vitest and React Testing Library

## Requirements

- Node.js and npm installed in the environment where the frontend runs.
- In WSL, use Node from Ubuntu/Linux instead of the Windows installation under `/mnt/c`.

Check:

```bash
node --version
npm --version
which node
which npm
```

`which node` and `which npm` should point to Linux paths, not `Program Files`.

## Launch

From the repo root:

```bash
cp .env.example .env
docker compose up --build
```

This starts the frontend container at `http://localhost:5173`.

For Vite development without containers:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local dev URL, usually `http://localhost:5173`.

## API Mode

The frontend supports two API modes:

- `mock` - local mock data, useful for fast UI work.
- `http` - calls the ASP.NET Core backend for recipes, gallery, auth, and recipe suggestions.

The default mode is `mock`. To run Vite against the backend, start only the backend and PostgreSQL from the repo root:

```bash
docker compose up --build db backend
```

Then create `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Set:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:5080
```

Run `npm run dev` in `frontend/`.

The Docker image builds with:

```text
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:5080
```

Main routes:

- `/` - home recipe discovery
- `/recipes/:slug` - recipe detail
- `/gallery` - gallery
- `/suggest` - recipe suggestions from selected ingredients
- `/admin/login` - admin login
- `/admin` - admin dashboard
- `/admin/gallery` - admin gallery management
- `/admin/recipes/new` - create recipe
- `/admin/recipes/:id/edit` - edit recipe

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run preview
```

## Tests And Build

```bash
cd frontend
npm run lint
npm run test
npm run build
```

## Structure

```text
frontend/
  src/
    app/
    components/
    features/
    lib/
    pages/
    routes/
    test/
    types/
```

More system context is available in `../README.md` and `../docs/`.
