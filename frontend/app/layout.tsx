import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import DarkVeil from "@/components/ui/DarkVeil";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walron - Web3 Patreon (Seal + Walrus)",
  description: "Decentralized creator platform with encrypted content (Seal) and distributed storage (Walrus). Built on Sui blockchain.",
  icons: {
    icon: [
      { url: '/walron.JPG' },
      { url: '/walron.JPG', sizes: '32x32', type: 'image/jpeg' },
      { url: '/walron.JPG', sizes: '16x16', type: 'image/jpeg' },
    ],
    apple: '/walron.JPG',
    shortcut: '/walron.JPG',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DarkVeil hueShift={220} speed={0.3} noiseIntensity={0.02} scanlineIntensity={0.05} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
