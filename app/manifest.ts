import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Chord & Harmony Pro',
    short_name: 'ChordPro',
    description: 'Dicionário de acordes, escalas e campos harmônicos com áudio e funcionamento 100% offline.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0a0f12',
    theme_color: '#0a0f12',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
