using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AIService.DTOs;
using AIService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIService.Controllers
{
    [ApiController]
    [Route("api/ai")]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found in token.");
        }

        private string GetSubscriptionPlan()
        {
            return User.FindFirst("SubscriptionPlan")?.Value ?? "Free";
        }

        [HttpPost("generate-summary")]
        public async Task<IActionResult> GenerateSummary([FromBody] AiRequestDto request)
        {
            try
            {
                int userId = GetUserId();
                string plan = GetSubscriptionPlan();
                var result = await _aiService.GenerateSummaryAsync(userId, request.ResumeId, request.Input, plan);
                return result.Success ? Ok(result) : BadRequest(new { success = false, message = result.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("generate-bullets")]
        public async Task<IActionResult> GenerateBullets([FromBody] AiRequestDto request)
        {
            try
            {
                int userId = GetUserId();
                string plan = GetSubscriptionPlan();
                var result = await _aiService.GenerateBulletPointsAsync(userId, request.ResumeId, request.Input, plan);
                return result.Success ? Ok(result) : BadRequest(new { success = false, message = result.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("improve-section")]
        public async Task<IActionResult> ImproveSection([FromBody] AiRequestDto request)
        {
            try
            {
                int userId = GetUserId();
                string plan = GetSubscriptionPlan();
                var result = await _aiService.ImproveSectionAsync(userId, request.ResumeId, request.Input, plan);
                return result.Success ? Ok(result) : BadRequest(new { success = false, message = result.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("check-ats")]
        public async Task<IActionResult> CheckAts([FromBody] AiRequestDto request)
        {
            try
            {
                int userId = GetUserId();
                string plan = GetSubscriptionPlan();
                var result = await _aiService.CheckAtsAsync(userId, request.ResumeId, request.Input, plan);
                return result.Success ? Ok(result) : BadRequest(new { success = false, message = result.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("suggest-skills")]
        public async Task<IActionResult> SuggestSkills([FromBody] AiRequestDto request)
        {
            try
            {
                int userId = GetUserId();
                string plan = GetSubscriptionPlan();
                var result = await _aiService.SuggestSkillsAsync(userId, request.ResumeId, request.Input, plan);
                return result.Success ? Ok(result) : BadRequest(new { success = false, message = result.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            try
            {
                int userId = GetUserId();
                var result = await _aiService.GetHistoryAsync(userId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("quota")]
        public async Task<IActionResult> GetQuota()
        {
            try
            {
                int userId = GetUserId();
                string plan = GetSubscriptionPlan();
                var result = await _aiService.GetRemainingQuotaAsync(userId, plan);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }
    }
}
