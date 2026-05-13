using Microsoft.AspNetCore.Mvc;
using TemplateService.Data;

namespace TemplateService.Controllers
{
    [ApiController]
    [Route("api/health")]
    public class HealthController : ControllerBase
    {
        private readonly TemplateDbContext _context;

        public HealthController(TemplateDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                return Ok(new { Status = "Healthy", Database = canConnect ? "Connected" : "Disconnected" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Unhealthy", Error = ex.Message });
            }
        }
    }
}
