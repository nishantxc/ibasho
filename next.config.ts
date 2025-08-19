// next.config.js or next.config.ts
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // only enable in prod
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // ✅ covers Supabase storage
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // ✅ Google profile images
      },
    ],
  },
};

export default withSentryConfig(
  withPWA(nextConfig), // 👈 wrap BOTH together
  {
    org: "sunfocus-a6",
    project: "javascript-nextjs",
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);
