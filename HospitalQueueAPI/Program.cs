using System.Data;
using System.Text;
using HospitalQueueAPI.Data;
using HospitalQueueAPI.Interfaces;
using HospitalQueueAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using HospitalQueueAPI.Hubs;

var builder = WebApplication.CreateBuilder(args);


// =======================================================
// DATABASE
// =======================================================

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(
            builder.Configuration.GetConnectionString("DefaultConnection")
        )
    );
});


// =======================================================
// CONTROLLERS
// =======================================================

builder.Services.AddControllers();


// =======================================================
// CORS
// =======================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// =======================================================
// SIGNALR
// =======================================================

builder.Services.AddSignalR();


// =======================================================
// JWT AUTHENTICATION
// =======================================================

var jwtKey = builder.Configuration["Jwt:Key"];

builder.Services
.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;

    options.SaveToken = true;

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/queueHub"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };

    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey!)
                ),

            ValidateIssuer = true,

            ValidateAudience = true,

            ValidateLifetime = true,

            ValidIssuer =
                builder.Configuration["Jwt:Issuer"],

            ValidAudience =
                builder.Configuration["Jwt:Audience"],

            ClockSkew = TimeSpan.Zero
        };
});

builder.Services.AddAuthorization();


// =======================================================
// DEPENDENCY INJECTION
// =======================================================

builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IQueueService, QueueService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddHttpClient<IOllamaService, OllamaService>();


// Register these after we create them
// builder.Services.AddScoped<IAuthService, AuthService>();
// builder.Services.AddScoped<IAppointmentService, AppointmentService>();
// builder.Services.AddScoped<IQueueService, QueueService>();
// builder.Services.AddScoped<OllamaService>();


// =======================================================
// SWAGGER
// =======================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "AI Hospital Queue API",
            Version = "v1",
            Description = "Backend API for AI Hospital Queue Management System"
        });

    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter JWT Token"
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});

// =======================================================
// BUILD APP
// =======================================================

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    var connection = dbContext.Database.GetDbConnection();
    if (connection.State != ConnectionState.Open)
        await connection.OpenAsync();

    var columns = new List<string>();

    using (var command = connection.CreateCommand())
    {
        command.CommandText = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'patients';";

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            columns.Add(reader.GetString(0));
        }
    }

    if (!columns.Contains("age", StringComparer.OrdinalIgnoreCase))
    {
        using var command = connection.CreateCommand();
        command.CommandText = "ALTER TABLE patients ADD COLUMN age INT NULL;";
        await command.ExecuteNonQueryAsync();
    }

    if (!columns.Contains("occupation", StringComparer.OrdinalIgnoreCase))
    {
        using var command = connection.CreateCommand();
        command.CommandText = "ALTER TABLE patients ADD COLUMN occupation VARCHAR(100) NULL;";
        await command.ExecuteNonQueryAsync();
    }
}

// =======================================================
// MIDDLEWARE
// =======================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("ReactPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapHub<QueueHub>("/queueHub");

// SignalR Hub (we'll create QueueHub later)
// app.MapHub<QueueHub>("/queueHub");

app.Run();