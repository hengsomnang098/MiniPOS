using Microsoft.AspNetCore.Http;

namespace MiniPOS.API.Application.Contracts
{
    public interface IFileUploadService
    {
         Task<string> UploadToBunnyCdnAsync(IFormFile file, string folder = "uploads");
        Task<bool> DeleteFromBunnyCdnAsync(string fileUrl);
    }
}