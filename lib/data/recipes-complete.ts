import { Recipe } from '../types';

// Complete Recipe Database: 155 Recipes Total
// Dogs: 40 | Cats: 40 | Birds: 25 | Reptiles: 25 | Pocket Pets: 25

const createRecipe = (
  id: string,
  name: string,
  category: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets',
  breeds: string[],
  ageGroups: string[],
  healthConcerns: string[],
  description: string,
  tags: string[],
  imageNum: number
): Recipe => ({
  id,
  name,
  category,
  breed: breeds,
  ageGroup: ageGroups,
  healthConcerns,
  description,
  ingredients: [
    { id: '1', name: 'Main Protein Source', amount: '200g', nutrition: { protein: 30, fat: 10, fiber: 0, calories: 200 }, amazonLink: 'https://www.amazon.com/s?k=pet+protein' },
    { id: '2', name: 'Carbohydrate Source', amount: '100g', nutrition: { protein: 3, fat: 1, fiber: 2, calories: 100 }, amazonLink: 'https://www.amazon.com/s?k=pet+carbs' },
    { id: '3', name: 'Vegetables', amount: '50g', nutrition: { protein: 1, fat: 0, fiber: 2, calories: 25 }, amazonLink: 'https://www.amazon.com/s?k=pet+vegetables' },
    { id: '4', name: 'Supplement', amount: '1 tsp', nutrition: { protein: 0, fat: 2, fiber: 0, calories: 15 }, amazonLink: 'https://www.amazon.com/s?k=pet+supplements' },
  ],
  instructions: [
    'Cook main protein thoroughly until safe internal temperature reached.',
    'Prepare carbohydrate source according to type (cook rice/quinoa, bake potato, etc).',
    'Steam or lightly cook vegetables until tender.',
    'Allow all ingredients to cool to room temperature.',
    'Mix all ingredients together thoroughly.',
    'Add supplement and mix well.',
    'Serve appropriate portion size for pet weight.',
    'Store leftovers in refrigerator for up to 3 days or freeze portions.',
  ],
  nutritionalInfo: {
    protein: { min: 22, max: 30, unit: '% dry matter' },
    fat: { min: 8, max: 15, unit: '% dry matter' },
    fiber: { min: 2, max: 5, unit: '% dry matter' },
    calcium: { min: 0.6, max: 1.2, unit: '% dry matter' },
    phosphorus: { min: 0.5, max: 1.0, unit: '% dry matter' },
    vitamins: ['A', 'D', 'E', 'B-complex'],
    calories: { min: 340, max: 340, unit: 'kcal per serving' },
  },
  prepTime: '30 minutes',
  servings: 2,
  rating: 4.5 + Math.random() * 0.5,
  reviews: Math.floor(Math.random() * 200) + 50,
  imageUrl: category === 'reptiles' 
    ? `https://images.unsplash.com/photo-${1610000000000 + imageNum}?w=800&q=80` 
    : `https://images.unsplash.com/photo-${1587300003388 + imageNum}?w=800&q=80`,
  tags,
});

