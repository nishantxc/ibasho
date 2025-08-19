// next.config.ts
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// Wrap with PWA
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // enable only in prod
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // ✅ Supabase images
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // ✅ Google profile pics
      },
    ],
  },
};

// Wrap with PWA first, then Sentry
export default withSentryConfig(
  withPWA(nextConfig),
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
