/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Batas upload file transaksi (Bulk Upload) = 2 MB + ruang untuk metadata form
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
