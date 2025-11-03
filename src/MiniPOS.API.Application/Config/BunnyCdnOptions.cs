namespace MiniPOS.API.Application.Config
{
    public class BunnyCdnOptions
    {
        public string StorageZoneName { get; set; } = string.Empty;
        public string AccessKey { get; set; } = string.Empty;
        public string RegionUrl { get; set; } = string.Empty;
        public string CdnBaseUrl { get; set; } = string.Empty;
    }
}