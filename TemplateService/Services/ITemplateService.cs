using System.Threading.Tasks;
using TemplateService.DTOs;

namespace TemplateService.Services
{
    public interface ITemplateService
    {
        Task<object> CreateTemplate(CreateTemplateDto dto);
        Task<object> GetAllTemplates();
        Task<object> GetTemplateById(int id);
        Task<object> GetByCategory(string category);
        Task<object> GetFreeTemplates();
        Task<object> GetPremiumTemplates();
        Task<object> GetPopularTemplates();
        Task<object> UpdateTemplate(int id, UpdateTemplateDto dto);
        Task<object> DeactivateTemplate(int id);
        Task<object> IncrementUsage(int id);
    }
}
