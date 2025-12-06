'use client';

import React, { useEffect, useState } from 'react';
import { Construction, Sparkles, ShoppingCart } from 'lucide-react';
import { getPurchaseStats } from '@/lib/utils/purchaseTracking';
import { useVillageStore, useVillageProgress } from '@/lib/state/villageStore';

interface VillagePlaceholderProps {
  className?: string;
  userId?: string;
}

export default function VillagePlaceholder({ className = '', userId }: VillagePlaceholderProps) {
  const { setUserId, refreshFromLocal } = useVillageStore();
  const { count, level, progress, nextLevelThreshold, ingredientsRemaining, progressPercent } = useVillageProgress();
  const [isClient, setIsClient] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Only access localStorage on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const id = userId || (typeof window !== 'undefined' ? localStorage.getItem('last_user_id') || '' : '');
    setCurrentUserId(id);
    if (id) {
      setUserId(id);
    }
  }, [userId, setUserId]);

  // Get stats only on client
  const stats = isClient && currentUserId ? getPurchaseStats(currentUserId) : null;

  return (
    <div className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-200 p-8 ${className}`}>
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative">
          <Construction size={64} className="text-amber-600 animate-pulse" />
          <Sparkles 
            size={32} 
            className="absolute -top-2 -right-2 text-yellow-400 animate-spin" 
            style={{ animationDuration: '3s' }}
          />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {level ? `${level.name} Village` : 'Mascot Village Coming Soon!'}
          </h3>
          <p className="text-gray-700 max-w-md">
            {level 
              ? `${level.name} - ${level.buildings.join(', ')}`
              : 'Watch your village grow as you purchase ingredients! The more you shop, the more your mascots\' village evolves.'
            }
          </p>
        </div>

        {/* Purchase Stats - Only render on client to prevent hydration mismatch */}
        {isClient && currentUserId && (
          <div className="mt-4 w-full max-w-md space-y-3">
            <div className="p-4 bg-white/60 rounded-lg border border-amber-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingCart size={20} className="text-amber-600" />
                <span className="text-lg font-bold text-gray-900">
                  {count} Ingredient{count !== 1 ? 's' : ''} Purchased
                </span>
              </div>
              {stats && stats.pendingPurchases > 0 && (
                <p className="text-sm text-amber-700">
                  {stats.pendingPurchases} pending confirmation
                </p>
              )}
            </div>

            {/* Progress to Next Level */}
            {ingredientsRemaining > 0 && ingredientsRemaining <= 10 && (
              <div className="p-4 bg-white/60 rounded-lg border border-amber-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Progress to Next Level: {progress}/10
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {ingredientsRemaining} more ingredient{ingredientsRemaining !== 1 ? 's' : ''} to unlock the next level!
                </p>
              </div>
            )}

            {ingredientsRemaining === 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900">
                  🎉 Maximum level reached! Your village is complete!
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-white/60 rounded-lg border border-amber-200">
          <p className="text-sm text-gray-600">
            <strong>How it works:</strong> Each ingredient purchase helps build the village. 
            Purchase 10 ingredients to unlock the next level!
          </p>
        </div>
      </div>
    </div>
  );
}

