import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".stitch-build",
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
