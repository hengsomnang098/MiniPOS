import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  logging: {
    fetches: {
      fullUrl: true
    }
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    // quality: 60,
    remotePatterns: [
      { protocol: "https", hostname: "techhl.b-cdn.net" },
    ],
    deviceSizes: [64, 128, 256, 512, 1024],
  },

  experimental: {
    optimizeCss: true,
    // serverActions: { bodySizeLimit: "5mb" },
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error"] }
        : false,
    // transformMixedEsModules: true,
  },
};

export default withBundleAnalyzer(nextConfig);
