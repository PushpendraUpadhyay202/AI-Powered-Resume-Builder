using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using AIService.Repositories;

namespace AIService.Controllers
{
    [ApiController]
    [Route("api/health")]
    public class HealthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IAiRequestRepository _repository;

        public HealthController(IConfiguration configuration, IAiRequestRepository repository)
        {
            _configuration = configuration;
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var apiKey = _configuration["Groq:ApiKey"] ?? _configuration["GROQ_API_KEY"];
            bool isKeyPresent = !string.IsNullOrEmpty(apiKey);
            
            var lastRequests = await _repository.FindByUserIdAsync(0); // Dummy call to test DB
            
            return Ok(new { 
                Status = "Healthy", 
                AiProvider = "Groq",
                ApiKeyPresent = isKeyPresent,
                ApiKeyLength = isKeyPresent ? apiKey.Length : 0,
                Note = "To fix 400 errors, check the response body in Network Tab or check DB logs."
            });
        }
    }
}
