using ResumeService.Models;
using ResumeService.Repositories;

namespace ResumeService.Services
{
    public class ResumeService : IResumeService
    {
        private readonly IResumeRepository _repository;

        public ResumeService(IResumeRepository repository)
        {
            _repository = repository;
        }

        public async Task<Resume> CreateResume(Resume resume)
        {
            resume.CreatedAt = DateTime.UtcNow;
            resume.UpdatedAt = DateTime.UtcNow;
            resume.Status = "DRAFT";
            resume.AtsScore = 0;
            resume.IsPublic = false;
            resume.ViewCount = 0;

            return await _repository.CreateAsync(resume);
        }

        public async Task<Resume?> GetResumeById(int id)
        {
            return await _repository.FindByResumeIdAsync(id);
        }

        public async Task<List<Resume>> GetResumesByUser(int userId)
        {
            return await _repository.FindByUserIdAsync(userId);
        }

        public async Task<Resume> UpdateResume(int id, Resume resume)
        {
            var existingResume = await _repository.FindByResumeIdAsync(id);
            if (existingResume == null)
                throw new KeyNotFoundException($"Resume with ID {id} not found.");

            existingResume.Title = resume.Title;
            existingResume.TargetJobTitle = resume.TargetJobTitle;
            existingResume.TemplateId = resume.TemplateId;
            existingResume.Status = resume.Status;
            existingResume.Language = resume.Language;
            existingResume.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(existingResume);
            return existingResume;
        }

        public async Task<bool> DeleteResume(int id)
        {
            var existingResume = await _repository.FindByResumeIdAsync(id);
            if (existingResume == null) return false;

            await _repository.DeleteByResumeIdAsync(id);
            return true;
        }

        public async Task<Resume> DuplicateResume(int id)
        {
            // Fetch the existing resume to duplicate
            var existingResume = await _repository.FindByResumeIdAsync(id);
            if (existingResume == null)
                throw new KeyNotFoundException($"Resume with ID {id} not found.");

            // Create a new object and copy all fields except ResumeId
            var newResume = new Resume
            {
                UserId = existingResume.UserId,
                Title = existingResume.Title + " (Copy)",
                TargetJobTitle = existingResume.TargetJobTitle,
                TemplateId = existingResume.TemplateId,
                Language = existingResume.Language,
                
                // Reset metadata fields
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = "DRAFT",
                AtsScore = 0,
                IsPublic = false,
                ViewCount = 0
            };

            // Save as new record
            return await _repository.CreateAsync(newResume);
        }

        public async Task<bool> UpdateAtsScore(int id, int score)
        {
            // Use efficient update where possible, but here we fetch to use existing repo methods
            // In a real-world scenario with high performance needs, this could be a direct DB update query.
            var existingResume = await _repository.FindByResumeIdAsync(id);
            if (existingResume == null) return false;

            existingResume.AtsScore = score;
            existingResume.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(existingResume);
            return true;
        }

        public async Task<bool> PublishResume(int id)
        {
            var existingResume = await _repository.FindByResumeIdAsync(id);
            if (existingResume == null) return false;

            existingResume.IsPublic = true;
            existingResume.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(existingResume);
            return true;
        }

        public async Task<bool> UnpublishResume(int id)
        {
            var existingResume = await _repository.FindByResumeIdAsync(id);
            if (existingResume == null) return false;

            existingResume.IsPublic = false;
            existingResume.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(existingResume);
            return true;
        }

        public async Task<List<Resume>> GetPublicResumes()
        {
            return await _repository.FindByIsPublicAsync(true);
        }

        public async Task<bool> IncrementViewCount(int id)
        {
            var existingResume = await _repository.FindByResumeIdAsync(id);
            if (existingResume == null) return false;

            existingResume.ViewCount += 1;
            await _repository.UpdateAsync(existingResume);
            return true;
        }

        public async Task<List<Resume>> GetResumesByTemplate(int templateId)
        {
            return await _repository.FindByTemplateIdAsync(templateId);
        }
    }
}
