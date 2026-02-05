import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "../components/pwa-register";
import { TopBar } from "../components/TopBar";
import { TopLogo } from "../components/TopLogo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0b0b",
};

export const metadata: Metadata = {
  title: "Gestor WebApp",
  description: "WebApp em tela cheia para acesso direto ao AppScript.",
  applicationName: "Gestor WebApp",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/favicon.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gestor",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-layout">
          <TopLogo />
          <TopBar />
          <div className="app-content">{children}</div>
        </div>
        <PWARegister />
      </body>
    </html>
  );
}
