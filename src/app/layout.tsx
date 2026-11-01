import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyTerra Financial Portal",
  description: "Sistem Informasi Financial Report & Management Arus Kas - PT SkyTerra Nusantara",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
