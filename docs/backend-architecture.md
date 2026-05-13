# Backend Architecture

Det här dokumentet beskriver hur backendens lager är kopplade efter refaktorn till controllers och interface-baserad dependency injection.

## Översikt

Backenden är nu uppdelad i tydliga lager:

- `Controllers`
  Tar emot HTTP-anrop, mappar routes, läser requestdata och returnerar HTTP-svar.
- `Services`
  Innehåller affärslogik och arbetar mot serviceinterfaces som `IRecipeService` och `IGalleryService`.
- `Repositories`
  Innehåller persistenslogik och abstraherar minne, fil och SQLite bakom interfaces som `IRecipeRepository` och `IGalleryRepository`.
- `Data`
  Innehåller EF Core-kontext, entities, mappning och databasinitialisering.
- `Infrastructure`
  Innehåller tvärgående tekniska delar som adminauth, authorization filter, password hashing och requestvalidering.
- `Contracts`
  Innehåller DTO:er för request/response mellan API och klient.

## Hur `Program.cs` kopplar ihop allt

Det viktiga i [backend/RecipeApp.Api/Program.cs](C:/Users/Oscar/Documents/New%20project/backend/RecipeApp.Api/Program.cs) är att vi registrerar relationer i DI-containern i stället för att manuellt skriva `new` för hela objektgrafen.

Exempel:

```csharp
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<IGalleryService, GalleryService>();
builder.Services.AddScoped<IRecipeRepository, SqliteRecipeRepository>();
builder.Services.AddControllers();
```

Det betyder:

1. Om någon begär `IRecipeService`, skapa en `RecipeService`.
2. Om någon begär `IRecipeRepository`, skapa en `SqliteRecipeRepository`.
3. Controller-systemet är aktiverat via `AddControllers()`.
4. Routes kopplas in via `app.MapControllers()`.

## Runtime-flöde

När en HTTP-request kommer in händer i praktiken detta:

1. ASP.NET matchar requesten mot en controller-route.
2. Frameworket försöker skapa rätt controller.
3. Controllerns constructor talar om vilka beroenden som behövs.
4. DI-containern skapar dessa beroenden rekursivt.
5. När hela objektgrafen är redo körs action-metoden.

Exempel för adminrecept:

```text
HTTP request
-> AdminRecipesController
-> IRecipeService
-> RecipeService
-> IRecipeRepository
-> SqliteRecipeRepository
-> RecipeDbContext
```

## Exempel: Controller beroende på interface

I stället för att controllern beror direkt på den konkreta implementationen:

```csharp
private readonly RecipeService _recipeService;
```

beror den nu på kontraktet:

```csharp
private readonly IRecipeService _recipeService;
```

Det gör att controllern bara känner till vad servicen kan göra, inte exakt hur den är implementerad.

## Varför det här är nyttigt

Det här ger flera fördelar:

- lösare koppling mellan lager
- enklare att byta implementation senare
- tydligare kontrakt per domän
- mer idiomatisk enterprise-arkitektur i ASP.NET Core
- lättare att förstå objektgrafen när projektet växer

## Hur det skiljer sig från manuell C++-wiring

I ett mer manuellt C++-upplägg skulle man ofta se:

- explicita `new`
- explicita factories
- explicita ägarkedjor
- smartpekare mellan lager

I ASP.NET Core är mycket av detta bortabstraherat:

- DI-containern fungerar som factory-lager
- livstider definieras med `Singleton`, `Scoped` och `Transient`
- objekt skapas när frameworket behöver dem

Det gör koden kortare, men kräver att man förstår registreringarna i `Program.cs`.

## Viktiga kodpunkter

- [backend/RecipeApp.Api/Program.cs](C:/Users/Oscar/Documents/New%20project/backend/RecipeApp.Api/Program.cs)
- [backend/RecipeApp.Api/Controllers/Admin/Recipes/AdminRecipesController.cs](C:/Users/Oscar/Documents/New%20project/backend/RecipeApp.Api/Controllers/Admin/Recipes/AdminRecipesController.cs)
- [backend/RecipeApp.Api/Services/Recipes/IRecipeService.cs](C:/Users/Oscar/Documents/New%20project/backend/RecipeApp.Api/Services/Recipes/IRecipeService.cs)
- [backend/RecipeApp.Api/Services/Recipes/RecipeService.cs](C:/Users/Oscar/Documents/New%20project/backend/RecipeApp.Api/Services/Recipes/RecipeService.cs)
- [backend/RecipeApp.Api/Repositories/Recipes/IRecipeRepository.cs](C:/Users/Oscar/Documents/New%20project/backend/RecipeApp.Api/Repositories/Recipes/IRecipeRepository.cs)
- [backend/RecipeApp.Api/Repositories/Recipes/SqliteRecipeRepository.cs](C:/Users/Oscar/Documents/New%20project/backend/RecipeApp.Api/Repositories/Recipes/SqliteRecipeRepository.cs)
- [backend/RecipeApp.Api/Data/Persistence/RecipeDbContext.cs](C:/Users/Oscar/Documents/New%20project/backend/RecipeApp.Api/Data/Persistence/RecipeDbContext.cs)

## Diagram

Se även:

- [docs/system/10-backend-di-runtime-flow.puml](C:/Users/Oscar/Documents/New%20project/docs/system/10-backend-di-runtime-flow.puml)
- [docs/system/04-backend-class-overview.puml](C:/Users/Oscar/Documents/New%20project/docs/system/04-backend-class-overview.puml)
