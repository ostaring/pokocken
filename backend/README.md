# Backend

ASP.NET Core Web API for receptappen.

## Stack

- ASP.NET Core controllers
- .NET 10 SDK
- EF Core med PostgreSQL
- Docker Compose for lokal PostgreSQL + backend
- xUnit och Testcontainers for tester
- lokal `dotnet-ef` tool-manifest for migrationer

## Projektstruktur

```text
backend/
  Dockerfile
  RecipeApp.sln
  README.md
  RecipeApp.Api/
  RecipeApp.Api.Tests/
```

## Nuvarande Omfang

Backenden innehaller just nu:

- publik receptlista och receptdetalj
- publikt galleri
- adminskyddade CRUD-endpoints for recept
- adminskyddade endpoints for gallerihantering
- cookie-baserad bootstrap-auth for admin
- faltspecifik requestvalidering for admin create/update
- tidsbegransade adminsessions och konfigurerbar API-key fallback
- hash-baserad verifiering av adminlosenord
- CORS-konfiguration for frontendens dev-server
- Swagger i utvecklingslage
- PostgreSQL-baserad persistens via EF Core
- EF Core-migrationer for databasschema
- health-endpoint for snabb lokal diagnostik
- testprojekt for services, repositories och endpoints

## Lokal Utveckling

Backend exponeras pa:

- `http://localhost:5080`

Detta matchar frontendens `VITE_API_BASE_URL`.

### Starta Backend Och Databas

Fran repo-roten:

```powershell
docker compose up --build
```

Det startar:

- `db`: PostgreSQL pa `localhost:5432`
- `backend`: ASP.NET Core API pa `http://localhost:5080`

Swagger finns pa:

- `http://localhost:5080/swagger`

Health-endpoint finns pa:

- `http://localhost:5080/health`

Backenden tillater frontendens dev-origin:

- `http://localhost:5173`

### Persistens

PostgreSQL ar den enda aktiva persistenslosningen.

Konfigurationen ligger i:

- `RecipeApp.Api/appsettings.json`
- `RecipeApp.Api/appsettings.Development.json`
- `docker-compose.yml`

Lokal connection string:

```text
Host=localhost;Port=5432;Database=pokocken;Username=pokocken;Password=pokocken
```

I Compose anvander backenden hostnamnet `db`:

```text
Host=db;Port=5432;Database=pokocken;Username=pokocken;Password=pokocken
```

Databasen skapas, migreras och seedas via `RecipeDbInitializer` nar API:t startar.

### Koer Tester

```powershell
cd backend
dotnet build .\RecipeApp.sln
dotnet test .\RecipeApp.sln
```

Backendtesterna anvander Testcontainers for PostgreSQL och kraver att Docker ar igang.

### Migrationer Och Schemauppdateringar

Forsta gangen pa en ny maskin:

```powershell
cd backend
dotnet tool restore
```

Skapa en ny migration efter en modelandring:

```powershell
cd backend
dotnet ef migrations add <MigrationName> --project .\RecipeApp.Api\RecipeApp.Api.csproj --startup-project .\RecipeApp.Api\RecipeApp.Api.csproj --output-dir Data\Migrations
```

Backenden applicerar migrationer automatiskt vid uppstart genom `RecipeDbInitializer`.

## Adminatkomst

Nuvarande adminauth ar bootstrapad pa tva satt:

- foredraget for frontend: `POST /api/auth/login` med utvecklingsuppgifterna nedan
- valfri fallback for manuell eller teknisk API-testning: skicka header `X-Admin-Api-Key: dev-admin-key`

Utvecklingsuppgifter:

- username: `admin`
- password: `admin123`

Adminlosenordet verifieras i forsta hand mot `Admin:PasswordHash`.
Det gamla faltet `Admin:Password` finns kvar som tillfallig fallback under overgangen, men grundkonfigurationen anvander hashad lagring.

Auth-endpoints:

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

API-key fallback ar konfigurerbar via `Admin:AllowApiKeyFallback`:

- `false` i grundkonfigurationen
- `true` i lokal utvecklingskonfiguration och Docker Compose

## API-Oversikt

### Infrastruktur

- `GET /health`

### Publika endpoints

- `GET /api/recipes`
- `GET /api/recipes/{slug}`
- `GET /api/gallery`

### Admin-endpoints

- `GET /api/admin/recipes`
- `GET /api/admin/recipes/{slug}`
- `POST /api/admin/recipes`
- `PUT /api/admin/recipes/{slug}`
- `DELETE /api/admin/recipes/{slug}`
- `GET /api/admin/gallery`
- `POST /api/admin/gallery`
- `DELETE /api/admin/gallery/{id}`

## Koppling Till Frontend

For att kora fullstack lokalt:

1. Starta backend och PostgreSQL med `docker compose up --build`.
2. Skapa `frontend/.env.local`.
3. Satt `VITE_API_MODE=http`.
4. Satt `VITE_API_BASE_URL=http://localhost:5080`.
5. Starta frontendens Vite-server.

## Nastkommande Steg

- ersatta bootstrap-auth med riktig autentisering
- containerisera frontend nar backend + databasflodet sitter
- hardna validering och felhantering innan extern publicering
