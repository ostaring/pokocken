# Frontend

Frontend for receptappen.

## Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- Vitest
- React Testing Library

## Krav

- Windows med `npm` tillgangligt
- ingen global Node-uppgradering kravs for projektet

Frontendskripten anvander den lokala portabla Node-runtime som ligger i `../tools/node-v24.14.1-win-x64`, sa appen kan koras aven om den globalt installerade Node-versionen ar aldre.

## Starta Frontend

Fran repo-roten:

```powershell
cd frontend
npm install
npm run dev
```

Vite startar da den lokala utvecklingsservern och skriver ut URL:en i terminalen.

## API-Lagen

Frontend har tva API-lagen:

- `mock`
- `http`

Skapa en lokal env-fil om du vill styra laget:

```powershell
cd frontend
copy .env.example .env.local
```

Tillgangliga variabler:

- `VITE_API_MODE=mock`
- `VITE_API_MODE=http`
- `VITE_API_BASE_URL=http://localhost:5080`

Rekommenderad anvandning:

- anvand `mock` nar du vill jobba snabbt med UI och floden utan backend
- anvand `http` nar ASP.NET-backenden kor lokalt

Projektets standardlage ar fortfarande `mock`.

## Bygg Och Testa

```powershell
cd frontend
npm run test -- --run
npm run build
```

## Forhandsgranska Produktionsbygge

```powershell
cd frontend
npm run preview
```

## Viktiga Skript

- `npm run dev` startar utvecklingsservern
- `npm run test -- --run` kor frontendens testsuite en gang
- `npm run build` kor TypeScript-bygget och skapar produktionsbundle
- `npm run preview` server lokalt det byggda resultatet
- `npm run lint` kor ESLint

## Mappstruktur

```text
frontend/
  public/
  src/
    app/
    components/
    features/
      auth/
      recipes/
    lib/
    pages/
    routes/
    test/
    types/
```

## Nuvarande Funktioner

- startsida med utvalda recept och tydliga ingangar till publik del och admin
- publik receptlista med sokning, kategorifilter och filter i URL
- publik receptdetaljsida med oversikt, ingredienser, steg och relaterade recept
- admininloggning med validering och sessionskontroll
- adminoversikt med filter, publicera/avpublicera och borttagning
- admineditor for att skapa och redigera recept
- tydlig 404-sida for okanda routes
- bred Vitest-tackning for sidor, routes, hooks och API-adapters

## Koera Mot Backend

1. Starta API:t enligt [backend/README.md](C:/Users/Oscar/Documents/New%20project/backend/README.md).
2. Skapa `frontend/.env.local`.
3. Satt:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:5080
```

4. Starta frontend med `npm run dev`.

## Nastkommande Steg

- koppla fler floden till verklig backenddata som standard i lokal fullstack-korning
- lagga till fler UI-tester kring fellagen och edge cases
- komplettera senare med Playwright for end-to-end-tester
