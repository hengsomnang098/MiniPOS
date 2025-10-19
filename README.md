# MiniPOS - Point of Sale System

A modern, feature-rich Point of Sale (POS) system built with ASP.NET Core 9.0, Entity Framework Core, and PostgreSQL. This system provides comprehensive store management, user authentication, and category management capabilities with a clean, RESTful API architecture.

[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/download/dotnet/9.0)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🏗️ Project Architecture

This project follows Clean Architecture principles with a well-organized structure that separates concerns and promotes maintainability. The application is built using the Repository pattern with clear separation between data access, business logic, and API layers.

### 📁 Project Structure

MiniPOS/
├── docker-compose.yml              # Docker configuration for PostgreSQL
├── MiniPOS.sln                     # Solution file
├── README.md                       # Project documentation
└── src/
    └── MiniPOS.API/               # Main API project
        ├── Program.cs              # Application entry point
        ├── MiniPOS.API.csproj      # Project configuration
        ├── appsettings.json        # Configuration settings
        ├── appsettings.Development.json
        │
        ├── Application/            # Business Logic Layer
        │   ├── Interfaces/         # Repository interfaces
        │   │   ├── IAuthRepository.cs
        │   │   ├── ICategoryRepository.cs
        │   │   ├── IStoreRepository.cs
        │   │   └── IUserRepository.cs
        │   └── Repositories/       # Repository implementations
        │       ├── AuthRepository.cs
        │       ├── CategoryRepository.cs
        │       ├── StoreRepository.cs
        │       └── UserRepository.cs
        │
        ├── Controllers/            # API Controllers
        │   ├── BaseApiController.cs
        │   ├── AuthController.cs
        │   ├── AdminUsersController.cs
        │   ├── CategoryController.cs
        │   └── StoreController.cs
        │
        ├── Data/                   # Data Access Layer
        │   ├── ApplicationDbContext.cs
        │   ├── BaseEntity.cs
        │   ├── ApplicationUser.cs
        │   ├── ApplicationRole.cs
        │   ├── Category.cs
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
