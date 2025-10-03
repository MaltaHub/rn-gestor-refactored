import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "../components/react-query-provider";
import { Navbar } from "../components/navbar";  // <-- importa aqui
import { PWARegister } from "../components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeInitializer = `
(() => {
  const applyTheme = () => {
    const now = new Date();
    const hour = now.getHours();
    const isDark = hour >= 18 || hour < 6;
    const root = document.documentElement;
    root.dataset.theme = isDark ? "dark" : "light";
    root.classList.toggle("dark", isDark);
  };

  applyTheme();
  setInterval(applyTheme, 15 * 60 * 1000);
})();
`;

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
      { url: "/icons/favicon.ico", sizes: "192x192", type: "image/png" },
      { url: "/icons/favicon.ico", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/favicon.ico" }],
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased theme-surface`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        <ReactQueryProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-grow theme-surface">{/* Conteúdo principal */}
              {children}
            </main>
            <footer className="mx-auto w-full border-t theme-border theme-surface py-6">
              <div className="mx-auto max-w-6xl px-4 text-center text-sm">
                © {new Date().getFullYear()} Gestor de Veículos
              </div>
            </footer>
          </div>
          <PWARegister />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
