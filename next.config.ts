import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // ❌ não se usa swSrc aqui
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: (() => {
      const patterns = [
        {
          protocol: "https" as const,
          hostname: "*.supabase.co",
          pathname: "/storage/v1/object/public/**",
        },
        {
          protocol: "https" as const,
          hostname: "*.supabase.in",
          pathname: "/storage/v1/object/public/**",
        },
      ];

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        try {
          const { hostname } = new URL(supabaseUrl);
          patterns.unshift({
            protocol: "https" as const,
            hostname,
            pathname: "/storage/v1/object/public/**",
          });
        } catch {
          // ignora formato inválido
        }
      }

      return patterns;
    })(),
  },
};

export default withPWA(nextConfig);
