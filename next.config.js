/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only enable static export for mobile/capacitor builds
  output: process.env.IS_CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  turbopack: {},
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
