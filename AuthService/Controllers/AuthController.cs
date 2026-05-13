using AuthService.Data;
using AuthService.DTO;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(AuthDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { Message = "Email is already in use." });
            }

            // Check if phone number already exists
            if (await _context.Users.AnyAsync(u => u.PhoneNumber == request.PhoneNumber))
            {
                return BadRequest(new { Message = "Phone number is already in use." });
            }

            // Create new user and hash the password securely
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Role = request.Role,
                SubscriptionPlan = request.SubscriptionPlan,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { Message = $"Registration successful for {user.Role} with {user.SubscriptionPlan} plan. You can now log in." }));
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Find user
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            // Verify existence and password
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(ApiResponse<object>.Error("Invalid email or password."));
            }

            // Generate JWT
            var token = _tokenService.GenerateToken(user);

            var loginData = new 
            { 
                Token = token,
                User = new {
                    UserId = user.Id,
                    user.FullName,
                    user.Email,
                    user.PhoneNumber,
                    user.Role,
                    user.SubscriptionPlan
                }
            };

            return Ok(ApiResponse<object>.Ok(loginData, "Login successful."));
        }

        // GET: api/auth/google-login
        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties { RedirectUri = Url.Action("GoogleResponse") };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        // GET: api/auth/google-response
        [HttpGet("google-response")]
        public async Task<IActionResult> GoogleResponse()
        {
            var result = await HttpContext.AuthenticateAsync("External");

            if (!result.Succeeded)
                return BadRequest("Google authentication failed");

            var claims = result.Principal.Identities.FirstOrDefault()?.Claims.ToList();

            if (claims == null)
                return BadRequest("Could not read claims from Google");

            var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var fullName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
                return BadRequest("Email not provided by Google");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                // Create new user if they don't exist
                user = new User
                {
                    Email = email,
                    FullName = fullName ?? "Google User",
                    Provider = "GOOGLE",
                    Role = "User", // default role
                    SubscriptionPlan = "Free"
                };
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // Generate our standard JWT for this user
            var token = _tokenService.GenerateToken(user);

            return Ok(new { Token = token, Message = "Google login successful" });
        }

        // POST: api/auth/google-signin
        [HttpPost("google-signin")]
        public async Task<IActionResult> GoogleSignin([FromBody] GoogleSigninRequest request)
        {
            try
            {
                var settings = new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new List<string> { "885554078531-b3dce8j4a68l7ho3t2a4q2q00ju9busu.apps.googleusercontent.com" }
                };

                var payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);

                if (payload == null)
                    return BadRequest(ApiResponse<object>.Error("Invalid Google token."));

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

                if (user == null)
                {
                    user = new User
                    {
                        Email = payload.Email,
                        FullName = payload.Name ?? "Google User",
                        Provider = "GOOGLE",
                        Role = "User",
                        SubscriptionPlan = "Free"
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                var token = _tokenService.GenerateToken(user);

                return Ok(ApiResponse<object>.Ok(new
                {
                    Token = token,
                    User = new
                    {
                        UserId = user.Id,
                        user.FullName,
                        user.Email,
                        user.PhoneNumber,
                        user.Role,
                        user.SubscriptionPlan
                    }
                }, "Google login successful."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Error($"Google authentication failed: {ex.Message}"));
            }
        }

        public class GoogleSigninRequest
        {
            public string IdToken { get; set; } = string.Empty;
        }

        // GET: api/auth/profile
        [HttpGet("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst("id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<object>.Error("User ID not found in token."));
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Error("User not found."));
            }

            return Ok(ApiResponse<object>.Ok(new
            {
                user.Id,
                UserId = user.Id,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.Role,
                user.SubscriptionPlan,
                user.Provider
            }));
        }

        // PUT: api/auth/profile
        [HttpPut("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userIdClaim = User.FindFirst("id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<object>.Error("User ID not found in token."));
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Error("User not found."));
            }

            user.FullName = request.FullName;
            user.PhoneNumber = request.PhoneNumber;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { user.FullName, user.PhoneNumber }, "Profile updated successfully."));
        }

        public class UpdateProfileRequest
        {
            public string FullName { get; set; } = string.Empty;
            public string PhoneNumber { get; set; } = string.Empty;
        }

        // POST: api/auth/refresh
        [HttpPost("refresh")]
        public IActionResult RefreshToken([FromBody] RefreshRequest request)
        {
            // TODO: Validate the refresh token against the database and generate new pair
            return Ok(new { Message = "Refresh endpoint not fully implemented yet." });
        }

        // POST: api/auth/logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // TODO: Invalidate the user's refresh token in the database
            return Ok(new { Message = "Logged out successfully." });
        }
    }
}
