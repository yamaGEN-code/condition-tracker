import type { Metadata, Viewport } from "next";
import "./globals.css";
import SwRegistration from "@/components/SwRegistration";

export const metadata: Metadata = {
  title: "コンディション管理",
  description: "渓流釣行に向けたコンディション管理アプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "コンディション管理",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full bg-gray-50">
        <SwRegistration />
        {children}
      </body>
    </html>
  );
}
