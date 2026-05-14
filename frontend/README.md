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

- Node.js och npm installerat i den miljo dar frontend koras.
- I WSL rekommenderas Node via Ubuntu, inte Windows-installationen via `/mnt/c`.

Kontrollera i WSL:

```bash
node --version
npm --version
which node
which npm
```

`which node` och `which npm` bor peka pa Linux-pathar, inte `Program Files`.

## Starta Frontend

Fran repo-roten:

```bash
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

```bash
cd frontend
cp .env.example .env.local
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

```bash
cd frontend
npm run test -- --run
npm run build
```

## Forhandsgranska Produktionsbygge

```bash
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

1. Starta API:t enligt [backend/README.md](../backend/README.md).
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
