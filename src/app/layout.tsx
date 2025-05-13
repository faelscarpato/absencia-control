import "@/styles/globals.css";
import React from "react";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Controle de Absenteísmo",
    template: "%s | Controle de Absenteísmo",
  },
  description: "Sistema de controle de absenteísmo para empresas",
  applicationName: "Controle de Absenteísmo",
  keywords: ["absenteísmo", "controle", "funcionários", "dashboard", "relatórios"],
  authors: [{ name: "Controle de Absenteísmo Team" }],
  creator: "Controle de Absenteísmo Team",
  publisher: "Controle de Absenteísmo Team",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Controle de Absenteísmo",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
