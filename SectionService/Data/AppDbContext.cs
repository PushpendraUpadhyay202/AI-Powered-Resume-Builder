using Microsoft.EntityFrameworkCore;
using SectionService.Models;

namespace SectionService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<ResumeSection> ResumeSections { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Any specific configurations can go here
        }
    }
}
