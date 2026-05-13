using System.Threading.Tasks;

namespace ExportService.Services
{
    public interface IExportService
    {
        Task<byte[]> ExportResumePdf(int resumeId);
    }
}
