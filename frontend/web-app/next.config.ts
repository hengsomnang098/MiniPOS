import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true", // Only runs when you enable it
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "techhl.b-cdn.net",
      },
    ],
  },
  // You can re-enable this logging later if needed
  // logging: {
  //   fetches: { fullUrl: true },
  // },
};

export default withBundleAnalyzer(nextConfig);
