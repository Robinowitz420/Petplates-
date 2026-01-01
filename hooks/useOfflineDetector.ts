// hooks/useOfflineDetector.ts
// Hook to detect online/offline status

import { useState, useEffect } from 'react';
import { debugEnabled, debugLog } from '@/lib/utils/debugLog';

export function useOfflineDetector() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (debugEnabled) debugLog('App is online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (debugEnabled) debugLog('App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
}

