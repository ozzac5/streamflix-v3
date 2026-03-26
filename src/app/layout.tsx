import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StreamFlix - شاهد الأفلام والمسلسلات أونلاين",
  description: "أفضل منصة لمشاهدة الأفلام والمسلسلات والقنوات التلفزيونية مباشرة",
  keywords: ["StreamFlix", "أفلام", "مسلسلات", "بث مباشر", "قنوات", "مشاهدة أونلاين"],
  authors: [{ name: "StreamFlix Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "StreamFlix - شاهد الأفلام والمسلسلات",
    description: "أفضل منصة لمشاهدة الأفلام والمسلسلات أونلاين",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
