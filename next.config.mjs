/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Production optimizations
  experimental: {
    // Disable development-only features in production
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
};

export default nextConfig;
