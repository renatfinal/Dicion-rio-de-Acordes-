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

const PIANO_AUDIO_FILES = [
  "/audio/piano/A0.mp3",
  "/audio/piano/C1.mp3",
  "/audio/piano/A1.mp3",
  "/audio/piano/C2.mp3",
  "/audio/piano/A2.mp3",
  "/audio/piano/C3.mp3",
  "/audio/piano/A3.mp3",
  "/audio/piano/C4.mp3",
  "/audio/piano/A4.mp3",
  "/audio/piano/C5.mp3",
  "/audio/piano/A5.mp3",
  "/audio/piano/C6.mp3",
  "/audio/piano/A6.mp3",
  "/audio/piano/C7.mp3",
  "/audio/piano/A7.mp3",
];

const GUITAR_AUDIO_FILES = [
  "/audio/violao/E2.mp3",
  "/audio/violao/F2.mp3",
  "/audio/violao/Gb2.mp3",
  "/audio/violao/G2.mp3",
  "/audio/violao/Ab2.mp3",
  "/audio/violao/A2.mp3",
  "/audio/violao/Bb2.mp3",
  "/audio/violao/B2.mp3",
  "/audio/violao/C3.mp3",
  "/audio/violao/Db3.mp3",
  "/audio/violao/D3.mp3",
  "/audio/violao/Eb3.mp3",
  "/audio/violao/E3.mp3",
  "/audio/violao/F3.mp3",
  "/audio/violao/Gb3.mp3",
  "/audio/violao/G3.mp3",
  "/audio/violao/Ab3.mp3",
  "/audio/violao/A3.mp3",
  "/audio/violao/Bb3.mp3",
  "/audio/violao/B3.mp3",
  "/audio/violao/C4.mp3",
  "/audio/violao/Db4.mp3",
  "/audio/violao/D4.mp3",
  "/audio/violao/Eb4.mp3",
  "/audio/violao/E4.mp3",
  "/audio/violao/F4.mp3",
  "/audio/violao/Gb4.mp3",
  "/audio/violao/G4.mp3",
  "/audio/violao/Ab4.mp3",
  "/audio/violao/A4.mp3",
  "/audio/violao/Bb4.mp3",
  "/audio/violao/B4.mp3",
  "/audio/violao/C5.mp3",
  "/audio/violao/Db5.mp3",
  "/audio/violao/D5.mp3",
  "/audio/violao/Eb5.mp3",
  "/audio/violao/E5.mp3",
  "/audio/violao/F5.mp3",
  "/audio/violao/Gb5.mp3",
  "/audio/violao/G5.mp3",
  "/audio/violao/Ab5.mp3",
  "/audio/violao/A5.mp3",
  "/audio/violao/Bb5.mp3",
  "/audio/violao/B5.mp3",
  "/audio/violao/C6.mp3",
];

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
    // Real acoustic audio sample assets for Piano and Violão (CacheFirst)
    {
      matcher: ({ url }) => url.pathname.startsWith("/audio/"),
      handler: new CacheFirst({
        cacheName: "acoustic-instruments-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 120,
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

// Precache essential application shell assets & acoustic audio samples upon installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
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
      }),
      caches.open("acoustic-instruments-cache").then(async (cache) => {
        try {
          await cache.addAll([...PIANO_AUDIO_FILES, ...GUITAR_AUDIO_FILES]);
        } catch (err) {
          console.warn("Audio pre-cache addAll error:", err);
        }
      }),
    ])
  );
});
