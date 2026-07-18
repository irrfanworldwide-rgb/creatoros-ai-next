import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SessionProvider } from "@/contexts/SessionContext";
import { ToastProvider } from "@/contexts/ToastContext";
import AppBoot from "@/components/AppBoot";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://creator-os-ai-kohl.vercel.app";

// Ported from the original <head> meta tags.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CreatorOS AI — AI Content Creation Platform",
    template: "%s — CreatorOS AI",
  },
  description:
    "CreatorOS AI — Generate viral hooks, scripts, captions, hashtags and more. Premium AI tools for content creators.",
  keywords:
    "CreatorOS AI, AI Script Writer, Hook Generator, Caption Generator, Free AI Writing Tool",
  robots: "index, follow",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CreatorOS AI — AI Content Creation Platform",
    description: "Generate viral content in seconds with AI.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AppBoot>
          <SessionProvider>
            <ToastProvider>{children}</ToastProvider>
          </SessionProvider>
        </AppBoot>
      </body>
    </html>
  );
}
