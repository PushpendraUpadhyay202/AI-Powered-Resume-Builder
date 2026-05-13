using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using TemplateService.Models;

namespace TemplateService.Data
{
    public static class DbInitializer
    {
        public static void Initialize(TemplateDbContext context)
        {
            Console.WriteLine("--> Checking for templates in database...");
            context.Database.Migrate();

            var count = context.Templates.Count();
            var activeCount = context.Templates.Count(t => t.IsActive);
            Console.WriteLine($"--> Total templates: {count}, Active templates: {activeCount}");

            if (activeCount > 0)
            {
                Console.WriteLine("--> Database already has active templates. Skipping seed.");
                return; // DB has been seeded
            }

            Console.WriteLine("--> Seeding default templates...");
            var templates = new ResumeTemplate[]
            {
                new ResumeTemplate
                {
                    Name = "Professional Minimal",
                    Description = "A clean, minimal design perfect for any industry.",
                    ThumbnailUrl = "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
                    Category = "Professional",
                    IsPremium = false,
                    IsActive = true,
                    HtmlLayout = "<html><body><header><h1>{{resume.title}}</h1><p>{{resume.targetJobTitle}}</p></header><main>{{sections}}</main></body></html>",
                    CssStyles = "body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; } h1 { color: #000; margin: 0; }",
                    CreatedAt = DateTime.UtcNow
                },
                new ResumeTemplate
                {
                    Name = "Creative Modern",
                    Description = "Vibrant and dynamic layout for creative professionals.",
                    ThumbnailUrl = "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=400",
                    Category = "Creative",
                    IsPremium = true,
                    IsActive = true,
                    HtmlLayout = "<html><body><div style='display:flex'><aside style='width:30%'><h1>{{resume.title}}</h1></aside><main>{{sections}}</main></div></body></html>",
                    CssStyles = "body { font-family: 'Outfit', sans-serif; margin: 0; } h1 { color: #4f46e5; }",
                    CreatedAt = DateTime.UtcNow
                },
                new ResumeTemplate
                {
                    Name = "Executive Classic",
                    Description = "Traditional serif-style layout for a prestigious look.",
                    ThumbnailUrl = "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400",
                    Category = "Executive",
                    IsPremium = false,
                    IsActive = true,
                    HtmlLayout = "<html><body><div style='text-align:center'><h1>{{resume.title}}</h1><hr/></div>{{sections}}</body></html>",
                    CssStyles = "body { font-family: 'Georgia', serif; padding: 50px; } h1 { text-transform: uppercase; letter-spacing: 2px; }",
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Templates.AddRange(templates);
            context.SaveChanges();
        }
    }
}
