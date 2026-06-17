import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Run static generation sequentially to prevent overloading Neon's direct connections
    workerThreads: false,
  }
};

export default nextConfig;
