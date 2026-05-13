using ResumeService.Models;

namespace ResumeService.Repositories
{
    public interface IResumeRepository
    {
        Task<Resume> CreateAsync(Resume resume);
        Task<Resume?> FindByResumeIdAsync(int resumeId);
        Task<List<Resume>> FindByUserIdAsync(int userId);
        Task<List<Resume>> FindByStatusAsync(string status);
        Task<List<Resume>> FindByTargetJobTitleAsync(string title);
        Task<List<Resume>> FindByIsPublicAsync(bool isPublic);
        Task<int> CountByUserIdAsync(int userId);
        Task<List<Resume>> FindByTemplateIdAsync(int templateId);
        Task UpdateAsync(Resume resume);
        Task DeleteByResumeIdAsync(int resumeId);
    }
}
