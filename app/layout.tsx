import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mutfak Savaşları",
  description: "4 kişilik yemek temalı masa oyunu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
