using System.ComponentModel.DataAnnotations;

namespace AuthService.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        public string Email { get; set; } = string.Empty;
        
        public string? PasswordHash { get; set; }
        
        [Required]
        public string Role { get; set; } = "User"; // e.g., "User", "Admin"
        
        [Required]
        public string SubscriptionPlan { get; set; } = "Free"; // e.g., "Free", "Premium"

        public string? PhoneNumber { get; set; }

        [Required]
        public string Provider { get; set; } = "LOCAL"; // "LOCAL" or "GOOGLE"
    }
}
