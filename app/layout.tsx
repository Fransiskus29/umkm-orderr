import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PesanUMKM - Platform Pemesanan Online UMKM Kuliner",
  description: "Platform SaaS untuk UMKM kuliner mengelola menu dan pesanan online.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "PesanUMKM" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#EE4D2D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
