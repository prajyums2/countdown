import type { Metadata } from "next";
import { Nunito, Caveat } from "next/font/google";
import { DevTimeProvider } from "@/lib/dev-time";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Countdown to You ♥",
  description: "A journey of love, milestones, and counting down the moments.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} ${caveat.variable}`}>
      <body className="antialiased font-nunito">
        <DevTimeProvider>{children}</DevTimeProvider>
      </body>
    </html>
  );
}
