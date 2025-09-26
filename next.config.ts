import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  i18n: {
    locales: ["en", "pt", "es"], // Idiomas suportados
    defaultLocale: "pt", // Idioma padrão
  },
};

export default nextConfig;
