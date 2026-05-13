using System;
using System.Collections.Generic;

namespace ExportService.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
    }

    public class ResumeDataDto
    {
        public ResumeDto? Resume { get; set; }
        public List<SectionDto> Sections { get; set; } = new();
    }

    public class ResumeDto
    {
        public int ResumeId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string TargetJobTitle { get; set; } = string.Empty;
        public int TemplateId { get; set; }
        public int AtsScore { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public int ViewCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class SectionDto
    {
        public int SectionId { get; set; }
        public int ResumeId { get; set; }
        public string SectionType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty; // JSON string
        public int DisplayOrder { get; set; }
    }

    public class TemplateResponseDto
    {
        public int TemplateId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string HtmlLayout { get; set; } = string.Empty;
        public string CssStyles { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsPremium { get; set; }
        public bool IsActive { get; set; }
        public int UsageCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    public class UserDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
