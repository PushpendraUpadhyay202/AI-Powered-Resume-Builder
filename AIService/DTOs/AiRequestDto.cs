namespace AIService.DTOs
{
    public class AiRequestDto
    {
        public int ResumeId { get; set; }
        public string Input { get; set; } = string.Empty;
        public string? SectionType { get; set; }
    }
}
