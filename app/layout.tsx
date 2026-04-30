import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/components/AppStateProvider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Request Backbone",
  description:
    "Internal AI workflow prototype — structured request triage for Kelluu Core AI Architect application (Sagar Dubey).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrains.variable} min-h-screen font-sans antialiased bg-grid`}
      >
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
