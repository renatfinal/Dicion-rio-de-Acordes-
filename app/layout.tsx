import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles
import { PWAStatus } from '@/components/PWAStatus';

export const viewport: Viewport = {
  themeColor: '#0a0f12',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Chord & Harmony Pro',
  description: 'Dicionário completo de acordes, escalas e harmonia funcional com áudio e suporte 100% offline.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ChordPro',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Chord & Harmony Pro',
    description: 'Dicionário de acordes, escalas e harmonia funcional com áudio e suporte offline.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chord & Harmony Pro',
    description: 'Dicionário de acordes, escalas e harmonia funcional com áudio e suporte offline.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-[#0a0f12] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <PWAStatus />
        {children}
      </body>
    </html>
  );
}
