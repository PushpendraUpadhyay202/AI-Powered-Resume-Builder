using System.Collections.Generic;
using System.Threading.Tasks;
using TemplateService.Models;

namespace TemplateService.Repositories
{
    public interface ITemplateRepository
    {
        Task<ResumeTemplate?> GetByIdAsync(int id);
        Task<List<ResumeTemplate>> GetAllAsync();
        Task<List<ResumeTemplate>> GetByCategoryAsync(string category);
        Task<List<ResumeTemplate>> GetFreeTemplatesAsync();
        Task<List<ResumeTemplate>> GetPremiumTemplatesAsync();
        Task<List<ResumeTemplate>> GetPopularTemplatesAsync();
        Task AddAsync(ResumeTemplate template);
        Task UpdateAsync(ResumeTemplate template);
        Task SaveChangesAsync();
    }
}
