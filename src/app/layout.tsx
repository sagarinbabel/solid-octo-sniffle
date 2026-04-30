import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { AnalysisProvider } from "@/components/AnalysisContext";

export const metadata: Metadata = {
  title: "AI Request Backbone — Kelluu Core AI Architect Prototype",
  description:
    "Prototype internal AI workflow tool: turn messy sales/customer/ops requests into structured, reviewable, auditable work. Built by Sagar Dubey for the Kelluu Core AI Architect application.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AnalysisProvider>
          <AppShell>{children}</AppShell>
        </AnalysisProvider>
      </body>
    </html>
  );
}
