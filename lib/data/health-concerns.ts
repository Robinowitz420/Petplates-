// lib/data/health-concerns.ts
// Species-specific and breed-specific health concerns for pet nutrition platform

export const healthConcernsBySpecies = {
  dogs: [
    'Arthritis/joint pain',
    'Dental problems',
    'Digestive issues',
    'Ear infections',
    'Obesity',
    'Kidney disease',
    'Heart disease',
    'Urinary problems',
    'Thyroid issues',
    'Pancreatitis',
    'Diabetes',
    'Hip dysplasia',
    'Skin conditions'
  ],

  cats: [
    'Dental disease',
    'Kidney disease',
    'Urinary tract issues',
    'Hyperthyroidism',
    'Diabetes',
    'Inflammatory Bowel Disease',
    'Hairballs',
    'Obesity',
    'Respiratory issues',
    'Pancreatitis',
    'Heart disease'
  ],

  birds: [
    'Feather plucking',
    'Respiratory infection',
    'Beak overgrowth',
    'Vitamin deficiencies',
    'Heavy metal exposure',
    'Egg binding',
    'Fatty liver disease',
    'Nutritional imbalances'
  ],

  reptiles: [
    'Metabolic Bone Disease',
    'Respiratory infection',
    'Parasites',
    'Stuck shed',
    'Impaction',
    'Mouth rot',
    'Thermal burns',
    'Nutritional deficiencies',
    'Tail/foot injuries'
  ],

  'pocket-pets': [
    'Dental problems',
    'Digestive issues',
    'Respiratory infection',
    'Urinary problems',
    'Obesity',
    'Nutritional deficiencies'
  ]
};

// Breed-specific health concerns (fallback to species-level if not specified)
export const healthConcernsByBreed: Record<string, string[]> = {
  // Reptiles
  'Iguana': [
    'Metabolic Bone Disease',
    'Thermal burns',
    'Nutritional deficiencies',
    'Impaction',
    'Tail/foot injuries',
    'Respiratory infection'
  ],
  'Bearded Dragon': [
    'Metabolic Bone Disease',
    'Impaction',
    'Mouth rot (stomatitis)',
    'Respiratory infection',
    'Parasites'
  ],
  'Leopard Gecko': [
    'Metabolic Bone Disease',
    'Stuck shed (dysecdysis)',
    'Impaction',
    'Tail loss',
    'Respiratory infection'
  ],
  'Ball Python': [
    'Respiratory infection',
    'Scale rot',
    'Impaction',
    'Mouth rot',
    'Parasites'
  ],
  'Corn Snake': [
    'Respiratory infection',
    'Scale rot',
    'Impaction',
    'Mouth rot',
    'Parasites'
  ],
  'Red-Eared Slider': [
    'Metabolic Bone Disease',
    'Shell rot',
    'Respiratory infection',
    'Vitamin A deficiency',
    'Impaction'
  ],
  'Crested Gecko': [
    'Metabolic Bone Disease',
    'Stuck shed',
    'Impaction',
    'Respiratory infection'
  ],

  // Dogs
  'Labrador Retriever': [
    'Obesity',
    'Arthritis/joint pain',
    'Hip dysplasia',
    'Ear infections',
    'Allergies/skin issues'
  ],
  'German Shepherd': [
    'Hip dysplasia',
    'Arthritis/joint pain',
    'Digestive issues',
    'Pancreatitis',
    'Skin conditions'
  ],
  'Golden Retriever': [
    'Hip dysplasia',
    'Arthritis/joint pain',
    'Obesity',
    'Skin allergies',
    'Ear infections'
  ],
  'French Bulldog': [
    'Respiratory issues',
    'Skin allergies',
    'Obesity',
    'Dental problems',
    'Digestive issues'
  ],
  'Bulldog': [
    'Respiratory issues',
    'Skin allergies',
    'Obesity',
    'Hip dysplasia',
    'Dental problems'
  ],
  'Poodle': [
    'Skin allergies',
    'Ear infections',
    'Dental problems',
    'Pancreatitis',
    'Diabetes'
  ],
  'Beagle': [
    'Obesity',
    'Ear infections',
    'Epilepsy',
    'Hip dysplasia',
    'Allergies/skin issues'
  ],
  'Dachshund': [
    'Intervertebral disc disease',
    'Obesity',
    'Dental problems',
    'Diabetes',
    'Skin conditions'
  ],
  'Great Dane': [
    'Hip dysplasia',
    'Bloat (GDV)',
    'Heart disease',
    'Arthritis/joint pain',
    'Obesity'
  ],
  'Siberian Husky': [
    'Hip dysplasia',
    'Eye problems',
    'Skin allergies',
    'Digestive issues',
    'Obesity'
  ],

  // Cats
  'Persian': [
    'Dental disease',
    'Hairballs',
    'Urinary tract issues (FLUTD)',
    'Respiratory infection',
    'Skin conditions',
    'Eye problems'
  ],
  'Maine Coon': [
    'Hip dysplasia',
    'Heart disease (HCM)',
    'Kidney disease',
    'Obesity',
    'Dental disease'
  ],
  'Siamese': [
    'Respiratory issues',
    'Dental disease',
    'Amyloidosis',
    'Asthma',
    'Skin allergies'
  ],
  'Ragdoll': [
    'Heart disease (HCM)',
    'Urinary tract issues',
    'Obesity',
    'Dental disease',
    'Kidney disease'
  ],
  'Bengal': [
    'Hip dysplasia',
    'Progressive retinal atrophy',
    'Hypertrophic cardiomyopathy',
    'Skin allergies',
    'Digestive issues'
  ],
  'British Shorthair': [
    'Obesity',
    'Heart disease (HCM)',
    'Dental disease',
    'Kidney disease',
    'Urinary tract issues'
  ],
  'Sphynx': [
    'Skin conditions',
    'Heart disease (HCM)',
    'Dental disease',
    'Respiratory issues',
    'Obesity'
  ],

  // Birds
  'African Grey': [
    'Feather plucking',
    'Calcium deficiency',
    'Respiratory infection',
    'Heavy metal exposure',
    'Vitamin A deficiency'
  ],
  'Cockatiel': [
    'Respiratory infection',
    'Feather plucking',
    'Egg binding',
    'Fatty liver disease',
    'Vitamin deficiencies'
  ],
  'Budgie': [
    'Respiratory infection',
    'Tumors',
    'Feather plucking',
    'Beak overgrowth',
    'Nutritional imbalances'
  ],
  'Macaw': [
    'Feather plucking',
    'Respiratory infection',
    'Heavy metal exposure',
    'Beak overgrowth',
    'Nutritional deficiencies'
  ],

  // Pocket Pets
  'Rabbit': [
    'Dental problems',
    'Digestive issues (GI stasis)',
    'Respiratory infection',
    'Urinary problems',
    'Obesity',
    'Skin/fur issues'
  ],
  'Guinea Pig': [
    'Vitamin C deficiency',
    'Dental problems',
    'Respiratory infection',
    'Urinary problems',
    'Skin conditions',
    'Digestive issues'
  ],
  'Hamster': [
    'Diabetes',
    'Dental problems',
    'Respiratory infection',
    'Skin conditions',
    'Digestive issues'
  ],
  'Chinchilla': [
    'Dental problems',
    'Respiratory infection',
    'Heat stroke',
    'Skin/fur issues',
    'Digestive issues'
  ],
  'Ferret': [
    'Insulinoma',
    'Adrenal disease',
    'Digestive issues',
    'Respiratory infection',
    'Skin conditions'
  ]
};

