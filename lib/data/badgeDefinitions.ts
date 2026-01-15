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
  [BadgeType.PERFECT_MATCH]: {
    type: BadgeType.PERFECT_MATCH,
    name: "Cats Cunning Circles",
    description: 'Perfect Match — earned when you hit a 95% compatibility score or higher.',
    category: 'Core Achievements',
    iconPath: '/images/Badges/Glasses.png',
    designDescription: 'Cat glasses accessory (cunning).',
    isProgressive: false,
  },

  [BadgeType.FEAST_ARCHITECT]: {
    type: BadgeType.FEAST_ARCHITECT,
    name: "The Dog's Divine Toque",
    description: 'Feast Architect — unlocked when you complete a weekly meal plan.',
    category: 'Core Achievements',
    iconPath: '/images/Badges/ChefHat.png',
    designDescription: 'Dog chef hat/toque accessory.',
    isProgressive: false,
  },

  [BadgeType.WEEK_WHISKER]: {
    type: BadgeType.WEEK_WHISKER,
    name: "Cats Chronicle Card",
    description: 'Week Whisker — earned when you start building a meal plan.',
    category: 'Plans & Routines',
    iconPath: '/images/Badges/Clipboard.png',
    designDescription: 'Cat clipboard accessory.',
    isProgressive: false,
  },

  [BadgeType.PURCHASE_CHAMPION]: {
    type: BadgeType.PURCHASE_CHAMPION,
    name: 'Birds Bag Of Clear Skies',
    description: 'Purchase Champion — earned when you confirm your first purchase.',
    category: 'Shopping & Savings',
    iconPath: '/images/Badges/MessengerBag.png',
    designDescription: 'Bird bag accessory.',
    isProgressive: false,
  },

  [BadgeType.PURCHASE_BASKET]: {
    type: BadgeType.PURCHASE_BASKET,
    name: 'Hamsters Basket Of Bounty',
    description: 'Unlocked after confirming 5 purchases for this pet.',
    category: 'Shopping & Savings',
    iconPath: '/images/Badges/Basket.png',
    designDescription: 'Hamster basket accessory.',
    isProgressive: false,
  },

  [BadgeType.PURCHASE_HOE]: {
    type: BadgeType.PURCHASE_HOE,
    name: 'Hoe Of Harvests',
    description: 'Unlocked after confirming 10 purchases for this pet.',
    category: 'Shopping & Savings',
    iconPath: '/images/Badges/GardenHoe.png',
    designDescription: 'Garden hoe accessory.',
    isProgressive: false,
  },

  [BadgeType.PURCHASE_BOWL]: {
    type: BadgeType.PURCHASE_BOWL,
    name: "The Dog's Bowl Of Bounty",
    description: 'Unlocked after confirming 15 purchases for this pet.',
    category: 'Shopping & Savings',
    iconPath: '/images/Badges/bowl.png',
    designDescription: 'Dog bowl accessory.',
    isProgressive: false,
  },

  [BadgeType.PURCHASE_GOGGLES]: {
    type: BadgeType.PURCHASE_GOGGLES,
    name: 'Birds Goggles Of Google‑Ing',
    description: 'Unlocked after confirming 20 purchases for this pet.',
    category: 'Shopping & Savings',
    iconPath: '/images/Badges/goggles.png',
    designDescription: 'Bird goggles accessory.',
    isProgressive: false,
  },

  [BadgeType.PURCHASE_MONOCLE]: {
    type: BadgeType.PURCHASE_MONOCLE,
    name: 'Turtles Monocle Of Mystery',
    description: 'Unlocked after confirming 30 purchases for this pet.',
    category: 'Shopping & Savings',
    iconPath: '/images/Badges/Monocle.png',
    designDescription: 'Turtle monocle accessory.',
    isProgressive: false,
  },

  [BadgeType.SEARCH_DISCOVERY]: {
    type: BadgeType.SEARCH_DISCOVERY,
    name: "Turle's Lens Of Long Looking",
    description: 'Search/Discovery — earned when you explore meal results for your pet.',
    category: 'Utility & Exploration',
    iconPath: '/images/Badges/MagnifyingGlass.png',
    designDescription: 'Turtle magnifier accessory.',
    isProgressive: false,
  },

  [BadgeType.BIRD_HAT]: {
    type: BadgeType.BIRD_HAT,
    name: 'Birds Cap Of Clear Skies',
    description: 'Unlocked after viewing 5 recipe pages for this pet.',
    category: 'Utility & Exploration',
    iconPath: '/images/Badges/BirdHat.png',
    designDescription: 'Bird hat accessory.',
    isProgressive: false,
  },

  [BadgeType.PROFILE_SETUP]: {
    type: BadgeType.PROFILE_SETUP,
    name: 'Hamsters Suspenders Of Suspense',
    description: 'Profile Setup — earned by uploading your pet’s first photo.',
    category: 'Utility & Exploration',
    iconPath: '/images/Badges/Suspenders.png',
    designDescription: 'Hamster suspenders accessory.',
    isProgressive: false,
  },

  [BadgeType.PREPARATION]: {
    type: BadgeType.PREPARATION,
    name: "Dog's Spoon Of Stirring",
    description: 'Preparation — earned by preparing/creating a meal.',
    category: 'Utility & Exploration',
    iconPath: '/images/Badges/Spoon.png',
    designDescription: 'Dog spoon accessory.',
    isProgressive: false,
  },

  [BadgeType.SHERLOCK_HAT]: {
    type: BadgeType.SHERLOCK_HAT,
    name: 'The Turtles Tracking Cap',
    description: 'Unlocked after saving 3 custom meals for this pet.',
    category: 'Core Achievements',
    iconPath: '/images/Badges/SherlockHat.png',
    designDescription: 'Turtle tracking cap accessory.',
    isProgressive: false,
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

