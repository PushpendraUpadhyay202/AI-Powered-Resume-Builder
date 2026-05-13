using Microsoft.EntityFrameworkCore;
using ResumeService.Data;
using ResumeService.Models;

namespace ResumeService.Repositories
{
    public class ResumeRepository : IResumeRepository
    {
        private readonly AppDbContext _context;

        public ResumeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Resume> CreateAsync(Resume resume)
        {
            _context.Resumes.Add(resume);
            await _context.SaveChangesAsync();
            return resume;
        }

        public async Task<Resume?> FindByResumeIdAsync(int resumeId)
        {
            return await _context.Resumes.FindAsync(resumeId);
        }

        public async Task<List<Resume>> FindByUserIdAsync(int userId)
        {
            return await _context.Resumes
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Resume>> FindByStatusAsync(string status)
        {
            return await _context.Resumes
                .Where(r => r.Status == status)
                .ToListAsync();
        }

        public async Task<List<Resume>> FindByTargetJobTitleAsync(string title)
        {
            return await _context.Resumes
                .Where(r => r.TargetJobTitle.Contains(title))
                .ToListAsync();
        }

        public async Task<List<Resume>> FindByIsPublicAsync(bool isPublic)
        {
            return await _context.Resumes
                .Where(r => r.IsPublic == isPublic)
                .ToListAsync();
        }

        public async Task<int> CountByUserIdAsync(int userId)
        {
            return await _context.Resumes
                .CountAsync(r => r.UserId == userId);
        }

        public async Task<List<Resume>> FindByTemplateIdAsync(int templateId)
        {
            return await _context.Resumes
                .Where(r => r.TemplateId == templateId)
                .ToListAsync();
        }

        public async Task UpdateAsync(Resume resume)
        {
            _context.Resumes.Update(resume);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteByResumeIdAsync(int resumeId)
        {
            var resume = await _context.Resumes.FindAsync(resumeId);
            if (resume != null)
            {
                _context.Resumes.Remove(resume);
                await _context.SaveChangesAsync();
            }
        }
    }
}
