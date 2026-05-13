using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AIService.DTOs;
using AIService.Entities;
using AIService.Providers;
using AIService.Repositories;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace AIService.Services
{
    public class AiService : IAiService
    {
        private readonly IAiProvider _aiProvider;
        private readonly IAiRequestRepository _repository;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AiService> _logger;

        private const int FREE_LIMIT = 10;
        private const int PREMIUM_LIMIT = 100;
        private const int LIMIT_WINDOW_HOURS = 12;

        public AiService(IAiProvider aiProvider, IAiRequestRepository repository, IMemoryCache cache, ILogger<AiService> logger)
        {
            _aiProvider = aiProvider;
            _repository = repository;
            _cache = cache;
            _logger = logger;
        }

        public async Task<ApiResponse<string>> GenerateSummaryAsync(int userId, int resumeId, string input, string subscriptionPlan)
        {
            return await ProcessAiRequestAsync(userId, resumeId, input, "Summary", "Generate a professional resume summary for: {0}", subscriptionPlan);
        }

        public async Task<ApiResponse<string>> GenerateBulletPointsAsync(int userId, int resumeId, string input, string subscriptionPlan)
        {
            return await ProcessAiRequestAsync(userId, resumeId, input, "BulletPoints", "Generate 3 strong resume bullet points for: {0}", subscriptionPlan);
        }

        public async Task<ApiResponse<string>> ImproveSectionAsync(int userId, int resumeId, string input, string subscriptionPlan)
        {
            return await ProcessAiRequestAsync(userId, resumeId, input, "Improve", "Improve this resume content professionally: {0}", subscriptionPlan);
        }

        public async Task<ApiResponse<string>> CheckAtsAsync(int userId, int resumeId, string input, string subscriptionPlan)
        {
            return await ProcessAiRequestAsync(userId, resumeId, input, "ATS", "Analyze ATS score and missing keywords for: {0}", subscriptionPlan);
        }

        public async Task<ApiResponse<string>> SuggestSkillsAsync(int userId, int resumeId, string input, string subscriptionPlan)
        {
            return await ProcessAiRequestAsync(userId, resumeId, input, "Skills", "Suggest relevant skills for job role: {0}", subscriptionPlan);
        }

        private async Task<ApiResponse<string>> ProcessAiRequestAsync(int userId, int resumeId, string input, string requestType, string promptTemplate, string subscriptionPlan)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return ApiResponse<string>.ErrorResponse("Input cannot be empty.");
            }
            
            string sanitizedInput = input.Trim();

            // Quota System (Rolling 12-hour window)
            int limit = subscriptionPlan.Equals("Premium", StringComparison.OrdinalIgnoreCase) ? PREMIUM_LIMIT : FREE_LIMIT;
            DateTime since = DateTime.UtcNow.AddHours(-LIMIT_WINDOW_HOURS);
            
            int currentUsage = await _repository.CountRecentRequestsAsync(userId, since);

            if (currentUsage >= limit)
            {
                return ApiResponse<string>.ErrorResponse($"AI limit reached ({limit} requests per {LIMIT_WINDOW_HOURS} hours). Please upgrade or wait.");
            }

            string prompt = string.Format(promptTemplate, sanitizedInput);

            var requestRecord = new AiRequest
            {
                UserId = userId,
                ResumeId = resumeId,
                RequestType = requestType,
                InputPrompt = prompt,
                Model = "Groq-llama-3.1-8b-instant",
                Status = "QUEUED"
            };

            await _repository.AddAsync(requestRecord);
            await _repository.SaveChangesAsync();

            try
            {
                string response = await _aiProvider.GenerateAsync(prompt);

                requestRecord.AiResponse = response;
                requestRecord.Status = "COMPLETED";
                requestRecord.CompletedAt = DateTime.UtcNow;
                await _repository.SaveChangesAsync();

                return ApiResponse<string>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI generation failed for request {RequestId}", requestRecord.RequestId);
                
                requestRecord.Status = "FAILED";
                requestRecord.CompletedAt = DateTime.UtcNow;
                await _repository.SaveChangesAsync();

                return ApiResponse<string>.ErrorResponse("Failed to generate AI content. Please try again later.");
            }
        }

        public async Task<ApiResponse<IEnumerable<AiRequest>>> GetHistoryAsync(int userId)
        {
            var history = await _repository.FindByUserIdAsync(userId);
            return ApiResponse<IEnumerable<AiRequest>>.SuccessResponse(history);
        }

        public async Task<ApiResponse<object>> GetRemainingQuotaAsync(int userId, string subscriptionPlan)
        {
            int limit = subscriptionPlan.Equals("Premium", StringComparison.OrdinalIgnoreCase) ? PREMIUM_LIMIT : FREE_LIMIT;
            DateTime since = DateTime.UtcNow.AddHours(-LIMIT_WINDOW_HOURS);
            
            int currentUsage = await _repository.CountRecentRequestsAsync(userId, since);
            
            return ApiResponse<object>.SuccessResponse(new { Used = currentUsage, Limit = limit });
        }
    }
}
