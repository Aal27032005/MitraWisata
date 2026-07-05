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
      // Naikkan limit payload Server Action → 50 MB
      // agar multi-upload foto utama + galeri resolusi tinggi tidak terpotong.
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
