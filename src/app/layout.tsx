import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContentHub - Instagram to Blog Platform",
  description: "Turn your Instagram content into a beautiful, SEO-optimized blog automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-white antialiased`}>{children}</body>
    </html>
  );
}