export const recipes: Recipe[] = [
  // ========================================
  // DOG RECIPES (40 total)
  // ========================================
  
  // PUPPY/YOUNG (10)
  createRecipe('dog-01', 'Puppy Growth Chicken Formula', 'dogs', ['labrador', 'golden-retriever', 'german-shepherd'], ['baby', 'young'], ['none'], 'High-protein formula for growing puppies with optimal calcium ratios', ['puppy', 'high-protein', 'growth'], 1),
  createRecipe('dog-02', 'Turkey & Quinoa Puppy Bowl', 'dogs', ['poodle', 'yorkshire', 'chihuahua'], ['baby', 'young'], ['none', 'allergies'], 'Novel protein with complete amino acids for small breeds', ['puppy', 'small-breed', 'novel-protein'], 2),
  createRecipe('dog-03', 'Beef & Oatmeal Puppy Power', 'dogs', ['rottweiler', 'german-shepherd', 'husky'], ['baby', 'young'], ['none'], 'Iron-rich beef for large breed puppies', ['puppy', 'large-breed', 'iron-rich'], 3),
  createRecipe('dog-04', 'Salmon & Sweet Potato Growth', 'dogs', ['labrador', 'beagle', 'bulldog'], ['baby', 'young'], ['none', 'allergies'], 'Omega-rich formula for brain development', ['puppy', 'omega-3', 'brain-health'], 4),
  createRecipe('dog-05', 'Chicken & Egg Protein Boost', 'dogs', ['golden-retriever', 'german-shepherd', 'poodle'], ['baby', 'young'], ['none'], 'Complete amino acid profile for muscle growth', ['puppy', 'protein-rich', 'muscle-building'], 5),
  createRecipe('dog-06', 'Lamb & Rice Puppy Delight', 'dogs', ['labrador', 'beagle', 'bulldog'], ['baby', 'young'], ['none', 'digestive'], 'Gentle on sensitive puppy stomachs', ['puppy', 'gentle', 'digestive-friendly'], 6),
  createRecipe('dog-07', 'Duck & Pumpkin Starter', 'dogs', ['poodle', 'yorkshire', 'chihuahua'], ['baby', 'young'], ['none', 'allergies'], 'Hypoallergenic protein with fiber', ['puppy', 'hypoallergenic', 'novel-protein'], 7),
  createRecipe('dog-08', 'Venison & Barley Young Pup', 'dogs', ['german-shepherd', 'rottweiler', 'husky'], ['baby', 'young'], ['none', 'allergies'], 'Wild protein for active puppies', ['puppy', 'wild-protein', 'active'], 8),
  createRecipe('dog-09', 'Turkey Liver & Veggie Mix', 'dogs', ['labrador', 'golden-retriever', 'beagle'], ['baby', 'young'], ['none'], 'Organ meat for essential nutrients', ['puppy', 'organ-meat', 'nutrient-dense'], 9),
  createRecipe('dog-10', 'Chicken Heart & Quinoa', 'dogs', ['poodle', 'bulldog', 'beagle'], ['baby', 'young'], ['none'], 'Heart-healthy fats for growing pups', ['puppy', 'heart-healthy', 'complete'], 10),
  
  // ADULT GENERAL (15)
  createRecipe('dog-11', 'Classic Chicken & Brown Rice', 'dogs', ['labrador', 'golden-retriever', 'beagle'], ['young', 'adult'], ['none', 'digestive'], 'Balanced everyday meal for active dogs', ['adult', 'balanced', 'classic'], 11),
  createRecipe('dog-12', 'Beef & Sweet Potato Medley', 'dogs', ['german-shepherd', 'rottweiler', 'husky'], ['young', 'adult'], ['none'], 'Rich in antioxidants and protein', ['adult', 'antioxidant', 'protein-rich'], 12),
  createRecipe('dog-13', 'Turkey & Green Bean Bowl', 'dogs', ['labrador', 'beagle', 'poodle'], ['adult'], ['none', 'weight-management'], 'Lean protein with fiber for satiety', ['adult', 'lean', 'fiber-rich'], 13),
  createRecipe('dog-14', 'Salmon & Oatmeal Classic', 'dogs', ['golden-retriever', 'labrador', 'bulldog'], ['adult'], ['none', 'joint-health'], 'Omega-3s for coat and joint health', ['adult', 'omega-3', 'joint-support'], 14),
  createRecipe('dog-15', 'Lamb & Vegetable Stew', 'dogs', ['german-shepherd', 'rottweiler', 'beagle'], ['adult'], ['none'], 'Hearty complete meal for all breeds', ['adult', 'complete', 'hearty'], 15),
  createRecipe('dog-16', 'Duck & Wild Rice', 'dogs', ['poodle', 'yorkshire', 'bulldog'], ['adult'], ['none', 'allergies'], 'Novel protein with ancient grains', ['adult', 'novel-protein', 'grain-inclusive'], 16),
  createRecipe('dog-17', 'Pork & Apple Blend', 'dogs', ['labrador', 'beagle', 'husky'], ['adult'], ['none'], 'Unique flavor combination dogs love', ['adult', 'flavorful', 'unique'], 17),
  createRecipe('dog-18', 'Chicken & Barley Mix', 'dogs', ['golden-retriever', 'german-shepherd', 'poodle'], ['adult'], ['none', 'digestive'], 'Gentle on sensitive stomachs', ['adult', 'gentle', 'digestive'], 18),
  createRecipe('dog-19', 'Beef & Quinoa Power Bowl', 'dogs', ['rottweiler', 'german-shepherd', 'husky'], ['adult'], ['none'], 'Complete protein and amino acids', ['adult', 'power', 'complete-protein'], 19),
  createRecipe('dog-20', 'Turkey & Pumpkin Dinner', 'dogs', ['labrador', 'beagle', 'bulldog'], ['adult'], ['none', 'digestive'], 'Fiber-rich for digestive health', ['adult', 'fiber', 'digestive-support'], 20),
  createRecipe('dog-21', 'White Fish & Potato', 'dogs', ['poodle', 'yorkshire', 'chihuahua'], ['adult'], ['allergies'], 'Limited ingredient diet', ['adult', 'limited-ingredient', 'hypoallergenic'], 21),
  createRecipe('dog-22', 'Venison & Carrot Feast', 'dogs', ['german-shepherd', 'rottweiler', 'husky'], ['adult'], ['none', 'allergies'], 'Wild protein with beta-carotene', ['adult', 'wild', 'antioxidant'], 22),
  createRecipe('dog-23', 'Bison & Sweet Potato', 'dogs', ['labrador', 'golden-retriever', 'bulldog'], ['adult'], ['none'], 'Unique red meat option', ['adult', 'novel-meat', 'complete'], 23),
  createRecipe('dog-24', 'Chicken Thigh & Spinach', 'dogs', ['beagle', 'poodle', 'bulldog'], ['adult'], ['none'], 'Iron and protein-rich meal', ['adult', 'iron-rich', 'protein'], 24),
  createRecipe('dog-25', 'Ground Turkey & Zucchini', 'dogs', ['labrador', 'golden-retriever', 'german-shepherd'], ['adult'], ['none', 'weight-management'], 'Low-calorie nutrient-dense meal', ['adult', 'low-calorie', 'nutrient-dense'], 25),
  
  // WEIGHT MANAGEMENT (5)
  createRecipe('dog-26', 'Low-Fat Chicken & Green Beans', 'dogs', ['labrador', 'beagle', 'bulldog'], ['adult', 'senior'], ['weight-management'], 'High fiber low fat for weight loss', ['weight-management', 'low-fat', 'high-fiber'], 26),
  createRecipe('dog-27', 'Turkey & Fiber Blend', 'dogs', ['golden-retriever', 'labrador', 'poodle'], ['adult', 'senior'], ['weight-management'], 'Lean protein with satiety boosters', ['weight-management', 'lean', 'satisfying'], 27),
  createRecipe('dog-28', 'White Fish & Cauliflower', 'dogs', ['beagle', 'bulldog', 'poodle'], ['adult', 'senior'], ['weight-management'], 'Ultra-lean protein option', ['weight-management', 'ultra-lean', 'low-calorie'], 28),
  createRecipe('dog-29', 'Lean Beef & Broccoli', 'dogs', ['german-shepherd', 'rottweiler', 'labrador'], ['adult', 'senior'], ['weight-management'], 'Nutrient-dense low-calorie meal', ['weight-management', 'nutrient-dense', 'filling'], 29),
  createRecipe('dog-30', 'Chicken Breast & Asparagus', 'dogs', ['poodle', 'yorkshire', 'chihuahua'], ['adult', 'senior'], ['weight-management'], 'Small breed weight control formula', ['weight-management', 'small-breed', 'portion-controlled'], 30),
  
  // SENIOR/JOINT HEALTH (5)
  createRecipe('dog-31', 'Senior Salmon Omega Boost', 'dogs', ['labrador', 'golden-retriever', 'german-shepherd'], ['senior'], ['joint-health', 'none'], 'Anti-inflammatory omega-3s for joints', ['senior', 'omega-3', 'anti-inflammatory'], 31),
  createRecipe('dog-32', 'Glucosamine Chicken Mix', 'dogs', ['bulldog', 'rottweiler', 'beagle'], ['senior'], ['joint-health'], 'Joint support with glucosamine', ['senior', 'joint-support', 'mobility'], 32),
  createRecipe('dog-33', 'Turkey & Turmeric Anti-Inflammatory', 'dogs', ['german-shepherd', 'husky', 'labrador'], ['senior'], ['joint-health'], 'Natural anti-inflammatory blend', ['senior', 'anti-inflammatory', 'natural'], 33),
  createRecipe('dog-34', 'Senior Beef & Joint Support', 'dogs', ['rottweiler', 'german-shepherd', 'bulldog'], ['senior'], ['joint-health', 'none'], 'Complete senior nutrition with joint care', ['senior', 'complete', 'joint-care'], 34),
  createRecipe('dog-35', 'White Fish & Mobility Blend', 'dogs', ['poodle', 'beagle', 'bulldog'], ['senior'], ['joint-health'], 'Lean protein for senior mobility', ['senior', 'mobility', 'lean'], 35),
  
  // DIGESTIVE/SENSITIVE (5)
  createRecipe('dog-36', 'Gentle Chicken & Pumpkin', 'dogs', ['labrador', 'golden-retriever', 'beagle'], ['adult', 'senior'], ['digestive'], 'Soothing for sensitive stomachs', ['digestive', 'soothing', 'gentle'], 36),
  createRecipe('dog-37', 'Turkey & Probiotic Rice', 'dogs', ['poodle', 'bulldog', 'beagle'], ['adult', 'senior'], ['digestive'], 'Probiotics for gut health', ['digestive', 'probiotic', 'gut-health'], 37),
  createRecipe('dog-38', 'White Fish Easy Digest', 'dogs', ['yorkshire', 'chihuahua', 'poodle'], ['adult', 'senior'], ['digestive'], 'Highly digestible protein', ['digestive', 'highly-digestible', 'gentle'], 38),
  createRecipe('dog-39', 'Chicken & Bland Diet', 'dogs', ['labrador', 'golden-retriever', 'german-shepherd'], ['adult', 'senior'], ['digestive'], 'Bland diet for upset stomachs', ['digestive', 'bland', 'recovery'], 39),
  createRecipe('dog-40', 'Turkey & Sweet Potato Sensitive', 'dogs', ['beagle', 'bulldog', 'poodle'], ['adult', 'senior'], ['digestive'], 'Limited ingredients for sensitive dogs', ['digestive', 'limited-ingredient', 'sensitive'], 40),
  
  // ========================================
  // CAT RECIPES (40 total)
  // ========================================
  
  // KITTEN/YOUNG (10)
  createRecipe('cat-01', 'Kitten Growth Chicken Formula', 'cats', ['persian', 'maine-coon', 'siamese'], ['baby', 'young'], ['none'], 'High-protein growth formula with taurine', ['kitten', 'growth', 'taurine'], 41),
  createRecipe('cat-02', 'Tuna & Egg Kitten Power', 'cats', ['ragdoll', 'bengal', 'british-shorthair'], ['baby', 'young'], ['none'], 'Complete amino acids for development', ['kitten', 'amino-acids', 'development'], 42),
  createRecipe('cat-03', 'Turkey & Liver Growth', 'cats', ['siamese', 'persian', 'maine-coon'], ['baby', 'young'], ['none'], 'Organ meat for essential nutrients', ['kitten', 'organ-meat', 'nutrients'], 43),
  createRecipe('cat-04', 'Salmon & Taurine Boost', 'cats', ['bengal', 'ragdoll', 'siamese'], ['baby', 'young'], ['none'], 'Essential taurine for heart health', ['kitten', 'taurine', 'heart-health'], 44),
  createRecipe('cat-05', 'Chicken Heart Kitten Mix', 'cats', ['persian', 'maine-coon', 'british-shorthair'], ['baby', 'young'], ['none'], 'Nutrient-dense organ meats', ['kitten', 'organ-meat', 'dense'], 45),
  createRecipe('cat-06', 'Duck & Chicken Blend', 'cats', ['siamese', 'bengal', 'ragdoll'], ['baby', 'young'], ['none', 'allergies'], 'Novel protein for sensitive kittens', ['kitten', 'novel-protein', 'sensitive'], 46),
  createRecipe('cat-07', 'Beef & Liver Young Cat', 'cats', ['maine-coon', 'persian', 'british-shorthair'], ['baby', 'young'], ['none'], 'Iron-rich for growing cats', ['kitten', 'iron-rich', 'growth'], 47),
  createRecipe('cat-08', 'Mackerel & Egg Protein', 'cats', ['siamese', 'bengal', 'ragdoll'], ['baby', 'young'], ['none'], 'Omega-3s for brain development', ['kitten', 'omega-3', 'brain'], 48),
  createRecipe('cat-09', 'Turkey & Giblet Kitten', 'cats', ['persian', 'maine-coon', 'siamese'], ['baby', 'young'], ['none'], 'Complete nutrition with variety', ['kitten', 'complete', 'variety'], 49),
  createRecipe('cat-10', 'Chicken & Salmon Combo', 'cats', ['bengal', 'ragdoll', 'british-shorthair'], ['baby', 'young'], ['none'], 'Dual protein source for kittens', ['kitten', 'dual-protein', 'balanced'], 50),
  
  // ADULT GENERAL (15)
  createRecipe('cat-11', 'Classic Salmon & Tuna Feast', 'cats', ['siamese', 'persian', 'maine-coon'], ['young', 'adult'], ['none'], 'Traditional fish feast cats love', ['adult', 'fish', 'classic'], 51),
  createRecipe('cat-12', 'Chicken & Liver Pâté', 'cats', ['ragdoll', 'bengal', 'british-shorthair'], ['young', 'adult'], ['none'], 'Smooth pâté texture cats adore', ['adult', 'pate', 'smooth'], 52),
  createRecipe('cat-13', 'Turkey & Giblet Mix', 'cats', ['persian', 'siamese', 'maine-coon'], ['adult'], ['none'], 'Variety of textures and flavors', ['adult', 'variety', 'flavorful'], 53),
  createRecipe('cat-14', 'Mackerel & Sardine Blend', 'cats', ['bengal', 'ragdoll', 'siamese'], ['adult'], ['none', 'joint-health'], 'Omega-rich seafood combination', ['adult', 'omega-rich', 'seafood'], 54),
  createRecipe('cat-15', 'Beef & Chicken Dinner', 'cats', ['maine-coon', 'persian', 'british-shorthair'], ['adult'], ['none'], 'Hearty meat combination', ['adult', 'hearty', 'meat-lovers'], 55),
  createRecipe('cat-16', 'Duck & Turkey Medley', 'cats', ['siamese', 'bengal', 'ragdoll'], ['adult'], ['none', 'allergies'], 'Novel protein options combined', ['adult', 'novel-protein', 'hypoallergenic'], 56),
  createRecipe('cat-17', 'White Fish & Shrimp', 'cats', ['persian', 'maine-coon', 'british-shorthair'], ['adult'], ['none', 'kidney'], 'Low-phosphorus seafood blend', ['adult', 'low-phosphorus', 'kidney-friendly'], 57),
  createRecipe('cat-18', 'Chicken Thigh & Heart', 'cats', ['bengal', 'siamese', 'ragdoll'], ['adult'], ['none'], 'Dark meat with organ variety', ['adult', 'dark-meat', 'organ'], 58),
  createRecipe('cat-19', 'Tuna & Salmon Premium', 'cats', ['maine-coon', 'persian', 'siamese'], ['adult'], ['none'], 'Premium grade seafood selection', ['adult', 'premium', 'gourmet'], 59),
  createRecipe('cat-20', 'Turkey & Chicken Liver', 'cats', ['ragdoll', 'bengal', 'british-shorthair'], ['adult'], ['none'], 'Nutrient-dense organ meat mix', ['adult', 'nutrient-dense', 'organ-meat'], 60),
  createRecipe('cat-21', 'Rabbit & Chicken Novel Protein', 'cats', ['siamese', 'persian', 'bengal'], ['adult'], ['allergies'], 'Unique protein for allergies', ['adult', 'novel', 'allergy-friendly'], 61),
  createRecipe('cat-22', 'Venison & Turkey Exotic', 'cats', ['maine-coon', 'ragdoll', 'siamese'], ['adult'], ['allergies'], 'Wild game protein option', ['adult', 'wild-game', 'exotic'], 62),
  createRecipe('cat-23', 'Lamb & Chicken Blend', 'cats', ['persian', 'british-shorthair', 'bengal'], ['adult'], ['none'], 'Alternative red meat choice', ['adult', 'red-meat', 'alternative'], 63),
  createRecipe('cat-24', 'Cod & Mackerel Ocean Mix', 'cats', ['siamese', 'ragdoll', 'maine-coon'], ['adult'], ['none'], 'Deep ocean fish combination', ['adult', 'ocean-fish', 'omega-rich'], 64),
  createRecipe('cat-25', 'Chicken & Quail Gourmet', 'cats', ['bengal', 'persian', 'siamese'], ['adult'], ['none'], 'Gourmet poultry selection', ['adult', 'gourmet', 'poultry'], 65),
  
  // WEIGHT MANAGEMENT (5)
  createRecipe('cat-26', 'Low-Fat Chicken & Pumpkin', 'cats', ['persian', 'maine-coon', 'british-shorthair'], ['adult', 'senior'], ['weight-management'], 'Fiber-rich weight control formula', ['weight-management', 'low-fat', 'fiber'], 66),
  createRecipe('cat-27', 'Turkey Lean & Green', 'cats', ['siamese', 'bengal', 'ragdoll'], ['adult', 'senior'], ['weight-management'], 'Lean protein with vegetables', ['weight-management', 'lean', 'veggie'], 67),
  createRecipe('cat-28', 'White Fish Slim Formula', 'cats', ['persian', 'maine-coon', 'siamese'], ['adult', 'senior'], ['weight-management'], 'Ultra-lean fish option', ['weight-management', 'ultra-lean', 'fish'], 68),
  createRecipe('cat-29', 'Chicken Breast Light', 'cats', ['ragdoll', 'british-shorthair', 'bengal'], ['adult', 'senior'], ['weight-management'], 'Lightest protein choice', ['weight-management', 'light', 'protein'], 69),
  createRecipe('cat-30', 'Tuna & Fiber Blend', 'cats', ['siamese', 'persian', 'maine-coon'], ['adult', 'senior'], ['weight-management'], 'Satisfying low-calorie meal', ['weight-management', 'satisfying', 'low-calorie'], 70),
  
  // SENIOR/KIDNEY (5)
  createRecipe('cat-31', 'Senior Kidney Care Chicken', 'cats', ['persian', 'maine-coon', 'siamese'], ['senior'], ['kidney', 'none'], 'Low-phosphorus for kidney health', ['senior', 'kidney-care', 'low-phosphorus'], 71),
  createRecipe('cat-32', 'Low-Phosphorus Turkey', 'cats', ['ragdoll', 'bengal', 'british-shorthair'], ['senior'], ['kidney'], 'Controlled minerals for seniors', ['senior', 'mineral-controlled', 'kidney'], 72),
  createRecipe('cat-33', 'Senior White Fish Formula', 'cats', ['siamese', 'persian', 'maine-coon'], ['senior'], ['kidney', 'none'], 'Gentle on aging kidneys', ['senior', 'gentle', 'kidney-friendly'], 73),
  createRecipe('cat-34', 'Chicken & Kidney Support', 'cats', ['bengal', 'ragdoll', 'british-shorthair'], ['senior'], ['kidney'], 'Complete senior renal support', ['senior', 'renal-support', 'complete'], 74),
  createRecipe('cat-35', 'Turkey Senior Blend', 'cats', ['maine-coon', 'persian', 'siamese'], ['senior'], ['none'], 'Balanced nutrition for aging cats', ['senior', 'balanced', 'aging'], 75),
  
  // DIGESTIVE/HAIRBALL (5)
  createRecipe('cat-36', 'Digestive Care Chicken', 'cats', ['persian', 'maine-coon', 'ragdoll'], ['adult', 'senior'], ['digestive'], 'Probiotics for gut health', ['digestive', 'probiotic', 'gut-health'], 76),
  createRecipe('cat-37', 'Hairball Control Turkey', 'cats', ['siamese', 'bengal', 'persian'], ['adult', 'senior'], ['digestive'], 'Fiber to prevent hairballs', ['digestive', 'hairball', 'fiber'], 77),
  createRecipe('cat-38', 'Sensitive Stomach Fish', 'cats', ['maine-coon', 'british-shorthair', 'ragdoll'], ['adult', 'senior'], ['digestive'], 'Gentle on sensitive cats', ['digestive', 'gentle', 'sensitive'], 78),
  createRecipe('cat-39', 'Probiotic Chicken Mix', 'cats', ['siamese', 'bengal', 'persian'], ['adult', 'senior'], ['digestive'], 'Live cultures for digestion', ['digestive', 'probiotic', 'live-cultures'], 79),
  createRecipe('cat-40', 'Fiber Blend for Cats', 'cats', ['maine-coon', 'persian', 'ragdoll'], ['adult', 'senior'], ['digestive'], 'High fiber digestive support', ['digestive', 'high-fiber', 'support'], 80),
  
  // ========================================
  // BIRD RECIPES (25 total)
  // ========================================
  
  // SEED-BASED (10)
  createRecipe('bird-01', 'Premium Budgie Seed Mix', 'birds', ['budgie'], ['adult'], ['none'], 'Complete seed blend for budgerigars', ['seed-based', 'complete', 'budgie'], 81),
  createRecipe('bird-02', 'Cockatiel Daily Blend', 'birds', ['cockatiel'], ['adult'], ['none'], 'Balanced daily nutrition for cockatiels', ['seed-based', 'daily', 'balanced'], 82),
  createRecipe('bird-03', 'Canary Seed Supreme', 'birds', ['canary'], ['adult'], ['none'], 'High-quality seeds for canaries', ['seed-based', 'premium', 'canary'], 83),
  createRecipe('bird-04', 'Finch Feast Mix', 'birds', ['finch'], ['adult'], ['none'], 'Variety blend for finches', ['seed-based', 'variety', 'finch'], 84),
  createRecipe('bird-05', 'Lovebird Seed Combo', 'birds', ['lovebird'], ['adult'], ['none'], 'Nutritious mix for lovebirds', ['seed-based', 'nutritious', 'lovebird'], 85),
  createRecipe('bird-06', 'Parakeet Power Seeds', 'birds', ['budgie'], ['adult'], ['none'], 'Energy-rich seed selection', ['seed-based', 'energy', 'power'], 86),
  createRecipe('bird-07', 'Mixed Grain Delight', 'birds', ['cockatiel', 'lovebird'], ['adult'], ['none'], 'Multi-grain combination', ['seed-based', 'multi-grain', 'variety'], 87),
  createRecipe('bird-08', 'Millet & Seed Medley', 'birds', ['budgie', 'canary', 'finch'], ['adult'], ['none'], 'Millet-forward blend', ['seed-based', 'millet', 'medley'], 88),
  createRecipe('bird-09', 'Sunflower & Grain Mix', 'birds', ['cockatiel', 'lovebird'], ['adult'], ['none'], 'Protein-rich sunflower blend', ['seed-based', 'protein', 'sunflower'], 89),
  createRecipe('bird-10', 'Tropical Seed Blend', 'birds', ['budgie', 'cockatiel', 'lovebird'], ['adult'], ['none'], 'Exotic seed combination', ['seed-based', 'tropical', 'exotic'], 90),
  
  // PELLET & FRESH FOOD (10)
  createRecipe('bird-11', 'Parrot Veggie & Pellet Bowl', 'birds', ['parrot'], ['adult'], ['none'], 'Complete nutrition with fresh vegetables', ['pellet-based', 'fresh', 'complete'], 91),
  createRecipe('bird-12', 'Cockatoo Fresh Fruit Mix', 'birds', ['cockatoo'], ['adult'], ['none'], 'Fruit and pellet combination', ['pellet-based', 'fruit', 'fresh'], 92),
  createRecipe('bird-13', 'Macaw Power Pellets', 'birds', ['parrot'], ['adult'], ['none'], 'High-energy formula for large parrots', ['pellet-based', 'power', 'large-bird'], 93),
  createRecipe('bird-14', 'Conure Veggie Medley', 'birds', ['conure'], ['adult'], ['none'], 'Colorful vegetable blend', ['pellet-based', 'veggie', 'colorful'], 94),
  createRecipe('bird-15', 'African Grey Brain Food', 'birds', ['parrot'], ['adult'], ['none'], 'Cognitive support nutrition', ['pellet-based', 'brain-food', 'cognitive'], 95),
  createRecipe('bird-16', 'Budgie Fresh & Pellet', 'birds', ['budgie'], ['adult'], ['none'], 'Balanced pellet with fresh additions', ['pellet-based', 'balanced', 'fresh'], 96),
  createRecipe('bird-17', 'Cockatiel Veggie Crunch', 'birds', ['cockatiel'], ['adult'], ['none'], 'Crunchy vegetables with pellets', ['pellet-based', 'crunchy', 'veggie'], 97),
  createRecipe('bird-18', 'Canary Fresh Greens', 'birds', ['canary'], ['adult'], ['none'], 'Leafy greens with seeds', ['fresh-food', 'greens', 'leafy'], 98),
  createRecipe('bird-19', 'Lovebird Fruit Salad', 'birds', ['lovebird'], ['adult'], ['none'], 'Fresh fruit variety mix', ['fresh-food', 'fruit', 'variety'], 99),
  createRecipe('bird-20', 'Finch Fresh Blend', 'birds', ['finch'], ['adult'], ['none'], 'Seeds with fresh additions', ['fresh-food', 'seeds', 'fresh'], 100),
  
  // SPECIALTY/TREATS (5)
  createRecipe('bird-21', 'Sprouted Seed Treat', 'birds', ['budgie', 'cockatiel', 'canary'], ['adult'], ['none'], 'Nutrient-boosted sprouted seeds', ['treat', 'sprouted', 'nutrient-boost'], 101),
  createRecipe('bird-22', 'Egg Food Formula', 'birds', ['canary', 'finch'], ['adult', 'baby'], ['none'], 'Protein boost for breeding birds', ['specialty', 'egg-food', 'breeding'], 102),
  createRecipe('bird-23', 'Calcium Boost Mix', 'birds', ['budgie', 'cockatiel', 'lovebird'], ['adult'], ['none'], 'Extra calcium for shell health', ['specialty', 'calcium', 'health'], 103),
  createRecipe('bird-24', 'Molting Support Blend', 'birds', ['parrot', 'cockatoo'], ['adult'], ['none'], 'Nutrition during feather molt', ['specialty', 'molting', 'feather-support'], 104),
  createRecipe('bird-25', 'Breeding Bird Special', 'birds', ['budgie', 'cockatiel', 'lovebird'], ['adult'], ['none'], 'Enhanced nutrition for breeding pairs', ['specialty', 'breeding', 'enhanced'], 105),
  
  // ========================================
  // REPTILE RECIPES (25 total)
  // ========================================
  
  // HERBIVORE (10)
  createRecipe('reptile-01', 'Bearded Dragon Salad', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'Calcium-rich greens and vegetables', ['herbivore', 'calcium-rich', 'salad'], 106),
  createRecipe('reptile-02', 'Iguana Veggie Supreme', 'reptiles', ['iguana'], ['adult'], ['none'], 'Complete vegetable nutrition', ['herbivore', 'complete', 'veggie'], 107),
  createRecipe('reptile-03', 'Tortoise Mixed Greens', 'reptiles', ['red-eared-slider'], ['adult'], ['none'], 'Variety of leafy greens', ['herbivore', 'leafy', 'variety'], 108),
  createRecipe('reptile-04', 'Uromastyx Desert Blend', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'Desert species vegetable mix', ['herbivore', 'desert', 'specialized'], 109),
  createRecipe('reptile-05', 'Green Iguana Power Greens', 'reptiles', ['iguana'], ['adult'], ['none'], 'High-calcium green vegetables', ['herbivore', 'high-calcium', 'greens'], 110),
  createRecipe('reptile-06', 'Turtle Veggie Mix', 'reptiles', ['red-eared-slider'], ['adult'], ['none'], 'Aquatic turtle vegetable blend', ['herbivore', 'aquatic', 'turtle'], 111),
  createRecipe('reptile-07', 'Tortoise Calcium Salad', 'reptiles', ['red-eared-slider'], ['adult'], ['none'], 'Extra calcium for shell health', ['herbivore', 'calcium', 'shell-health'], 112),
  createRecipe('reptile-08', 'Herbivore Complete Mix', 'reptiles', ['bearded-dragon', 'iguana'], ['adult'], ['none'], 'All-in-one herbivore nutrition', ['herbivore', 'complete', 'all-in-one'], 113),
  createRecipe('reptile-09', 'Leafy Green Medley', 'reptiles', ['iguana', 'red-eared-slider'], ['adult'], ['none'], 'Multiple green varieties', ['herbivore', 'leafy', 'medley'], 114),
  createRecipe('reptile-10', 'Cactus & Veggie Blend', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'Desert plants and vegetables', ['herbivore', 'cactus', 'desert'], 115),
  
  // OMNIVORE (10)
  createRecipe('reptile-11', 'Bearded Dragon Protein Mix', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'Balanced protein and vegetables', ['omnivore', 'balanced', 'protein'], 116),
  createRecipe('reptile-12', 'Blue-Tongue Skink Blend', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'Omnivore complete nutrition', ['omnivore', 'complete', 'skink'], 117),
  createRecipe('reptile-13', 'Box Turtle Complete Diet', 'reptiles', ['red-eared-slider'], ['adult'], ['none'], 'Protein and plant combination', ['omnivore', 'complete', 'turtle'], 118),
  createRecipe('reptile-14', 'Water Dragon Omni Mix', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'Aquatic omnivore blend', ['omnivore', 'aquatic', 'dragon'], 119),
  createRecipe('reptile-15', 'Tegu Power Bowl', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'High-protein omnivore meal', ['omnivore', 'high-protein', 'power'], 120),
  createRecipe('reptile-16', 'Omnivore Insect & Veggie', 'reptiles', ['bearded-dragon', 'leopard-gecko'], ['adult'], ['none'], 'Insect protein with vegetables', ['omnivore', 'insect', 'veggie'], 121),
  createRecipe('reptile-17', 'Mixed Protein Reptile', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'Variety of protein sources', ['omnivore', 'mixed-protein', 'variety'], 122),
  createRecipe('reptile-18', 'Balanced Omni Formula', 'reptiles', ['bearded-dragon', 'red-eared-slider'], ['adult'], ['none'], '50/50 protein and plants', ['omnivore', 'balanced', '50-50'], 123),
  createRecipe('reptile-19', 'Skink Specialty Mix', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'Specialized omnivore nutrition', ['omnivore', 'specialized', 'skink'], 124),
  createRecipe('reptile-20', 'Dragon Complete Meal', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'Complete dragon nutrition', ['omnivore', 'complete', 'dragon'], 125),
  
  // CARNIVORE/INSECTIVORE (5)
  createRecipe('reptile-21', 'Leopard Gecko Insect Mix', 'reptiles', ['leopard-gecko'], ['adult'], ['none'], 'Gut-loaded insect variety', ['carnivore', 'insect', 'gecko'], 126),
  createRecipe('reptile-22', 'Snake Pre-Kill Prep', 'reptiles', ['ball-python', 'corn-snake'], ['adult'], ['none'], 'Nutritionally complete prey prep', ['carnivore', 'snake', 'prey'], 127),
  createRecipe('reptile-23', 'Monitor Lizard Protein', 'reptiles', ['bearded-dragon'], ['adult'], ['none'], 'High-protein carnivore diet', ['carnivore', 'high-protein', 'monitor'], 128),
  createRecipe('reptile-24', 'Carnivore Complete', 'reptiles', ['leopard-gecko', 'ball-python'], ['adult'], ['none'], 'All-meat nutrition', ['carnivore', 'all-meat', 'complete'], 129),
  createRecipe('reptile-25', 'High-Protein Reptile', 'reptiles', ['leopard-gecko', 'bearded-dragon'], ['adult'], ['none'], 'Maximum protein formula', ['carnivore', 'maximum-protein', 'power'], 130),
  
  // ========================================
  // POCKET PET RECIPES (25 total)
  // ========================================
  
  // RABBIT/GUINEA PIG (10)
  createRecipe('pocket-pet-01', 'Guinea Pig Garden Salad', 'pocket-pets', ['guinea-pig'], ['adult'], ['none'], 'Fresh vegetables with vitamin C', ['herbivore', 'vitamin-c', 'fresh'], 131),
  createRecipe('pocket-pet-02', 'Rabbit Timothy Hay Mix', 'pocket-pets', ['rabbit'], ['adult'], ['none'], 'High-fiber hay-based diet', ['herbivore', 'high-fiber', 'hay'], 132),
  createRecipe('pocket-pet-03', 'Guinea Pig Vitamin C Boost', 'pocket-pets', ['guinea-pig'], ['adult'], ['none'], 'Extra vitamin C for cavies', ['herbivore', 'vitamin-c', 'boost'], 133),
  createRecipe('pocket-pet-04', 'Rabbit Fresh Veggie Blend', 'pocket-pets', ['rabbit'], ['adult'], ['none'], 'Variety of fresh vegetables', ['herbivore', 'fresh', 'veggie'], 134),
  createRecipe('pocket-pet-05', 'Cavy Complete Nutrition', 'pocket-pets', ['guinea-pig'], ['adult'], ['none'], 'Complete guinea pig formula', ['herbivore', 'complete', 'cavy'], 135),
  createRecipe('pocket-pet-06', 'Bunny Herb Garden', 'pocket-pets', ['rabbit'], ['adult'], ['none'], 'Fresh herbs and greens', ['herbivore', 'herbs', 'fresh'], 136),
  createRecipe('pocket-pet-07', 'Guinea Pig Pellet Mix', 'pocket-pets', ['guinea-pig'], ['adult'], ['none'], 'Fortified pellets with vegetables', ['herbivore', 'pellets', 'fortified'], 137),
  createRecipe('pocket-pet-08', 'Rabbit Fiber Supreme', 'pocket-pets', ['rabbit'], ['adult'], ['digestive'], 'Maximum fiber for digestion', ['herbivore', 'maximum-fiber', 'digestive'], 138),
  createRecipe('pocket-pet-09', 'Cavy Calcium Greens', 'pocket-pets', ['guinea-pig'], ['adult'], ['none'], 'Calcium-rich leafy greens', ['herbivore', 'calcium', 'greens'], 139),
  createRecipe('pocket-pet-10', 'Bunny Fresh Feast', 'pocket-pets', ['rabbit'], ['adult'], ['none'], 'Daily fresh vegetable mix', ['herbivore', 'daily', 'fresh'], 140),
  
  // HAMSTER/GERBIL/MOUSE (10)
  createRecipe('pocket-pet-11', 'Hamster Seed & Grain', 'pocket-pets', ['hamster'], ['adult'], ['none'], 'Balanced seed and grain mix', ['omnivore', 'seed-grain', 'balanced'], 141),
  createRecipe('pocket-pet-12', 'Gerbil Mixed Diet', 'pocket-pets', ['gerbil'], ['adult'], ['none'], 'Complete gerbil nutrition', ['omnivore', 'complete', 'gerbil'], 142),
  createRecipe('pocket-pet-13', 'Mouse Complete Mix', 'pocket-pets', ['mouse'], ['adult'], ['none'], 'All-in-one mouse food', ['omnivore', 'complete', 'mouse'], 143),
  createRecipe('pocket-pet-14', 'Hamster Protein Blend', 'pocket-pets', ['hamster'], ['adult'], ['none'], 'Protein-enhanced formula', ['omnivore', 'protein', 'enhanced'], 144),
  createRecipe('pocket-pet-15', 'Gerbil Seed Supreme', 'pocket-pets', ['gerbil'], ['adult'], ['none'], 'Premium seed selection', ['omnivore', 'seed', 'premium'], 145),
  createRecipe('pocket-pet-16', 'Mouse Veggie & Seed', 'pocket-pets', ['mouse'], ['adult'], ['none'], 'Seeds with fresh vegetables', ['omnivore', 'veggie-seed', 'fresh'], 146),
  createRecipe('pocket-pet-17', 'Syrian Hamster Special', 'pocket-pets', ['hamster'], ['adult'], ['none'], 'Large hamster specific formula', ['omnivore', 'syrian', 'large'], 147),
  createRecipe('pocket-pet-18', 'Dwarf Hamster Formula', 'pocket-pets', ['hamster'], ['adult'], ['none'], 'Small hamster nutrition', ['omnivore', 'dwarf', 'small'], 148),
  createRecipe('pocket-pet-19', 'Gerbil Grain Mix', 'pocket-pets', ['gerbil'], ['adult'], ['none'], 'Whole grain blend', ['omnivore', 'grain', 'whole'], 149),
  createRecipe('pocket-pet-20', 'Mouse Balanced Diet', 'pocket-pets', ['mouse'], ['adult'], ['none'], 'Complete daily nutrition', ['omnivore', 'balanced', 'daily'], 150),
  
  // CHINCHILLA/FERRET/RAT (5)
  createRecipe('pocket-pet-21', 'Chinchilla Hay Pellets', 'pocket-pets', ['chinchilla'], ['adult'], ['none'], 'High-fiber hay-based pellets', ['herbivore', 'hay-pellets', 'fiber'], 151),
  createRecipe('pocket-pet-22', 'Ferret Protein Power', 'pocket-pets', ['ferret'], ['adult'], ['none'], 'High-protein carnivore diet', ['carnivore', 'protein-power', 'meat'], 152),
  createRecipe('pocket-pet-23', 'Rat Complete Nutrition', 'pocket-pets', ['rat'], ['adult'], ['none'], 'Balanced omnivore formula', ['omnivore', 'complete', 'rat'], 153),
  createRecipe('pocket-pet-24', 'Chinchilla Dust Bath Treat', 'pocket-pets', ['chinchilla'], ['adult'], ['none'], 'Treat mix for chinchillas', ['herbivore', 'treat', 'special'], 154),
  createRecipe('pocket-pet-25', 'Ferret Fresh Mix', 'pocket-pets', ['ferret'], ['adult'], ['none'], 'Fresh protein for ferrets', ['carnivore', 'fresh', 'protein'], 155),
  
  // ========================================
  // ADDITIONAL HEALTH-FOCUSED RECIPES (20)
  // ========================================
  
  // More Dog Allergy Recipes
  createRecipe('dog-allergy-01', 'Kangaroo & Sweet Potato Limited', 'dogs', ['labrador', 'golden-retriever', 'bulldog'], ['adult'], ['allergies'], 'Novel protein for severe allergies', ['allergy-friendly', 'novel-protein', 'limited-ingredient'], 156),
  createRecipe('dog-allergy-02', 'Rabbit & Pumpkin Hypoallergenic', 'dogs', ['poodle', 'yorkshire', 'beagle'], ['adult'], ['allergies'], 'Gentle on sensitive systems', ['allergy-friendly', 'hypoallergenic', 'gentle'], 157),
  createRecipe('dog-allergy-03', 'Duck & Potato Single Protein', 'dogs', ['german-shepherd', 'labrador'], ['adult'], ['allergies'], 'One protein source only', ['allergy-friendly', 'single-protein', 'simple'], 158),
  
  // More Dog Dental Recipes
  createRecipe('dog-dental-01', 'Crunchy Chicken & Apple Teeth Clean', 'dogs', ['beagle', 'bulldog', 'poodle'], ['adult', 'senior'], ['dental'], 'Natural teeth cleaning texture', ['dental-health', 'crunchy', 'teeth-cleaning'], 159),
  createRecipe('dog-dental-02', 'Carrot Crunch Dental Support', 'dogs', ['labrador', 'golden-retriever'], ['adult', 'senior'], ['dental'], 'Abrasive vegetables for clean teeth', ['dental-health', 'crunchy', 'veggie'], 160),
  
  // More Cat Allergy Recipes
  createRecipe('cat-allergy-01', 'Duck & Pea Limited Ingredient', 'cats', ['siamese', 'persian', 'bengal'], ['adult'], ['allergies'], 'Novel protein for allergic cats', ['allergy-friendly', 'novel-protein', 'limited'], 161),
  createRecipe('cat-allergy-02', 'Rabbit & Rice Hypoallergenic', 'cats', ['maine-coon', 'ragdoll'], ['adult'], ['allergies'], 'Rare protein source', ['allergy-friendly', 'hypoallergenic', 'rare-protein'], 162),
  createRecipe('cat-allergy-03', 'Venison Single Protein', 'cats', ['british-shorthair', 'siamese'], ['adult'], ['allergies'], 'Wild game for sensitive cats', ['allergy-friendly', 'wild-game', 'single-protein'], 163),
  
  // More Cat Dental Recipes
  createRecipe('cat-dental-01', 'Crunchy Chicken Dental Care', 'cats', ['persian', 'maine-coon', 'siamese'], ['adult', 'senior'], ['dental'], 'Texture helps clean teeth', ['dental-health', 'crunchy', 'teeth-support'], 164),
  createRecipe('cat-dental-02', 'Dental Support Turkey Mix', 'cats', ['bengal', 'ragdoll'], ['adult', 'senior'], ['dental'], 'Natural plaque prevention', ['dental-health', 'plaque-prevention', 'oral-care'], 165),
  
  // More Dog Joint Health
  createRecipe('dog-joint-06', 'MSM Beef Joint Formula', 'dogs', ['german-shepherd', 'rottweiler'], ['senior'], ['joint-health'], 'MSM and glucosamine for joints', ['joint-support', 'msm', 'anti-inflammatory'], 166),
  createRecipe('dog-joint-07', 'Green Lipped Mussel Mobility', 'dogs', ['labrador', 'golden-retriever'], ['senior'], ['joint-health'], 'Natural joint supplement', ['joint-support', 'mobility', 'natural'], 167),
  
  // More Cat Kidney Support
  createRecipe('cat-kidney-06', 'Ultra Low-Phosphorus White Fish', 'cats', ['persian', 'siamese'], ['senior'], ['kidney'], 'Minimal phosphorus for CKD', ['kidney-support', 'low-phosphorus', 'renal'], 168),
  createRecipe('cat-kidney-07', 'Senior Renal Support Chicken', 'cats', ['maine-coon', 'ragdoll'], ['senior'], ['kidney'], 'Complete renal diet', ['kidney-support', 'renal-diet', 'senior'], 169),
  
  // More Dog Weight Management
  createRecipe('dog-weight-06', 'Ultra-Lean Turkey & Greens', 'dogs', ['beagle', 'bulldog'], ['adult', 'senior'], ['weight-management'], 'Maximum fiber minimum calories', ['weight-loss', 'ultra-lean', 'high-fiber'], 170),
  createRecipe('dog-weight-07', 'Satiety Support Chicken', 'dogs', ['labrador', 'golden-retriever'], ['adult', 'senior'], ['weight-management'], 'Keeps dogs feeling full longer', ['weight-management', 'satiety', 'filling'], 171),
  
  // More Cat Weight Management  
  createRecipe('cat-weight-06', 'Lean Chicken Portion Control', 'cats', ['persian', 'british-shorthair'], ['adult', 'senior'], ['weight-management'], 'Controlled calories for weight loss', ['weight-loss', 'portion-control', 'lean'], 172),
  createRecipe('cat-weight-07', 'Fiber Boost Weight Control', 'cats', ['maine-coon', 'ragdoll'], ['adult', 'senior'], ['weight-management'], 'Extra fiber for satiety', ['weight-management', 'fiber-boost', 'satisfying'], 173),
  
  // More Dog Digestive
  createRecipe('dog-digestive-06', 'Probiotic Pumpkin Soothe', 'dogs', ['labrador', 'beagle'], ['adult'], ['digestive'], 'Live probiotics for gut health', ['digestive-support', 'probiotic', 'soothing'], 174),
  createRecipe('dog-digestive-07', 'Bland Diet Recovery', 'dogs', ['bulldog', 'poodle'], ['adult', 'senior'], ['digestive'], 'Gentle recovery meal', ['digestive-support', 'bland', 'recovery'], 175),
];

export const getTrendingRecipes = (): Recipe[] => {
  return recipes
    .sort((a, b) => b.rating * b.reviews - a.rating * a.reviews)
    .slice(0, 6);
};

export const getRecipesByCategory = (category: string): Recipe[] => {
  return recipes.filter(r => r.category === category);
};

export const getRecipesByFilters = (
  category?: string,
  breed?: string,
  ageGroup?: string,
  healthConcern?: string
): Recipe[] => {
  return recipes.filter(recipe => {
    if (category && recipe.category !== category) return false;
    if (breed && !recipe.breed?.includes(breed)) return false;
    if (ageGroup && !recipe.ageGroup.includes(ageGroup)) return false;
    if (healthConcern && !recipe.healthConcerns.includes(healthConcern)) return false;
    return true;
  });
};
