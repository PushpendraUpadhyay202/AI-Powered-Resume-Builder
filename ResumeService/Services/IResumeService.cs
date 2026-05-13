using ResumeService.Models;

namespace ResumeService.Services
{
    public interface IResumeService
    {
        Task<Resume> CreateResume(Resume resume);
        Task<Resume?> GetResumeById(int id);
        Task<List<Resume>> GetResumesByUser(int userId);
        Task<Resume> UpdateResume(int id, Resume resume);
        Task<bool> DeleteResume(int id);
        Task<Resume> DuplicateResume(int id);
        Task<bool> UpdateAtsScore(int id, int score);
        Task<bool> PublishResume(int id);
        Task<bool> UnpublishResume(int id);
        Task<List<Resume>> GetPublicResumes();
        Task<bool> IncrementViewCount(int id);
        Task<List<Resume>> GetResumesByTemplate(int templateId);
    }
}
