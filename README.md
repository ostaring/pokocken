# Recipe App

Fullstack-repo for en svensk receptapp med React i frontend och ASP.NET Core i backend.

## Delprojekt

- `frontend/` innehaller den publika webbappen och admingranssnittet
- `backend/` innehaller API, auth-bootstrap och tester
- `tools/` innehaller lokal Node-runtime som frontendens skript anvander

## Stack

- frontend: React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS
- backend: ASP.NET Core minimal API, .NET 10, xUnit

## Kom Igång

### Frontend i mock-lage

```powershell
cd frontend
npm install
npm run dev
```

Frontend startar da mot mockdata.

### Fullstack lokalt

Starta backend i ett terminalfonster:

```powershell
cd backend
dotnet run --project .\RecipeApp.Api\RecipeApp.Api.csproj
```

Starta sedan frontend i ett annat terminalfonster:

```powershell
cd frontend
copy .env.example .env.local
```

Satt i `frontend/.env.local`:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:5080
```

Och starta frontend:

```powershell
cd frontend
npm run dev
```

## Tester

Frontend:

```powershell
cd frontend
npm run test -- --run
npm run build
```

Backend:

```powershell
cd backend
dotnet test .\RecipeApp.sln
```

## Nuvarande Funktioner

- publik startsida med utvalda recept
- publik receptlista med filter i URL
- publik receptdetaljsida med relaterade recept
- admininloggning med bootstrap-auth
- adminoversikt med filter, publicering och borttagning
- admineditor for att skapa och redigera recept
- explicit 404-sida i frontend

## Vidare Arbete

- byta in-memory-lagring mot databas i backend
- ersatta bootstrap-auth med mer riktig autentisering
- lagga till e2e-tester nar huvudflodena satt sig helt
