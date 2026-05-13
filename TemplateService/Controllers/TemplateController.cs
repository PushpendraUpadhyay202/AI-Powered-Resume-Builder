using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TemplateService.DTOs;
using TemplateService.Models;
using TemplateService.Services;

namespace TemplateService.Controllers
{
    [ApiController]
    [Route("api/templates")]
    public class TemplateController : ControllerBase
    {
        private readonly ITemplateService _service;

        public TemplateController(ITemplateService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTemplate([FromBody] CreateTemplateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.Error("Invalid template data"));

            var result = await _service.CreateTemplate(dto);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllActiveTemplates()
        {
            var result = await _service.GetAllTemplates();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTemplateById(int id)
        {
            var result = await _service.GetTemplateById(id);
            return Ok(result);
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            var result = await _service.GetByCategory(category);
            return Ok(result);
        }

        [HttpGet("free")]
        public async Task<IActionResult> GetFreeTemplates()
        {
            var result = await _service.GetFreeTemplates();
            return Ok(result);
        }

        [HttpGet("premium")]
        public async Task<IActionResult> GetPremiumTemplates()
        {
            var result = await _service.GetPremiumTemplates();
            return Ok(result);
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularTemplates()
        {
            var result = await _service.GetPopularTemplates();
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] UpdateTemplateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.Error("Invalid update data"));

            var result = await _service.UpdateTemplate(id, dto);
            return Ok(result);
        }

        [HttpPut("deactivate/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateTemplate(int id)
        {
            var result = await _service.DeactivateTemplate(id);
            return Ok(result);
        }

        [HttpPut("use/{id}")]
        public async Task<IActionResult> IncrementUsage(int id)
        {
            var result = await _service.IncrementUsage(id);
            return Ok(result);
        }
    }
}
