import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Desabilitar otimizacao para permitir IPs privados (Supabase self-hosted)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.242',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
