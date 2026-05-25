import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Countdown to Meghs ♥",
    short_name: "Countdown",
    description: "A journey of love, milestones, and counting down the moments.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFBF7",
    theme_color: "#F9A8D4",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
