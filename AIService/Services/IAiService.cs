using System.Collections.Generic;
using System.Threading.Tasks;
using AIService.DTOs;
using AIService.Entities;

namespace AIService.Services
{
    public interface IAiService
    {
        Task<ApiResponse<string>> GenerateSummaryAsync(int userId, int resumeId, string input, string subscriptionPlan);
        Task<ApiResponse<string>> GenerateBulletPointsAsync(int userId, int resumeId, string input, string subscriptionPlan);
        Task<ApiResponse<string>> ImproveSectionAsync(int userId, int resumeId, string input, string subscriptionPlan);
        Task<ApiResponse<string>> CheckAtsAsync(int userId, int resumeId, string input, string subscriptionPlan);
        Task<ApiResponse<string>> SuggestSkillsAsync(int userId, int resumeId, string input, string subscriptionPlan);
        Task<ApiResponse<IEnumerable<AiRequest>>> GetHistoryAsync(int userId);
        Task<ApiResponse<object>> GetRemainingQuotaAsync(int userId, string subscriptionPlan);
    }
}
