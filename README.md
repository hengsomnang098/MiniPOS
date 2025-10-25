# MiniPOS

MiniPOS is a small ASP.NET Core Web API for a minimal point-of-sale system. It uses:

- .NET 9 (net9.0)
- Entity Framework Core with Npgsql (PostgreSQL)
- ASP.NET Core Identity for authentication/authorization
- Serilog for logging
- Swagger (Swashbuckle) for API documentation

This README explains how to set up the project from scratch on macOS (or Linux/Windows with analogous steps), run it with Docker for the database, apply EF migrations, and start the application.

## Folder structure

Below is a concise tree of the repository and a short description of the important files and folders. Paths are relative to the repository root.

```text
.
├── docker-compose.yml                # Postgres service for local dev
├── MiniPOS.sln                      # Visual Studio solution
└── src
    ├── MiniPOS.API                  # Web API project
    │   ├── Program.cs               # Main application entry point and configuration
    │   ├── appsettings.json         # Production configuration settings
    │   ├── appsettings.Development.json # Development configuration settings
    │   ├── MiniPOS.API.csproj       # Project file with dependencies
    │   ├── Authorization/           # Permission handling and authorization
    │   │   ├── HasPermissionAttribute.cs    # Custom permission attribute
    │   │   ├── PermissionAuthorizationHandler.cs # Permission handler logic
    │   │   └── Permissions.cs       # Permission constants and definitions
    │   ├── Configuration/           # DI extension methods and configuration
    │   │   ├── AuthenticationConfiguration.cs # JWT authentication setup
    │   │   ├── AuthorizationConfiguration.cs  # Authorization policies
    │   │   ├── DatabaseConfiguration.cs       # EF Core and DB setup
    │   │   ├── LoggingConfiguration.cs        # Serilog configuration
    │   │   ├── RateLimitingConfiguration.cs   # API rate limiting
    │   │   ├── ServiceConfiguration.cs        # DI service registration
    │   │   └── SwaggerConfiguration.cs        # API documentation setup
    │   ├── Controllers/             # MVC/WebAPI controllers
    │   │   ├── AdminUsersController.cs        # User management endpoints
    │   │   ├── AuthController.cs              # Authentication endpoints
    │   │   ├── BaseApiController.cs           # Base controller with common functionality
    │   │   ├── CategoryController.cs          # Category management
    │   │   └── StoreController.cs             # Store management
    │   ├── Properties/launchSettings.json # Development server settings
    │   └── logs/                    # Serilog file sink output (local)
    ├── MiniPOS.API.Domain           # Domain models & DbContext
    │   ├── ApplicationDbContext.cs  # EF Core DB context
    │   ├── ApplicationUser.cs       # Custom Identity user
    │   ├── ApplicationRole.cs       # Custom Identity role
    │   ├── BaseEntity.cs            # Base class for all entities
    │   ├── Category.cs              # Category entity
    │   ├── Permission.cs            # Permission entity
    │   ├── RolePermission.cs        # Role-Permission mapping
    │   ├── Store.cs                 # Store entity
    │   ├── DatabaseInitializer.cs   # Initial data seeding
    │   ├── IdentitySeeder.cs        # Identity roles and users seeding
    │   └── Migrations/              # EF Core migrations
    ├── MiniPOS.API.Application      # Application layer (services, DTOs, mapping)
    │   ├── Contracts/               # Repository/service interfaces
    │   │   ├── IAuthRepository.cs   # Authentication interface
    │   │   ├── ICategoryRepository.cs # Category operations
    │   │   ├── IStoreRepository.cs  # Store operations
    │   │   └── IUserRepository.cs   # User management
    │   ├── DTOs/                    # Data Transfer Objects
    │   │   ├── Auth/               # Authentication DTOs
    │   │   ├── Category/           # Category DTOs
    │   │   ├── Store/             # Store DTOs
    │   │   └── User/              # User DTOs
    │   ├── MappingProfiles/        # AutoMapper configurations
    │   │   └── MappingProfiles.cs  # Entity-DTO mappings
    │   └── Services/               # Repository implementations
    │       └── AuthRepository.cs   # Authentication service implementation
    └── MiniPOS.API.Common           # Shared helpers, results, constants
        ├── Constants/              # Application-wide constants
        └── Results/               # Standardized API response types
```

## Key Files

