using System.ComponentModel.DataAnnotations;

namespace TemplateService.DTOs
{
    public class CreateTemplateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string ThumbnailUrl { get; set; } = string.Empty;

        [Required]
        public string HtmlLayout { get; set; } = string.Empty;

        public string CssStyles { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        public bool IsPremium { get; set; }
    }
}
