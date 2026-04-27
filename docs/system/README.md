# Systemdokumentation

Den har mappen samlar arkitektur- och flodesdokumentation for receptappen.

Jag valde PlantUML eftersom du uttryckligen namnde det och fordiagramtyperna vi behover nu ar:

- oversiktsdiagram
- sekvensdiagram for use cases
- klass- och ansvarsbilder

Det ar fullt mojligt att senare komplettera med Mermaid for enklare README-visualiseringar, men PlantUML ar ett bra huvudformat for teknisk systemdokumentation.

## Innehall

- `01-system-overview.puml`
  Beskriver huvuddelarna i frontend, backend och lagringslagret.
- `02-public-recipe-browse-sequence.puml`
  Visar flodet for publik receptlista och receptdetalj.
- `03-admin-login-and-edit-sequence.puml`
  Visar adminlogin och skapa/uppdatera recept.
- `04-backend-class-overview.puml`
  Visar centrala backendklasser och deras relationer.
- `05-persistence-modes.puml`
  Visar hur backend kan kora mot minne, fil eller SQLite.
- `06-public-list-function-sequence.puml`
  Visar exakt funktionskedja for publik receptlista.
- `07-public-detail-function-sequence.puml`
  Visar exakt funktionskedja for publik receptdetalj och relaterade recept.
- `08-admin-login-function-sequence.puml`
  Visar exakt funktionskedja for adminlogin.
- `09-admin-save-recipe-function-sequence.puml`
  Visar exakt funktionskedja for admin skapa/uppdatera recept.

## Viktiga use cases som dokumenteras

1. Besokare oppnar startsida eller receptlista.
2. Besokare filtrerar recept och oppnar en receptdetalj.
3. Admin loggar in.
4. Admin hamtar recept i dashboard.
5. Admin skapar eller uppdaterar recept.
6. Backend valjer repository beroende pa konfiguration.

## Diagramnivaer

Det finns nu tva nivaer av sekvensdiagram:

- oversiktssekvenser i `02` och `03`
- detaljerade funktionssekvenser i `06` till `09`

De detaljerade sekvenserna ar skrivna pa engelska och anvander faktiska funktionsnamn fran koden, till exempel:

- `useRecipesQuery`
- `fetchRecipes`
- `fetchRecipesHttp`
- `GetPublishedRecipes`
- `GetBySlug`
- `useLoginMutation`
- `loginAdminHttp`
- `CreateRecipe`
- `SqliteRecipeRepository.Add`

## Viktiga kodpunkter

Frontend:

- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/features/recipes/recipe-hooks.ts`
- `frontend/src/features/auth/auth-hooks.ts`
- `frontend/src/lib/api/recipes.ts`
- `frontend/src/lib/api/auth.ts`

Backend:

- `backend/RecipeApp.Api/Program.cs`
- `backend/RecipeApp.Api/Services/RecipeService.cs`
- `backend/RecipeApp.Api/Infrastructure/AdminApiKeyEndpointFilter.cs`
- `backend/RecipeApp.Api/Repositories/IRecipeRepository.cs`
- `backend/RecipeApp.Api/Repositories/InMemoryRecipeRepository.cs`
- `backend/RecipeApp.Api/Repositories/FileRecipeRepository.cs`
- `backend/RecipeApp.Api/Repositories/SqliteRecipeRepository.cs`
- `backend/RecipeApp.Api/Data/RecipeDbContext.cs`
- `backend/RecipeApp.Api/Data/RecipeDbInitializer.cs`

## Hur man renderar

Exempel med PlantUML CLI om du har det installerat:

```powershell
cd docs/system
plantuml *.puml
```

Om du kor VS Code ar PlantUML-plugin eller IntelliJ-plugin ocksa ett bra alternativ.

## Lasordning

1. borja med `01-system-overview.puml`
2. fortsatt med sekvensdiagrammen `02` och `03`
3. ga sedan till `04-backend-class-overview.puml`
4. ga vidare till funktionssekvenserna `06` till `09`
5. avsluta med `05-persistence-modes.puml`

Det ger forst helhetsbilden, sedan use cases, och sist implementation och driftval.
