using Microsoft.AspNetCore.Mvc;
using ResumeService.Models;
using ResumeService.Services;

namespace ResumeService.Controllers
{
    [ApiController]
    [Route("api/resumes")]
    public class ResumeController : ControllerBase
    {
        private readonly IResumeService _resumeService;

        public ResumeController(IResumeService resumeService)
        {
            _resumeService = resumeService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateResume([FromBody] Resume resume)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Error("Invalid resume data."));
            }

            try
            {
                var createdResume = await _resumeService.CreateResume(resume);
                return Ok(ApiResponse<Resume>.Ok(createdResume, "Resume created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while creating the resume: " + ex.Message));
            }
        }

        // Duplicate a resume
        [HttpPost("duplicate/{id}")]
        public async Task<IActionResult> DuplicateResume(int id)
        {
            try
            {
                var duplicatedResume = await _resumeService.DuplicateResume(id);
                return Ok(ApiResponse<Resume>.Ok(duplicatedResume, "Resume duplicated successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while duplicating the resume: " + ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetResume(int id)
        {
            try
            {
                var resume = await _resumeService.GetResumeById(id);
                if (resume == null)
                {
                    return NotFound(ApiResponse<object>.Error($"Resume with ID {id} not found."));
                }
                return Ok(ApiResponse<Resume>.Ok(resume, "Resume retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while retrieving the resume: " + ex.Message));
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetResumesByUser(int userId)
        {
            try
            {
                var resumes = await _resumeService.GetResumesByUser(userId);
                return Ok(ApiResponse<List<Resume>>.Ok(resumes, "User resumes retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while retrieving user resumes: " + ex.Message));
            }
        }

        // Get public resumes for discovery/templates
        [HttpGet("public")]
        public async Task<IActionResult> GetPublicResumes()
        {
            try
            {
                var resumes = await _resumeService.GetPublicResumes();
                return Ok(ApiResponse<List<Resume>>.Ok(resumes, "Public resumes retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while retrieving public resumes: " + ex.Message));
            }
        }

        [HttpGet("template/{templateId}")]
        public async Task<IActionResult> GetResumesByTemplate(int templateId)
        {
            try
            {
                var resumes = await _resumeService.GetResumesByTemplate(templateId);
                return Ok(ApiResponse<List<Resume>>.Ok(resumes, "Resumes by template retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while retrieving resumes by template: " + ex.Message));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResume(int id, [FromBody] Resume resume)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Error("Invalid resume data."));
            }

            try
            {
                var updatedResume = await _resumeService.UpdateResume(id, resume);
                return Ok(ApiResponse<Resume>.Ok(updatedResume, "Resume updated successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while updating the resume: " + ex.Message));
            }
        }

        // Make resume public so others can view it
        [HttpPut("publish/{id}")]
        public async Task<IActionResult> PublishResume(int id)
        {
            try
            {
                var success = await _resumeService.PublishResume(id);
                if (!success)
                    return NotFound(ApiResponse<object>.Error($"Resume with ID {id} not found."));
                
                return Ok(ApiResponse<bool>.Ok(true, "Resume published successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while publishing the resume: " + ex.Message));
            }
        }

        // Make resume private again
        [HttpPut("unpublish/{id}")]
        public async Task<IActionResult> UnpublishResume(int id)
        {
            try
            {
                var success = await _resumeService.UnpublishResume(id);
                if (!success)
                    return NotFound(ApiResponse<object>.Error($"Resume with ID {id} not found."));
                
                return Ok(ApiResponse<bool>.Ok(true, "Resume unpublished successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while unpublishing the resume: " + ex.Message));
            }
        }

        // Update just the ATS score (often called by an external AI service)
        [HttpPut("ats/{id}")]
        public async Task<IActionResult> UpdateAtsScore(int id, [FromBody] int score)
        {
            try
            {
                var success = await _resumeService.UpdateAtsScore(id, score);
                if (!success)
                    return NotFound(ApiResponse<object>.Error($"Resume with ID {id} not found."));
                
                return Ok(ApiResponse<bool>.Ok(true, "ATS score updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while updating the ATS score: " + ex.Message));
            }
        }

        [HttpPut("view/{id}")]
        public async Task<IActionResult> IncrementViewCount(int id)
        {
            try
            {
                var success = await _resumeService.IncrementViewCount(id);
                if (!success)
                    return NotFound(ApiResponse<object>.Error($"Resume with ID {id} not found."));
                
                return Ok(ApiResponse<bool>.Ok(true, "View count incremented successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while incrementing view count: " + ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResume(int id)
        {
            try
            {
                var success = await _resumeService.DeleteResume(id);
                if (!success)
                    return NotFound(ApiResponse<object>.Error($"Resume with ID {id} not found."));

                return Ok(ApiResponse<bool>.Ok(true, "Resume deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while deleting the resume: " + ex.Message));
            }
        }
    }
}
