'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker.
 *
 * It is only registered in a production build. In development the service
 * worker would keep serving the files of an earlier build while Next.js is
 * making new ones, which shows up as changes that do not appear.
 *
 * The worker itself is careful about what it caches - see `public/sw.js` -
 * so nothing that belongs to a user is stored on the device.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('The service worker could not be registered:', error);
      });
    };

    // Registering after the page has loaded keeps the first paint fast.
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
