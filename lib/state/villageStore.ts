// lib/state/villageStore.ts
// Zustand store for village state management
// Provides reactive state for village level, purchase count, and mascot activities

import { create } from 'zustand';
import type { VillageLevel } from '../data/villageLevels';
import { VILLAGE_LEVELS, getVillageLevelData } from '../data/villageLevels';
import { getConfirmedCount } from '../utils/purchaseTracking';
import { logger } from '../utils/logger';

type VillageState = {
  userId: string | null;
  count: number;
  level: VillageLevel;
  isLoading: boolean;
  
  // Actions
  setUserId: (id: string) => void;
  refreshFromLocal: () => void;
  setCount: (n: number) => void;
  incrementCount: () => void;
  reset: () => void;
};

/**
 * Village store using Zustand
 * Provides reactive state management for village evolution
 */
export const useVillageStore = create<VillageState>((set, get) => ({
  userId: null,
  count: 0,
  level: VILLAGE_LEVELS[0],
  isLoading: false,

  /**
   * Set user ID and automatically refresh from localStorage
   */
  setUserId: (id: string) => {
    if (!id) {
      set({ userId: null, count: 0, level: VILLAGE_LEVELS[0] });
      return;
    }
    
    set({ userId: id, isLoading: true });
    get().refreshFromLocal();
  },

  /**
   * Refresh village state from localStorage
   * Called automatically when userId changes or after purchases
   */
  refreshFromLocal: () => {
    const { userId } = get();
    if (!userId) {
      set({ count: 0, level: VILLAGE_LEVELS[0], isLoading: false });
      return;
    }

    try {
      const count = getConfirmedCount(userId);
      const level = getVillageLevelData(count);
      set({ count, level, isLoading: false });
    } catch (error) {
      // Handle error gracefully
      logger.error('Failed to refresh village state', error as Error, { userId });
      set({ count: 0, level: VILLAGE_LEVELS[0], isLoading: false });
    }
  },

  /**
   * Set purchase count directly (for testing or manual updates)
   */
  setCount: (n: number) => {
    const count = Math.max(0, n);
    const level = getVillageLevelData(count);
    set({ count, level });
  },

  /**
   * Increment purchase count by 1
   * Useful for testing or manual increments
   */
  incrementCount: () => {
    const { count } = get();
    get().setCount(count + 1);
  },

  /**
   * Reset village state to initial values
   */
  reset: () => {
    set({
      userId: null,
      count: 0,
      level: VILLAGE_LEVELS[0],
      isLoading: false
    });
  }
}));

/**
 * Hook to get current village level
 * Convenience hook for components that only need the level
 */
export function useVillageLevel(): VillageLevel {
  return useVillageStore(state => state.level);
}

/**
 * Hook to get purchase count
 * Convenience hook for components that only need the count
 */
export function usePurchaseCount(): number {
  return useVillageStore(state => state.count);
}

/**
 * Hook to get village progress info
 * Returns count, level, and progress to next level
 */
export function useVillageProgress() {
  const count = useVillageStore(state => state.count);
  const level = useVillageStore(state => state.level);
  const progress = count % 10;
  const nextLevelThreshold = (level.id + 1) * 10;
  const ingredientsRemaining = nextLevelThreshold - count;
  
  return {
    count,
    level,
    progress,
    nextLevelThreshold,
    ingredientsRemaining,
    progressPercent: (progress / 10) * 100
  };
}

