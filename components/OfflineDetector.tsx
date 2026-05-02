'use client';

import { useState, useEffect } from 'react';

export default function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state without triggering re-render during mount
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check initial state
    if (navigator.onLine !== isOnline) {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center shadow-lg">
      <p className="font-semibold flex items-center justify-center gap-2">
        <span>📡</span>
        Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.
      </p>
    </div>
  );
}
