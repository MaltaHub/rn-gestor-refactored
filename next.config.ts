import type { NextConfig } from "next";

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

export default nextConfig;