- `src/MiniPOS.API/Program.cs` — app startup, swagger, logging, middleware and DB seeding call
- `src/MiniPOS.API/Configuration/DatabaseConfiguration.cs` — registers `ApplicationDbContext` and reads connection string configuration
- `src/MiniPOS.API.Domain/ApplicationDbContext.cs` — EF Core DbContext and fluent model configuration
- `src/MiniPOS.API.Domain/Migrations/` — where EF migrations live if they're committed
- `docker-compose.yml` — brings up a `postgres` service on `5432` by default

## Project Dependencies

The solution uses the following key NuGet packages:

- `AutoMapper` (12.0.1) - Object-to-object mapping
- `AutoMapper.Extensions.Microsoft.DependencyInjection` (12.0.1) - DI integration for AutoMapper
- `Microsoft.AspNetCore.Authentication.JwtBearer` (9.0.10) - JWT authentication
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore` (9.0.10) - Identity framework
- `Microsoft.EntityFrameworkCore.Design` (9.0.10) - EF Core design-time tools
- `Microsoft.EntityFrameworkCore.Tools` (9.0.10) - EF Core CLI tools
- `Npgsql.EntityFrameworkCore.PostgreSQL` (9.0.4) - PostgreSQL provider for EF Core
- `Serilog.AspNetCore` (9.0.0) - Structured logging
- `Serilog.Sinks.Console` (6.0.0) - Console logging
- `Swashbuckle.AspNetCore` (6.5.0) - Swagger/OpenAPI documentation

## Recommended Improvements
`
- Add `src/MiniPOS.API/Dockerfile` and extend `docker-compose.yml` for full containerization
- Add a `.gitignore` to exclude `bin/`, `obj/`, user secrets, and local logs
- Commit EF Core migrations for easier deployment and development
- Add a `tests/` project (example: `MiniPOS.Tests`) with unit tests
- Add helper scripts (`scripts/dev-up.sh`) or a `Makefile` for common tasks


## Prerequisites

- .NET 9 SDK installed (required to build & run the projects)
  - macOS: install via `brew install --cask dotnet` or from <https://dotnet.microsoft.com>
- Docker & Docker Compose (for running PostgreSQL locally): <https://docs.docker.com/get-docker/>
- dotnet-ef tool (to run migrations):

```bash
dotnet tool install --global dotnet-ef --version 9.*
```

If already installed, update with:

```bash
dotnet tool update --global dotnet-ef --version 9.*
```

## Creating the Project from Scratch

1. Create the solution and projects:

```bash
# Create solution
dotnet new sln -n MiniPOS

# Create projects
dotnet new webapi -n MiniPOS.API -o src/MiniPOS.API
dotnet new classlib -n MiniPOS.API.Domain -o src/MiniPOS.API.Domain
dotnet new classlib -n MiniPOS.API.Application -o src/MiniPOS.API.Application
dotnet new classlib -n MiniPOS.API.Common -o src/MiniPOS.API.Common

# Add projects to solution
dotnet sln add src/MiniPOS.API/MiniPOS.API.csproj
dotnet sln add src/MiniPOS.API.Domain/MiniPOS.API.Domain.csproj
dotnet sln add src/MiniPOS.API.Application/MiniPOS.API.Application.csproj
dotnet sln add src/MiniPOS.API.Common/MiniPOS.API.Common.csproj
```

2. Add project references:

```bash
# API project dependencies
cd src/MiniPOS.API
dotnet add reference ../MiniPOS.API.Domain/MiniPOS.API.Domain.csproj
dotnet add reference ../MiniPOS.API.Application/MiniPOS.API.Application.csproj
dotnet add reference ../MiniPOS.API.Common/MiniPOS.API.Common.csproj

# Application layer dependencies
cd ../MiniPOS.API.Application
dotnet add reference ../MiniPOS.API.Domain/MiniPOS.API.Domain.csproj
dotnet add reference ../MiniPOS.API.Common/MiniPOS.API.Common.csproj
```

3. Install required NuGet packages:

```bash
# Domain project packages
cd ../MiniPOS.API.Domain
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore --version 9.0.10
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.4

# Application project packages
cd ../MiniPOS.API.Application
dotnet add package AutoMapper --version 12.0.1
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection --version 12.0.1

# API project packages
cd ../MiniPOS.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 9.0.10
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.10
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 9.0.10
dotnet add package Serilog.AspNetCore --version 9.0.0
dotnet add package Serilog.Sinks.Console --version 6.0.0
dotnet add package Swashbuckle.AspNetCore --version 6.5.0
```

4. Create the project structure:

