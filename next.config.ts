import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@noble/curves", "@noble/ciphers"],
  typescript: { ignoreBuildErrors: true },
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "i.pinimg.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
