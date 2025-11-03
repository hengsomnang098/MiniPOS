using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.Config;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace MiniPOS.API.Application.Repository
{
    public class BunnyCdnService : IFileUploadService
    {
        private readonly HttpClient _httpClient;
        private readonly BunnyCdnOptions _options;

        public BunnyCdnService(HttpClient httpClient, BunnyCdnOptions options)
        {
            _httpClient = httpClient;
            _options = options;
        }

        public async Task<string> UploadToBunnyCdnAsync(IFormFile file, string folder = "uploads")
        {
            // Generate unique file name
            var fileExtension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var uploadUrl = $"{_options.RegionUrl}/{_options.StorageZoneName}/{folder}/{fileName}";

            // Check if file is an image for optimization
            if (file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                using var image = await Image.LoadAsync(file.OpenReadStream());

                // Resize if width exceeds 1920px (maintains aspect ratio)
                const int maxWidth = 1920;
                if (image.Width > maxWidth)
                {
                    var ratio = (double)maxWidth / image.Width;
                    var newHeight = (int)(image.Height * ratio);
                    image.Mutate(x => x.Resize(maxWidth, newHeight));
                }

                // Compress to JPEG (you can tune quality)
                var encoder = new JpegEncoder { Quality = 80 };

                await using var memoryStream = new MemoryStream();
                await image.SaveAsync(memoryStream, encoder);
                memoryStream.Position = 0;

                var request = new HttpRequestMessage(HttpMethod.Put, uploadUrl);
                request.Headers.Add("AccessKey", _options.AccessKey);
                request.Content = new StreamContent(memoryStream);
                request.Content.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                return $"{_options.CdnBaseUrl}/{folder}/{fileName}";
            }
            else
            {
                // Not an image → upload as-is
                using var fileStream = file.OpenReadStream();
                var request = new HttpRequestMessage(HttpMethod.Put, uploadUrl);
                request.Headers.Add("AccessKey", _options.AccessKey);
                request.Content = new StreamContent(fileStream);
                request.Content.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                return $"{_options.CdnBaseUrl}/{folder}/{fileName}";
            }
        }

        public async Task<bool> DeleteFromBunnyCdnAsync(string fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return false;

            try
            {
                var uri = new Uri(fileUrl);
                var relativePath = uri.AbsolutePath.TrimStart('/');
                var deleteUrl = $"{_options.RegionUrl}/{_options.StorageZoneName}/{relativePath}";

                var request = new HttpRequestMessage(HttpMethod.Delete, deleteUrl);
                request.Headers.Add("AccessKey", _options.AccessKey);

                var response = await _httpClient.SendAsync(request);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BunnyCDN] Delete failed: {ex.Message}");
                return false;
            }
        }
    }
}
