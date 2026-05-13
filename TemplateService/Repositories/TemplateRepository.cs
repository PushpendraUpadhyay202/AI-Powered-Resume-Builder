using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TemplateService.Data;
using TemplateService.Models;

namespace TemplateService.Repositories
{
    public class TemplateRepository : ITemplateRepository
    {
        private readonly TemplateDbContext _context;

        public TemplateRepository(TemplateDbContext context)
        {
            _context = context;
        }

        public async Task<ResumeTemplate?> GetByIdAsync(int id)
        {
            return await _context.Templates.FindAsync(id);
        }

        public async Task<List<ResumeTemplate>> GetAllAsync()
        {
            return await _context.Templates.ToListAsync();
        }

        public async Task<List<ResumeTemplate>> GetByCategoryAsync(string category)
        {
            return await _context.Templates
                .Where(t => t.Category.ToLower() == category.ToLower())
                .ToListAsync();
        }

        public async Task<List<ResumeTemplate>> GetFreeTemplatesAsync()
        {
            return await _context.Templates
                .Where(t => !t.IsPremium)
                .ToListAsync();
        }

        public async Task<List<ResumeTemplate>> GetPremiumTemplatesAsync()
        {
            return await _context.Templates
                .Where(t => t.IsPremium)
                .ToListAsync();
        }

        public async Task<List<ResumeTemplate>> GetPopularTemplatesAsync()
        {
            return await _context.Templates
                .OrderByDescending(t => t.UsageCount)
                .Take(10)
                .ToListAsync();
        }

        public async Task AddAsync(ResumeTemplate template)
        {
            await _context.Templates.AddAsync(template);
        }

        public Task UpdateAsync(ResumeTemplate template)
        {
            _context.Templates.Update(template);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
