using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AIService.Data;
using AIService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIService.Repositories
{
    public class AiRequestRepository : IAiRequestRepository
    {
        private readonly AiDbContext _context;

        public AiRequestRepository(AiDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(AiRequest request)
        {
            await _context.AiRequests.AddAsync(request);
        }

        public async Task<IEnumerable<AiRequest>> FindByUserIdAsync(int userId)
        {
            return await _context.AiRequests
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AiRequest>> FindByResumeIdAsync(int resumeId)
        {
            return await _context.AiRequests
                .Where(r => r.ResumeId == resumeId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> CountRecentRequestsAsync(int userId, DateTime since)
        {
            return await _context.AiRequests
                .Where(r => r.UserId == userId && r.CreatedAt >= since && r.Status == "COMPLETED")
                .CountAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
