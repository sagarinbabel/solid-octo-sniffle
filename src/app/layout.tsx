import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Request Triage",
  description: "Role-based internal request triage prototype for sales and software review.",
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
