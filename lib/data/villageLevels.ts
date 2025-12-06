/**
 * Village Evolution Levels
 * Defines how the village looks and evolves based on cumulative ingredient purchases
 * Every 10 ingredients purchased = new level
 * Uses range-based structure (minCount/maxCount) for cleaner level matching
 */

export interface VillageLevel {
  id: number;
  name: string;
  minCount: number; // Inclusive minimum purchase count
  maxCount: number; // Inclusive maximum purchase count (or Infinity)
  buildings: string[]; // Array of building types/keys
  environment: string; // Environment theme key (camp, suburb, paradise, etc.)
  mascotStates: Record<string, string>; // Mascot activity states (e.g., { dog: 'cooking', cat: 'testing' })
  palette: {
    background: string; // Background color
    accent: string; // Accent color
    neutral: string; // Neutral color
  };
}

export const VILLAGE_LEVELS: VillageLevel[] = [
  {
    id: 0,
    name: 'Struggle',
    minCount: 0,
    maxCount: 9,
    buildings: ['strawHut'],
    environment: 'camp',
    mascotStates: {
      dog: 'stir',      // Puppy Prepper stirring over campfire
      cat: 'worry',     // Professor Purrfessor taking notes anxiously
      turtle: 'inspect', // Sherlock Shells slowly investigating
      hamster: 'busy',   // Farmer Fluff gathering supplies
      bird: 'idle'       // Robin Redroute resting
    },
    palette: {
      background: '#F7F3EE',
      accent: '#D6A77A',
      neutral: '#BDB8B0'
    }
  },
  {
    id: 1,
    name: 'Suburbs',
    minCount: 10,
    maxCount: 19,
    buildings: ['house', 'playground'],
    environment: 'suburb',
    mascotStates: {
      dog: 'cook',      // Puppy Prepper cooking in kitchen
      cat: 'note',      // Professor Purrfessor taking notes
      turtle: 'inspect', // Sherlock Shells investigating
      hamster: 'stack',  // Farmer Fluff organizing supplies
      bird: 'deliver'    // Robin Redroute delivering packages
    },
    palette: {
      background: '#F0F6F4',
      accent: '#A8D5BA',
      neutral: '#CFCFCF'
    }
  },
  {
    id: 2,
    name: 'Paradise',
    minCount: 20,
    maxCount: 29,
    buildings: ['villa', 'themePark'],
    environment: 'paradise',
    mascotStates: {
      dog: 'plate',     // Puppy Prepper plating food
      cat: 'test',      // Professor Purrfessor testing recipes
      turtle: 'discover', // Sherlock Shells discovering
      hamster: 'harvest', // Farmer Fluff harvesting
      bird: 'fly'        // Robin Redroute flying deliveries
    },
    palette: {
      background: '#E8FAF0',
      accent: '#FFD48E',
      neutral: '#D3D3D3'
    }
  },
  {
    id: 3,
    name: 'Utopia',
    minCount: 30,
    maxCount: 39,
    buildings: ['estate', 'forestPark'],
    environment: 'utopia',
    mascotStates: {
      dog: 'master',    // Puppy Prepper master chef
      cat: 'experiment', // Professor Purrfessor advanced experiments
      turtle: 'curate',  // Sherlock Shells curating discoveries
      hamster: 'complex', // Farmer Fluff managing complex
      bird: 'speed'      // Robin Redroute high-speed deliveries
    },
    palette: {
      background: '#FFF2E6',
      accent: '#B7E2E8',
      neutral: '#C8C8C8'
    }
  },
  {
    id: 4,
    name: 'Legendary',
    minCount: 40,
    maxCount: 49,
    buildings: ['castle', 'amusementPark'],
    environment: 'legendary',
    mascotStates: {
      dog: 'royal',      // Puppy Prepper royal chef
      cat: 'wizard',     // Professor Purrfessor wizard scientist
      turtle: 'sage',     // Sherlock Shells sage researcher
      hamster: 'knight',  // Farmer Fluff knight farmer
      bird: 'dragon'      // Robin Redroute dragon rider
    },
    palette: {
      background: '#F5E8FF',
      accent: '#FFD4F0',
      neutral: '#C0B3C7'
    }
  },
  {
    id: 5,
    name: 'Divine',
    minCount: 50,
    maxCount: Infinity,
    buildings: ['palace', 'magicalForest'],
    environment: 'divine',
    mascotStates: {
      dog: 'divine',     // Puppy Prepper divine chef
      cat: 'cosmic',     // Professor Purrfessor cosmic researcher
      turtle: 'universal', // Sherlock Shells universal investigator
      hamster: 'celestial', // Farmer Fluff celestial farmer
      bird: 'angel'       // Robin Redroute angel deliverer
    },
    palette: {
      background: '#E9FFF8',
      accent: '#FFF18C',
      neutral: '#EDEDED'
    }
  }
];

/**
 * Get village level data for a given purchase count
 * Uses range-based matching (minCount <= count <= maxCount)
 */
export function getVillageLevelData(purchaseCount: number): VillageLevel {
  // Find the level where count falls within the range
  for (const level of VILLAGE_LEVELS) {
    if (purchaseCount >= level.minCount && purchaseCount <= level.maxCount) {
      return level;
    }
  }
  
  // Default to level 0 (shouldn't happen, but safety fallback)
  return VILLAGE_LEVELS[0];
}

/**
 * Get village level by ID
 */
export function getVillageLevelById(id: number): VillageLevel | null {
  return VILLAGE_LEVELS.find(level => level.id === id) || null;
}

/**
 * Get next village level (what they're working toward)
 */
export function getNextVillageLevel(currentLevelId: number): VillageLevel | null {
  const currentLevel = getVillageLevelById(currentLevelId);
  if (!currentLevel) return null;
  
  const nextId = currentLevel.id + 1;
  return getVillageLevelById(nextId);
}

/**
 * Get village level for count (alias for getVillageLevelData)
 * Matches guide's function name
 */
export function levelForCount(count: number): VillageLevel {
  return getVillageLevelData(count);
}

