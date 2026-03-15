import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        hostname: "ik.imagekit.io",
        protocol: "https"
      },
      {
        hostname: "i.pinimg.com",
        protocol: "https",
        pathname: "/**"
      },
    ]
  }
};

export default nextConfig;
