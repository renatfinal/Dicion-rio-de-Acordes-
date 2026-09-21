'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { Download, WifiOff, X, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getServerOnlineSnapshot() {
  return true;
}

function subscribeStandalone(callback: () => void) {
  const mql = window.matchMedia('(display-mode: standalone)');
  mql.addEventListener('change', callback);
  window.addEventListener('appinstalled', callback);
  return () => {
    mql.removeEventListener('change', callback);
    window.removeEventListener('appinstalled', callback);
  };
}

function getStandaloneSnapshot() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getServerStandaloneSnapshot() {
  return false;
}

export function PWAStatus() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot);

  useEffect(() => {
    // Register Service Worker for offline capability
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Service worker updated
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('Registro de Service Worker:', err);
        });
    }
  }, []);

  return (
    <>
      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div
          id="offline-status-banner"
          className="bg-amber-950/80 border-b border-amber-600/40 text-amber-200 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Modo Offline Ativo:</strong> O aplicativo está funcionando sem internet. Todo o dicionário de acordes, escalas e áudio estão salvos em cache.
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/50 text-amber-300">
            Offline 100%
          </span>
        </div>
      )}
    </>
  );
}

// In-App Install Button Component (Mounts in header or controls)
export function PWAInstallButton() {
  const isInstalled = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, getServerStandaloneSnapshot);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (iosDevice) {
      // Defer to event loop to avoid synchronous set state warning
      queueMicrotask(() => setIsIOS(true));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return null; // Already running in standalone mode
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        id="pwa-install-app-btn"
        onClick={handleInstall}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition active:scale-95 shadow-sm"
        title="Instalar aplicativo para uso rápido e offline"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">Instalar</span>
      </button>

      {showIOSGuide && (
        <div
          id="ios-guide-modal-standalone"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
        >
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Instalar no Safari (iOS)</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              1. Toque no botão <Share className="w-3.5 h-3.5 inline text-cyan-400" /> <strong>Compartilhar</strong> no Safari.<br />
              2. Selecione <PlusSquare className="w-3.5 h-3.5 inline text-cyan-400" /> <strong>Adicionar à Tela de Início</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-lg bg-cyan-600 py-2 text-xs font-medium text-white hover:bg-cyan-500 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
