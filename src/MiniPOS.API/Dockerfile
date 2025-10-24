FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY MiniPOS.sln ./
COPY src/MiniPOS.API/MiniPOS.API.csproj ./src/MiniPOS.API/
COPY src/MiniPOS.API.Application/MiniPOS.API.Application.csproj ./src/MiniPOS.API.Application/
COPY src/MiniPOS.API.Common/MiniPOS.API.Common.csproj ./src/MiniPOS.API.Common/
COPY src/MiniPOS.API.Domain/MiniPOS.API.Domain.csproj ./src/MiniPOS.API.Domain/

RUN dotnet restore ./src/MiniPOS.API/MiniPOS.API.csproj

COPY . .

RUN dotnet publish ./src/MiniPOS.API/MiniPOS.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 80
COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "MiniPOS.API.dll"]

# COPY ["src/MiniPOS.API/MiniPOS.API.csproj", "MiniPOS.API/"]
# COPY ["src/MiniPOS.API.Application/MiniPOS.API.Application.csproj", "MiniPOS.API.Application/"]
# COPY ["src/MiniPOS.API.Common/MiniPOS.API.Common.csproj", "MiniPOS.API.Common/"]
# COPY ["src/MiniPOS.API.Domain/MiniPOS.API.Domain.csproj", "MiniPOS.API.Domain/"]

