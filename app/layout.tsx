import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoanWise — Know your loan eligibility before you apply",
  description: "Get an indicative estimate in minutes, understand what you need, and apply with confidence. A prototype for self-employed business loans.",
};

export const viewport: Viewport = {
  themeColor: "#19635b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
