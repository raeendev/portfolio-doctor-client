import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  port: 3001,
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'lucide-react'],
  },
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  output: 'standalone',
  poweredByHeader: false,
};

export default nextConfig;
