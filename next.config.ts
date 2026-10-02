import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/save-the-moon-base",
  assetPrefix: "/save-the-moon-base/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
