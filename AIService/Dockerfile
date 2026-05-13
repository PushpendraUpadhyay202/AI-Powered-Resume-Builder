FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["AIService.csproj", "./"]
RUN dotnet restore "AIService.csproj"
COPY . .
RUN dotnet build "AIService.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "AIService.csproj" -c Release -o /app/publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "AIService.dll"]
