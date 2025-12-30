// lib/utils/badgeStorage.ts
// Badge storage system for pet achievements

import { PetBadges, PetBadge, BadgeType, BadgeTier } from '@/lib/types/badges';
import { safeGetItem, safeSetItem, safeParseJSON } from './localStorageSafe';
import { logger } from './logger';

const PREFIX = 'pet_badges_';

/**
 * Get storage key for pet badges
 */
function getStorageKey(userId: string, petId: string): string {
  return `${PREFIX}${userId}_${petId}`;
}

/**
 * Load badges for a pet
 */
export function getPetBadges(userId: string, petId: string): PetBadges {
  if (!userId || !petId) {
    return { badges: [] };
  }

  try {
    const key = getStorageKey(userId, petId);
    const stored = safeGetItem(key);
    
    if (!stored) {
      return { badges: [] };
    }

    const parsed = safeParseJSON<PetBadges>(stored, { badges: [] });
    if (parsed && Array.isArray(parsed.badges)) {
      const validTypes = new Set(Object.values(BadgeType));
      return {
        ...parsed,
        badges: parsed.badges.filter((b) => b && validTypes.has(b.type)),
      };
    }

    return { badges: [] };
  } catch (error) {
    logger.error('Failed to load pet badges', error as Error, { userId, petId } as any);
    return { badges: [] };
  }
}

/**
 * Save badges for a pet
 */
export function savePetBadges(userId: string, petId: string, badges: PetBadges): void {
  if (!userId || !petId) {
    logger.warn('Cannot save badges: missing userId or petId', { userId, petId });
    return;
  }

  try {
    const key = getStorageKey(userId, petId);
    badges.lastChecked = new Date().toISOString();
    safeSetItem(key, JSON.stringify(badges));
  } catch (error) {
    logger.error('Failed to save pet badges', error as Error, { userId, petId });
  }
}

/**
 * Check if a badge is unlocked
 */
export function hasBadge(badges: PetBadges, badgeType: BadgeType, tier?: BadgeTier): boolean {
  if (!badges || !badges.badges) {
    return false;
  }

  const badge = badges.badges.find(b => b.type === badgeType);
  
  if (!badge) {
    return false;
  }

  // For progressive badges, check if tier matches or is higher
  if (tier && badge.tier) {
    const tierOrder: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'sultan'];
    const badgeTierIndex = tierOrder.indexOf(badge.tier);
    const requiredTierIndex = tierOrder.indexOf(tier);
    return badgeTierIndex >= requiredTierIndex;
  }

  return true;
}

/**
 * Unlock a badge (idempotent - safe to call multiple times)
 */
export function unlockBadge(
  userId: string,
  petId: string,
  badgeType: BadgeType,
  tier?: BadgeTier
): boolean {
  const badges = getPetBadges(userId, petId);
  
  // Check if already unlocked
  if (hasBadge(badges, badgeType, tier)) {
    return false; // Already unlocked
  }

  // Check if badge exists but needs tier upgrade
  const existingBadge = badges.badges.find(b => b.type === badgeType);
  
  if (existingBadge && tier) {
    // Upgrade tier if new tier is higher
    const tierOrder: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'sultan'];
    const currentTierIndex = tierOrder.indexOf(existingBadge.tier || 'bronze');
    const newTierIndex = tierOrder.indexOf(tier);
    
    if (newTierIndex > currentTierIndex) {
      existingBadge.tier = tier;
      existingBadge.unlockedAt = new Date().toISOString();
      savePetBadges(userId, petId, badges);
      return true; // Tier upgraded
    }
    
    return false; // Already at this tier or higher
  }

  // Create new badge
  const newBadge: PetBadge = {
    type: badgeType,
    tier,
    unlockedAt: new Date().toISOString(),
  };

  badges.badges.push(newBadge);
  savePetBadges(userId, petId, badges);
  return true; // New badge unlocked
}

/**
 * Update progressive badge progress
 */
export function updateBadgeProgress(
  userId: string,
  petId: string,
  badgeType: BadgeType,
  progress: number,
  tier?: BadgeTier
): boolean {
  const badges = getPetBadges(userId, petId);
  const existingBadge = badges.badges.find(b => b.type === badgeType);

  if (existingBadge) {
    // Update existing badge
    existingBadge.progress = progress;
    if (tier) {
      existingBadge.tier = tier;
    }
    existingBadge.unlockedAt = existingBadge.unlockedAt || new Date().toISOString();
    savePetBadges(userId, petId, badges);
    return true;
  } else {
    // Create new badge with progress
    const newBadge: PetBadge = {
      type: badgeType,
      tier,
      progress,
      unlockedAt: new Date().toISOString(),
    };
    badges.badges.push(newBadge);
    savePetBadges(userId, petId, badges);
    return true;
  }
}

/**
 * Get badge by type
 */
export function getBadge(badges: PetBadges, badgeType: BadgeType): PetBadge | null {
  if (!badges || !badges.badges) {
    return null;
  }
  return badges.badges.find(b => b.type === badgeType) || null;
}

/**
 * Remove a badge (for testing/demo purposes)
 */
export function removeBadge(userId: string, petId: string, badgeType: BadgeType): boolean {
  const badges = getPetBadges(userId, petId);
  const index = badges.badges.findIndex(b => b.type === badgeType);
  
  if (index === -1) {
    return false; // Badge not found
  }
  
  badges.badges.splice(index, 1);
  savePetBadges(userId, petId, badges);
  return true; // Badge removed
}

