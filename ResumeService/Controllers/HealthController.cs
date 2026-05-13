using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<IActionResult> Get([FromQuery] bool fix = false)
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                
                if (fix && canConnect)
                {
                    try {
                        string sql = @"
                            CREATE TABLE IF NOT EXISTS resumes (
                                ""ResumeId"" SERIAL PRIMARY KEY,
                                ""UserId"" INTEGER NOT NULL,
                                ""Title"" TEXT NOT NULL,
                                ""TargetJobTitle"" TEXT NOT NULL,
                                ""TemplateId"" INTEGER NOT NULL,
                                ""AtsScore"" INTEGER NOT NULL,
                                ""Status"" TEXT NOT NULL,
                                ""Language"" TEXT NOT NULL,
                                ""IsPublic"" BOOLEAN NOT NULL,
                                ""ViewCount"" INTEGER NOT NULL,
                                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL,
                                ""UpdatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL
                            );";
                        await _context.Database.ExecuteSqlRawAsync(sql);
                    } catch (Exception ex) {
                        return StatusCode(500, new { Status = "Fix Failed", Error = ex.Message });
                    }
                }

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
                    TableStatus = tableStatus,
                    FixApplied = fix
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Unhealthy", Error = ex.Message });
            }
        }
    }
}
