import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Nunito, Comfortaa } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { PageLoader } from "@/components/PageLoader";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FairyTaleAI — Personalized Stories in Your Voice",
  description:
    "Create personalized audio fairy tales for your child, narrated in your own cloned voice. Make magical stories in minutes.",
  keywords: ["fairy tales", "stories", "kids", "parents", "AI", "voice cloning", "bedtime stories"],
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/favicon.svg?v=2",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HYJRPS6YKK"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HYJRPS6YKK');
            `,
          }}
        />
      </head>
      <body className={`${nunito.variable} ${comfortaa.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
