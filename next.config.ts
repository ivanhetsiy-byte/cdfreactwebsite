import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // Phone / tunnel hosts hitting this machine's Next dev server.
  allowedDevOrigins: [
    "192.168.50.43",
    "*.trycloudflare.com",
    "*.loca.lt",
  ],
  turbopack: {
    root: projectRoot,
  },
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ["gsap", "motion"],
  },
};

export default nextConfig;
