# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["AuthService.csproj", "./"]
RUN dotnet restore "AuthService.csproj"

# Copy the rest of the files and build
COPY . .
RUN dotnet build "AuthService.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "AuthService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port and start
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "AuthService.dll"]
