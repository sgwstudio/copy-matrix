import type { NextConfig } from "next";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./lib/env";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // ppr: true,
    reactCompiler: isProd,
  },
  // Ensure Server Actions work properly with Next.js 15
  serverActions: {
    allowedOrigins: ["localhost:3001", "localhost:3000"],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Optimize for faster development
  compiler: {
    removeConsole: isProd,
  },
  // ...
};

export default nextConfig;
