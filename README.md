# Recipe App

Fullstack-repo for en svensk receptapp med React i frontend och ASP.NET Core i backend.

## Delprojekt

- `frontend/` innehaller den publika webbappen och admingranssnittet
- `backend/` innehaller API, auth-bootstrap, PostgreSQL-persistens och tester
- `docs/` innehaller system- och arkitekturdokumentation
- `tools/` innehaller lokal Node-runtime som frontendens skript anvander

## Stack

- frontend: React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS
- backend: ASP.NET Core controllers, .NET 10, xUnit, EF Core, PostgreSQL
- lokal drift: Docker Compose for backend + PostgreSQL
- backendtester: Testcontainers for PostgreSQL-integrationsfloden

## Kom Igang

### Frontend i mock-lage

```powershell
cd frontend
npm install
npm run dev
```

Frontend startar da mot mockdata.

### Backend + PostgreSQL via Docker Compose

Fran repo-roten:

```powershell
docker compose up --build
```

Det startar:

- PostgreSQL pa `localhost:5432`
- backend pa `http://localhost:5080`

Snabbkontroller for backend:

- `http://localhost:5080/health`
- `http://localhost:5080/swagger`

### Fullstack med frontend lokalt

Starta backend och databas via Docker Compose enligt ovan. Starta sedan frontend i ett annat terminalfonster:

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
dotnet build .\RecipeApp.sln
dotnet test .\RecipeApp.sln
```

Backendtesterna anvander Testcontainers och kraver att Docker ar igang.

## Nuvarande Funktioner

- publik startsida med utvalda recept
- publik receptlista med filter i URL
- publik receptdetaljsida med relaterade recept
- publikt galleri
- admininloggning med bootstrap-auth
- adminoversikt med filter, publicering och borttagning
- admineditor for att skapa och redigera recept
- admingalleri for att lagga till och ta bort bilder
- explicit 404-sida i frontend
- PostgreSQL-baserad backend med EF Core-migrationer
- interface-baserad dependency injection for service- och repositorylager
- health-endpoint for lokal diagnostik

## Vidare Arbete

- ersatta bootstrap-auth med mer riktig autentisering
- containerisera frontend nar backend + databasflodet sitter
- lagga till e2e-tester nar huvudflodena satt sig helt
