import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalBreadcrumbs } from "@/components/archive/global-breadcrumbs";
import { cn } from "@/lib/utils";

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "أرشيف البرلمان اللبناني",
  description:
    "متصفح أرشيف البرلمان اللبناني للبحث في الجلسات والنواب والحكومات وهيئة المجلس.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        cairo.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <GlobalBreadcrumbs />
        {children}
      </body>
    </html>
  );
}
