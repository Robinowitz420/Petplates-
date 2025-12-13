'use client';

import React, { useEffect, useState } from 'react';
import { useVillageStore, useVillageProgress } from '@/lib/state/villageStore';
import VillageBackground from './VillageBackground';
import VillageBuildings from './VillageBuildings';

export interface VillageSceneProps {
  userId?: string;
  className?: string;
}

/**
 * Main village component that renders the entire scene
 * Uses Zustand store for reactive state management
 */
export default function VillageScene({
  userId,
  className = ''
}: VillageSceneProps) {
  const { setUserId, refreshFromLocal } = useVillageStore();
  const { count, level, progress } = useVillageProgress();
  const [activity, setActivity] = useState<'idle' | 'active'>('idle');

  // Get userId from localStorage if not provided
  const getUserId = () => {
    if (userId) return userId;
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('last_user_id') || '';
  };

  useEffect(() => {
    const currentUserId = getUserId();
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, [userId, setUserId]);

  // Alternate between idle and active every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActivity(prev => prev === 'idle' ? 'active' : 'idle');
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (!level) {
    return (
      <div className={`bg-gray-100 rounded-2xl p-8 text-center ${className}`}>
        <p className="text-gray-600">Loading village...</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Village Level Badge */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border-2 border-amber-300">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {level.name} Village
          </div>
          <div className="text-lg font-bold text-gray-900">
            Level {level.id}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {count} ingredient{count !== 1 ? 's' : ''} purchased
          </div>
        </div>
      </div>

      {/* Progress to Next Level */}
      {progress < 10 && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border-2 border-amber-300">
            <div className="text-xs font-semibold text-gray-600 mb-1">
              Progress: {progress}/10
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-[width] duration-500 ease-out will-change-[width]"
                style={{ width: `${(progress / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Village Background */}
      <VillageBackground villageLevel={level} className="h-96" />

      {/* Village Buildings with Mascots */}
      <div className="absolute inset-0 z-10">
        <VillageBuildings
          villageLevel={level}
          activity={activity}
          className="h-full"
        />
      </div>

      {/* Village Description */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border-2 border-amber-300">
          <p className="text-sm text-gray-700 font-medium">
            {level.name} - {level.buildings.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}