```bash
# Create directory structure in API project
cd ../MiniPOS.API
mkdir Authorization Configuration 


# Create directory structure in Application project
cd ../MiniPOS.API.Application
mkdir Contracts DTOs MappingProfiles Services
mkdir DTOs/Auth DTOs/Category DTOs/Store DTOs/User

# Create directory structure in Common project
cd ../MiniPOS.API.Common
mkdir Constants Results
```

5. Set up Docker for PostgreSQL:

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespw
      POSTGRES_DB: MiniPOS
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

6. Initialize the database:

```bash
# Start PostgreSQL
docker-compose up -d

# Create and apply migrations
dotnet ef migrations add InitTable --project src/MiniPOS.API.Domain --startup-project src/MiniPOS.API
dotnet ef database update --project src/MiniPOS.API.Domain --startup-project src/MiniPOS.API
```

## Configuration keys and defaults

- The project reads the connection string from the `ConnectionStrings:HotelListingDbConnectionString` key.
- Example development connection string (already present in `src/MiniPOS.API/appsettings.Development.json`):

  ```text
  Host=localhost;Port=5432;Database=MiniPOS;Username=postgres;Password=postgrespw
  ```

- JWT settings are in `appsettings.Development.json` under `JwtSettings` (replace the `Key` with a secure secret for production).

## Steps — Setup from scratch (recommended)

1. Clone the repository

   ```bash
   git clone <repo_url>
   cd MiniPOS
   ```

2. Start PostgreSQL with Docker Compose

   The repository includes a minimal `docker-compose.yml` that starts a Postgres service exposing port 5432. From the repo root run:

   ```bash
   docker compose up -d
   ```

   By default the postgres service uses password `postgrespw` and exposes host port `5432`. It will persist data inside the container by default volume mapping.

3. Verify PostgreSQL is running

   ```bash
   # macOS / Linux
   docker compose ps

   # or use psql if installed locally
   PGPASSWORD=postgrespw psql -h localhost -U postgres -p 5432 -c "\l"
   ```

4. Configure the connection string (if you want to change it)

   - The development connection string is already set in `src/MiniPOS.API/appsettings.Development.json`.
   - For local dev you can keep that value. If you change it, ensure the key `ConnectionStrings:HotelListingDbConnectionString` is updated.

   Optionally, you can set the connection string via environment variables or user secrets for development. Example environment variable (zsh):

   ```bash
   export ConnectionStrings__HotelListingDbConnectionString="Host=localhost;Port=5432;Database=MiniPOS;Username=postgres;Password=postgrespw"
   ```

5. Restore .NET tools and packages

   ```bash
   dotnet restore
   ```

6. Run EF Core migrations (create database schema)

   The project uses EF Core migrations. The `ApplicationDbContext` and domain models are located in `src/MiniPOS.API.Domain` and the API project references those.

   - To add or apply migrations from the API project root, run (from repository root):

     ```bash
     # Apply existing migrations (if migrations are present in the Domain project)
     dotnet ef database update --project src/MiniPOS.API --startup-project src/MiniPOS.API
     ```

     If your migrations live in the Domain project, you can also target that project explicitly. Example:

     ```bash
     dotnet ef migrations add InitialCreate --project src/MiniPOS.API.Domain --startup-project src/MiniPOS.API
     dotnet ef database update --project src/MiniPOS.API.Domain --startup-project src/MiniPOS.API
     ```

   Note: The repository may already contain migrations; check `src/MiniPOS.API.Domain/Migrations`.

7. Seed data

   - The application calls `DatabaseInitializer.InitializeAsync` during startup which runs data seeding (including identity seeding). If migrations have been applied and the application runs, seeding will run automatically.

8. Run the API

   ```bash
   dotnet run --project src/MiniPOS.API
   ```

   The app uses Kestrel and will start; by default it configures HTTPS. When running locally, open Swagger at:

- <https://localhost:5001/swagger/index.html> (if HTTPS default ports are used)

If the port differs, check the console output for the exact listening URLs.

## Using Swagger

- Swagger is configured in `Program.cs`. After starting the API, visit `/swagger` (for example `https://localhost:5001/swagger/index.html`) to explore endpoints and test them.

## Debugging and common troubleshooting

- If EF can't connect to Postgres, confirm Docker is running and `docker compose ps` shows `postgres` service. Also ensure the connection string credentials match the environment.
- If you see a port conflict, check other processes using `lsof -i :5000` or change the app URL via `ASPNETCORE_URLS` environment variable or launch settings in `src/MiniPOS.API/Properties/launchSettings.json`.
- To view logs produced by Serilog file sink, check the `logs` directory under `src/MiniPOS.API`.

## Running with Docker (app + db)

