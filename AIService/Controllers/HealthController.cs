using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace AIService.Controllers
{
    [ApiController]
    [Route("api/health")]
    public class HealthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public HealthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var apiKey = _configuration["Groq:ApiKey"] ?? _configuration["GROQ_API_KEY"];
            bool isKeyPresent = !string.IsNullOrEmpty(apiKey);
            
            return Ok(new { 
                Status = "Healthy", 
                AiProvider = "Groq",
                ApiKeyPresent = isKeyPresent,
                ApiKeyLength = isKeyPresent ? apiKey.Length : 0
            });
        }
    }
}
