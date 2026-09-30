import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/common/Providers";

export const metadata: Metadata = {
  title: "JanSetu AI — Multilingual Citizen Civic Intelligence & Priority System",
  description: "Converts multilingual citizen voice and text feedback into structured development needs and transparent, explainable infrastructure priorities for governance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
