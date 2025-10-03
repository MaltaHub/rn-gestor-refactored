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
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    swSrc: "src/service-worker.ts",
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  i18n: {
    locales: ["en", "pt", "es"], // Idiomas suportados
    defaultLocale: "pt", // Idioma padrão
  },
  images: {
    remotePatterns,
  },
};

export default withPWA(nextConfig);
