using Microsoft.AspNetCore.Mvc;
using ResumeService.Data;

namespace ResumeService.Controllers
{
    [ApiController]
    [Route("api/health")]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HealthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                
                string tableStatus = "Unknown";
                if (canConnect)
                {
                    try {
                        var count = await _context.Resumes.CountAsync();
                        tableStatus = $"Exists (Count: {count})";
                    } catch (Exception) {
                        tableStatus = "Missing (Table not found)";
                    }
                }

                return Ok(new { 
                    Status = "Healthy", 
                    Database = canConnect ? "Connected" : "Disconnected",
                    TableStatus = tableStatus
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Unhealthy", Error = ex.Message });
            }
        }
    }
}