// Helper function to get concerns for any species (optionally with breed)
export function getHealthConcernsForSpecies(species: string, breed?: string): string[] {
  const normalized = species.toLowerCase().trim();

  // Map aliases
  const speciesMap: Record<string, keyof typeof healthConcernsBySpecies> = {
    'dog': 'dogs',
    'dogs': 'dogs',
    'puppy': 'dogs',
    'cat': 'cats',
    'cats': 'cats',
    'kitten': 'cats',
    'bird': 'birds',
    'birds': 'birds',
    'reptile': 'reptiles',
    'reptiles': 'reptiles',
    'rabbit': 'pocket-pets',
    'rabbits': 'pocket-pets',
    'guinea pig': 'pocket-pets',
    'guinea pigs': 'pocket-pets',
    'hamster': 'pocket-pets',
    'hamsters': 'pocket-pets',
    'gerbil': 'pocket-pets',
    'gerbils': 'pocket-pets',
    'ferret': 'pocket-pets',
    'ferrets': 'pocket-pets',
    'mouse': 'pocket-pets',
    'mice': 'pocket-pets',
    'rat': 'pocket-pets',
    'rats': 'pocket-pets',
    'chinchilla': 'pocket-pets',
    'chinchillas': 'pocket-pets'
  };

  // If breed provided and has specific concerns, return those
  if (breed && breed.trim()) {
    const breedKey = breed.trim();
    if (healthConcernsByBreed[breedKey]) {
      return healthConcernsByBreed[breedKey];
    }
  }

  // Otherwise fall back to species-level concerns
  const key = speciesMap[normalized] || normalized as keyof typeof healthConcernsBySpecies;
  return healthConcernsBySpecies[key] || [
    'Digestive issues',
    'Nutritional concerns',
    'Weight management'
  ];
}
