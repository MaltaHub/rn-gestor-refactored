import type { NextConfig } from "next";
import withPWAInit from "next-pwa";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const remotePatterns = (() => {
  if (!supabaseUrl) return [];
  try {
    const { hostname } = new URL(supabaseUrl);
    return [
      {
        protocol: "https" as const,
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
})();


const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // ❌ não se usa swSrc aqui
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
