import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FirebaseProvider } from "@/components/providers/firebase-provider";
import { LayoutContent } from "@/components/layout/layout-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cisem Öğrenci Takip",
    template: "%s | Cisem Öğrenci Takip",
  },
  description: "Dil kursu öğrenci kayıt, kurs yönetimi ve ödeme takip sistemi. Modern, güvenli ve kullanımı kolay.",
  keywords: ["dil kursu", "öğrenci takip", "kurs yönetimi", "ödeme takip", "yoklama sistemi"],
  authors: [{ name: "Cisem Dil Kursu" }],
  creator: "Cisem Dil Kursu",
  robots: {
    index: false, // Private app - don't index
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Cisem Öğrenci Takip",
    title: "Cisem Öğrenci Takip Sistemi",
    description: "Dil kursu öğrenci kayıt, kurs yönetimi ve ödeme takip sistemi.",
  },
  twitter: {
    card: "summary",
    title: "Cisem Öğrenci Takip",
    description: "Dil kursu öğrenci takip sistemi",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FirebaseProvider>
          <LayoutContent>{children}</LayoutContent>
        </FirebaseProvider>
      </body>
    </html>
  );
}
