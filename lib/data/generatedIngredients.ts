// lib/data/generatedIngredients.ts
// AUTO-GENERATED - Do not edit manually
// Generated from scraped data on 2025-12-02T22:00:58.798Z
// Run: node scripts/buildIngredients.js to regenerate

export interface GeneratedIngredient {
  id: string;
  name: string;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'supplement' | 'insect' | 'hay' | 'other';
  subtypeTags: string[];
  confidence: 'high' | 'medium' | 'low';
  scrapedCount: number;
}

export const GENERATED_INGREDIENTS: GeneratedIngredient[] = [
  {
    "id": "pumpkin",
    "name": "pumpkin",
    "category": "grain",
    "subtypeTags": [
      "bird_large",
      "bird_small"
    ],
    "confidence": "low",
    "scrapedCount": 2
  },
  {
    "id": "chinchilla",
    "name": "chinchilla",
    "category": "other",
    "subtypeTags": [
      "pocket_hay",
      "pocket_varied"
    ],
    "confidence": "low",
    "scrapedCount": 2
  },
  {
    "id": "ferret",
    "name": "ferret",
    "category": "other",
    "subtypeTags": [
      "pocket_carnivore",
      "pocket_hay",
      "pocket_varied"
    ],
    "confidence": "low",
    "scrapedCount": 2
  },
  {
    "id": "guinea_guru_popcorn_in_guinea_pig",
    "name": "guinea guru? popcorn in! guinea pig",
    "category": "other",
    "subtypeTags": [
      "pocket_hay",
      "pocket_varied"
    ],
    "confidence": "medium",
    "scrapedCount": 4
  },
  {
    "id": "guinea_pig",
    "name": "guinea pig",
    "category": "other",
    "subtypeTags": [
      "pocket_hay",
      "pocket_varied"
    ],
    "confidence": "high",
    "scrapedCount": 6
  },
  {
    "id": "guinea_pig_finder_cagetopia_the_original_cc_guinea_pig_cages_store_guinea_pig",
    "name": "guinea pig finder cagetopia - the original c&c guinea pig cages store guinea pig",
    "category": "other",
    "subtypeTags": [
      "pocket_hay",
      "pocket_varied"
    ],
    "confidence": "medium",
    "scrapedCount": 4
  },
  {
    "id": "hamster",
    "name": "hamster",
    "category": "other",
    "subtypeTags": [
      "pocket_hay",
      "pocket_varied"
    ],
    "confidence": "low",
    "scrapedCount": 2
  },
  {
    "id": "nutrient",
    "name": "nutrient",
    "category": "other",
    "subtypeTags": [],
    "confidence": "medium",
    "scrapedCount": 4
  },
  {
    "id": "pea",
    "name": "pea",
    "category": "other",
    "subtypeTags": [],
    "confidence": "medium",
    "scrapedCount": 4
  },
  {
    "id": "rabbit",
    "name": "rabbit",
    "category": "other",
    "subtypeTags": [
      "pocket_hay",
      "pocket_varied"
    ],
    "confidence": "medium",
    "scrapedCount": 4
  },
  {
    "id": "sweet_potato",
    "name": "sweet potato",
    "category": "other",
    "subtypeTags": [],
    "confidence": "low",
    "scrapedCount": 1
  },
  {
    "id": "uvb",
    "name": "uvb",
    "category": "other",
    "subtypeTags": [
      "reptile_herbivore",
      "reptile_insectivore",
      "reptile_omnivore"
    ],
    "confidence": "low",
    "scrapedCount": 2
  },
  {
    "id": "chicken",
    "name": "chicken",
    "category": "protein",
    "subtypeTags": [],
    "confidence": "medium",
    "scrapedCount": 5
  },
  {
    "id": "heart",
    "name": "heart",
    "category": "protein",
    "subtypeTags": [],
    "confidence": "high",
    "scrapedCount": 8
  },
  {
    "id": "kidney",
    "name": "kidney",
    "category": "protein",
    "subtypeTags": [],
    "confidence": "high",
    "scrapedCount": 8
  },
  {
    "id": "turkey",
    "name": "turkey",
    "category": "protein",
    "subtypeTags": [
      "bird_large",
      "bird_small"
    ],
    "confidence": "high",
    "scrapedCount": 7
  },
  {
    "id": "glucosamine",
    "name": "glucosamine",
    "category": "supplement",
    "subtypeTags": [],
    "confidence": "medium",
    "scrapedCount": 4
  },
  {
    "id": "supplement",
    "name": "supplement",
    "category": "supplement",
    "subtypeTags": [],
    "confidence": "high",
    "scrapedCount": 7
  },
  {
    "id": "vitamin",
    "name": "vitamin",
    "category": "supplement",
    "subtypeTags": [
      "reptile_herbivore",
      "reptile_insectivore",
      "reptile_omnivore"
    ],
    "confidence": "low",
    "scrapedCount": 2
  }
];

// Summary stats
export const GENERATED_INGREDIENTS_STATS = {
  total: 19,
  byCategory: {
    protein: 4,
    vegetable: 0,
    fruit: 0,
    grain: 1,
    supplement: 3,
    insect: 0,
    hay: 0,
    other: 11
  },
  byConfidence: {
    high: 5,
    medium: 7,
    low: 7
  },
  bySubtype: {
    bird_small: 2,
    bird_large: 2,
    reptile_herbivore: 2,
    reptile_insectivore: 2,
    reptile_omnivore: 2,
    reptile_carnivore: 0,
    pocket_hay: 7,
    pocket_varied: 7,
    pocket_carnivore: 1,
    pocket_insectivore: 0
  }
};
