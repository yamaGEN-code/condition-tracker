'use client';

import { useEffect } from 'react';

export default function SwRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshed = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshed) return;
      refreshed = true;
      window.location.reload();
    });

    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          reg.update().catch(() => {});
        }
      });
    }).catch(() => {});
  }, []);
  return null;
}
