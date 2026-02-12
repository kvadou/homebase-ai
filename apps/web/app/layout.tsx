import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { CapacitorProvider } from "@/components/capacitor-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0A2E4D",
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "HomeBase AI — Your Intelligent Home Management Platform",
  description:
    "Scan, identify, and manage everything in your home with AI-powered assistance. Track appliances, access manuals, schedule maintenance, and connect with service providers.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HomeBase AI",
  },
  openGraph: {
    title: "HomeBase AI — Your Intelligent Home Management Platform",
    description:
      "Scan, identify, and manage everything in your home with AI-powered assistance.",
    url: "https://homebase-ai-omega.vercel.app",
    siteName: "HomeBase AI",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        >
          <CapacitorProvider>
            <Toaster>{children}</Toaster>
          </CapacitorProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
