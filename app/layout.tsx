import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Chord & Harmony Pro',
  description: 'Professional web app with real-time audio and chord dictionary.',
  openGraph: {
    title: 'Chord & Harmony Pro',
    description: 'Professional web app with real-time audio and chord dictionary.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chord & Harmony Pro',
    description: 'Professional web app with real-time audio and chord dictionary.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
