import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  
  reactCompiler: true,
    images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.hamiltonliquor.shop" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
