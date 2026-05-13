using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SectionService.Models;
using SectionService.Repositories;

namespace SectionService.Services
{
    public class SectionService : ISectionService
    {
        private readonly ISectionRepository _repository;
        
        private readonly string[] ValidSectionTypes = new[] 
        { 
            "SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS", 
            "CERTIFICATIONS", "PROJECTS", "LANGUAGES", "VOLUNTEER", "CUSTOM" 
        };

        public SectionService(ISectionRepository repository)
        {
            _repository = repository;
        }

        public async Task<ResumeSection> AddSection(ResumeSection section)
        {
            if (string.IsNullOrEmpty(section.SectionType) || !ValidSectionTypes.Contains(section.SectionType.ToUpperInvariant()))
            {
                throw new ArgumentException("Invalid SectionType.");
            }

            section.SectionType = section.SectionType.ToUpperInvariant();
            section.CreatedAt = DateTime.UtcNow;
            section.UpdatedAt = DateTime.UtcNow;
            section.IsVisible = true;
            section.AiGenerated = false;

            // Calculate DisplayOrder
            var existingSections = await _repository.FindByResumeId(section.ResumeId);
            section.DisplayOrder = existingSections.Any() ? existingSections.Max(s => s.DisplayOrder) + 1 : 1;

            return await _repository.Add(section);
        }

        public async Task<List<ResumeSection>> GetSectionsByResume(int resumeId)
        {
            return await _repository.FindByResumeIdOrderByDisplayOrder(resumeId);
        }

        public async Task<ResumeSection?> GetSectionById(int id)
        {
            return await _repository.FindBySectionId(id);
        }

        public async Task<ResumeSection> UpdateSection(int id, ResumeSection section)
        {
            var existingSection = await _repository.FindBySectionId(id);
            if (existingSection == null)
            {
                throw new KeyNotFoundException("Section not found.");
            }

            if (section.SectionType != null && !ValidSectionTypes.Contains(section.SectionType.ToUpperInvariant()))
            {
                throw new ArgumentException("Invalid SectionType.");
            }

            if (section.SectionType != null)
            {
                existingSection.SectionType = section.SectionType.ToUpperInvariant();
            }
            
            existingSection.Title = section.Title ?? existingSection.Title;
            existingSection.Content = section.Content ?? existingSection.Content;
            existingSection.UpdatedAt = DateTime.UtcNow;
            // DisplayOrder, AiGenerated, IsVisible are handled separately or directly updated if needed, 
            // but usually UpdateSection is for content. Let's allow updating them if passed explicitly?
            // The prompt says: "Update Title, Content, etc. Update UpdatedAt". Let's just update common fields.

            return await _repository.Update(existingSection);
        }

        public async Task<bool> DeleteSection(int id)
        {
            var existingSection = await _repository.FindBySectionId(id);
            if (existingSection == null) return false;

            await _repository.DeleteBySectionId(id);
            return true;
        }

        public async Task<bool> ReorderSections(int resumeId, List<int> orderedSectionIds)
        {
            var sections = await _repository.FindByResumeId(resumeId);
            
            // Validate all section IDs belong to given ResumeId
            var existingIds = sections.Select(s => s.SectionId).ToHashSet();
            if (orderedSectionIds.Any(id => !existingIds.Contains(id)))
            {
                throw new ArgumentException("One or more section IDs do not belong to the specified ResumeId.");
            }

            // Update DisplayOrder sequentially starting from 1
            int order = 1;
            var updatedSections = new List<ResumeSection>();
            
            foreach (var id in orderedSectionIds)
            {
                var section = sections.First(s => s.SectionId == id);
                if (section.DisplayOrder != order)
                {
                    section.DisplayOrder = order;
                    section.UpdatedAt = DateTime.UtcNow;
                    updatedSections.Add(section);
                }
                order++;
            }

            if (updatedSections.Any())
            {
                await _repository.UpdateRange(updatedSections);
            }

            return true;
        }

        public async Task<bool> ToggleVisibility(int sectionId)
        {
            var section = await _repository.FindBySectionId(sectionId);
            if (section == null) return false;

            section.IsVisible = !section.IsVisible;
            section.UpdatedAt = DateTime.UtcNow;
            await _repository.Update(section);
            return true;
        }

        public async Task<bool> DeleteAllSections(int resumeId)
        {
            await _repository.DeleteByResumeId(resumeId);
            return true;
        }

        public async Task<List<ResumeSection>> GetSectionsByType(int resumeId, string type)
        {
            if (string.IsNullOrWhiteSpace(type)) return new List<ResumeSection>();
            return await _repository.FindByResumeIdAndSectionType(resumeId, type.ToUpperInvariant());
        }

        public async Task<bool> BulkUpdateSections(int resumeId, List<ResumeSection> sections)
        {
            var existingSections = await _repository.FindByResumeId(resumeId);
            var existingDict = existingSections.ToDictionary(s => s.SectionId);

            var updatedSections = new List<ResumeSection>();

            foreach (var update in sections)
            {
                if (existingDict.TryGetValue(update.SectionId, out var existingSection))
                {
                    existingSection.Title = update.Title ?? existingSection.Title;
                    existingSection.Content = update.Content ?? existingSection.Content;
                    existingSection.IsVisible = update.IsVisible;
                    existingSection.DisplayOrder = update.DisplayOrder;
                    existingSection.UpdatedAt = DateTime.UtcNow;
                    updatedSections.Add(existingSection);
                }
            }

            if (updatedSections.Any())
            {
                await _repository.UpdateRange(updatedSections);
            }

            return true;
        }
    }
}
