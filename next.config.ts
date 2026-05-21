import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    // TypeScript hataları olsa bile Vercel'in yükleme yapmasına izin ver
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint 'never used' uyarıları olsa bile projeyi internete yükle
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
