import { CacheFirst, NetworkFirst, Serwist, StaleWhileRevalidate, type SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (string | { url: string; revision?: string })[];
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher({ request, sameOrigin }) {
        return sameOrigin && request.mode === "navigate";
      },
      handler: new NetworkFirst({ cacheName: "pages" }),
    },
    {
      matcher({ request, sameOrigin }) {
        return sameOrigin && (request.destination === "script" || request.destination === "style");
      },
      handler: new StaleWhileRevalidate({ cacheName: "assets" }),
    },
    {
      matcher({ request, sameOrigin }) {
        return sameOrigin && request.destination === "image";
      },
      handler: new CacheFirst({ cacheName: "images" }),
    },
    {
      matcher({ request, sameOrigin }) {
        return sameOrigin && request.destination === "font";
      },
      handler: new CacheFirst({ cacheName: "fonts" }),
    },
    {
      matcher({ request }) {
        return request.url.includes("script.google.com");
      },
      handler: new NetworkFirst({ cacheName: "api-data" }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
