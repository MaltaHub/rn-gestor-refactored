import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReactQueryProvider } from "../components/react-query-provider";
import { PWARegister } from "../components/pwa-register";
import { FirebaseRegister } from "../components/firebase-register";
import { ThemeProvider } from "@/contexts/theme";
import { ToastProvider } from "@/components/ui/toast";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
    { color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  title: "Gestor de Veículos",
  description: "Sistema de gerenciamento de vitrine e estoque",
  applicationName: "Gestor de Veículos",
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
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <body className="antialiased theme-surface">
        <ThemeProvider defaultMode="light">
          <ToastProvider>
            <ReactQueryProvider>
              {children}
              <PWARegister />
              <FirebaseRegister />
            </ReactQueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
