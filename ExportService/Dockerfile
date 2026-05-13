FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ExportService.csproj", "./"]
RUN dotnet restore "ExportService.csproj"
COPY . .
RUN dotnet build "ExportService.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "ExportService.csproj" -c Release -o /app/publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
# Install font libraries and standard fonts
RUN apt-get update && apt-get install -y libfontconfig1 fonts-liberation && rm -rf /var/lib/apt/lists/*
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "ExportService.dll"]
