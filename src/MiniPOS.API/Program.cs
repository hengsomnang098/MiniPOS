using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MiniPOS.Application.Interfaces;
using MiniPOS.Application.Repositories;
using MiniPOS.Data;
using MiniPOS.Data.Seed;
using MiniPOS.MappingProfiles;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();


// Connection String
var connectionString = builder.Configuration.GetConnectionString("HotelListingDbConnectionString");
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));

// Identity Configuration
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();
// builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
//         .AddEntityFrameworkStores<ApplicationDbContext>();

// JWT Settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]))
    };
});


// Authentication Configuration
builder.Services.AddAuthorization(options =>
{
    // set condtion only users with "Permission: Users.View" claim can access
    options.AddPolicy("CanViewUsers", policy =>
    policy.RequireClaim("Permission", "Users.View"));
});


// Auto Mapper Configuration
builder.Services.AddAutoMapper((cfg) =>
    {
        cfg.AddProfile<MappingProfiles>();
    });

// dependecy Injection Configuration
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IStoreRepository, StoreRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddControllers()
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler =
    System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles; 
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



try
{
    var app = builder.Build();

    // Map Identity API Endpoints
    // app.MapIdentityApi<ApplicationUser>();
    
    
    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    app.UseAuthentication();
    app.UseAuthorization();

    // Initialize Database & Seed Data
    await DatabaseInitializer.InitializeAsync(app.Services);

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"An error occurred: {ex.Message}");
    throw;
}


