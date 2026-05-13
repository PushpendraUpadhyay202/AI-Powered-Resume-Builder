FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["PaymentService.csproj", "./"]
RUN dotnet restore "PaymentService.csproj"
COPY . .
RUN dotnet build "PaymentService.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "PaymentService.csproj" -c Release -o /app/publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "PaymentService.dll"]
