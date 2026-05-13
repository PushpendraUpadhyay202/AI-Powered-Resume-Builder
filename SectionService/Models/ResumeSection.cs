using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SectionService.Models
{
    public class ResumeSection
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SectionId { get; set; }
        
        [Required]
        public int ResumeId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string SectionType { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? Title { get; set; }
        
        public string? Content { get; set; }
        
        public int DisplayOrder { get; set; }
        
        public bool IsVisible { get; set; } = true;
        
        public bool AiGenerated { get; set; } = false;
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
    }
}
