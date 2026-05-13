using Microsoft.EntityFrameworkCore;
using TemplateService.Models;

namespace TemplateService.Data
{
    public class TemplateDbContext : DbContext
    {
        public TemplateDbContext(DbContextOptions<TemplateDbContext> options) : base(options)
        {
        }

        public DbSet<ResumeTemplate> Templates { get; set; }
    }
}
