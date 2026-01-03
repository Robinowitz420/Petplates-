'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[PWA] Service workers not supported in this browser.');
      }
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[PWA] Skipping service worker registration in development.');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.debug('[PWA] Service worker registration failed:', err);
      });
  }, []);

  return null;
}
