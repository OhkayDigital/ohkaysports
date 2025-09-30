import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEA Games 2025 Fantasy League",
  description:
    "Proof of concept dashboard connected to Supabase for the SEA Games 2025 Fantasy League.",
  openGraph: {
    title: "SEA Games 2025 Fantasy League",
    description:
      "Fantasy league management dashboard for the 2025 Southeast Asian Games.",
    url: "https://ohkaysports.com",
    siteName: "SEA Games Fantasy League",
    locale: "en_US",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>{children}</body>
    </html>
  );
}
