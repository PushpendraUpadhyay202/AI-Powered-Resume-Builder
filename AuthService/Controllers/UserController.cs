using AuthService.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All endpoints here require a valid JWT token
    public class UserController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public UserController(AuthDbContext context)
        {
            _context = context;
        }

        // GET: api/user/directory
        // Returns a simplified list of users
        [HttpGet("directory")]
        public async Task<IActionResult> GetDirectory()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Select(u => new
                {
                    UserId = u.Id,
                    Role = u.Role
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/user/profile
        // Returns the profile of the currently authenticated user
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { Message = "Invalid user token." });

            var user = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new 
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.Role,
                    u.SubscriptionPlan
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound(new { Message = "User not found." });

            return Ok(user);
        }

        // PUT: api/user/profile/phone-number
        // Updates the phone number for the authenticated user
        [HttpPut("profile/phone-number")]
        public async Task<IActionResult> UpdatePhoneNumber([FromBody] UpdatePhoneRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { Message = "Invalid user token." });

            if (string.IsNullOrWhiteSpace(request.PhoneNumber) || !Regex.IsMatch(request.PhoneNumber, @"^\d{10}$"))
            {
                return BadRequest(new { Message = "Phone number must be exactly 10 digits." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { Message = "User not found." });

            // Check if another user already has this phone number
            var isPhoneInUse = await _context.Users.AnyAsync(u => u.Id != userId && u.PhoneNumber == request.PhoneNumber);
            if (isPhoneInUse) return Conflict(new { Message = "This phone number is already registered." });

            user.PhoneNumber = request.PhoneNumber;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Phone number updated successfully.", PhoneNumber = user.PhoneNumber });
        }

        // PUT: api/user/subscription
        // Updates the subscription plan for the authenticated user
        [HttpPut("subscription")]
        public async Task<IActionResult> UpdateSubscription([FromBody] UpdateSubscriptionRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized(new { Message = "Invalid user token." });

            if (string.IsNullOrWhiteSpace(request.Plan) || 
                (!request.Plan.Equals("Free", StringComparison.OrdinalIgnoreCase) && 
                 !request.Plan.Equals("Premium", StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest(new { Message = "Invalid subscription plan. Use 'Free' or 'Premium'." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { Message = "User not found." });

            user.SubscriptionPlan = request.Plan;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Subscription updated successfully.", Plan = user.SubscriptionPlan });
        }

        // Helper to extract the User ID from the JWT Claims
        private int? GetCurrentUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(claim, out var userId))
            {
                return userId;
            }
            return null;
        }
    }

    // --- Simple Request DTO ---
    public class UpdatePhoneRequest
    {
        public string PhoneNumber { get; set; } = string.Empty;
    }

    public class UpdateSubscriptionRequest
    {
        public string Plan { get; set; } = "Free";
    }
}