This project includes `docker-compose.yml` only for PostgreSQL. If you want to containerize the API too, add a Dockerfile to `src/MiniPOS.API` and extend the compose file. Example minimal steps:

1. Add `src/MiniPOS.API/Dockerfile` (example):

   ```dockerfile
   FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
   WORKDIR /app
   EXPOSE 80

   FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
   WORKDIR /src
   COPY . .
   RUN dotnet restore "src/MiniPOS.API/MiniPOS.API.csproj"
   RUN dotnet publish "src/MiniPOS.API/MiniPOS.API.csproj" -c Release -o /app/publish

   FROM base AS final
   WORKDIR /app
   COPY --from=build /app/publish .
   ENTRYPOINT ["dotnet", "MiniPOS.API.dll"]
   ```

2. Extend `docker-compose.yml` to build and run the API alongside Postgres.

## Security notes

- The JWT `Key` in `appsettings.Development.json` is for development only. Use a secure secret stored in environment variables or a secrets manager for production.
- Do not commit production secrets to the repository.

## Maintenance & development tips

- Add new migrations from the domain project or the project containing your DbContext. Use `--project` and `--startup-project` flags to point the tools at the right projects.
- Keep NuGet package versions up to date, especially EF Core and Npgsql. The project currently targets EF Core 9 and Npgsql provider for .NET 9.

## Useful commands summary

```bash
# Start Postgres
docker compose up -d

# Stop Postgres
docker compose down

# Restore packages
dotnet restore

# Run the API
dotnet run --project src/MiniPOS.API

# Apply EF Migrations
dotnet ef database update --project src/MiniPOS.API --startup-project src/MiniPOS.API
```

## What I validated

- Target framework: `net9.0` (checked `src/MiniPOS.API/MiniPOS.API.csproj` and `src/MiniPOS.API.Domain/MiniPOS.API.Domain.csproj`).
- Database provider: PostgreSQL via `Npgsql.EntityFrameworkCore.PostgreSQL` and `UseNpgsql()` (checked `DatabaseConfiguration.cs` and project files).
- Connection string key: `ConnectionStrings:HotelListingDbConnectionString` (checked `appsettings.Development.json`).
- `docker-compose.yml` spins up a `postgres` service on port `5432`.

## NuGet packages (by project)

All projects target `net9.0`. Below are the PackageReference entries taken from each project file.

 - `src/MiniPOS.API/MiniPOS.API.csproj`
  - AutoMapper (12.0.1)
  - AutoMapper.Extensions.Microsoft.DependencyInjection (12.0.1)
  - Microsoft.AspNetCore.Authentication.JwtBearer (9.0.10)
  - Microsoft.AspNetCore.Identity.EntityFrameworkCore (9.0.10)
  - Microsoft.EntityFrameworkCore.Design (9.0.10)
  - Microsoft.EntityFrameworkCore.Tools (9.0.10)
  - Npgsql.EntityFrameworkCore.PostgreSQL (9.0.4)
  - Serilog.AspNetCore (9.0.0)
  - Serilog.Sinks.Console (6.0.0)
  - Serilog.Sinks.File (7.0.0)
  - Swashbuckle.AspNetCore (9.0.6)
  - System.IdentityModel.Tokens.Jwt (8.14.0)

 - `src/MiniPOS.API.Application/MiniPOS.API.Application.csproj`
  - AutoMapper (12.0.1)
  - AutoMapper.Extensions.Microsoft.DependencyInjection (12.0.1)
  - Microsoft.AspNetCore.Authentication.JwtBearer (9.0.10)
  - Microsoft.AspNetCore.Identity.EntityFrameworkCore (9.0.10)
  - Microsoft.EntityFrameworkCore.Design (9.0.10)
  - Microsoft.EntityFrameworkCore.Tools (9.0.10)
  - Npgsql.EntityFrameworkCore.PostgreSQL (9.0.4)
  - Swashbuckle.AspNetCore (9.0.6)
  - System.IdentityModel.Tokens.Jwt (8.14.0)

 - `src/MiniPOS.API.Domain/MiniPOS.API.Domain.csproj`
  - Microsoft.AspNetCore.Identity.EntityFrameworkCore (9.0.10)
  - Microsoft.EntityFrameworkCore.Design (9.0.10)
  - Microsoft.EntityFrameworkCore.Tools (9.0.10)
  - Npgsql.EntityFrameworkCore.PostgreSQL (9.0.4)

- `src/MiniPOS.API.Common/MiniPOS.API.Common.csproj`
   - (no external NuGet packages)


