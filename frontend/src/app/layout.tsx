import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
