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
- mock recipe browsing UI
- admin login form with client-side validation

## Next Steps

- connect recipes list to backend API
- connect login form to backend auth endpoint
- add protected admin routes
- build recipe editor form
