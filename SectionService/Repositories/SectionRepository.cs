using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SectionService.Data;
using SectionService.Models;

namespace SectionService.Repositories
{
    public class SectionRepository : ISectionRepository
    {
        private readonly AppDbContext _context;

        public SectionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ResumeSection> Add(ResumeSection section)
        {
            _context.ResumeSections.Add(section);
            await _context.SaveChangesAsync();
            return section;
        }

        public async Task<ResumeSection> Update(ResumeSection section)
        {
            _context.ResumeSections.Update(section);
            await _context.SaveChangesAsync();
            return section;
        }

        public async Task UpdateRange(List<ResumeSection> sections)
        {
            _context.ResumeSections.UpdateRange(sections);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ResumeSection>> FindByResumeId(int resumeId)
        {
            return await _context.ResumeSections
                .Where(s => s.ResumeId == resumeId)
                .ToListAsync();
        }

        public async Task<ResumeSection?> FindBySectionId(int sectionId)
        {
            return await _context.ResumeSections
                .FirstOrDefaultAsync(s => s.SectionId == sectionId);
        }

        public async Task<List<ResumeSection>> FindByResumeIdAndSectionType(int resumeId, string type)
        {
            return await _context.ResumeSections
                .Where(s => s.ResumeId == resumeId && s.SectionType == type)
                .ToListAsync();
        }

        public async Task<List<ResumeSection>> FindByResumeIdOrderByDisplayOrder(int resumeId)
        {
            return await _context.ResumeSections
                .Where(s => s.ResumeId == resumeId)
                .OrderBy(s => s.DisplayOrder)
                .ToListAsync();
        }

        public async Task<List<ResumeSection>> FindByAiGenerated(bool aiGenerated)
        {
            return await _context.ResumeSections
                .Where(s => s.AiGenerated == aiGenerated)
                .ToListAsync();
        }

        public async Task<int> CountByResumeId(int resumeId)
        {
            return await _context.ResumeSections
                .CountAsync(s => s.ResumeId == resumeId);
        }

        public async Task DeleteByResumeId(int resumeId)
        {
            var sections = await _context.ResumeSections
                .Where(s => s.ResumeId == resumeId)
                .ToListAsync();
            
            if (sections.Any())
            {
                _context.ResumeSections.RemoveRange(sections);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteBySectionId(int sectionId)
        {
            var section = await FindBySectionId(sectionId);
            if (section != null)
            {
                _context.ResumeSections.Remove(section);
                await _context.SaveChangesAsync();
            }
        }
    }
}
