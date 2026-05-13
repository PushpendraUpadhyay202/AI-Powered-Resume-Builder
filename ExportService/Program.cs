using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;
using System.Text;
using ExportService.Services;

var builder = WebApplication.CreateBuilder(args);

// QuestPDF License
QuestPDF.Settings.License = LicenseType.Community;

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});



// Register HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "default_super_secret_key_needs_to_be_long_enough_for_hmac_sha256";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ResumeAI",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ResumeAI",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Configure HttpClients
var servicesConfig = builder.Configuration.GetSection("Services");
builder.Services.AddHttpClient("ResumeService", client =>
{
    client.BaseAddress = new Uri(servicesConfig["ResumeService"] ?? "http://localhost:5002");
});
builder.Services.AddHttpClient("TemplateService", client =>
{
    client.BaseAddress = new Uri(servicesConfig["TemplateService"] ?? "http://localhost:5285");
});
builder.Services.AddHttpClient("SectionService", client =>
{
    client.BaseAddress = new Uri(servicesConfig["SectionService"] ?? "http://localhost:5226");
});
builder.Services.AddHttpClient("AuthService", client =>
{
    client.BaseAddress = new Uri(servicesConfig["AuthService"] ?? "http://localhost:5259");
});

// Register Custom Services
builder.Services.AddScoped<IExportService, ExportService.Services.ExportServiceImplementation>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();



app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");
