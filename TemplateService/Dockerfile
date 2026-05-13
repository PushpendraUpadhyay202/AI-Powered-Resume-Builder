FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["TemplateService.csproj", "./"]
RUN dotnet restore "TemplateService.csproj"
COPY . .
RUN dotnet build "TemplateService.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "TemplateService.csproj" -c Release -o /app/publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TemplateService.dll"]
