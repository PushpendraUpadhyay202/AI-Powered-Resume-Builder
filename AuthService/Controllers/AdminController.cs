using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Data;
using System.Threading.Tasks;
using System.Linq;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")] 
    public class AdminController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public AdminController(AuthDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/overview
        // Returns high-level statistics for the admin dashboard
        [HttpGet("overview")]
        public async Task<IActionResult> GetSystemOverview()
        {
            var totalUsers = await _context.Users.CountAsync();
            var premiumUsers = await _context.Users.CountAsync(u => u.SubscriptionPlan == "Premium");
            var freeUsers = await _context.Users.CountAsync(u => u.SubscriptionPlan == "Free");
            var localUsers = await _context.Users.CountAsync(u => u.Provider == "LOCAL");
            var googleUsers = await _context.Users.CountAsync(u => u.Provider == "GOOGLE");

            return Ok(new
            {
                TotalUsers = totalUsers,
                PremiumUsers = premiumUsers,
                FreeUsers = freeUsers,
                LocalUsers = localUsers,
                GoogleUsers = googleUsers
            });
        }

        // GET: api/admin/users
        // Retrieves a list of all registered users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new 
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.SubscriptionPlan,
                    u.Provider,
                    u.PhoneNumber
                })
                .ToListAsync();
                
            return Ok(users);
        }

        // GET: api/admin/users/{id}
        // Retrieves detailed information and activity for a specific user
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserDetails(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new 
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Role,
                user.SubscriptionPlan,
                user.Provider,
                user.PhoneNumber
            });
        }

        // DELETE: api/admin/users/{id}
        // Removes a user and their associated data from the system
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully" });
        }
    }
}
