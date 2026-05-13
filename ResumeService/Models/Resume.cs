using System.ComponentModel.DataAnnotations;

namespace ResumeService.Models
{
    public class Resume
    {
        [Key]
        public int ResumeId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string TargetJobTitle { get; set; } = string.Empty;

        public int TemplateId { get; set; }
        
        public int AtsScore { get; set; } = 0;
        
        public string Status { get; set; } = "DRAFT"; // DRAFT or COMPLETE
        
        public string Language { get; set; } = string.Empty;
        
        public bool IsPublic { get; set; } = false;
        
        public int ViewCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
    }
}
