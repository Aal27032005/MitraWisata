import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Izinkan gambar dari Supabase Storage (foto profil & galeri guide)
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      // Naikkan limit payload Server Action dari default 1 MB → 20 MB
      // agar upload foto profil dan galeri tidak dipotong oleh server.
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
