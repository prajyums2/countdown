import type { Metadata, Viewport } from "next";
import { Nunito, Caveat } from "next/font/google";
import { DevTimeProvider } from "@/lib/dev-time";
import ProfileGate from "@/components/ProfileGate";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import { ToastProvider } from "@/components/Toast";
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
  title: "Countdown to Meghs ♥",
  description: "A journey of love, milestones, and counting down the moments.",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F9A8D4",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} ${caveat.variable}`}>
      <body className="antialiased font-nunito">
        <ServiceWorkerRegister />
        <ToastProvider>
          <DevTimeProvider>
            <ProfileGate>{children}</ProfileGate>
          </DevTimeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
