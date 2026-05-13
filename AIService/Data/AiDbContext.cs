using AIService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIService.Data
{
    public class AiDbContext : DbContext
    {
        public AiDbContext(DbContextOptions<AiDbContext> options) : base(options)
        {
        }

        public DbSet<AiRequest> AiRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<AiRequest>()
                .HasKey(a => a.RequestId);
        }
    }
}
