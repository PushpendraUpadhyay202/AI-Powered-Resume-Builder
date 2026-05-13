using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ExportService.Services;

namespace ExportService.Controllers
{
    [ApiController]
    [Route("api/export")]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly IExportService _exportService;

        public ExportController(IExportService exportService)
        {
            _exportService = exportService;
        }

        [HttpGet("pdf/{resumeId}")]
        public async Task<IActionResult> ExportPdf(int resumeId)
        {
            try
            {
                var pdfBytes = await _exportService.ExportResumePdf(resumeId);
                return File(pdfBytes, "application/pdf", $"resume_{resumeId}.pdf");
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                if (ex.Message == "Resume not found" || ex.Message == "Template not found")
                {
                    return NotFound(new { success = false, message = ex.Message });
                }
                return StatusCode(500, new { success = false, message = "Internal server error: " + ex.Message });
            }
        }
    }
}
