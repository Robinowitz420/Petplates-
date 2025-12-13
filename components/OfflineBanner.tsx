// components/OfflineBanner.tsx
// Banner to show when app is offline

'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOfflineDetector } from '@/hooks/useOfflineDetector';

export function OfflineBanner() {
  const { isOffline } = useOfflineDetector();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <WifiOff size={18} />
        <span className="text-sm font-medium">
          You're offline. Changes will sync when you reconnect.
        </span>
      </div>
    </div>
  );
}

export default OfflineBanner;

