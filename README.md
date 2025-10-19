# 🏪 MiniPOS - Point of Sale System

A modern, scalable Point of Sale (POS) system built with **ASP.NET Core 9.0** following Clean Architecture principles. This project demonstrates enterprise-level development practices with JWT authentication, Entity Framework Core, PostgreSQL, and comprehensive logging with Serilog.

[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/download/dotnet/9.0)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Entity Framework](https://img.shields.io/badge/Entity%20Framework-9.0-green.svg)](https://docs.microsoft.com/en-us/ef/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🏗️ Project Architecture

This project implements **Clean Architecture** with clear separation of concerns across multiple layers:

- **MiniPOS.API** - Presentation Layer (Controllers, API endpoints)
- **MiniPOS.API.Application** - Application Layer (Business logic, DTOs, Services)
- **MiniPOS.API.Domain** - Domain Layer (Entities, Database context)
- **MiniPOS.API.Common** - Cross-cutting concerns (Constants, Results, Utilities)

## 📁 Project Structure

```
MiniPOS/
├── docker-compose.yml                  # PostgreSQL containerization
├── MiniPOS.sln                        # Solution file
├── README.md                          # Project documentation
├── .gitignore                         # Git ignore rules
└── src/
    ├── MiniPOS.API/                   # 🎯 Presentation Layer
    │   ├── Program.cs                 # Application entry point & DI setup
    │   ├── MiniPOS.API.csproj         # Project dependencies
    │   ├── appsettings.json           # Production configuration
    │   ├── appsettings.Development.json # Development settings
    │   │
    │   ├── Controllers/               # REST API Controllers
    │   │   ├── BaseApiController.cs   # Base controller with common functionality
    │   │   ├── AuthController.cs      # Authentication endpoints
    │   │   ├── AdminUsersController.cs # User management
    │   │   ├── CategoryController.cs  # Category CRUD operations
    │   │   └── StoreController.cs     # Store management
    │   │
    │   ├── MappingProfiles/           # AutoMapper configurations
    │   │   └── MappingProfiles.cs     # Entity ↔ DTO mappings
    │   │
    │   ├── Properties/                # Launch settings
    │   │   └── launchSettings.json    # Development profiles
    │   │
    │   └── logs/                      # Serilog output directory
    │
    ├── MiniPOS.API.Application/       # 💼 Application Layer
    │   ├── MiniPOS.API.Application.csproj
    │   │
    │   ├── Contracts/                 # Repository interfaces
    │   │   ├── IAuthRepository.cs     # Authentication contract
    │   │   ├── ICategoryRepository.cs # Category operations
    │   │   ├── IStoreRepository.cs    # Store management
    │   │   └── IUserRepository.cs     # User operations
    │   │
    │   ├── Services/                  # Repository implementations
    │   │   ├── AuthRepository.cs      # JWT authentication logic
    │   │   ├── CategoryRepository.cs  # Category business logic
    │   │   ├── StoreRepository.cs     # Store operations
    │   │   └── UserRepository.cs      # User management logic
    │   │
    │   └── DTOs/                      # Data Transfer Objects
    │       ├── Auth/                  # Authentication DTOs
    │       │   ├── AuthResponseDto.cs # Login response
    │       │   ├── LoginUserDto.cs    # Login request
    │       │   └── UserInfoDto.cs     # User info response
    │       ├── Category/              # Category DTOs
    │       │   ├── CreateCategoryDto.cs
    │       │   ├── GetCategoryDto.cs
    │       │   └── UpdateCategoryDto.cs
    │       ├── Store/                 # Store DTOs
    │       │   ├── CreateStoreDto.cs
    │       │   ├── GetStoreDto.cs
    │       │   └── UpdateStoreDto.cs
    │       └── User/                  # User DTOs
    │           ├── CreateUserDto.cs
    │           ├── GetUserDto.cs
    │           └── UpdateUserDto.cs
    │
    ├── MiniPOS.API.Domain/            # 🗄️ Domain Layer
    │   ├── MiniPOS.API.Domain.csproj
    │   ├── ApplicationDbContext.cs    # EF Core database context
    │   ├── BaseEntity.cs              # Base entity with common properties
    │   ├── DatabaseInitializer.cs     # Database setup & seeding
    │   ├── IdentitySeeder.cs          # Default user/role seeding
    │   │
    │   ├── Entities/                  # Domain entities
    │   │   ├── ApplicationUser.cs     # Extended IdentityUser
    │   │   ├── ApplicationRole.cs     # Extended IdentityRole
    │   │   ├── Category.cs            # Product categories
    │   │   ├── Store.cs               # Store management
    │   │   ├── Permission.cs          # System permissions
    │   │   └── RolePermission.cs      # Role-Permission mapping
    │   │
    │   └── Migrations/                # EF Core migrations
    │       ├── 20251019083325_InitialCreate.cs
    │       ├── 20251019083325_InitialCreate.Designer.cs
    │       └── ApplicationDbContextModelSnapshot.cs
    │
    └── MiniPOS.API.Common/            # 🔧 Common Layer
        ├── MiniPOS.API.Common.csproj
        │
        ├── Constants/                 # Application constants
        │   ├── ErrorCodes.cs          # Standardized error codes
        │   └── RateLimitingConstants.cs # Rate limiting settings
        │
        └── Results/                   # Custom result patterns
            └── Results.cs             # Result<T> pattern implementation
```

## 🚀 Features

### 🔐 Security & Authentication
- **JWT Bearer Authentication** with refresh tokens
- **Role-based Authorization** with granular permissions
- **ASP.NET Core Identity** integration
- **Password complexity requirements**
- **Rate limiting** for API protection

### 💾 Data Management
- **PostgreSQL** database with Entity Framework Core
- **Repository pattern** for data access
- **Database migrations** for schema versioning
- **Automatic seeding** of default data

### 🔧 Development Features
- **Clean Architecture** with clear separation of concerns
- **AutoMapper** for object mapping
- **Serilog** for structured logging
- **Swagger/OpenAPI** documentation
- **Docker Compose** for local development
- **Hot reload** development experience

### 📊 Business Features
- **Multi-store management**
- **Category organization**
- **User management with roles**
- **Comprehensive audit logging**

## 🛠️ Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | ASP.NET Core | 9.0 |
| **Database** | PostgreSQL | 15+ |
| **ORM** | Entity Framework Core | 9.0 |
| **Authentication** | JWT Bearer | - |
| **Mapping** | AutoMapper | 12.0.1 |
| **Logging** | Serilog | 9.0.0 |
| **API Documentation** | Swagger/OpenAPI | 9.0.6 |
| **Containerization** | Docker Compose | - |

### 📦 Key Dependencies

```xml
<PackageReference Include="AutoMapper" Version="12.0.1" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.10" />
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="9.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.10" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />
<PackageReference Include="Serilog.AspNetCore" Version="9.0.0" />
<PackageReference Include="Serilog.Sinks.Console" Version="6.0.0" />
<PackageReference Include="Serilog.Sinks.File" Version="7.0.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="9.0.6" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.14.0" />
```

## 📋 Prerequisites

Before creating this project, ensure you have:

- **[.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)** - Latest version
- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** - For PostgreSQL
- **[Git](https://git-scm.com/)** - Version control
- **[Visual Studio Code](https://code.visualstudio.com/)** or **[Visual Studio 2022](https://visualstudio.microsoft.com/)**
- **[C# Extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)** (for VS Code)

## 🎯 How to Create This Project from Scratch

Follow this step-by-step guide to recreate the MiniPOS project:

### 1️⃣ Project Initialization

```bash
# Create solution and project structure
mkdir MiniPOS && cd MiniPOS
dotnet new sln -n MiniPOS

# Create the main projects
mkdir src && cd src

# Create API project (Web API)
dotnet new webapi -n MiniPOS.API -f net9.0
dotnet sln ../MiniPOS.sln add MiniPOS.API/MiniPOS.API.csproj

# Create class library projects
dotnet new classlib -n MiniPOS.API.Domain -f net9.0
dotnet new classlib -n MiniPOS.API.Application -f net9.0
dotnet new classlib -n MiniPOS.API.Common -f net9.0

# Add projects to solution
dotnet sln ../MiniPOS.sln add MiniPOS.API.Domain/MiniPOS.API.Domain.csproj
dotnet sln ../MiniPOS.sln add MiniPOS.API.Application/MiniPOS.API.Application.csproj
dotnet sln ../MiniPOS.sln add MiniPOS.API.Common/MiniPOS.API.Common.csproj

# Set up project references
cd MiniPOS.API
dotnet add reference ../MiniPOS.API.Domain/MiniPOS.API.Domain.csproj
dotnet add reference ../MiniPOS.API.Application/MiniPOS.API.Application.csproj
dotnet add reference ../MiniPOS.API.Common/MiniPOS.API.Common.csproj

cd ../MiniPOS.API.Application
dotnet add reference ../MiniPOS.API.Domain/MiniPOS.API.Domain.csproj
dotnet add reference ../MiniPOS.API.Common/MiniPOS.API.Common.csproj

cd ../MiniPOS.API.Domain
dotnet add reference ../MiniPOS.API.Common/MiniPOS.API.Common.csproj
```

### 2️⃣ Install NuGet Packages

```bash
# Navigate to API project
cd ../MiniPOS.API

# Add core packages
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore --version 9.0.10
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 9.0.10
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.10
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 9.0.10
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.4
dotnet add package AutoMapper --version 12.0.1
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection --version 12.0.1
dotnet add package System.IdentityModel.Tokens.Jwt --version 8.14.0
dotnet add package Swashbuckle.AspNetCore --version 9.0.6

# Add Serilog packages
dotnet add package Serilog.AspNetCore --version 9.0.0
dotnet add package Serilog.Sinks.Console --version 6.0.0
dotnet add package Serilog.Sinks.File --version 7.0.0
```

### 3️⃣ Create Domain Entities

Create the following files in `MiniPOS.API.Domain/`:

**BaseEntity.cs**
```csharp
namespace MiniPOS.API.Domain
{
    public class BaseEntity
    {
        public Guid Id { get; set; }
    }
}
```

**ApplicationUser.cs**, **ApplicationRole.cs**, **Category.cs**, **Store.cs**, **Permission.cs**, **RolePermission.cs**

### 4️⃣ Set Up Database Context

Create `ApplicationDbContext.cs` in the Domain project with DbContext configuration.

### 5️⃣ Create DTOs

Set up Data Transfer Objects in `MiniPOS.API.Application/DTOs/` for each entity.

### 6️⃣ Implement Repository Pattern

Create interfaces in `Contracts/` and implementations in `Services/`.

### 7️⃣ Configure Services in Program.cs

Set up dependency injection, authentication, database, AutoMapper, and Serilog.

### 8️⃣ Create Controllers

Implement API controllers for each entity with full CRUD operations.

### 9️⃣ Database Setup

```bash
# Create Docker Compose file for PostgreSQL
# Add connection strings to appsettings.json
# Run migrations
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 🔟 Configure Logging

Set up Serilog in `Program.cs` and configuration files.

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/hengsomnang098/MiniPOS.git
cd MiniPOS
```

### 2. Start Database
```bash
docker-compose up -d
```

### 3. Configure Connection String
Update `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "HotelListingDbConnectionString": "Host=localhost;Port=5432;Database=MiniPOS;Username=postgres;Password=postgrespw"
  }
}
```

### 4. Run Database Migrations
```bash
cd src/MiniPOS.API
dotnet ef database update
```

### 5. Start Application
```bash
dotnet run
# or for hot reload
dotnet watch
```

### 6. Access the Application
- **API**: `https://localhost:5001` or `http://localhost:5000`
- **Swagger UI**: `https://localhost:5001/swagger`

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/Auth/login` - User authentication
- `POST /api/Auth/refresh` - Refresh JWT token

### 👥 User Management
- `GET /api/adminusers` - List all users
- `POST /api/adminusers` - Create new user
- `PUT /api/adminusers/{id}` - Update user
- `DELETE /api/adminusers/{id}` - Delete user

### 📂 Categories
- `GET /api/category` - Get all categories
- `POST /api/category` - Create category
- `PUT /api/category/{id}` - Update category
- `DELETE /api/category/{id}` - Delete category

### 🏪 Stores
- `GET /api/store` - Get all stores
- `POST /api/store` - Create store
- `PUT /api/store/{id}` - Update store
- `DELETE /api/store/{id}` - Delete store

## 🔧 Development

### Hot Reload Development
```bash
cd src/MiniPOS.API
dotnet watch
```

### Database Migrations
```bash
# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Remove last migration (if not applied)
dotnet ef migrations remove
```

### Testing
```bash
dotnet test
```

## 🌐 Configuration

### Environment Variables
- `ASPNETCORE_ENVIRONMENT` - Development/Production
- `ConnectionStrings__HotelListingDbConnectionString` - Database connection

### Serilog Configuration
Configured in `appsettings.json` with console and file sinks:
- **Console**: Formatted for development
- **File**: Daily rolling logs in `logs/` directory

### JWT Configuration
```json
{
  "JwtSettings": {
    "Key": "YourSuperSecretKey123456789012345678901234567890123456789",
    "Issuer": "MiniPOS",
    "Audience": "MiniPOSUsers",
    "DurationInMinutes": 60
  }
}
```

## 🐳 Docker Support

```yaml
services:
  postgres:
    image: postgres:latest
    environment:
      - POSTGRES_PASSWORD=postgrespw
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🧪 Testing & Development Tools

- **Swagger UI** - Interactive API documentation
- **Serilog** - Structured logging with file and console output
- **Hot Reload** - Real-time development updates
- **Entity Framework Tools** - Database management

## 📊 Database Schema

### Core Tables
- **AspNetUsers** - User authentication (Identity)
- **AspNetRoles** - User roles (Identity)
- **Stores** - Store management
- **Categories** - Product categories
- **Permissions** - System permissions
- **RolePermissions** - Role-permission mapping

### Relationships
```
ApplicationUser ──┐
                  ├── ApplicationRole ──── RolePermission ──── Permission
                  │
                  └── Store ──── Category
```

## 🔒 Security Features

- **JWT Authentication** with configurable expiration
- **Role-based authorization** with fine-grained permissions
- **Password complexity** requirements
- **Rate limiting** for API protection
- **CORS** configuration for cross-origin requests
- **Input validation** through DTOs
- **Secure password hashing** via Identity

## 📝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Heng Somnang**
- GitHub: [@hengsomnang098](https://github.com/hengsomnang098)
- Email: hengsomnang098@gmail.com

## 🙏 Acknowledgments

- **ASP.NET Core Team** - For the excellent framework
- **Entity Framework Core** - For powerful ORM capabilities
- **PostgreSQL Community** - For reliable database system
- **Serilog Team** - For structured logging
- **AutoMapper** - For seamless object mapping

---

**Built with ❤️ using ASP.NET Core 9.0**

*This project demonstrates modern .NET development practices with Clean Architecture, comprehensive security, and production-ready logging.*
        │   ├── Store.cs
        │   ├── Permission.cs
        │   ├── RolePermission.cs
        │   └── Seed/               # Database seeding
        │       ├── DatabaseInitializer.cs
        │       └── IdentitySeeder.cs
        │
        ├── DTOs/                   # Data Transfer Objects
        │   ├── Auth/
        │   │   ├── AuthResponseDto.cs
        │   │   ├── LoginUserDto.cs
        │   │   └── UserInfoDto.cs
        │   ├── Category/
        │   │   ├── CreateCategoryDto.cs
        │   │   ├── GetCategoryDto.cs
        │   │   └── UpdateCategoryDto.cs
        │   ├── Store/
        │   │   ├── CreateStoreDto.cs
        │   │   ├── GetStoreDto.cs
        │   │   └── UpdateStoreDto.cs
        │   └── User/
        │       ├── CreateUserDto.cs
        │       ├── GetUserDto.cs
        │       └── UpdateUserDto.cs
        │
        ├── MappingProfiles/        # AutoMapper profiles
        │   └── MappingProfiles.cs
        │
        ├── Constants/              # Application constants
        │   └── ErrorCodes.cs
        │
        ├── Results/                # Custom result types
        │   └── Results.cs
        │
        └── Migrations/             # Entity Framework migrations
            ├── 20251019072715_IdentityInit.cs
            ├── 20251019072715_IdentityInit.Designer.cs
            └── ApplicationDbContextModelSnapshot.cs

## 🚀 Features

### Core Functionality

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user lifecycle management with role assignments
- **Store Management**: Multi-store support with comprehensive store operations
- **Category Management**: Product category organization and management
- **Database Integration**: PostgreSQL with Entity Framework Core

### Technical Features

- **Clean Architecture**: Separation of concerns with repository pattern
- **AutoMapper Integration**: Automatic object-to-object mapping
- **Swagger Documentation**: Interactive API documentation
- **Docker Support**: Containerized PostgreSQL database
- **Entity Framework Migrations**: Database versioning and schema management

## Technology Stack

### Backend

- **Framework**: ASP.NET Core 9.0
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core 9.0
- **Authentication**: JWT Bearer tokens
- **Mapping**: AutoMapper 12.0
- **Documentation**: Swagger/OpenAPI

### Dependencies

- Microsoft.AspNetCore.Identity.EntityFrameworkCore
- Microsoft.AspNetCore.Authentication.JwtBearer
- Npgsql.EntityFrameworkCore.PostgreSQL
- AutoMapper.Extensions.Microsoft.DependencyInjection
- Swashbuckle.AspNetCore

## 📋 Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Docker](https://www.docker.com/get-started) (for PostgreSQL)
- [Git](https://git-scm.com/)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/hengsomnang098/MiniPOS.git
cd MiniPOS
```

### 2. Start PostgreSQL Database

```bash
docker-compose up -d
```

### 3. Update Database Connection

Update the connection string in `appsettings.json` if needed:

```json
{
  "ConnectionStrings": {
    "HotelListingDbConnectionString": "Host=localhost;Database=MiniPOSDb;Username=postgres;Password=postgrespw"
  }
}
```

### 4. Navigate to Project Directory

```bash
cd src/MiniPOS.API
```

### 5. Restore Dependencies

```bash
dotnet restore
```

### 6. Run Database Migrations

```bash
dotnet ef database update
```

### 7. Run the Application

```bash
dotnet run
```

### 8. Access the Application

- **API**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/swagger`

## 🔧 Development

### Running in Development Mode

```bash
cd src/MiniPOS.API
dotnet run --environment Development
```

### Adding New Migrations

```bash
cd src/MiniPOS.API
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Building the Project

```bash
dotnet build
```

### Running Tests

```bash
dotnet test
```

### Hot Reload Development

```bash
cd src/MiniPOS.API
dotnet watch
```

## 📡 API Endpoints

### Authentication

- `POST /api/Auth/login` - User login
- `POST /api/Auth/refresh` - Refresh Token

### Users

- `GET /api/adminusers` - Get all users
- `POST /api/adminusers` - Create user
- `PUT /api/adminusers/{id}` - Update user
- `DELETE /api/adminusers/{id}` - Delete user

### Categories

- `GET /api/category` - Get all categories
- `POST /api/category` - Create category
- `PUT /api/category/{id}` - Update category
- `DELETE /api/category/{id}` - Delete category

### Stores

- `GET /api/store` - Get all stores
- `POST /api/store` - Create store
- `PUT /api/store/{id}` - Update store
- `DELETE /api/store/{id}` - Delete store

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Fine-grained access control
- **Password Requirements**: Enforced password complexity
- **CORS Configuration**: Cross-origin request handling

## 🌐 Configuration

### Environment Variables

- `ASPNETCORE_ENVIRONMENT`: Development/Production
- `ConnectionStrings__HotelListingDbConnectionString`: Database connection string

### Key Configuration Files

- `appsettings.json`: Production configuration
- `appsettings.Development.json`: Development-specific settings
- `launchSettings.json`: Launch profiles and environment settings

### Database Configuration

The application uses PostgreSQL as the primary database. The connection string should be configured in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "HotelListingDbConnectionString": "Host=localhost;Database=MiniPOSDb;Username=postgres;Password=postgrespw"
  }
}
```

### Key Settings

- JWT token configuration and secret keys
- Identity password requirements and policies
- CORS policies for cross-origin requests
- Swagger documentation and UI settings
- Database connection and Entity Framework configuration

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � Docker Support

The application includes Docker Compose configuration for easy database setup:

```yaml
services:
  postgres:
    image: postgres:latest
    environment:
      - POSTGRES_PASSWORD=postgrespw
    ports:
      - "5432:5432"
    volumes:
      - /var/lib/postgresql/data
```

## 🧪 Testing

### API Testing Tools

- **Swagger UI**: Interactive API documentation and testing at `/swagger`
- **HTTP Client Files**: Ready-to-use request collections for development
- **Postman Compatible**: Import/export capability for API collections

## Security Features

- **JWT Bearer Authentication**: Secure token-based authentication
- **ASP.NET Core Identity**: Built-in user management system  
- **Role-Based Authorization**: Fine-grained access control
- **Password Security**: Enforced complexity requirements
- **Input Validation**: DTO-based request validation
- **CORS Configuration**: Cross-origin request handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Heng Somnang** - [hengsomnang098](https://github.com/hengsomnang098)

## 🙏 Acknowledgments

- ASP.NET Core team for the excellent framework
- Entity Framework Core for robust data access
- PostgreSQL community for the reliable database system
- AutoMapper for seamless object mapping

---

Built with ❤️ using ASP.NET Core 9.0

## 🛠️ Technology Stack

### Backend Framework

- **ASP.NET Core 9.0** - Modern web framework
- **Entity Framework Core 9.0** - ORM for data access
- **PostgreSQL** - Robust relational database
- **AutoMapper 12.0** - Object-to-object mapping

### Authentication & Security

- **ASP.NET Core Identity** - User management system
- **JWT Bearer Tokens** - Secure authentication
- **Role-based Authorization** - Fine-grained access control

### Development Tools

- **Swagger/OpenAPI** - API documentation
- **Docker Compose** - Database containerization
- **Entity Framework Migrations** - Database versioning

### Key Dependencies

```xml
<PackageReference Include="AutoMapper" Version="12.0.1" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.10" />
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="9.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.10" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.10" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="9.0.6" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.14.0" />
```

## 🏛️ Database Schema

### Core Entities

- **ApplicationUser** - Extended IdentityUser with custom properties
- **ApplicationRole** - Custom roles for system authorization  
- **Category** - Product category management with hierarchical support
- **Store** - Multi-location store management
- **Permission** - Granular system permissions
- **RolePermission** - Many-to-many relationship for role-based access

### Entity Relationships

ApplicationUser ──┐
                  ├── ApplicationRole ──── RolePermission ──── Permission
                  │
                  └── Store ──── Category

## 🧪 Testing & Development

### API Testing

- **HTTP Client Files** - Ready-to-use API request collections
- **Swagger UI** - Interactive API documentation and testing interface
- **Postman Compatible** - Import/export API collections

### Development Workflow

- **Hot Reload** - `dotnet watch` for rapid development
- **Migration Support** - Automatic database schema updates  
- **Seed Data** - Pre-configured test data for development

## 🐳 Docker Configuration

### PostgreSQL Container

```yaml
services:
  postgres:
    image: postgres:latest
    environment:
      - POSTGRES_PASSWORD=postgrespw
    ports:
      - "5432:5432"
    volumes:
      - /var/lib/postgresql/data
```

### Development Setup

1. Start database: `docker-compose up -d`
2. Verify connection: Check PostgreSQL is running on `localhost:5432`
3. Run migrations: `dotnet ef database update`

## � Security Implementation

### Authentication Flow

1. **User Login** → JWT Token Generation
2. **Token Validation** → Request Authorization  
3. **Role Verification** → Endpoint Access Control

### Security_Features

- **Password Hashing** - BCrypt with salt
- **Token Expiration** - Configurable JWT lifetime
- **Role Hierarchy** - Admin, Manager, User roles
- **CORS Configuration** - Cross-origin request handling
- **Input Validation** - DTO-based request validation

## 📈 Performance & Scalability

### Database Optimization

- **Entity Framework** - Optimized queries with navigation properties
- **Connection Pooling** - Efficient database connection management  
- **Indexing Strategy** - Primary and foreign key optimization

### API Performance

- **AutoMapper** - Efficient object mapping
- **Async/Await** - Non-blocking I/O operations
- **Response Caching** - Configurable caching policies
