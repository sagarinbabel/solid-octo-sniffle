import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Request Backbone",
  description: "Kelluu Core AI Architect prototype for structured internal AI request triage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
