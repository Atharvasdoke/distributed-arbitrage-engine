import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Precision Arbitrage Engine",
  description: "Distributed E-Commerce Price Arbitrage Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-navy bg-slate">
        {children}
      </body>
    </html>
  );
}
