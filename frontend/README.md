# Frontend

Frontend for the recipe app.

## Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS

## Requirements

- Windows with `npm` available
- No global Node upgrade is required for this project right now

The frontend scripts are configured to use the local portable Node runtime in `../tools/node-v24.14.1-win-x64`, so the app can still run even if the system-installed Node version is older.

## Start The App

From the repo root:

```powershell
cd frontend
npm install
npm run dev
```

Vite will start a local development server and print the local URL in the terminal.

## API Configuration

The frontend supports two API modes:

- `mock`
- `http`

Create a local env file if you want to override the defaults:

```powershell
cd frontend
copy .env.example .env.local
```

Available variables:

- `VITE_API_MODE=mock`
- `VITE_API_MODE=http`
- `VITE_API_BASE_URL=http://localhost:5080`

Recommended usage:

- use `mock` while shaping UI and flows without a running backend
- use `http` when the ASP.NET backend is running locally

The current default is `mock`.

## Build

```powershell
cd frontend
npm run build
```

This creates a production build in `frontend/dist`.

## Preview Production Build

```powershell
cd frontend
npm run preview
```

## Useful Scripts

- `npm run dev` starts the development server
- `npm run build` runs TypeScript build checks and creates a production bundle
- `npm run preview` serves the production build locally
- `npm run lint` runs ESLint

## Folder Structure

```text
frontend/
  public/
  src/
    app/
    components/
    features/
      admin/
      auth/
      recipes/
    lib/
    pages/
    routes/
    types/
```

## Current State

The frontend currently includes:

- app shell and routing
- public pages
- admin pages
- configurable API adapter layer for mock or HTTP mode
- admin login form with client-side validation
- Vitest + React Testing Library setup

## Next Steps

- wire the upcoming ASP.NET backend to `VITE_API_MODE=http`
- expand component tests around editor and dashboard edge cases
- add Playwright later for end-to-end coverage
