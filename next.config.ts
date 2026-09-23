import type { NextConfig } from "next";

const streamHostname = process.env.BUNNY_STREAM_HOSTNAME as string | undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.aafstories.africa",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      ...(streamHostname
        ? [
            {
              protocol: "https" as const,
              hostname: streamHostname,
            },
            {
              protocol: "https" as const,
              hostname: "*.b-cdn.net",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;