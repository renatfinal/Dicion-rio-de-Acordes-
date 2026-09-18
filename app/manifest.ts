import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chord & Harmony Pro',
    short_name: 'ChordPro',
    description: 'Professional web app with real-time audio and chord dictionary',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1a1f',
    theme_color: '#0f1a1f',
    icons: [
      {
        src: 'https://picsum.photos/seed/chordpro192/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/chordpro512/512/512',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  };
}
