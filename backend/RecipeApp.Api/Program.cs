using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Data;
using RecipeApp.Api.Infrastructure;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
var persistenceMode = builder.Configuration["Persistence:Mode"] ?? "Memory";
var sqliteConnectionString = builder.Configuration.GetConnectionString("RecipesDb");

builder.Services.Configure<AdminAuthOptions>(builder.Configuration.GetSection("Admin"));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<AdminPasswordHasher>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDevClient", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.WithOrigins("http://localhost:5173");
        }
        else
        {
            policy.WithOrigins(allowedOrigins);
        }

        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

if (string.Equals(persistenceMode, "Sqlite", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddDbContext<RecipeDbContext>(options =>
    {
        options.UseSqlite(sqliteConnectionString);
    });
    builder.Services.AddScoped<IRecipeRepository, SqliteRecipeRepository>();
    builder.Services.AddScoped<RecipeDbInitializer>();
}
else if (string.Equals(persistenceMode, "File", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddSingleton<IRecipeRepository>(_ =>
    {
        var storagePath = builder.Configuration["Persistence:RecipesFilePath"];
        return new FileRecipeRepository(storagePath!);
    });
}
else
{
    builder.Services.AddSingleton<IRecipeRepository, InMemoryRecipeRepository>();
}

builder.Services.AddSingleton<AdminSessionStore>();
builder.Services.AddScoped<RecipeService>();

var app = builder.Build();
app.UseCors("FrontendDevClient");

if (string.Equals(persistenceMode, "Sqlite", StringComparison.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var initializer = scope.ServiceProvider.GetRequiredService<RecipeDbInitializer>();
    await initializer.InitializeAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    persistenceMode = builder.Configuration["Persistence:Mode"] ?? "Memory"
}));

app.MapGet("/api/recipes", (
    string? search,
    string? category,
    RecipeService recipeService) =>
{
    var recipes = recipeService.GetPublishedRecipes(search, category);
    return Results.Ok(recipes);
});

app.MapGet("/api/recipes/{slug}", (string slug, RecipeService recipeService) =>
{
    var recipe = recipeService.GetPublishedRecipeBySlug(slug);
    return recipe is null ? Results.NotFound() : Results.Ok(recipe);
});

app.MapGet("/api/auth/me", (HttpContext httpContext, AdminSessionStore sessionStore) =>
{
    var session = sessionStore.GetSession(httpContext.Request.Cookies[AdminAuthConstants.SessionCookieName]);
    return session is null ? Results.Unauthorized() : Results.Ok(new AdminSessionResponse(session.Username));
});

app.MapPost("/api/auth/login", (
    LoginAdminRequest request,
    HttpContext httpContext,
    IOptions<AdminAuthOptions> authOptions,
    AdminPasswordHasher passwordHasher,
    AdminSessionStore sessionStore) =>
{
    var configuredUsername = authOptions.Value.Username;

    if (!string.Equals(request.Username, configuredUsername, StringComparison.Ordinal) ||
        !passwordHasher.Verify(
            request.Password,
            authOptions.Value.PasswordHash,
            authOptions.Value.Password))
    {
        return Results.Unauthorized();
    }

    var session = sessionStore.CreateSession(configuredUsername!);
    httpContext.Response.Cookies.Append(
        AdminAuthConstants.SessionCookieName,
        session.Id,
        new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Secure = httpContext.Request.IsHttps,
            IsEssential = true,
            Expires = session.ExpiresAtUtc
        });

    return Results.Ok(new AdminSessionResponse(session.Username));
});

app.MapPost("/api/auth/logout", (HttpContext httpContext, AdminSessionStore sessionStore) =>
{
    var sessionId = httpContext.Request.Cookies[AdminAuthConstants.SessionCookieName];
    sessionStore.RemoveSession(sessionId);
    httpContext.Response.Cookies.Delete(AdminAuthConstants.SessionCookieName);
    return Results.NoContent();
});

app.MapGet("/api/admin/recipes", (
    string? search,
    string? category,
    RecipeService recipeService) =>
{
    var recipes = recipeService.GetAllRecipes(search, category);
    return Results.Ok(recipes);
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.MapGet("/api/admin/recipes/{slug}", (string slug, RecipeService recipeService) =>
{
    var recipe = recipeService.GetRecipeBySlug(slug);
    return recipe is null ? Results.NotFound() : Results.Ok(recipe);
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.MapPost("/api/admin/recipes", (CreateRecipeRequest request, RecipeService recipeService) =>
{
    var validationErrors = RecipeRequestValidator.Validate(request);
    if (validationErrors.Count > 0)
    {
        return Results.ValidationProblem(validationErrors);
    }

    try
    {
        var createdRecipe = recipeService.CreateRecipe(request);
        return Results.Created($"/api/admin/recipes/{createdRecipe.Slug}", createdRecipe);
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (InvalidOperationException exception)
    {
        return Results.Conflict(new { message = exception.Message });
    }
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.MapPut("/api/admin/recipes/{slug}", (string slug, UpdateRecipeRequest request, RecipeService recipeService) =>
{
    var validationErrors = RecipeRequestValidator.Validate(request);
    if (validationErrors.Count > 0)
    {
        return Results.ValidationProblem(validationErrors);
    }

    try
    {
        var updatedRecipe = recipeService.UpdateRecipe(slug, request);
        return updatedRecipe is null ? Results.NotFound() : Results.Ok(updatedRecipe);
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (InvalidOperationException exception)
    {
        return Results.Conflict(new { message = exception.Message });
    }
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.MapDelete("/api/admin/recipes/{slug}", (string slug, RecipeService recipeService) =>
{
    var deleted = recipeService.DeleteRecipe(slug);
    return deleted ? Results.NoContent() : Results.NotFound();
}).AddEndpointFilter<AdminApiKeyEndpointFilter>();

app.Run();

public partial class Program;
