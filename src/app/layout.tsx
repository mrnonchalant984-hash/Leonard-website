import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "LeonardX | Nigerian Freelancing + AI Platform",
  description:
    "LeonardX connects talented freelancers with ambitious clients and powerful AI tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans")}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
