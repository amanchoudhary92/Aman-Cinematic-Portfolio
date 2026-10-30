/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
    deviceSizes: [390, 430, 768, 1024, 1366, 1440, 1920],
  },
  async headers() {
    const immutable = "public, max-age=31536000, immutable";
    return [
      { source: "/frames/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/projects/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: immutable }] },
      { source: "/Aman-Resume.pdf", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }] },
    ];
  },
};

export default nextConfig;
