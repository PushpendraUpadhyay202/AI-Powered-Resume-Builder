using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SectionService.Models;
using SectionService.Services;

namespace SectionService.Controllers
{
    [ApiController]
    [Route("api/sections")]
    public class SectionController : ControllerBase
    {
        private readonly ISectionService _sectionService;

        public SectionController(ISectionService sectionService)
        {
            _sectionService = sectionService;
        }

        private IActionResult SuccessResponse(object? data = null, string message = "Operation successful")
        {
            return Ok(new
            {
                success = true,
                message,
                data
            });
        }

        private IActionResult ErrorResponse(string message, int statusCode = 400)
        {
            return StatusCode(statusCode, new
            {
                success = false,
                message,
                data = (object?)null
            });
        }

        // POST /api/sections
        [HttpPost]
        public async Task<IActionResult> AddSection([FromBody] ResumeSection section)
        {
            try
            {
                var addedSection = await _sectionService.AddSection(section);
                return SuccessResponse(addedSection, "Section added successfully");
            }
            catch (ArgumentException ex)
            {
                return ErrorResponse(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return ErrorResponse("Internal server error: " + ex.Message, 500);
            }
        }

        // GET /api/sections/resume/{resumeId}
        [HttpGet("resume/{resumeId}")]
        public async Task<IActionResult> GetSectionsByResume(int resumeId)
        {
            var sections = await _sectionService.GetSectionsByResume(resumeId);
            return SuccessResponse(sections);
        }

        // GET /api/sections/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSectionById(int id)
        {
            var section = await _sectionService.GetSectionById(id);
            if (section == null)
            {
                return ErrorResponse("Section not found", 404);
            }
            return SuccessResponse(section);
        }

        // GET /api/sections/type/{resumeId}/{type}
        [HttpGet("type/{resumeId}/{type}")]
        public async Task<IActionResult> GetSectionsByType(int resumeId, string type)
        {
            var sections = await _sectionService.GetSectionsByType(resumeId, type);
            return SuccessResponse(sections);
        }

        // PUT /api/sections/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSection(int id, [FromBody] ResumeSection section)
        {
            try
            {
                var updatedSection = await _sectionService.UpdateSection(id, section);
                return SuccessResponse(updatedSection, "Section updated successfully");
            }
            catch (KeyNotFoundException ex)
            {
                return ErrorResponse(ex.Message, 404);
            }
            catch (ArgumentException ex)
            {
                return ErrorResponse(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return ErrorResponse("Internal server error: " + ex.Message, 500);
            }
        }

        // PUT /api/sections/reorder/{resumeId}
        // Body should be an array of section IDs in the new order.
        [HttpPut("reorder/{resumeId}")]
        public async Task<IActionResult> ReorderSections(int resumeId, [FromBody] List<int> orderedSectionIds)
        {
            try
            {
                var success = await _sectionService.ReorderSections(resumeId, orderedSectionIds);
                return SuccessResponse(success, "Sections reordered successfully");
            }
            catch (ArgumentException ex)
            {
                return ErrorResponse(ex.Message, 400);
            }
            catch (Exception ex)
            {
                return ErrorResponse("Internal server error: " + ex.Message, 500);
            }
        }

        // PUT /api/sections/toggle/{id}
        // Visibility toggle logic: true -> false, false -> true
        [HttpPut("toggle/{id}")]
        public async Task<IActionResult> ToggleVisibility(int id)
        {
            var success = await _sectionService.ToggleVisibility(id);
            if (!success)
            {
                return ErrorResponse("Section not found", 404);
            }
            return SuccessResponse(true, "Section visibility toggled successfully");
        }

        // PUT /api/sections/bulk/{resumeId}
        // Bulk update logic: Update multiple sections in one save (batch update)
        [HttpPut("bulk/{resumeId}")]
        public async Task<IActionResult> BulkUpdateSections(int resumeId, [FromBody] List<ResumeSection> sections)
        {
            try
            {
                var success = await _sectionService.BulkUpdateSections(resumeId, sections);
                return SuccessResponse(success, "Sections bulk updated successfully");
            }
            catch (Exception ex)
            {
                return ErrorResponse("Internal server error: " + ex.Message, 500);
            }
        }

        // DELETE /api/sections/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSection(int id)
        {
            var success = await _sectionService.DeleteSection(id);
            if (!success)
            {
                return ErrorResponse("Section not found", 404);
            }
            return SuccessResponse(true, "Section deleted successfully");
        }

        // DELETE /api/sections/resume/{resumeId}
        [HttpDelete("resume/{resumeId}")]
        public async Task<IActionResult> DeleteAllSections(int resumeId)
        {
            var success = await _sectionService.DeleteAllSections(resumeId);
            return SuccessResponse(success, "All sections for resume deleted successfully");
        }
    }
}
