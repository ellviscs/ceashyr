import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";

export const metadata: Metadata = {
  title: "Ceashyr — Aplikasi Kasir & Stok Kantin KWU HIMATEKPAL ITS",
  description:
    "PWA Kasir sederhana, manajemen katalog produk, pencatatan transaksi otomatis, dan rekap foto laporan kertas (OCR) offline-first.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ceashyr",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#EBF4E8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans min-h-screen bg-ceashyr-mint text-ceashyr-ink antialiased">
        <PwaRegistrar />
        {children}
      </body>
    </html>
  );
}
