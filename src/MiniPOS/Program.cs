using System.Text;

using Microsoft.EntityFrameworkCore;

using MiniPOS.Application.Interfaces;
using MiniPOS.Application.Repositories;
using MiniPOS.Data;
using MiniPOS.MappingProfiles;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

var connectionString = builder.Configuration.GetConnectionString("HotelListingDbConnectionString");
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));


// Auto Mapper Configuration
   builder.Services.AddAutoMapper((cfg) =>
    {
        cfg.AddProfile<MappingProfiles>();
    });

// dependecy Injection Configuration
builder.Services.AddScoped<IStoreRepository, StoreRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();



builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



try
{
    var app = builder.Build();
    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"An error occurred: {ex.Message}");
    throw;
}


