/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Production optimizations
  swcMinify: true,
  // Ensure dev dependencies don't affect production
  experimental: {
    // Disable development-only features in production
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Environment-specific settings
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
};

export default nextConfig;
