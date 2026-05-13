using System;
using System.Linq;
using System.Threading.Tasks;
using TemplateService.DTOs;
using TemplateService.Models;
using TemplateService.Repositories;

namespace TemplateService.Services
{
    public class TemplateService : ITemplateService
    {
        private readonly ITemplateRepository _repository;

        public TemplateService(ITemplateRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> CreateTemplate(CreateTemplateDto dto)
        {
            try
            {
                var template = new ResumeTemplate
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    ThumbnailUrl = dto.ThumbnailUrl,
                    HtmlLayout = dto.HtmlLayout,
                    CssStyles = dto.CssStyles,
                    Category = dto.Category,
                    IsPremium = dto.IsPremium,
                    IsActive = true,
                    UsageCount = 0,
                    CreatedAt = DateTime.UtcNow
                };

                await _repository.AddAsync(template);
                await _repository.SaveChangesAsync();

                return new ApiResponse { Success = true, Message = "Template created successfully.", Data = MapToResponse(template) };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error creating template: {ex.Message}" };
            }
        }

        public async Task<object> GetAllTemplates()
        {
            try
            {
                var templates = await _repository.GetAllAsync();
                var activeTemplates = templates.Where(t => t.IsActive).Select(MapToResponse).ToList();
                return new ApiResponse { Success = true, Message = "Templates retrieved.", Data = activeTemplates };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error retrieving templates: {ex.Message}" };
            }
        }

        public async Task<object> GetTemplateById(int id)
        {
            try
            {
                var template = await _repository.GetByIdAsync(id);
                if (template == null || !template.IsActive)
                    return new ApiResponse { Success = false, Message = "Template not found or inactive." };

                return new ApiResponse { Success = true, Message = "Template retrieved.", Data = MapToResponse(template) };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error retrieving template: {ex.Message}" };
            }
        }

        public async Task<object> GetByCategory(string category)
        {
            try
            {
                var templates = await _repository.GetByCategoryAsync(category);
                var activeTemplates = templates.Where(t => t.IsActive).Select(MapToResponse).ToList();
                return new ApiResponse { Success = true, Message = "Templates retrieved.", Data = activeTemplates };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error retrieving templates: {ex.Message}" };
            }
        }

        public async Task<object> GetFreeTemplates()
        {
            try
            {
                var templates = await _repository.GetFreeTemplatesAsync();
                var activeTemplates = templates.Where(t => t.IsActive).Select(MapToResponse).ToList();
                return new ApiResponse { Success = true, Message = "Free templates retrieved.", Data = activeTemplates };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error retrieving templates: {ex.Message}" };
            }
        }

        public async Task<object> GetPremiumTemplates()
        {
            try
            {
                var templates = await _repository.GetPremiumTemplatesAsync();
                var activeTemplates = templates.Where(t => t.IsActive).Select(MapToResponse).ToList();
                return new ApiResponse { Success = true, Message = "Premium templates retrieved.", Data = activeTemplates };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error retrieving templates: {ex.Message}" };
            }
        }

        public async Task<object> GetPopularTemplates()
        {
            try
            {
                var templates = await _repository.GetPopularTemplatesAsync();
                var activeTemplates = templates.Where(t => t.IsActive).Select(MapToResponse).ToList();
                return new ApiResponse { Success = true, Message = "Popular templates retrieved.", Data = activeTemplates };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error retrieving templates: {ex.Message}" };
            }
        }

        public async Task<object> UpdateTemplate(int id, UpdateTemplateDto dto)
        {
            try
            {
                var template = await _repository.GetByIdAsync(id);
                if (template == null)
                    return new ApiResponse { Success = false, Message = "Template not found." };

                template.Name = dto.Name;
                template.Description = dto.Description;
                template.ThumbnailUrl = dto.ThumbnailUrl;
                template.HtmlLayout = dto.HtmlLayout;
                template.CssStyles = dto.CssStyles;
                template.Category = dto.Category;
                template.IsPremium = dto.IsPremium;
                template.IsActive = dto.IsActive;

                await _repository.UpdateAsync(template);
                await _repository.SaveChangesAsync();

                return new ApiResponse { Success = true, Message = "Template updated successfully.", Data = MapToResponse(template) };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error updating template: {ex.Message}" };
            }
        }

        public async Task<object> DeactivateTemplate(int id)
        {
            try
            {
                var template = await _repository.GetByIdAsync(id);
                if (template == null)
                    return new ApiResponse { Success = false, Message = "Template not found." };

                template.IsActive = false;
                await _repository.UpdateAsync(template);
                await _repository.SaveChangesAsync();

                return new ApiResponse { Success = true, Message = "Template deactivated successfully." };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error deactivating template: {ex.Message}" };
            }
        }

        public async Task<object> IncrementUsage(int id)
        {
            try
            {
                var template = await _repository.GetByIdAsync(id);
                if (template == null || !template.IsActive)
                    return new ApiResponse { Success = false, Message = "Template not found or inactive." };

                template.UsageCount += 1;
                await _repository.UpdateAsync(template);
                await _repository.SaveChangesAsync();

                return new ApiResponse { Success = true, Message = "Usage incremented.", Data = MapToResponse(template) };
            }
            catch (Exception ex)
            {
                return new ApiResponse { Success = false, Message = $"Error incrementing usage: {ex.Message}" };
            }
        }

        private TemplateResponseDto MapToResponse(ResumeTemplate template)
        {
            return new TemplateResponseDto
            {
                TemplateId = template.TemplateId,
                Name = template.Name,
                Description = template.Description,
                ThumbnailUrl = template.ThumbnailUrl,
                Category = template.Category,
                IsPremium = template.IsPremium,
                IsActive = template.IsActive,
                UsageCount = template.UsageCount,
                CreatedAt = template.CreatedAt
            };
        }
    }
}
