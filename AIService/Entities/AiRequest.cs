using System;

namespace AIService.Entities
{
    public class AiRequest
    {
        public Guid RequestId { get; set; } = Guid.NewGuid();
        public int UserId { get; set; }
        public int ResumeId { get; set; }
        public string RequestType { get; set; } = string.Empty;
        public string InputPrompt { get; set; } = string.Empty;
        public string AiResponse { get; set; } = string.Empty;
        public string Model { get; set; } = "GEMINI";
        public int TokensUsed { get; set; }
        public string Status { get; set; } = "QUEUED"; // QUEUED, COMPLETED, FAILED
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}
