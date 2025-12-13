// lib/data/badgeDefinitions.ts
// Badge metadata definitions

import { BadgeType, BadgeTier } from '@/lib/types/badges';

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  category: string;
  iconPath: string; // Base path, will be extended with tier for progressive badges
  designDescription: string;
  isProgressive: boolean;
  tiers?: BadgeTierDefinition[];
}

export interface BadgeTierDefinition {
  tier: BadgeTier;
  name: string;
  threshold: number;
  iconPath: string;
  designDescription: string;
}

/**
 * Badge definitions with metadata
 */
export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  [BadgeType.NUTRIENT_NAVIGATOR]: {
    type: BadgeType.NUTRIENT_NAVIGATOR,
    name: 'Perfect Match',
    description: 'Earned when you hit a 100% compatibility score.',
    category: 'The Quality Match',
    iconPath: '/images/ElvenBadges/bowl2-removebg-preview.png',
    designDescription: 'Bowl accessory - Perfect Match for 100% compatibility.',
    isProgressive: false,
  },

  [BadgeType.MASTER_MEAL_PLANNER]: {
    type: BadgeType.MASTER_MEAL_PLANNER,
    name: 'Feast Architect',
    description: 'Unlocked by building a layered or multi‑step meal plan.',
    category: 'Plan Variety & Engagement',
    iconPath: '/images/ElvenBadges/Spoon2-removebg-preview.png',
    designDescription: 'Spoon accessory - Feast Architect for meal planning achievement.',
    isProgressive: false,
  },

  [BadgeType.PLANNING_VOLUME]: {
    type: BadgeType.PLANNING_VOLUME,
    name: 'Week Whisker',
    description: 'Awarded for completing a full weekly plan.',
    category: 'Planning Volume',
    iconPath: '/images/ElvenBadges/Clipboard2-removebg-preview.png',
    designDescription: 'Clipboard accessory - Week Whisker for completing weekly meal plans.',
    isProgressive: true,
    tiers: [
      {
        tier: 'bronze',
        name: 'Week Whisker',
        threshold: 1,
        iconPath: '/images/ElvenBadges/Clipboard2-removebg-preview.png',
        designDescription: 'Clipboard accessory for completing your first weekly plan.',
      },
      {
        tier: 'silver',
        name: 'Week Whisker (Silver)',
        threshold: 10,
        iconPath: '/images/ElvenBadges/Clipboard2-removebg-preview.png',
        designDescription: 'Clipboard accessory for completing 10 weekly plans.',
      },
      {
        tier: 'gold',
        name: 'Week Whisker (Gold)',
        threshold: 50,
        iconPath: '/images/ElvenBadges/Clipboard2-removebg-preview.png',
        designDescription: 'Clipboard accessory for completing 50 weekly plans.',
      },
    ],
  },

  [BadgeType.PURCHASE_COMMITMENT]: {
    type: BadgeType.PURCHASE_COMMITMENT,
    name: 'Purchase Champion',
    description: 'Triggered by buying meals — delivery energy.',
    category: 'Purchase Commitment',
    iconPath: '/images/ElvenBadges/MessengerBag2-removebg-preview.png',
    designDescription: 'Messenger bag accessory - Purchase Champion for meal purchases.',
    isProgressive: true,
    tiers: [
      {
        tier: 'bronze',
        name: 'Purchase Champion',
        threshold: 1,
        iconPath: '/images/ElvenBadges/MessengerBag2-removebg-preview.png',
        designDescription: 'Messenger bag accessory for your first meal purchase.',
      },
      {
        tier: 'silver',
        name: 'Purchase Champion (Silver)',
        threshold: 10,
        iconPath: '/images/ElvenBadges/MessengerBag2-removebg-preview.png',
        designDescription: 'Messenger bag accessory for 10 meal purchases.',
      },
      {
        tier: 'gold',
        name: 'Purchase Champion (Gold)',
        threshold: 20,
        iconPath: '/images/ElvenBadges/MessengerBag2-removebg-preview.png',
        designDescription: 'Messenger bag accessory for 20 meal purchases.',
      },
      {
        tier: 'platinum',
        name: 'Purchase Champion (Platinum)',
        threshold: 30,
        iconPath: '/images/ElvenBadges/MessengerBag2-removebg-preview.png',
        designDescription: 'Messenger bag accessory for 30 meal purchases.',
      },
      {
        tier: 'diamond',
        name: 'Purchase Champion (Diamond)',
        threshold: 40,
        iconPath: '/images/ElvenBadges/MessengerBag2-removebg-preview.png',
        designDescription: 'Messenger bag accessory for 40 meal purchases.',
      },
      {
        tier: 'sultan',
        name: 'Purchase Champion (Sultan)',
        threshold: 50,
        iconPath: '/images/ElvenBadges/MessengerBag2-removebg-preview.png',
        designDescription: 'Messenger bag accessory for 50+ meal purchases.',
      },
    ],
  },
};

/**
 * Get badge definition by type
 */
export function getBadgeDefinition(type: BadgeType): BadgeDefinition {
  return BADGE_DEFINITIONS[type];
}

/**
 * Get tier definition for a progressive badge
 */
export function getTierDefinition(type: BadgeType, tier: BadgeTier): BadgeTierDefinition | null {
  const definition = BADGE_DEFINITIONS[type];
  if (!definition.isProgressive || !definition.tiers) {
    return null;
  }
  return definition.tiers.find(t => t.tier === tier) || null;
}

/**
 * Get tier for a given progress count
 */
export function getTierForProgress(type: BadgeType, progress: number): BadgeTier | null {
  const definition = BADGE_DEFINITIONS[type];
  if (!definition.isProgressive || !definition.tiers) {
    return null;
  }

  // Find the highest tier threshold that progress meets
  let currentTier: BadgeTier | null = null;
  for (const tierDef of definition.tiers) {
    if (progress >= tierDef.threshold) {
      currentTier = tierDef.tier;
    } else {
      break;
    }
  }

  return currentTier;
}

/**
 * Get next tier threshold for progress display
 */
export function getNextTierThreshold(type: BadgeType, currentTier: BadgeTier | null): number | null {
  const definition = BADGE_DEFINITIONS[type];
  if (!definition.isProgressive || !definition.tiers) {
    return null;
  }

  if (!currentTier) {
    // Return first tier threshold
    return definition.tiers[0]?.threshold || null;
  }

  const tierOrder: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'sultan'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex < 0 || currentIndex >= definition.tiers.length - 1) {
    return null; // Already at max tier
  }

  return definition.tiers[currentIndex + 1]?.threshold || null;
}

