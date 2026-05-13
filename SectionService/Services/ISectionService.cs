using System.Collections.Generic;
using System.Threading.Tasks;
using SectionService.Models;

namespace SectionService.Services
{
    public interface ISectionService
    {
        Task<ResumeSection> AddSection(ResumeSection section);
        Task<List<ResumeSection>> GetSectionsByResume(int resumeId);
        Task<ResumeSection?> GetSectionById(int id);
        Task<ResumeSection> UpdateSection(int id, ResumeSection section);
        Task<bool> DeleteSection(int id);
        
        Task<bool> ReorderSections(int resumeId, List<int> orderedSectionIds);
        Task<bool> ToggleVisibility(int sectionId);
        Task<bool> DeleteAllSections(int resumeId);
        Task<List<ResumeSection>> GetSectionsByType(int resumeId, string type);
        Task<bool> BulkUpdateSections(int resumeId, List<ResumeSection> sections);
    }
}
