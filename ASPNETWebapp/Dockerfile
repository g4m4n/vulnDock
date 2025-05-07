# Establecer la imagen base (usando el SDK de .NET para compilar la app)
FROM mcr.microsoft.com/dotnet/aspnet:8.0-nanoserver-1809 AS base
WORKDIR /app
EXPOSE 5353

# Imagen de construcción (compilaremos la app aquí)
FROM mcr.microsoft.com/dotnet/sdk:8.0-preview-nanoserver-ltsc2022 AS build
WORKDIR /src
COPY ["ASPNETWebapp.csproj", "./"]
RUN dotnet restore "ASPNETWebapp.csproj"
COPY . .
WORKDIR "/src/"
RUN dotnet build "ASPNETWebapp.csproj" -c Release -o /app/build

# Publicar la aplicación
FROM build AS publish
RUN dotnet publish "ASPNETWebapp.csproj" -c Release -o /app/publish

# Imagen final de la app (usando runtime de .NET)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ASPNETWebapp.dll"]
