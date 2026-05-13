using System;
using System.ComponentModel.DataAnnotations;

namespace TemplateService.Models
{
    /// <summary>
    /// Represents a resume template in the system.
    /// </summary>
    public class ResumeTemplate
    {
        [Key]
        public int TemplateId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public string ThumbnailUrl { get; set; } = string.Empty;

        [Required]
        public string HtmlLayout { get; set; } = string.Empty;

        public string CssStyles { get; set; } = string.Empty;

        // E.g., PROFESSIONAL, CREATIVE, MODERN, MINIMALIST, ATS
        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        public bool IsPremium { get; set; }

        public bool IsActive { get; set; } = true;

        public int UsageCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
