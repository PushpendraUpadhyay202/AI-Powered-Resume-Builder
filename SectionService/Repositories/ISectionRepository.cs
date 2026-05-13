using System.Collections.Generic;
using System.Threading.Tasks;
using SectionService.Models;

namespace SectionService.Repositories
{
    public interface ISectionRepository
    {
        Task<ResumeSection> Add(ResumeSection section);
        Task<ResumeSection> Update(ResumeSection section);
        Task UpdateRange(List<ResumeSection> sections);
        
        Task<List<ResumeSection>> FindByResumeId(int resumeId);
        Task<ResumeSection?> FindBySectionId(int sectionId);
        Task<List<ResumeSection>> FindByResumeIdAndSectionType(int resumeId, string type);
        Task<List<ResumeSection>> FindByResumeIdOrderByDisplayOrder(int resumeId);
        Task<List<ResumeSection>> FindByAiGenerated(bool aiGenerated);
        Task<int> CountByResumeId(int resumeId);
        
        Task DeleteByResumeId(int resumeId);
        Task DeleteBySectionId(int sectionId);
    }
}
