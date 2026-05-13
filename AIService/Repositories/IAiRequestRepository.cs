using System.Collections.Generic;
using System.Threading.Tasks;
using AIService.Entities;

namespace AIService.Repositories
{
    public interface IAiRequestRepository
    {
        Task AddAsync(AiRequest request);
        Task<IEnumerable<AiRequest>> FindByUserIdAsync(int userId);
        Task<IEnumerable<AiRequest>> FindByResumeIdAsync(int resumeId);
        Task<int> CountRecentRequestsAsync(int userId, DateTime since);
        Task SaveChangesAsync();
    }
}
