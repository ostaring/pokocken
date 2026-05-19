using System.Threading.RateLimiting;
using RecipeApp.Api.Controllers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using RecipeApp.Api.Data;
using RecipeApp.Api.Infrastructure;
using RecipeApp.Api.Repositories;
using RecipeApp.Api.Services;

if (args is ["hash-admin-password", var password])
{
    Console.WriteLine(AdminPasswordHasher.HashPassword(password));
    return;
}

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
if (allowedOrigins.Any(origin => string.IsNullOrWhiteSpace(origin) || origin == "*"))
{
    throw new InvalidOperationException("Cors:AllowedOrigins must contain explicit origins only.");
}

var adminApiPermitLimit = builder.Configuration.GetValue("Security:RateLimiting:AdminApiPermitLimit", 120);
var databaseConnectionString = builder.Configuration.GetConnectionString("RecipesDb");
if (string.IsNullOrWhiteSpace(databaseConnectionString))
{
    throw new InvalidOperationException("ConnectionStrings:RecipesDb must be configured.");
}

builder.Services.Configure<AdminAuthOptions>(builder.Configuration.GetSection("Admin"));
builder.Services.Configure<SecurityRateLimitOptions>(builder.Configuration.GetSection("Security:RateLimiting"));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<AdminPasswordHasher>();
builder.Services.AddSingleton<AdminLoginRateLimiter>();
builder.Services.AddScoped<AdminAuthorizationFilter>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(SecurityPolicyNames.AdminApiRateLimit, context =>
    {
        var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = adminApiPermitLimit,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
});
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

builder.Services.AddDbContext<RecipeDbContext>(options =>
{
    options.UseNpgsql(databaseConnectionString);
});
builder.Services.AddScoped<IRecipeRepository, EfRecipeRepository>();
builder.Services.AddScoped<IGalleryRepository, EfGalleryRepository>();
builder.Services.AddScoped<RecipeDbInitializer>();
builder.Services.AddSingleton<AdminSessionStore>();
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<IGalleryService, GalleryService>();

var app = builder.Build();
app.UseRouting();
app.UseCors("FrontendDevClient");
app.UseRateLimiter();
app.Logger.LogInformation(
    "Starting RecipeApp API in {Environment} with PostgreSQL persistence",
    app.Environment.EnvironmentName);

using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<RecipeDbInitializer>();
    try
    {
        await initializer.InitializeAsync();
    }
    catch (Exception exception)
    {
        app.Logger.LogError(exception, "Database initialization failed");
        throw;
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapControllers();

app.Run();

public partial class Program;
