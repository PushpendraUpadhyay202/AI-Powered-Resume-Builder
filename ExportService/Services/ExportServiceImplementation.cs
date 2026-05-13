using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ExportService.DTOs;
using System.Linq;

namespace ExportService.Services
{
    public class ExportServiceImplementation : IExportService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ExportServiceImplementation(IHttpClientFactory httpClientFactory, IHttpContextAccessor httpContextAccessor)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<byte[]> ExportResumePdf(int resumeId)
        {
            // 1. Get Token
            var token = GetBearerToken();
            if (string.IsNullOrEmpty(token)) throw new UnauthorizedAccessException("Missing Authorization header");

            // 2. Fetch Resume
            var resumeClient = _httpClientFactory.CreateClient("ResumeService");
            resumeClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            
            var resumeResponse = await resumeClient.GetAsync($"/api/resumes/{resumeId}");
            if (!resumeResponse.IsSuccessStatusCode) throw new Exception("Resume not found");

            var wrappedResume = await resumeResponse.Content.ReadFromJsonAsync<ApiResponse<ResumeDto>>();
            if (wrappedResume?.Data == null) throw new Exception("Resume data is null");
            var resume = wrappedResume.Data;

            // 2b. Fetch Sections
            var sectionClient = _httpClientFactory.CreateClient("SectionService");
            sectionClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var sectionResponse = await sectionClient.GetAsync($"/api/sections/resume/{resumeId}");
            
            var sections = new List<SectionDto>();
            if (sectionResponse.IsSuccessStatusCode)
            {
                var wrappedSections = await sectionResponse.Content.ReadFromJsonAsync<ApiResponse<List<SectionDto>>>();
                if (wrappedSections?.Data != null)
                {
                    sections = wrappedSections.Data;
                }
            }

            // 3. Fetch User Profile
            var authClient = _httpClientFactory.CreateClient("AuthService");
            authClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var authResponse = await authClient.GetAsync("/api/auth/profile");
            
            UserDto? userProfile = null;
            if (authResponse.IsSuccessStatusCode)
            {
                var wrappedUser = await authResponse.Content.ReadFromJsonAsync<ApiResponse<UserDto>>();
                userProfile = wrappedUser?.Data;
            }

            // 4. Template logic (just structural parsing in QuestPDF)
            // Fetch template info if TemplateId > 0
            TemplateResponseDto? template = null;
            if (resume.TemplateId > 0)
            {
                var templateClient = _httpClientFactory.CreateClient("TemplateService");
                var templateResponse = await templateClient.GetAsync($"/api/templates/{resume.TemplateId}");
                if (templateResponse.IsSuccessStatusCode)
                {
                    var wrappedTemplate = await templateResponse.Content.ReadFromJsonAsync<ApiResponse<TemplateResponseDto>>();
                    template = wrappedTemplate?.Data;
                }
            }

            // Generate PDF
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Liberation Sans"));

