import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PesanUMKM - Platform Pemesanan Online UMKM Kuliner",
  description: "Platform SaaS untuk UMKM kuliner mengelola menu dan pesanan online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
