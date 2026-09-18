/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/generate-tickets/**': [
        './node_modules/pdfkit/js/data/**',
        './node_modules/pdfkit/js/font/**',
      ],
    },
  },
};

export default nextConfig;