                    page.Header().Element(c => ComposeHeader(c, resume, sections, userProfile));
                    page.Content().Element(c => ComposeContent(c, resume, sections, template));
                    page.Footer().Element(ComposeFooter);
                });
            });

            return document.GeneratePdf();
        }

        private string GetBearerToken()
        {
            var authHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return authHeader.Substring("Bearer ".Length).Trim();
            }
            return string.Empty;
        }

        private void ComposeHeader(IContainer container, ResumeDto resume, List<SectionDto> sections, UserDto? userProfile)
        {
            var personalInfo = sections.FirstOrDefault(s => s.SectionType == "CUSTOM" && (s.Title == "Contact" || s.Title == "Personal Info" || s.Title == "Custom"));
            
            var name = userProfile?.FullName ?? "N/A"; 
            var email = userProfile?.Email ?? "N/A";
            var phone = userProfile?.PhoneNumber ?? "N/A";

            if (personalInfo != null && !string.IsNullOrWhiteSpace(personalInfo.Content))
            {
                try
                {
                    var doc = JsonDocument.Parse(personalInfo.Content);
                    if (doc.RootElement.TryGetProperty("fullName", out var n)) name = n.GetString() ?? name;
                    if (doc.RootElement.TryGetProperty("email", out var e)) email = e.GetString() ?? email;
                    if (doc.RootElement.TryGetProperty("phone", out var p)) phone = p.GetString() ?? phone;
                }
                catch { }
            }

            container.Background(Colors.Grey.Darken4).Padding(30).Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text(name).FontSize(32).SemiBold().FontColor(Colors.White);
                    column.Item().PaddingTop(5).Text(resume.TargetJobTitle).FontSize(16).FontColor(Colors.Blue.Lighten2);
                });

                row.ConstantItem(200).AlignRight().Column(column =>
                {
                    column.Item().Text(email).FontSize(10).FontColor(Colors.Grey.Lighten2);
                    column.Item().Text(phone).FontSize(10).FontColor(Colors.Grey.Lighten2);
                    column.Item().Text(resume.Language).FontSize(10).FontColor(Colors.Grey.Lighten2);
                });
            });
        }

        private void ComposeContent(IContainer container, ResumeDto resume, List<SectionDto> sections, TemplateResponseDto? template)
        {
            container.PaddingVertical(20).PaddingHorizontal(30).Row(row =>
            {
                // Left Column (Skills, Education, Certifications)
                row.ConstantItem(180).Column(column =>
                {
                    var skillsSection = sections.FirstOrDefault(s => s.SectionType == "SKILLS");
                    if (skillsSection != null && !string.IsNullOrWhiteSpace(skillsSection.Content))
                    {
                        column.Item().PaddingBottom(5).Text("SKILLS").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
                        BuildSkills(column.Item(), skillsSection.Content);
                    }

                    var eduSection = sections.FirstOrDefault(s => s.SectionType == "EDUCATION");
                    if (eduSection != null && !string.IsNullOrWhiteSpace(eduSection.Content))
                    {
                        column.Item().PaddingTop(20).PaddingBottom(5).Text("EDUCATION").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
                        BuildEducation(column.Item(), eduSection.Content);
                    }

                    var certSection = sections.FirstOrDefault(s => s.SectionType == "CERTIFICATIONS");
                    if (certSection != null && !string.IsNullOrWhiteSpace(certSection.Content))
                    {
                        column.Item().PaddingTop(20).PaddingBottom(5).Text("CERTIFICATIONS").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
                        BuildCertifications(column.Item(), certSection.Content);
                    }
                });

                row.ConstantItem(30); // Spacer

                // Right Column (Summary, Experience, Projects)
                row.RelativeItem().Column(column =>
                {
                    var summarySection = sections.FirstOrDefault(s => s.SectionType == "SUMMARY");
                    if (summarySection != null && !string.IsNullOrWhiteSpace(summarySection.Content))
                    {
                        column.Item().PaddingBottom(5).Text("PROFILE").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
                        column.Item().Text(ParseSummary(summarySection.Content)).FontSize(10).FontColor(Colors.Grey.Darken3).LineHeight(1.5f);
                    }

                    var expSection = sections.FirstOrDefault(s => s.SectionType == "EXPERIENCE");
                    if (expSection != null && !string.IsNullOrWhiteSpace(expSection.Content))
                    {
                        column.Item().PaddingTop(20).PaddingBottom(5).Text("EXPERIENCE").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
                        BuildExperience(column.Item(), expSection.Content);
                    }

                    var projSection = sections.FirstOrDefault(s => s.SectionType == "PROJECTS");
                    if (projSection != null && !string.IsNullOrWhiteSpace(projSection.Content))
                    {
                        column.Item().PaddingTop(20).PaddingBottom(5).Text("PROJECTS").FontSize(14).SemiBold().FontColor(Colors.Blue.Darken2);
                        BuildProjects(column.Item(), projSection.Content);
                    }
                });
            });
        }

        private string ParseSummary(string jsonContent)
        {
            try
            {
                var doc = JsonDocument.Parse(jsonContent);
                if (doc.RootElement.TryGetProperty("summary", out var summaryElement))
                {
                    return summaryElement.GetString() ?? string.Empty;
                }
                return doc.RootElement.ToString();
            }
            catch
            {
                return jsonContent;
            }
        }

        private void BuildExperience(IContainer container, string jsonContent)
        {
            try
            {
                var doc = JsonDocument.Parse(jsonContent);
                container.Column(col =>
                {
                    col.Spacing(15);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in doc.RootElement.EnumerateArray())
                        {
                            var company = item.TryGetProperty("company", out var c) ? c.GetString() : "Company";
                            var title = item.TryGetProperty("title", out var t) ? t.GetString() : "Title";
                            var dates = item.TryGetProperty("dates", out var d) ? d.GetString() : "";
                            var desc = item.TryGetProperty("description", out var de) ? de.GetString() : "";

                            col.Item().Column(jobCol =>
                            {
                                jobCol.Item().Row(r =>
                                {
                                    r.RelativeItem().Text(title).FontSize(12).SemiBold().FontColor(Colors.Black);
                                    r.ConstantItem(100).AlignRight().Text(dates).FontSize(10).FontColor(Colors.Blue.Darken1);
                                });
                                jobCol.Item().Text(company).FontSize(11).SemiBold().FontColor(Colors.Grey.Darken2);
                                if (!string.IsNullOrEmpty(desc))
                                {
                                    jobCol.Item().PaddingTop(4).Text(desc).FontSize(10).FontColor(Colors.Grey.Darken3).LineHeight(1.4f);
                                }
                            });
                        }
                    }
                    else
                    {
                        col.Item().Text(jsonContent);
                    }
                });
            }
            catch
            {
                container.Text(jsonContent);
            }
        }

        private void BuildProjects(IContainer container, string jsonContent)
        {
            try
            {
                var doc = JsonDocument.Parse(jsonContent);
                container.Column(col =>
                {
                    col.Spacing(12);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in doc.RootElement.EnumerateArray())
                        {
                            var title = item.TryGetProperty("title", out var t) ? t.GetString() : "Project Title";
                            var tech = item.TryGetProperty("technologies", out var tc) ? tc.GetString() : "";
                            var desc = item.TryGetProperty("description", out var de) ? de.GetString() : "";

                            col.Item().Column(projCol =>
                            {
                                projCol.Item().Row(r =>
                                {
                                    r.RelativeItem().Text(title).FontSize(12).SemiBold().FontColor(Colors.Black);
                                });
                                if (!string.IsNullOrEmpty(tech))
                                {
                                    projCol.Item().Text(tech).FontSize(10).Italic().FontColor(Colors.Blue.Darken1);
                                }
                                if (!string.IsNullOrEmpty(desc))
                                {
                                    projCol.Item().PaddingTop(4).Text(desc).FontSize(10).FontColor(Colors.Grey.Darken3).LineHeight(1.4f);
                                }
                            });
                        }
                    }
                    else
                    {
                        col.Item().Text(jsonContent);
                    }
                });
            }
            catch
            {
                container.Text(jsonContent);
            }
        }

        private void BuildEducation(IContainer container, string jsonContent)
        {
            try
            {
                var doc = JsonDocument.Parse(jsonContent);
                container.Column(col =>
                {
                    col.Spacing(10);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in doc.RootElement.EnumerateArray())
                        {
                            var school = item.TryGetProperty("school", out var s) ? s.GetString() : "School";
                            var degree = item.TryGetProperty("degree", out var d) ? d.GetString() : "Degree";
                            var year = item.TryGetProperty("year", out var y) ? y.GetString() : "";

                            col.Item().Column(eduCol =>
                            {
                                eduCol.Item().Text(degree).FontSize(11).SemiBold().FontColor(Colors.Black);
                                eduCol.Item().Text(school).FontSize(10).FontColor(Colors.Grey.Darken2);
                                if (!string.IsNullOrEmpty(year)) eduCol.Item().Text(year).FontSize(10).FontColor(Colors.Blue.Darken1);
                            });
                        }
                    }
                    else
                    {
                        col.Item().Text(jsonContent);
                    }
                });
            }
            catch
            {
                container.Text(jsonContent);
            }
        }

        private void BuildSkills(IContainer container, string jsonContent)
        {
            try
            {
                var doc = JsonDocument.Parse(jsonContent);
                container.Column(col =>
                {
                    col.Spacing(4);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in doc.RootElement.EnumerateArray())
                        {
                            col.Item().Text(item.GetString()).FontSize(10).FontColor(Colors.Grey.Darken3);
                        }
                    }
                    else if (doc.RootElement.ValueKind == JsonValueKind.Object && doc.RootElement.TryGetProperty("skills", out var skills))
                    {
                        foreach (var item in skills.EnumerateArray())
                        {
                            col.Item().Text(item.GetString()).FontSize(10).FontColor(Colors.Grey.Darken3);
                        }
                    }
                    else
                    {
                        col.Item().Text(jsonContent);
                    }
                });
            }
            catch
            {
                container.Text(jsonContent);
            }
        }

        private void BuildCertifications(IContainer container, string jsonContent)
        {
            try
            {
                var doc = JsonDocument.Parse(jsonContent);
                container.Column(col =>
                {
                    col.Spacing(6);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in doc.RootElement.EnumerateArray())
                        {
                            var title = item.TryGetProperty("title", out var t) ? t.GetString() : "Certification";
                            var issuer = item.TryGetProperty("issuer", out var i) ? i.GetString() : "";
                            
                            col.Item().Column(cCol =>
                            {
                                cCol.Item().Text(title).FontSize(10).SemiBold().FontColor(Colors.Black);
                                if (!string.IsNullOrEmpty(issuer)) cCol.Item().Text(issuer).FontSize(9).FontColor(Colors.Grey.Darken2);
                            });
                        }
                    }
                    else
                    {
                        col.Item().Text(jsonContent);
                    }
                });
            }
            catch
            {
                container.Text(jsonContent);
            }
        }

        private void ComposeFooter(IContainer container)
        {
            container.PaddingHorizontal(30).PaddingBottom(20).AlignRight().Text(x =>
            {
                x.Span("Page ").FontSize(8).FontColor(Colors.Grey.Lighten1);
                x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Lighten1);
                x.Span(" / ").FontSize(8).FontColor(Colors.Grey.Lighten1);
                x.TotalPages().FontSize(8).FontColor(Colors.Grey.Lighten1);
            });
        }
    }
}
