using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AIService.Providers
{
    public class GroqProvider : IAiProvider
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GroqProvider> _logger;
        private readonly string _apiKey;

        public GroqProvider(HttpClient httpClient, IConfiguration configuration, ILogger<GroqProvider> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _apiKey = configuration["Groq:ApiKey"] ?? string.Empty;

            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogWarning("Groq API Key is missing in configuration.");
            }
        }

        public async Task<string> GenerateAsync(string prompt)
        {
            if (string.IsNullOrEmpty(_apiKey))
                throw new InvalidOperationException("Groq API Key is not configured.");

            var requestBody = new
            {
                model = "llama-3.1-8b-instant", // Updated to supported Groq model
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.7
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            request.Content = JsonContent.Create(requestBody);

            try
            {
                var response = await _httpClient.SendAsync(request);
                
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API error: {StatusCode} - {Error}", response.StatusCode, error);
                    throw new Exception($"Groq API failed with status {response.StatusCode}");
                }

                var responseBody = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<GroqResponse>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (result?.Choices != null && result.Choices.Length > 0)
                {
                    return result.Choices[0].Message.Content;
                }

                return string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Groq API");
                throw;
            }
        }

        private class GroqResponse
        {
            public GroqChoice[] Choices { get; set; } = Array.Empty<GroqChoice>();
        }

        private class GroqChoice
        {
            public GroqMessage Message { get; set; } = new GroqMessage();
        }

        private class GroqMessage
        {
            public string Content { get; set; } = string.Empty;
        }
    }
}
