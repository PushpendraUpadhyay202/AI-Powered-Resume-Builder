FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["ExportService.csproj", "./"]
RUN dotnet restore "ExportService.csproj"
COPY . .
RUN dotnet build "ExportService.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "ExportService.csproj" -c Release -o /app/publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "ExportService.dll"]
