import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { clsx } from "clsx";
import { Plus_Jakarta_Sans } from "next/font/google";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: {
    default: "Gestor Automotivo",
    template: "%s | Gestor Automotivo"
  },
  description: "Interface simplificada e declarativa para gestão automotiva."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={clsx("min-h-screen bg-slate-950 text-slate-100 antialiased", fontSans.variable, "font-sans")}>
        {children}
      </body>
    </html>
  );
}
