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
    description: 'Perfect Match — earned when you hit a 100% compatibility score.',
    category: 'Core Achievements',
    iconPath: '/images/Badges/Accessorie Badges/CatsGlassesBadge.png',
    designDescription: 'Cat glasses accessory (cunning).',
    isProgressive: false,
  },

  [BadgeType.FEAST_ARCHITECT]: {
    type: BadgeType.FEAST_ARCHITECT,
    name: "The Dog's Divine Toque",
    description: 'Feast Architect — unlocked when you complete a weekly meal plan.',
    category: 'Core Achievements',
    iconPath: '/images/Badges/Accessorie Badges/DogsHatBadge.png',
    designDescription: 'Dog chef hat/toque accessory.',
    isProgressive: false,
  },

  [BadgeType.WEEK_WHISKER]: {
    type: BadgeType.WEEK_WHISKER,
    name: "Week Whisker",
    description: 'Week Whisker — progressive badge for completed weekly plans.',
    category: 'Week Whisker (Progressive Plans)',
    iconPath: '/images/Badges/Accessorie Badges/CatsClipboardBadge.png',
    designDescription: 'Planning progress accessories.',
    isProgressive: true,
    tiers: [
      {
        tier: 'bronze',
        name: "Cats Chronicle Card",
        threshold: 1,
        iconPath: '/images/Badges/Accessorie Badges/CatsClipboardBadge.png',
        designDescription: 'Cat clipboard accessory (first plan).',
      },
      {
        tier: 'silver',
        name: "Cat's Cloak Of Curiosity",
        threshold: 10,
        iconPath: '/images/Badges/Accessorie Badges/CatsCoatBadge.png',
        designDescription: 'Cat coat/cloak accessory (10 plans).',
      },
      {
        tier: 'gold',
        name: 'The Turtles Tracking Cap',
        threshold: 50,
        iconPath: '/images/Badges/Accessorie Badges/TurtlesHatBadge.png',
        designDescription: 'Turtle tracking cap accessory (50 plans).',
      },
    ],
  },

  [BadgeType.PURCHASE_CHAMPION]: {
    type: BadgeType.PURCHASE_CHAMPION,
    name: 'Purchase Champion',
    description: 'Purchase Champion — progressive badge for confirmed purchases.',
    category: 'Purchase Champion (Progressive Tiers)',
    iconPath: '/images/Badges/Accessorie Badges/BirdsBagBadge.png',
    designDescription: 'Purchase progress accessories.',
    isProgressive: true,
    tiers: [
      {
        tier: 'bronze',
        name: 'Birds Bag Of Clear Skies',
        threshold: 1,
        iconPath: '/images/Badges/Accessorie Badges/BirdsBagBadge.png',
        designDescription: 'Bird bag accessory (first purchase).',
      },
      {
        tier: 'silver',
        name: 'Hamsters Basket Of Bounty',
        threshold: 10,
        iconPath: '/images/Badges/Accessorie Badges/HamstersBasketBadge.png',
        designDescription: 'Hamster basket accessory (10 purchases).',
      },
      {
        tier: 'gold',
        name: 'Hoe Of Harvests',
        threshold: 20,
        iconPath: '/images/Badges/Accessorie Badges/HamstersHoeBadge.png',
        designDescription: 'Hamster hoe accessory (20 purchases).',
      },
      {
        tier: 'platinum',
        name: "The Dog's Bowl Of Bounty",
        threshold: 30,
        iconPath: '/images/Badges/Accessorie Badges/DogsBowlBadge.png',
        designDescription: 'Dog bowl accessory (30 purchases).',
      },
      {
        tier: 'diamond',
        name: 'Birds Goggles Of Google‑Ing',
        threshold: 40,
        iconPath: '/images/Badges/Accessorie Badges/BirdsGogglesBadge.png',
        designDescription: 'Bird goggles accessory (40 purchases).',
      },
      {
        tier: 'sultan',
        name: 'Turtles Monocle Of Mystery',
        threshold: 50,
        iconPath: '/images/Badges/Accessorie Badges/TurtlesMonocleBadge.png',
        designDescription: 'Turtle monocle accessory (50+ purchases).',
      },
    ],
  },

  [BadgeType.SEARCH_DISCOVERY]: {
    type: BadgeType.SEARCH_DISCOVERY,
    name: "Turle's Lens Of Long Looking",
    description: 'Search/Discovery — earned when you explore meal results for your pet.',
    category: 'Utility & Exploration',
    iconPath: '/images/Badges/Accessorie Badges/TurtlesMagnifyerBadge.png',
    designDescription: 'Turtle magnifier accessory.',
    isProgressive: false,
  },

  [BadgeType.DAILY_LOGIN]: {
    type: BadgeType.DAILY_LOGIN,
    name: 'Birds Cap Of Clear Skies',
    description: 'Daily Login — earned by logging in and returning to the app.',
    category: 'Utility & Exploration',
    iconPath: '/images/Badges/Accessorie Badges/BirdHatBadge.png',
    designDescription: 'Bird hat accessory.',
    isProgressive: false,
  },

  [BadgeType.PROFILE_SETUP]: {
    type: BadgeType.PROFILE_SETUP,
    name: 'Hamsters Suspenders Of Suspense',
    description: 'Profile Setup — earned by creating your pet profile.',
    category: 'Utility & Exploration',
    iconPath: '/images/Badges/Accessorie Badges/HamstersSuspendersBadge.png',
    designDescription: 'Hamster suspenders accessory.',
    isProgressive: false,
  },

  [BadgeType.PREPARATION]: {
    type: BadgeType.PREPARATION,
    name: "Dog's Spoon Of Stirring",
    description: 'Preparation — earned by preparing/creating a meal.',
    category: 'Utility & Exploration',
    iconPath: '/images/Badges/Accessorie Badges/DogsSpoonBadge.png',
    designDescription: 'Dog spoon accessory.',
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

