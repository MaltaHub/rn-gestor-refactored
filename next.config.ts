import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
}) as (config: NextConfig) => NextConfig;

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
