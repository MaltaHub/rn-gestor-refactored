import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gestor de Veículos",
    short_name: "Gestor",
    description: "Gerencie o estoque e a vitrine de veículos em qualquer dispositivo.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0ea5e9",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/favicon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/favicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
