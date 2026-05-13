using System.ComponentModel.DataAnnotations;

namespace AuthService.DTO
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Full Name is required.")]
        [System.ComponentModel.DefaultValue("John Doe")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [RegularExpression(@"^[a-zA-Z0-9_.+-]+@gmail\.com$", ErrorMessage = "Email must end with @gmail.com.")]
        [System.ComponentModel.DefaultValue("johndoe@gmail.com")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&_?]).{6,}$", ErrorMessage = "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special symbol (@#$&_?).")]
        [System.ComponentModel.DefaultValue("Password@123")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone Number is required.")]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone number must be exactly 10 digits.")]
        [System.ComponentModel.DefaultValue("9876543210")]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [RegularExpression("^(User|Admin)$", ErrorMessage = "Role must be either 'User' or 'Admin'.")]
        [System.ComponentModel.DefaultValue("User")]
        public string Role { get; set; } = "User"; 

        [RegularExpression("^(Free|Premium)$", ErrorMessage = "SubscriptionPlan must be either 'Free' or 'Premium'.")]
        [System.ComponentModel.DefaultValue("Free")]
        public string SubscriptionPlan { get; set; } = "Free"; 
    }

    public class LoginRequest
    {
        [Required(ErrorMessage = "Email is required.")]
        [RegularExpression(@"^[a-zA-Z0-9_.+-]+@gmail\.com$", ErrorMessage = "Email must end with @gmail.com.")]
        [System.ComponentModel.DefaultValue("johndoe@gmail.com")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [System.ComponentModel.DefaultValue("Password@123")]
        public string Password { get; set; } = string.Empty;
    }

    public class RefreshRequest
    {
        [Required(ErrorMessage = "Refresh Token is required.")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
