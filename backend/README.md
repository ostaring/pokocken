# Backend

ASP.NET Core Web API for receptappen.

## Stack

- ASP.NET Core minimal API
- .NET 10 SDK
- xUnit for tester
- EF Core med SQLite i utvecklingslage
- konfigurerbar repositorystrategi med minne, fil eller SQLite

## Projektstruktur

```text
backend/
  RecipeApp.sln
  README.md
  RecipeApp.Api/
  RecipeApp.Api.Tests/
```

## Nuvarande Omfang

Backenden innehaller just nu:

- publik receptlista och receptdetalj
- adminskyddade CRUD-endpoints for recept
- cookie-baserad bootstrap-auth for admin
- CORS-konfiguration for frontendens dev-server
- Swagger i utvecklingslage
- SQLite-baserad receptpersistens i utvecklingslage
- health-endpoint for snabb lokal diagnostik
- testprojekt for services, repositories och endpoints

## Lokal Utveckling

Utvecklingsprofilen ar konfigurerad for:

- `http://localhost:5080`

Detta matchar frontendens `VITE_API_BASE_URL`.

### Starta API:t

Fran repo-roten:

```powershell
cd backend
dotnet run --project .\RecipeApp.Api\RecipeApp.Api.csproj
```

Swagger finns pa:

- `http://localhost:5080/swagger`

Health-endpoint finns pa:

- `http://localhost:5080/health`

Backenden tillater frontendens dev-origin:

- `http://localhost:5173`

### Persistenslagen

Backenden kan kora i tre lagen:

- `Memory`
- `File`
- `Sqlite`

Konfigurationen ligger i:

- `RecipeApp.Api/appsettings.json`
- `RecipeApp.Api/appsettings.Development.json`

Nuvarande standard:

- generell baseline: `Memory`
- utvecklingslage: `Sqlite`

Vid SQLite-lagring sparas databasen i:

- `RecipeApp.Api/App_Data/recipes.db`

Filrepositoryn finns kvar som alternativ och anvander:

- `RecipeApp.Api/App_Data/recipes.json`

### Koer Tester

```powershell
cd backend
dotnet build .\RecipeApp.sln
dotnet test .\RecipeApp.sln
```

Notera att endpointtesterna tvingas till minneslagring i testhosten for att sviten ska vara deterministisk aven om utvecklingslaget ar SQLite.

## Adminatkomst

Nuvarande adminauth ar bootstrapad pa tva satt:

- foredraget for frontend: `POST /api/auth/login` med utvecklingsuppgifterna nedan
- fallback for manuell eller teknisk API-testning: skicka header `X-Admin-Api-Key: dev-admin-key`

Utvecklingsuppgifter:

- username: `admin`
- password: `admin123`

Auth-endpoints:

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Detta ar fortfarande en tillfallig losning fore riktig produktionsauth.

## API-Oversikt

### Infrastruktur

- `GET /health`

### Publika endpoints

- `GET /api/recipes`
- `GET /api/recipes/{slug}`

### Admin-endpoints

- `GET /api/admin/recipes`
- `GET /api/admin/recipes/{id}`
- `POST /api/admin/recipes`
- `PUT /api/admin/recipes/{id}`
- `DELETE /api/admin/recipes/{id}`

## Payloadformat

`POST /api/admin/recipes` och `PUT /api/admin/recipes/{id}` anvander just nu detta payloadformat:

```json
{
  "title": "Ortig potatissallad",
  "slug": "ortig-potatissallad",
  "description": "Ljummen potatis med orter och senapsdressing.",
  "category": "Lunch",
  "prepTimeMinutes": 30,
  "servings": 4,
  "imageUrl": "https://example.com/potato-salad.jpg",
  "isPublished": false,
  "ingredients": ["1 kg potatis", "Persilja", "Senap"],
  "steps": ["Koka potatisen.", "Blanda dressingen.", "Vand ihop allt."]
}
```

## Koppling Till Frontend

For att kora fullstack lokalt:

1. Starta backend med `dotnet run`.
2. Skapa `frontend/.env.local`.
3. Satt `VITE_API_MODE=http`.
4. Satt `VITE_API_BASE_URL=http://localhost:5080`.
5. Starta frontendens Vite-server.

## Nastkommande Steg

- lagga till migrationer och mer explicit databasschemahantering
- kunna byta vidare till PostgreSQL nar deploysparet tar form
- ersatta bootstrap-auth med riktig autentisering
- hardna validering, felhantering och persistens innan extern publicering
