import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    // Next.js static assets: scripts, CSS chunks with hashes (CacheFirst)
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: "next-static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 128,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Icons, SVGs, and images
    {
      matcher: ({ url }) => /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: "images-and-icons",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 60 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Manifest & configuration files
    {
      matcher: ({ url }) => /\.(?:json|webmanifest)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: "manifest-data",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 14 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // HTML Navigations (App root / and pages) with fallback to cache
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages-cache",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // General same-origin requests fallback
    {
      matcher: ({ sameOrigin }) => sameOrigin,
      handler: new StaleWhileRevalidate({
        cacheName: "app-general-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 14 * 24 * 60 * 60,
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();

// Precache essential application shell assets upon installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("pages-cache").then(async (cache) => {
      try {
        await cache.addAll([
          "/",
          "/icon.svg",
          "/pwa-192x192.png",
          "/pwa-512x512.png",
          "/pwa-maskable-512x512.png",
          "/apple-touch-icon.png",
        ]);
      } catch (err) {
        console.warn("ServiceWorker pre-cache addAll error:", err);
      }
    })
  );
});
