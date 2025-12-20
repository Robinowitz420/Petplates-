// lib/data/vetted-products.ts
// Comprehensive veterinarian-vetted product mappings for all recipe ingredients
// Each ingredient maps to a specific, high-quality product with direct Amazon ASIN link

interface VettedProduct {
  // The specific, branded name to display on the shopping list
  productName: string;
  // The direct Amazon search link using the specific product name
  amazonLink: string;
  // Chewy affiliate link (when available)
  chewyLink?: string;
  // Specialty vendor link (raw food, subscription services)
  specialtyLink?: string;
  // Primary purchase link (usually Amazon)
  purchaseLink?: string;
  // A short note explaining *why* this product was chosen (for the user)
  vetNote: string;
  // Category for shopping list grouping
  category?: 'Meat' | \\'supplement' | 'Carb' | 'Vegetable' | 'Oil' | \\'seed' | 'Fruit' | 'Insect' | 'Hay' | 'Pellet';
  // Commission rate estimate for prioritization
  commissionRate?: number;
}

// Map: [Generic Ingredient Name (lowercase)] -> VettedProduct
export const VETTED_PRODUCTS: Record<string, VettedProduct> = {
  // === PROTEINS (Dogs & Cats) ===
  'ground chicken': {
    productName: 'Ground chicken (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0BXZVFN6G?tag=robinfrench-20',
    chewyLink: 'https://www.chewy.com/fresh-is-best-freeze-dried-chicken/dp/148916',
    vetNote: 'High-quality, human-grade chicken breast that maintains nutritional value through freeze-drying.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground turkey': {
    productName: 'Ground turkey (Free Range)',
    amazonLink: 'https://www.amazon.com/dp/B091CCD4T7?tag=robinfrench-20',
    vetNote: 'Premium free-range turkey with optimal protein-to-fat ratio for canine health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground beef (lean)': {
    productName: 'Ground beef (lean)',
    amazonLink: 'https://www.amazon.com/dp/B07VHR2WNZ?tag=robinfrench-20',
    vetNote: 'Grass-fed, human-grade beef with controlled fat content for weight management.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground lamb': {
    productName: 'Ground lamb (Raw)',
    amazonLink: 'https://www.amazon.com/dp/B0082C00P8?tag=robinfrench-20',
    vetNote: 'Novel protein source ideal for dogs with chicken or beef allergies.',
    category: 'Meat',
    commissionRate: 0.03
  },
  \\'salmon (boneless)': {
    productName: \\'salmon (boneless) (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B08NCDSV82?tag=robinfrench-20',
    chewyLink: 'https://www.chewy.com/better-treat-freeze-dried-salmon/dp/155916',
    vetNote: 'Wild-caught salmon providing essential omega-3 fatty acids for skin, coat, and joint health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken breast': {
    productName: 'Chicken breast',
    amazonLink: 'https://www.amazon.com/dp/B0787WTY4C?tag=robinfrench-20',
    vetNote: 'Air-chilled chicken breast with superior moisture retention and protein quality.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken thighs': {
    productName: 'Chicken thighs',
    amazonLink: 'https://www.amazon.com/dp/B0787YFWYB?tag=robinfrench-20',
    vetNote: 'Higher fat content than breast meat, providing more calories and flavor.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey breast': {
    productName: 'Turkey breast (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0CZRN7HXT?tag=robinfrench-20',
    vetNote: 'Lean turkey breast maintaining natural nutrients through gentle freeze-drying.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'beef liver': {
    productName: 'Beef liver (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B07G3QFG8N?tag=robinfrench-20',
    vetNote: 'Rich source of vitamin A, iron, and B vitamins essential for canine health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken liver': {
    productName: 'Chicken liver (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B07S8JCNTH?tag=robinfrench-20',
    vetNote: 'Concentrated nutrition with high vitamin content and natural enzymes.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken hearts': {
    productName: 'Chicken hearts (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0BXZ3JJL9?tag=robinfrench-20',
    vetNote: 'Excellent taurine source and natural chews for dental health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  \\'sardines (canned in water)': {
    productName: \\'sardines (canned in water)',
    amazonLink: 'https://www.amazon.com/dp/B01FUWYO2M?tag=robinfrench-20',
    vetNote: 'Omega-3 rich fish with edible bones providing natural calcium and phosphorus.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'eggs': {
    productName: 'Eggs (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B001DY6U9M?tag=robinfrench-20',
    vetNote: 'Complete protein source with all essential amino acids and natural vitamins.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey giblets': {
    productName: 'Turkey giblets (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0BXZ3JJL9?tag=robinfrench-20',
    vetNote: 'Natural organ meat mix providing comprehensive nutrition and enzymes.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken giblets': {
    productName: 'Chicken giblets (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0BXZVFN6G?tag=robinfrench-20',
    vetNote: 'Traditional organ meat blend with heart, liver, and gizzard for complete nutrition.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'duck breast': {
    productName: 'Duck breast (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B01KAOGE5U?tag=robinfrench-20',
    vetNote: 'Novel protein with healthy fat profile and rich flavor dogs love.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'venison': {
    productName: 'Venison (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B07VHR2WNZ?tag=robinfrench-20',
    vetNote: 'Lean game meat ideal for dogs with allergies or weight management needs.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'rabbit meat': {
    productName: 'Rabbit meat (Grain Free)',
    amazonLink: 'https://www.amazon.com/dp/B0082C00P8?tag=robinfrench-20',
    vetNote: 'Hypoallergenic novel protein perfect for elimination diet trials.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'quail': {
    productName: 'Quail (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0DK1SJ2Z7?tag=robinfrench-20',
    vetNote: \\'small game bird providing novel protein and natural calcium from bones.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground pork (lean)': {
    productName: 'Ground pork (lean) (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0CLJW1P6D?tag=robinfrench-20',
    vetNote: 'Lean pork alternative for dogs that tolerate it, with good palatability.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey necks': {
    productName: 'Turkey necks (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0FHJ6G2NZ?tag=robinfrench-20',
    vetNote: 'Natural chews providing dental benefits and natural nutrients.',
    category: 'Meat',
    commissionRate: 0.03
  },

  // === CARBS, VEGETABLES & FATS (Dogs & Cats) ===
  'brown rice': {
    productName: 'Brown rice (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B072JNNB33?tag=robinfrench-20',
    vetNote: 'Whole grain rice providing complex carbohydrates and fiber for digestive health.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'white rice': {
    productName: 'White rice',
    amazonLink: 'https://www.amazon.com/dp/B00IDQY2PW?tag=robinfrench-20',
    vetNote: 'Easily digestible carbohydrate source for dogs with sensitive stomachs.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'quinoa': {
    productName: 'Quinoa (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07ZJNYGW4?tag=robinfrench-20',
    vetNote: 'Complete protein grain with all essential amino acids and gluten-free.',
    category: 'Carb',
    commissionRate: 0.03
  },
  \\'sweet potato': {
    productName: \\'sweet potato puree (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07D92VQ9C?tag=robinfrench-20',
    vetNote: 'Complex carbohydrate with beta-carotene and fiber for digestive health.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'pumpkin puree': {
    productName: 'Pumpkin puree (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0062A87HA?tag=robinfrench-20',
    vetNote: 'Natural soluble fiber for digestive health and stool regulation.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'butternut squash': {
    productName: 'Butternut squash puree (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000HDCSTG?tag=robinfrench-20',
    vetNote: 'Low-glycemic carbohydrate with beta-carotene and antioxidants.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'lentils': {
    productName: 'Red lentils (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000VDZ2GI?tag=robinfrench-20',
    vetNote: 'Plant-based protein and fiber source for balanced nutrition.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'chickpeas': {
    productName: 'Chickpeas (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0BYPF1Y79?tag=robinfrench-20',
    vetNote: 'Protein-rich legume providing complex carbohydrates and minerals.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'black beans': {
    productName: 'Black beans (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B094WYT2BK?tag=robinfrench-20',
    vetNote: 'High-fiber legume with antioxidants and plant-based protein.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'green peas': {
    productName: 'Green peas (Frozen, Organic)',
    amazonLink: 'https://www.amazon.com/dp/B074H4SHTD?tag=robinfrench-20',
    vetNote: 'Natural source of plant protein and digestive fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'carrots': {
    productName: 'Carrots (Frozen, Organic)',
    amazonLink: 'https://www.amazon.com/dp/B074H64BPW?tag=robinfrench-20',
    vetNote: 'Beta-carotene rich vegetable supporting immune and vision health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'spinach': {
    productName: \\'spinach (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0013ABAJG?tag=robinfrench-20',
    vetNote: 'Iron-rich leafy green providing vitamins K, A, and folate.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'broccoli': {
    productName: 'Broccoli (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07SV522V9?tag=robinfrench-20',
    vetNote: 'Cruciferous vegetable with antioxidants and vitamin C.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'zucchini': {
    productName: 'Zucchini (Frozen, Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07Q9WV1LY?tag=robinfrench-20',
    vetNote: 'Low-calorie vegetable providing hydration and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'kale': {
    productName: 'Kale (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B09VKDGT39?tag=robinfrench-20',
    vetNote: 'Nutrient-dense leafy green with calcium and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'celery': {
    productName: 'Celery (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B09VKDGT39?tag=robinfrench-20',
    vetNote: 'Low-calorie crunchy vegetable providing hydration and fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'brussels sprouts': {
    productName: 'Brussels sprouts (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B004DAQPR0?tag=robinfrench-20',
    vetNote: 'Cruciferous vegetable with sulforaphane for antioxidant support.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'asparagus': {
    productName: 'Asparagus (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07QV5G8HY?tag=robinfrench-20',
    vetNote: 'Diuretic vegetable supporting urinary tract health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'parsley': {
    productName: 'Parsley',
    amazonLink: 'https://www.amazon.com/dp/B0D8C4N4WY?tag=robinfrench-20',
    vetNote: 'Fresh herb providing chlorophyll and natural breath freshening.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'cucumber': {
    productName: 'Cucumber (Frozen, Organic)',
    amazonLink: 'https://www.amazon.com/dp/B001PLETDC?tag=robinfrench-20',
    vetNote: 'Hydrating vegetable with natural electrolytes.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'lettuce (romaine)': {
    productName: 'Lettuce (romaine) (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0F3YTY4XQ?tag=robinfrench-20',
    vetNote: 'Leafy green providing hydration and vitamin K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'arugula': {
    productName: 'Arugula (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B00JXR8RYW?tag=robinfrench-20',
    vetNote: 'Peppery leafy green with calcium and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'endive': {
    productName: 'Endive (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0006L2XNK?tag=robinfrench-20',
    vetNote: 'Bitter leafy green supporting liver health and digestion.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'escarole': {
    productName: 'Escarole (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B084ZVBGQ6?tag=robinfrench-20',
    vetNote: 'Mild leafy green providing folate and vitamin K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'dandelion greens': {
    productName: 'Dandelion greens (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000WR4A5M?tag=robinfrench-20',
    vetNote: 'Natural diuretic supporting kidney and liver health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'collard greens': {
    productName: 'Collard greens (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000P6H23W?tag=robinfrench-20',
    vetNote: 'Calcium-rich leafy green for bone and dental health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'mustard greens': {
    productName: 'Mustard greens (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B094JT2CCH?tag=robinfrench-20',
    vetNote: \\'spicy leafy green with antioxidants and vitamin K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'turnip greens': {
    productName: 'Turnip greens (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B09HQH6WZT?tag=robinfrench-20',
    vetNote: 'Nutrient-dense greens with calcium and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'beet greens': {
    productName: 'Beet greens (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0F9LNFLTK?tag=robinfrench-20',
    vetNote: 'Iron-rich greens supporting red blood cell production.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'radish greens': {
    productName: 'Radish greens (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07CHNV4S1?tag=robinfrench-20',
    vetNote: 'Peppery greens providing vitamin C and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'coconut oil': {
    productName: 'Coconut oil (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B00UHCJKVG?tag=robinfrench-20',
    vetNote: 'Medium-chain triglycerides for quick energy and cognitive support.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'olive oil': {
    productName: 'Olive oil',
    amazonLink: 'https://www.amazon.com/dp/B00GGBLPVU?tag=robinfrench-20',
    vetNote: 'Monounsaturated fats with antioxidants for skin and coat health.',
    category: 'Oil',
    commissionRate: 0.03
  },
  \\'salmon oil': {
    productName: \\'salmon oil',
    amazonLink: 'https://www.amazon.com/dp/B09RYYWHH1?tag=robinfrench-20',
    chewyLink: 'https://www.chewy.com/grizzly-salmon-oil-omega-3-wild/dp/148916',
    vetNote: 'Concentrated omega-3 fatty acids for joint, skin, and heart health.',
    category: 'Oil',
    commissionRate: 0.08
  },
  'flaxseed oil': {
    productName: "Flaxseed oil\\'s Organic Flax Oil",
    amazonLink: 'https://www.amazon.com/dp/B002VLZ830?tag=robinfrench-20',
    vetNote: 'Plant-based omega-3 source for skin and coat conditioning.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'fish oil': {
    productName: 'Fish oil',
    amazonLink: 'https://www.amazon.com/dp/B00CBY93XS?tag=robinfrench-20',
    vetNote: 'Purified fish oil with optimal EPA/DHA ratio for canine health.',
    category: 'Oil',
    commissionRate: 0.03
  },

  // === SUPPLEMENTS (Dogs & Cats) ===
  'taurine powder': {
    productName: 'Taurine powder',
    amazonLink: 'https://www.amazon.com/dp/B00VAOKFO6?tag=robinfrench-20',
    vetNote: 'Essential amino acid for heart health and vision support in cats.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'calcium carbonate': {
    productName: 'Calcium carbonate',
    amazonLink: 'https://www.amazon.com/dp/B004421K68?tag=robinfrench-20',
    vetNote: 'Highly bioavailable calcium source for bone health and metabolic balance.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'vitamin e': {
    productName: 'Vitamin e',
    amazonLink: 'https://www.amazon.com/dp/B01I5OB3LW?tag=robinfrench-20',
    vetNote: 'Antioxidant vitamin supporting immune function and skin health.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'b-complex': {
    productName: 'B-complex',
    amazonLink: 'https://www.amazon.com/dp/B01INRFW0E?tag=robinfrench-20',
    vetNote: 'Complete B vitamin complex for energy metabolism and nervous system health.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'probiotic powder': {
    productName: 'Probiotic powder',
    amazonLink: 'https://www.amazon.com/dp/B0BGV8L7L2?tag=robinfrench-20',
    vetNote: 'Veterinarian-recommended probiotic for digestive health and immune support.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'psyllium husk': {
    productName: 'Psyllium husk (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0016AXN7A?tag=robinfrench-20',
    vetNote: \\'soluble fiber for digestive health and hairball prevention in cats.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'joint supplement': {
    productName: 'Joint supplement',
    amazonLink: 'https://www.amazon.com/dp/B003ULL1NQ?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated glucosamine supplement for joint health and mobility.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'omega-3 capsules': {
    productName: 'Omega-3 capsules',
    amazonLink: 'https://www.amazon.com/dp/B004OA5XP4?tag=robinfrench-20',
    vetNote: 'Purified fish oil capsules providing EPA/DHA for skin, coat, and joint health.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'digestive enzymes': {
    productName: 'Digestive enzymes',
    amazonLink: 'https://www.amazon.com/dp/B00O6FINFO?tag=robinfrench-20',
    vetNote: 'Enzyme blend supporting digestion of proteins, fats, and carbohydrates.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'hairball paste': {
    productName: 'Hairball paste',
    amazonLink: 'https://www.amazon.com/dp/B07B282MR4?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated paste for hairball prevention and digestive health.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'chicken broth': {
    productName: 'Chicken broth',
    amazonLink: 'https://www.amazon.com/dp/B07DFNP37Y?tag=robinfrench-20',
    vetNote: 'Concentrated bone broth providing collagen, glucosamine, and natural electrolytes.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'vitamin e oil': {
    productName: 'Vitamin e oil',
    amazonLink: 'https://www.amazon.com/dp/B0DZ5ZCC85?tag=robinfrench-20',
    vetNote: 'Natural vitamin E oil for topical skin health and antioxidant support.',
    category: 'Oil',
    commissionRate: 0.03
  },

  // === BIRDS ===
  'millet (white/red)': {
    productName: "Millet (white/red)\\'s Parrot Food White Millet Spray",
    amazonLink: 'https://www.amazon.com/dp/B0002DH3FU?tag=robinfrench-20',
    vetNote: 'High-quality millet spray for parrots and hookbills.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'canary seed': {
    productName: "Millet (white/red)\\'s Parrot Food Canary Seed",
    amazonLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Traditional canary seed mix for small birds.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'niger seed': {
    productName: "Millet (white/red)\\'s Parrot Food Niger Seed",
    amazonLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Thistle seed attracting finches and small songbirds.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'oat groats': {
    productName: "Millet (white/red)\\'s Parrot Food Oat Groats",
    amazonLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Whole oat groats for larger parrots and hookbills.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'hemp seeds': {
    productName: "Millet (white/red)\\'s Parrot Food Hemp Seed",
    amazonLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Nutrient-rich hemp seeds for feather health.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'flaxseeds': {
    productName: "Millet (white/red)\\'s Parrot Food Flax Seed",
    amazonLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Omega-3 rich flax seeds for skin and feather health.',
    category: \\'seed',
    commissionRate: 0.03
  },
  \\'sesame seeds': {
    productName: "Millet (white/red)\\'s Parrot Food Sesame Seed",
    amazonLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Calcium-rich sesame seeds for bone health.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'chia seeds': {
    productName: "Millet (white/red)\\'s Parrot Food Chia Seed",
    amazonLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Hydrating chia seeds providing omega-3s and fiber.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'quinoa (cooked)': {
    productName: "Millet (white/red)\\'s Parrot Food Cooked Quinoa",
    amazonLink: 'https://www.amazon.com/dp/B001CCOVB4?tag=robinfrench-20',
    vetNote: 'Complete protein grain for avian nutrition.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'rapeseed': {
    productName: "Millet (white/red)\\'s Parrot Food Rapeseed",
    amazonLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Canola/rapeseed for additional dietary variety.',
    category: \\'seed',
    commissionRate: 0.03
  },
  \\'sunflower seeds (small amounts)': {
    productName: "Millet (white/red)\\'s Parrot Food Sunflower Seed",
    amazonLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'High-fat seeds to be fed in moderation.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'pumpkin seeds': {
    productName: "Millet (white/red)\\'s Parrot Food Pumpkin Seed",
    amazonLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Nutrient-dense seeds with natural deworming properties.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'bell peppers': {
    productName: 'Bell peppers (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000P6J14K?tag=robinfrench-20',
    vetNote: 'Vitamin C rich peppers for immune health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'corn (fresh)': {
    productName: 'Corn (fresh) (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000REL738?tag=robinfrench-20',
    vetNote: 'Fresh corn providing carbohydrates and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'apples (no seeds)': {
    productName: 'Apples (no seeds) (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B00AR0TG44?tag=robinfrench-20',
    vetNote: 'Vitamin-rich fruit providing natural sugars and fiber.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'blueberries': {
    productName: "Blueberries\\'s Organic Blueberries",
    amazonLink: 'https://www.amazon.com/dp/B07Z568Y3N?tag=robinfrench-20',
    vetNote: 'Antioxidant-rich berries for immune and cognitive health.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  \\'strawberries': {
    productName: "Blueberries\\'s Organic Strawberries",
    amazonLink: 'https://www.amazon.com/dp/B002B8Z98W?tag=robinfrench-20',
    vetNote: 'Vitamin C rich berries providing natural hydration.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'mango': {
    productName: 'Mango (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B00WM6CHFQ?tag=robinfrench-20',
    vetNote: 'Tropical fruit providing beta-carotene and vitamin C.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'banana': {
    productName: 'Banana (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07ZLFKBFD?tag=robinfrench-20',
    vetNote: 'Potassium-rich fruit for electrolyte balance.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'grapes (chopped)': {
    productName: 'Grapes (chopped) (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000RGYJI6?tag=robinfrench-20',
    vetNote: 'Hydrating fruit providing natural antioxidants.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'papaya': {
    productName: 'Papaya (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07FZ159ZB?tag=robinfrench-20',
    vetNote: 'Digestive enzyme-rich fruit for gut health.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'melon': {
    productName: 'Melon (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000NSGULC?tag=robinfrench-20',
    vetNote: 'High-water content fruit for hydration.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'egg (hard-boiled)': {
    productName: 'Egg (hard-boiled) (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0BWBNT8JX?tag=robinfrench-20',
    vetNote: 'Calcium and protein-rich egg treats for birds.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'pellets (fortified)': {
    productName: "Millet (white/red)\\'s Parrot Food Pellets",
    amazonLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Complete nutrition pellets formulated for avian health.',
    category: 'Pellet',
    commissionRate: 0.03
  },
  'cuttlebone': {
    productName: "Millet (white/red)\\'s Parrot Food Cuttlebone",
    amazonLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Natural calcium source for beak and bone health.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'honey (tiny amounts)': {
    productName: 'Honey (tiny amounts) (Raw)',
    amazonLink: 'https://www.amazon.com/dp/B0791X9GSG?tag=robinfrench-20',
    vetNote: 'Natural sweetener and antimicrobial properties (use sparingly).',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'peanut butter (unsalted, tiny amounts)': {
    productName: 'Peanut butter (unsalted, tiny amounts)',
    amazonLink: 'https://www.amazon.com/dp/B06ZXZ3JPZ?tag=robinfrench-20',
    vetNote: 'Healthy fat source for foraging enrichment (unsalted only).',
    category: \\'supplement',
    commissionRate: 0.03
  },

  // === REPTILES ===
  'dubia roaches': {
    productName: "Dubia roaches\\'s Frogs Live Dubia Roaches",
    amazonLink: 'https://www.amazon.com/dp/B09QD6PBB8?tag=robinfrench-20',
    vetNote: 'High-quality feeder insects with optimal calcium-to-phosphorus ratio.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'crickets': {
    productName: "Crickets\\'s Live Crickets",
    amazonLink: 'https://www.amazon.com/dp/B000YFGS52?tag=robinfrench-20',
    vetNote: \\'standard feeder insects gut-loaded for nutritional value.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'mealworms': {
    productName: "Crickets\\'s Freeze Dried Mealworms",
    amazonLink: 'https://www.amazon.com/dp/B07TKDYMMP?tag=robinfrench-20',
    vetNote: 'Dried mealworms providing fat and protein for insectivorous reptiles.',
    category: 'Insect',
    commissionRate: 0.03
  },
  \\'superworms': {
    productName: "Dubia roaches\\'s Frogs Live Superworms",
    amazonLink: 'https://www.amazon.com/dp/B01018SX5Y?tag=robinfrench-20',
    vetNote: 'Larger feeder insects for bigger reptiles and amphibians.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'black soldier fly larvae': {
    productName: 'Black soldier fly larvae',
    amazonLink: 'https://www.amazon.com/dp/B0BLZ88Q3R?tag=robinfrench-20',
    vetNote: \\'sustainable, high-calcium feeder insects with excellent nutrition.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'hornworms': {
    productName: "Dubia roaches\\'s Frogs Live Hornworms",
    amazonLink: 'https://www.amazon.com/dp/B09Y4RTNK9?tag=robinfrench-20',
    vetNote: 'Moisture-rich feeder insects ideal for tropical species.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'acorn squash': {
    productName: 'Acorn squash (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07FZ34ZS4?tag=robinfrench-20',
    vetNote: 'Nutrient-rich squash providing beta-carotene and fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'figs': {
    productName: 'Figs (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B08MDKF98D?tag=robinfrench-20',
    vetNote: 'Calcium-rich dried fruit for omnivorous reptiles.',
    category: 'Fruit',
    commissionRate: 0.03
  },

  // === POCKET PETS ===
  'timothy hay': {
    productName: 'Timothy hay',
    amazonLink: 'https://www.amazon.com/dp/B006AYMMRY?tag=robinfrench-20',
    vetNote: 'High-quality timothy hay for proper dental health and digestion.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'meadow hay': {
    productName: 'Meadow hay',
    amazonLink: 'https://www.amazon.com/dp/B07CJ2FRNC?tag=robinfrench-20',
    vetNote: 'Nutrient-rich meadow hay providing essential fiber.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'orchard grass hay': {
    productName: 'Orchard grass hay',
    amazonLink: 'https://www.amazon.com/dp/B00S6Y8MHU?tag=robinfrench-20',
    vetNote: 'Premium orchard grass hay for optimal small animal nutrition.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'alfalfa hay': {
    productName: 'Alfalfa hay',
    amazonLink: 'https://www.amazon.com/dp/B0CM34Z4BQ?tag=robinfrench-20',
    vetNote: 'Calcium-rich alfalfa hay for young or pregnant small animals.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'romaine lettuce': {
    productName: 'Lettuce (romaine) (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0F3YTY4XQ?tag=robinfrench-20',
    vetNote: 'Hydrating leafy green providing vitamins and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'cilantro': {
    productName: 'Cilantro (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07M9FWTRC?tag=robinfrench-20',
    vetNote: 'Fresh herb providing natural antioxidants and flavor.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'basil': {
    productName: 'Basil (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B097F282FC?tag=robinfrench-20',
    vetNote: 'Aromatic herb providing antioxidants and natural flavor enhancement.',
    category: 'Vegetable',
    commissionRate: 0.03
  },

  // === COMPREHENSIVE VETTED PRODUCTS (128 ingredients from sourcing guide) ===
  'duck hearts': {
    productName: 'Duck hearts (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0BWBNT8JX?tag=robinfrench-20',
    vetNote: 'Vital Essentials or Raw Paws Pet Food. Freeze-dried for convenience and safety.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'lamb liver': {
    productName: "Lamb liver\\'s Freeze Dried Lamb Liver",
    amazonLink: 'https://www.amazon.com/dp/B0015G862M?tag=robinfrench-20',
    vetNote: "Northwest Naturals or Stella & Chewy\'s. Freeze-dried organ meat.",
    category: 'Meat',
    commissionRate: 0.03
  },
  'duck liver': {
    productName: 'Duck liver (Freeze Dried)',
    amazonLink: 'https://www.amazon.com/dp/B0BWBV5PRJ?tag=robinfrench-20',
    vetNote: 'Vital Essentials freeze-dried duck liver treat.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken necks': {
    productName: 'Chicken necks (Raw)',
    amazonLink: 'https://www.amazon.com/dp/B0821PF71M?tag=robinfrench-20',
    vetNote: 'Raw Paws Pet Food or My Pet Carnivore. Raw chicken necks for dental health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey thighs': {
    productName: 'Turkey thighs',
    amazonLink: 'https://www.amazon.com/dp/B00AR100NE?tag=robinfrench-20',
    vetNote: 'Human-grade source from butcher or grocery store.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground duck': {
    productName: 'Ground duck (Raw)',
    amazonLink: 'https://www.amazon.com/dp/B0BY3CNR3Q?tag=robinfrench-20',
    vetNote: 'Raw Paws Pet Food or Darwins Pet Food. Frozen/raw ground duck.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground lamb (lean)': {
    productName: 'Ground lamb (lean)',
    amazonLink: 'https://www.amazon.com/dp/B088Y2N6WC?tag=robinfrench-20',
    vetNote: 'Human-grade lean ground lamb from quality source.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground herring': {
    productName: 'Ground herring',
    amazonLink: 'https://www.amazon.com/dp/B00B3G89MQ?tag=robinfrench-20',
    vetNote: 'K9 Natural hoki/fish blend for pets.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground mackerel': {
    productName: 'Ground mackerel (Raw)',
    amazonLink: 'https://www.amazon.com/dp/B079Z4MZTG?tag=robinfrench-20',
    vetNote: 'Northwest Naturals raw fish blend.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'mackerel (canned)': {
    productName: 'Mackerel (canned)',
    amazonLink: 'https://www.amazon.com/dp/B017J9X8IA?tag=robinfrench-20',
    vetNote: 'Wild Planet or Safe Catch. Canned in water, no salt added.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'herring (canned)': {
    productName: 'Herring (canned)',
    amazonLink: 'https://www.amazon.com/dp/B01FUWYO2M?tag=robinfrench-20',
    vetNote: 'Crown Prince or Season. Canned in water, no salt added.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken sausage (no additives)': {
    productName: 'Chicken sausage (no additives)',
    amazonLink: 'https://www.amazon.com/dp/B001JO4O80?tag=robinfrench-20',
    vetNote: 'Niman Ranch or Applegate. Read labels carefully for nitrates/sugar.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey sausage (no additives)': {
    productName: 'Turkey sausage (no additives)',
    amazonLink: 'https://www.amazon.com/dp/B00I2VLI5A?tag=robinfrench-20',
    vetNote: 'Applegate Naturals. Read labels carefully.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground pork (lean, small amounts)': {
    productName: 'Ground pork (lean, small amounts)',
    amazonLink: 'https://www.amazon.com/dp/B01H0AI6J4?tag=robinfrench-20',
    vetNote: 'Human-grade lean ground pork.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'regular potato': {
    productName: 'Regular potato',
    amazonLink: 'https://www.amazon.com/dp/B09SHBJWBR?tag=robinfrench-20',
    vetNote: 'Human-grade standard russet potato.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'walnut oil': {
    productName: 'Walnut oil',
    amazonLink: 'https://www.amazon.com/dp/B00QGWLZ3C?tag=robinfrench-20',
    vetNote: 'La Tourangelle or NOW Foods. Cold-pressed, human-grade.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'black currant oil': {
    productName: 'Black currant oil',
    amazonLink: 'https://www.amazon.com/dp/B01FXEM0BY?tag=robinfrench-20',
    vetNote: 'NOW Foods or Life-Flo. Capsules often best.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'almond oil': {
    productName: 'Almond oil',
    amazonLink: 'https://www.amazon.com/dp/B0BXMMDNJ8?tag=robinfrench-20',
    vetNote: 'NOW Foods or Viva Naturals. Cold-pressed, edible grade.',
    category: 'Oil',
    commissionRate: 0.03
  },
  \\'sunflower oil': {
    productName: \\'sunflower oil',
    amazonLink: 'https://www.amazon.com/dp/B00MNTRVPS?tag=robinfrench-20',
    vetNote: 'Goya or BetterBody Foods. High oleic, cold-pressed.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'chia seed oil': {
    productName: 'Chia seed oil (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B00WM6CHFQ?tag=robinfrench-20',
    vetNote: 'Healthworks or Organic Veda. Cold-pressed.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'herring oil': {
    productName: 'Herring oil',
    amazonLink: 'https://www.amazon.com/dp/B00CBY93XS?tag=robinfrench-20',
    vetNote: 'Nordic Naturals Pet or Grizzly Pet Products.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'anchovy oil': {
    productName: 'Anchovy oil',
    amazonLink: 'https://www.amazon.com/dp/B0FDNB2DVS?tag=robinfrench-20',
    vetNote: 'Nordic Naturals Pet or Carlson Labs.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'evening primrose oil': {
    productName: "Green peas\\'s Way Evening Primrose Oil",
    amazonLink: 'https://www.amazon.com/dp/B07FPBQ31W?tag=robinfrench-20',
    vetNote: "NOW Foods or Nature\'s Way. Capsules often best.",
    category: 'Oil',
    commissionRate: 0.03
  },
  'mackerel oil': {
    productName: 'Mackerel oil',
    amazonLink: 'https://www.amazon.com/dp/B01NBTJFJB?tag=robinfrench-20',
    vetNote: 'Nordic Naturals Pet or Jarrow Formulas.',
    category: 'Oil',
    commissionRate: 0.03
  },
  \\'sardine oil': {
    productName: \\'sardine oil',
    amazonLink: 'https://www.amazon.com/dp/B0CXKHT5K2?tag=robinfrench-20',
    vetNote: 'Zesty Paws or Grizzly Salmon Oil.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'borage oil': {
    productName: 'Borage oil',
    amazonLink: 'https://www.amazon.com/dp/B01FXEM0BY?tag=robinfrench-20',
    vetNote: 'NOW Foods or Barleans. Cold-pressed.',
    category: 'Oil',
    commissionRate: 0.03
  },
  \\'sesame oil': {
    productName: \\'sesame oil',
    amazonLink: 'https://www.amazon.com/dp/B0797GTG2C?tag=robinfrench-20',
    vetNote: 'Chosen Foods or Spectrum. Toasted or un-toasted.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'avocado oil': {
    productName: 'Avocado oil',
    amazonLink: 'https://www.amazon.com/dp/B0C3WCRNPN?tag=robinfrench-20',
    vetNote: 'Chosen Foods or La Tourangelle. Pure avocado oil.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'avocado oil (tiny amounts)': {
    productName: 'Avocado oil',
    amazonLink: 'https://www.amazon.com/dp/B0C3WCRNPN?tag=robinfrench-20',
    vetNote: 'Chosen Foods or La Tourangelle. Pure avocado oil.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'wheat germ oil': {
    productName: 'Wheat germ oil',
    amazonLink: 'https://www.amazon.com/dp/B001GAOHK2?tag=robinfrench-20',
    vetNote: 'NOW Foods or Solgar. High potency liquid.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'krill oil': {
    productName: 'Krill oil',
    amazonLink: 'https://www.amazon.com/dp/B004HIQ9CY?tag=robinfrench-20',
    vetNote: 'Viva Labs or Kori Krill Oil. Pure krill oil supplement.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'algae oil (dha)': {
    productName: 'Algae oil (dha)',
    amazonLink: 'https://www.amazon.com/dp/B079J5YZSS?tag=robinfrench-20',
    vetNote: 'Nordic Naturals Algae Omega or Ovega-3. Vegan DHA.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'omega-3 oil': {
    productName: 'Omega-3 oil',
    amazonLink: 'https://www.amazon.com/dp/B09RYYWHH1?tag=robinfrench-20',
    vetNote: 'Grizzly Salmon Oil or Nordic Naturals Pet.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'kelp powder': {
    productName: 'Kelp powder (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0002JG1GG?tag=robinfrench-20',
    vetNote: 'NOW Foods or Starwest Botanicals. Organic kelp powder.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'joint health powder': {
    productName: 'Joint health powder',
    amazonLink: 'https://www.amazon.com/dp/B00PXK1G50?tag=robinfrench-20',
    vetNote: 'Nutramax Dasuquin or VetriScience Glycoflex.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'amino acid supplement': {
    productName: 'Amino acid supplement',
    amazonLink: 'https://www.amazon.com/dp/B0C2JFLZHF?tag=robinfrench-20',
    vetNote: 'Purina Pro Plan Veterinary Diets amino acid supplement.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'calcium supplement': {
    productName: 'Calcium supplement',
    amazonLink: 'https://www.amazon.com/dp/B0CKNK682W?tag=robinfrench-20',
    vetNote: 'NOW Foods Calcium Carbonate or Thomas Labs Calciboost.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  \\'spirulina powder': {
    productName: \\'spirulina powder (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B08S4982CC?tag=robinfrench-20',
    vetNote: 'NOW Foods or Vimergy. Organic, high purity.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'electrolyte powder': {
    productName: 'Electrolyte powder',
    amazonLink: 'https://www.amazon.com/dp/B0FMZHN6M1?tag=robinfrench-20',
    vetNote: 'ReptoBoost or Pedialyte. Unflavored, read labels.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'vitamin d3 drops': {
    productName: 'Vitamin d3 drops',
    amazonLink: 'https://www.amazon.com/dp/B0062QD5LM?tag=robinfrench-20',
    vetNote: 'NOW Foods or Ddrops. 1000 IU per drop.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'brewer\'s yeast': {
    productName: "Quinoa\\'s Red Mill Brewer\"s Yeast Flakes',
    amazonLink: 'https://www.amazon.com/dp/B084JL2R77?tag=robinfrench-20',
    vetNote: "NOW Foods or Bob\'s Red Mill. Nutritional or brewer\"s yeast.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'buckwheat': {
    productName: "Quinoa\\'s Red Mill Raw Hulled Buckwheat Groats",
    amazonLink: 'https://www.amazon.com/dp/B00KQ17MDG?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Anthony\"s Goods. Raw hulled buckwheat groats.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'buckwheat (tiny amounts)': {
    productName: "Quinoa\\'s Red Mill Raw Hulled Buckwheat Groats",
    amazonLink: 'https://www.amazon.com/dp/B00KQ17MDG?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Anthony\"s Goods. Raw hulled buckwheat groats.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'buckwheat (hulled)': {
    productName: "Buckwheat (hulled)\\'s Goods Hulled Buckwheat Groats",
    amazonLink: 'https://www.amazon.com/dp/B0D15QDVW7?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Anthony\"s Goods. Hulled buckwheat groats.',
    category: 'Carb',
    commissionRate: 0.03
  },
  \\'sorghum': {
    productName: "Quinoa\\'s Red Mill Whole Grain Sorghum",
    amazonLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Shiloh Farms. Whole grain sorghum.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'barley': {
    productName: "Quinoa\\'s Red Mill Hulled Barley Grain",
    amazonLink: 'https://www.amazon.com/dp/B0D481997Z?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill hulled barley grain.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'barley (cooked, minimal)': {
    productName: "Quinoa\\'s Red Mill Hulled Barley Grain",
    amazonLink: 'https://www.amazon.com/dp/B00QKP257A?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill hulled barley grain.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'barley (hulled)': {
    productName: "Quinoa\\'s Red Mill Hulled Barley Grain",
    amazonLink: 'https://www.amazon.com/dp/B00QKP257A?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill hulled barley grain.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'millet': {
    productName: "Quinoa\\'s Red Mill Whole Grain Millet",
    amazonLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Organic Grains. Whole grain millet.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'millet (tiny amounts)': {
    productName: "Quinoa\\'s Red Mill Whole Grain Millet",
    amazonLink: 'https://www.amazon.com/dp/B07XPCWYP2?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Organic Grains. Whole grain millet.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'farro': {
    productName: "Quinoa\\'s Red Mill Farro Grain",
    amazonLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Thrive Market. Farro grain.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'bulgur': {
    productName: "Quinoa\\'s Red Mill Fine Bulgur Wheat",
    amazonLink: 'https://www.amazon.com/dp/B081DQ5NG5?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Ziyad. Fine bulgur wheat.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'amaranth (tiny amounts)': {
    productName: "Quinoa\\'s Red Mill Whole Grain Amaranth Seed",
    amazonLink: 'https://www.amazon.com/dp/B000V1O40U?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Anthony\"s Goods. Whole grain amaranth seed.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'amaranth seeds': {
    productName: "Quinoa\\'s Red Mill Whole Grain Amaranth Seed",
    amazonLink: 'https://www.amazon.com/dp/B000V1O40U?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Anthony\"s Goods. Whole grain amaranth seed.',
    category: \\'seed',
    commissionRate: 0.03
  },
  'teff seeds': {
    productName: "Quinoa\\'s Red Mill Whole Grain Teff Seeds",
    amazonLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill whole grain teff seeds.",
    category: \\'seed',
    commissionRate: 0.03
  },
  'wheat (hulled)': {
    productName: "Quinoa\\'s Red Mill Whole Hulled Wheat Berries",
    amazonLink: 'https://www.amazon.com/dp/B000YFB5NC?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or SpeltLife. Whole hulled wheat berries.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'oat bran (small amounts)': {
    productName: "Quinoa\\'s Red Mill Pure Oat Bran Cereal",
    amazonLink: 'https://www.amazon.com/dp/B07CC9RF6Y?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Quaker. Pure oat bran cereal.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'oatmeal (cooked, small amounts)': {
    productName: 'Oatmeal (cooked, small amounts)',
    amazonLink: 'https://www.amazon.com/dp/B00CTLAIH8?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Quaker. Rolled oats old fashioned.",
    category: 'Carb',
    commissionRate: 0.03
  },
  'corn (cracked)': {
    productName: 'Corn (cracked)',
    amazonLink: 'https://www.amazon.com/dp/B01HHGD81C?tag=robinfrench-20',
    vetNote: \\'scratch and Peck Feeds or Purina. Cracked corn non-GMO.',
    category: 'Carb',
    commissionRate: 0.03
  },
  \\'safflower seeds': {
    productName: "Safflower seeds\\'s Pure Safflower Seed Bird Food",
    amazonLink: 'https://www.amazon.com/dp/B0FWLFGG21?tag=robinfrench-20',
    vetNote: "Wagner\'s or Kaytee. Pure safflower seed bird food.",
    category: \\'seed',
    commissionRate: 0.03
  },
  'nyjer seeds': {
    productName: "Safflower seeds\\'s Nyjer Seed Bird Food",
    amazonLink: 'https://www.amazon.com/dp/B0D6688V7C?tag=robinfrench-20',
    vetNote: "Wagner\'s or Kaytee. Nyjer seed bird food.",
    category: \\'seed',
    commissionRate: 0.03
  },
  'bok choi': {
    productName: 'Bok choi',
    amazonLink: 'https://www.amazon.com/dp/B0FN4YGSK6?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'bok choy (small amounts)': {
    productName: 'Bok choi',
    amazonLink: 'https://www.amazon.com/dp/B0FN4YGSK6?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'navy beans (mashed)': {
    productName: 'Navy beans (mashed)',
    amazonLink: 'https://www.amazon.com/dp/B006AZE13G?tag=robinfrench-20',
    vetNote: "Goya or Bush\'s. Canned navy beans, low sodium, rinse well.",
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'kidney beans (mashed)': {
    productName: 'Kidney beans (mashed)',
    amazonLink: 'https://www.amazon.com/dp/B00552005I?tag=robinfrench-20',
    vetNote: "Goya or Bush\'s. Canned dark red kidney beans, low sodium, rinse well.",
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'kidney beans (mashed, tiny amounts)': {
    productName: 'Kidney beans (mashed)',
    amazonLink: 'https://www.amazon.com/dp/B00552005I?tag=robinfrench-20',
    vetNote: "Goya or Bush\'s. Canned dark red kidney beans, low sodium, rinse well.",
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'pinto beans (mashed)': {
    productName: "Pinto beans (mashed)\\'s Canned Pinto Beans Low Sodium",
    amazonLink: 'https://www.amazon.com/dp/B0C4G2PR58?tag=robinfrench-20',
    vetNote: "Goya or Bush\'s. Canned pinto beans, low sodium, rinse well.",
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'purslane': {
    productName: 'Purslane',
    amazonLink: 'https://www.amazon.com/dp/B09MDXM2YQ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'purslane (small amounts)': {
    productName: 'Purslane',
    amazonLink: 'https://www.amazon.com/dp/B0BWY8JWVL?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'miner\'s lettuce': {
    productName: "S lettuce\\'s Lettuce Seeds for Planting",
    amazonLink: 'https://www.amazon.com/dp/B0D3J7FZFD?tag=robinfrench-20',
    vetNote: 'Fresh produce or seeds for growing.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'flaxseed (ground)': {
    productName: "Quinoa\\'s Red Mill Organic Ground Flaxseed Meal",
    amazonLink: 'https://www.amazon.com/dp/B075XC6C69?tag=robinfrench-20',
    vetNote: "Bob\'s Red Mill or Spectrum. Organic ground flaxseed meal.",
    category: \\'seed',
    commissionRate: 0.03
  },
  'fennel': {
    productName: 'Fennel',
    amazonLink: 'https://www.amazon.com/dp/B00E3J6RC4?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'delicata squash': {
    productName: 'Delicata squash',
    amazonLink: 'https://www.amazon.com/dp/B07KHH8K4L?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'yellow squash': {
    productName: 'Yellow squash',
    amazonLink: 'https://www.amazon.com/dp/B08QVBFGDC?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'leeks': {
    productName: 'Leeks',
    amazonLink: 'https://www.amazon.com/dp/B09HQJGQDG?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'shallots': {
    productName: \\'shallots',
    amazonLink: 'https://www.amazon.com/dp/B09B2ZWHKQ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'tomatoes (small amounts)': {
    productName: 'Tomatoes (small amounts)',
    amazonLink: 'https://www.amazon.com/dp/B086WX15TH?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'napa cabbage': {
    productName: 'Napa cabbage',
    amazonLink: 'https://www.amazon.com/dp/B07FTVYNM3?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'napa cabbage (small amounts)': {
    productName: 'Napa cabbage',
    amazonLink: 'https://www.amazon.com/dp/B079VV1K9L?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'artichokes': {
    productName: 'Artichokes',
    amazonLink: 'https://www.amazon.com/dp/B0DF91JXND?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'frisee': {
    productName: 'Frisee',
    amazonLink: 'https://www.amazon.com/dp/B07FZGKZL4?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'radicchio': {
    productName: 'Radicchio',
    amazonLink: 'https://www.amazon.com/dp/B00BJPTZLA?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'red cabbage': {
    productName: 'Red cabbage',
    amazonLink: 'https://www.amazon.com/dp/B000RH1MXK?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'green cabbage': {
    productName: 'Green cabbage',
    amazonLink: 'https://www.amazon.com/dp/B09HQGDCKV?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'swiss chard': {
    productName: \\'swiss chard',
    amazonLink: 'https://www.amazon.com/dp/B07F12P248?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'swiss chard (cooked, tiny amounts)': {
    productName: \\'swiss chard',
    amazonLink: 'https://www.amazon.com/dp/B07F12P248?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'lettuce (romaine, small amounts)': {
    productName: 'Lettuce (romaine, small amounts)',
    amazonLink: 'https://www.amazon.com/dp/B074H5J9G2?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'red leaf lettuce': {
    productName: 'Red leaf lettuce',
    amazonLink: 'https://www.amazon.com/dp/B0BX76BG5V?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'mache': {
    productName: "Mache\\'s Lettuce",
    amazonLink: 'https://www.amazon.com/dp/B00AWLAQFG?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'alfalfa sprouts (small amounts)': {
    productName: 'Alfalfa sprouts (small amounts)',
    amazonLink: 'https://www.amazon.com/dp/B0DFZTWLTY?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'cat grass (wheatgrass)': {
    productName: 'Cat grass (wheatgrass)',
    amazonLink: 'https://www.amazon.com/dp/B0D45F9TGG?tag=robinfrench-20',
    vetNote: \\'smartyKat or Catit. Cat Grass growing kit wheatgrass.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'squash (cooked)': {
    productName: \\'squash (cooked)',
    amazonLink: 'https://www.amazon.com/dp/B002QY3U5A?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'lamb\'s quarters': {
    productName: "S quarters\\'s Quarters Seeds",
    amazonLink: 'https://www.amazon.com/dp/B0DYPHGW89?tag=robinfrench-20',
    vetNote: 'Wild harvested or seeds for growing.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'amaranth leaves': {
    productName: 'Amaranth leaves',
    amazonLink: 'https://www.amazon.com/dp/B0F2YRBGS6?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'ginger (small amounts)': {
    productName: 'Ginger (small amounts) (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0C6V3416T?tag=robinfrench-20',
    vetNote: 'McCormick or Simply Organic. Organic ginger root fresh.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'turmeric': {
    productName: 'Turmeric (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B018GPDCV4?tag=robinfrench-20',
    vetNote: \\'simply Organic or Tummydrops. Pure turmeric powder.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'rosemary': {
    productName: 'Rosemary (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B004JWLMNY?tag=robinfrench-20',
    vetNote: \\'simply Organic or Frontier Co-op. Dried organic rosemary.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'sage': {
    productName: \\'sage (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0CH3R9TVY?tag=robinfrench-20',
    vetNote: \\'simply Organic or Frontier Co-op. Dried sage leaf.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'mint': {
    productName: 'Mint',
    amazonLink: 'https://www.amazon.com/dp/B097F3NT7N?tag=robinfrench-20',
    vetNote: 'Fresh produce or Mountain Rose Herbs. Fresh mint leaves.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'garlic chives': {
    productName: 'Garlic chives',
    amazonLink: 'https://www.amazon.com/dp/B097F3J1PY?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'raisins (unsweetened)': {
    productName: 'Raisins (unsweetened) (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B01GXPRIQY?tag=robinfrench-20',
    vetNote: "Sun-Maid or Trader Joe\'s. Organic raisins unsweetened no oil.",
    category: 'Fruit',
    commissionRate: 0.03
  },
  'plums (pitted)': {
    productName: 'Plums (pitted)',
    amazonLink: 'https://www.amazon.com/dp/B07P6Z8L76?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'apricots (pitted)': {
    productName: 'Apricots (pitted)',
    amazonLink: 'https://www.amazon.com/dp/B07FZWBPC5?tag=robinfrench-20',
    vetNote: 'Fresh produce or NOW Foods. Dried apricots unsulphured no sugar.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'kiwi': {
    productName: 'Kiwi',
    amazonLink: 'https://www.amazon.com/dp/B01LASWK7G?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'mulberries': {
    productName: 'Mulberries (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B074153BXC?tag=robinfrench-20',
    vetNote: 'Navitas Organics or Terrasoul Superfoods. Dried mulberries organic.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'raspberries': {
    productName: 'Raspberries (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000P6G12U?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'cranberries': {
    productName: 'Cranberries',
    amazonLink: 'https://www.amazon.com/dp/B074153BXC?tag=robinfrench-20',
    vetNote: 'Fresh produce or NOW Foods. Dried cranberries unsweetened.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'pineapple (small amounts)': {
    productName: 'Pineapple (small amounts)',
    amazonLink: 'https://www.amazon.com/dp/B000P6L3V4?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'pears (no seeds)': {
    productName: 'Pears (no seeds)',
    amazonLink: 'https://www.amazon.com/dp/B0DYKVQ3XZ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'pinhead crickets': {
    productName: "Dubia roaches\\'s Frogs Live Pinhead Crickets",
    amazonLink: 'https://www.amazon.com/dp/B07196FX9W?tag=robinfrench-20',
    vetNote: "Josh\'s Frogs or Fluker\"s. Live pinhead crickets.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'locusts': {
    productName: 'Locusts',
    amazonLink: 'https://www.amazon.com/dp/B000CMKHBS?tag=robinfrench-20',
    vetNote: 'Rainbow Mealworms or Exo Terra. Canned locusts reptile food.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'butterworms': {
    productName: 'Butterworms',
    amazonLink: 'https://www.amazon.com/dp/B093BD8NXR?tag=robinfrench-20',
    vetNote: "Josh\'s Frogs or Rainbow Mealworms. Live butterworms.",
    category: 'Insect',
    commissionRate: 0.03
  },
  'grasshoppers': {
    productName: "Crickets\\'s Dried Grasshoppers Reptile Food",
    amazonLink: 'https://www.amazon.com/dp/B004HSQRG2?tag=robinfrench-20',
    vetNote: "Fluker\'s or Exo Terra. Dried grasshoppers reptile food.",
    category: 'Insect',
    commissionRate: 0.03
  },
  \\'small dubia roaches': {
    productName: \\'small dubia roaches',
    amazonLink: 'https://www.amazon.com/dp/B09QD6PBB8?tag=robinfrench-20',
    vetNote: "DubiaRoaches.com or Josh\'s Frogs. Small live dubia roaches feeder.",
    category: 'Insect',
    commissionRate: 0.03
  },
  \\'silkworms': {
    productName: \\'silkworms',
    amazonLink: 'https://www.amazon.com/dp/B08JKNZPSF?tag=robinfrench-20',
    vetNote: 'Coastal Silkworms or SilkwormShop. Live silkworms reptile food.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'earthworms': {
    productName: "Earthworms\\'s Live Earthworms",
    amazonLink: 'https://www.amazon.com/dp/B097PDMK47?tag=robinfrench-20',
    vetNote: "Uncle Jim\'s Worm Farm. Live earthworms.",
    category: 'Insect',
    commissionRate: 0.03
  },
  'wheat hay': {
    productName: 'Wheat hay',
    amazonLink: 'https://www.amazon.com/dp/B0CLC76V98?tag=robinfrench-20',
    vetNote: 'Oxbow Animal Health or Small Pet Select. Wheat hay small animal.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'fescue hay': {
    productName: 'Fescue hay',
    amazonLink: 'https://www.amazon.com/dp/B00S6YIF36?tag=robinfrench-20',
    vetNote: \\'small Pet Select fescue hay.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'oat hay': {
    productName: 'Oat hay',
    amazonLink: 'https://www.amazon.com/dp/B000WFKP80?tag=robinfrench-20',
    vetNote: 'Oxbow Animal Health or Small Pet Select. Oat hay small animal.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'bluegrass hay': {
    productName: 'Bluegrass hay',
    amazonLink: 'https://www.amazon.com/dp/B00S6Y8MHU?tag=robinfrench-20',
    vetNote: \\'small Pet Select bluegrass hay.',
    category: 'Hay',
    commissionRate: 0.03
  },
  \\'straw (wheat/pine)': {
    productName: \\'straw (wheat/pine) (Raw)',
    amazonLink: 'https://www.amazon.com/dp/B0CDQMD1CB?tag=robinfrench-20',
    vetNote: 'Kaytee or Oxbow. Wheat straw bedding.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'dried grass': {
    productName: 'Dried grass',
    amazonLink: 'https://www.amazon.com/dp/B0002DK8OI?tag=robinfrench-20',
    vetNote: 'Kaytee or Timothy Grass. Dried natural grass small animal.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'bermuda hay': {
    productName: 'Bermuda hay',
    amazonLink: 'https://www.amazon.com/dp/B0FSVM5P3D?tag=robinfrench-20',
    vetNote: 'Oxbow Animal Health or Standlee Hay. Premium bermuda hay.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'barley hay': {
    productName: 'Barley hay',
    amazonLink: 'https://www.amazon.com/dp/B08YM9VJC5?tag=robinfrench-20',
    vetNote: \\'small Pet Select or Standlee Hay. Barley hay.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'guinea pig pellets (with vitamin c)': {
    productName: 'Guinea pig pellets (with vitamin c)',
    amazonLink: 'https://www.amazon.com/dp/B00E4KT5NA?tag=robinfrench-20',
    vetNote: 'Oxbow Essentials Cavy Cuisine or Sherwood. Guinea pig pellets with vitamin C.',
    category: 'Pellet',
    commissionRate: 0.03
  },
  'rabbit pellets (high fiber)': {
    productName: 'Rabbit pellets (high fiber)',
    amazonLink: 'https://www.amazon.com/dp/B0017JANQY?tag=robinfrench-20',
    vetNote: 'Oxbow Essentials Rabbit Food. Adult rabbit pellets high fiber.',
    category: 'Pellet',
    commissionRate: 0.03
  },
  'hamster pellets (higher protein)': {
    productName: 'Hamster pellets (higher protein)',
    amazonLink: 'https://www.amazon.com/dp/B0053SYJVA?tag=robinfrench-20',
    vetNote: 'Higgins Sunburst or Oxbow Essentials. Hamster food higher protein.',
    category: 'Pellet',
    commissionRate: 0.03
  },
  'wild bird mix': {
    productName: 'Wild bird mix',
    amazonLink: 'https://www.amazon.com/dp/B0FWLFGG21?tag=robinfrench-20',
    vetNote: 'Lyric or Kaytee. Wild bird mix no filler.',
    category: 'Pellet',
    commissionRate: 0.03
  },

  // === MISSING INGREDIENTS - Added to complete coverage ===
  'beta-glucans': {
    productName: 'Beta-glucans',
    amazonLink: 'https://www.amazon.com/dp/B01LWVNL9J?tag=robinfrench-20',
    vetNote: 'Immune-supporting beta-glucans from yeast or mushrooms for enhanced immune function.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'biotin': {
    productName: 'Biotin',
    amazonLink: 'https://www.amazon.com/dp/B01AMJCHB8?tag=robinfrench-20',
    vetNote: 'B-complex vitamin essential for healthy skin, coat, and metabolic function.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'bone broth (low sodium)': {
    productName: 'Bone broth (low sodium)',
    amazonLink: 'https://www.amazon.com/dp/B07DFNP37Y?tag=robinfrench-20',
    vetNote: 'Concentrated bone broth providing collagen, glucosamine, and natural electrolytes without excess sodium.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'cauliflower': {
    productName: 'Cauliflower (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B000P6G0GM?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Low-calorie vegetable rich in fiber and vitamins.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'chicory root': {
    productName: 'Chicory root',
    amazonLink: 'https://www.amazon.com/dp/B08Q7KZYKC?tag=robinfrench-20',
    vetNote: 'Prebiotic fiber from chicory root supporting healthy gut bacteria and digestive function.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'chondroitin sulfate': {
    productName: 'Chondroitin sulfate',
    amazonLink: 'https://www.amazon.com/dp/B003ULL1NQ?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated joint supplement with chondroitin for cartilage health and mobility.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'cranberry extract': {
    productName: 'Cranberry extract',
    amazonLink: 'https://www.amazon.com/dp/B01N7KMPU3?tag=robinfrench-20',
    vetNote: 'Concentrated cranberry extract supporting urinary tract health and preventing bacterial adhesion.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'curcumin (turmeric extract)': {
    productName: 'Curcumin (turmeric extract)',
    amazonLink: 'https://www.amazon.com/dp/B0CK3C31JP?tag=robinfrench-20',
    vetNote: 'Anti-inflammatory curcumin from turmeric with enhanced absorption for joint and immune support.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'd-mannose': {
    productName: 'D-mannose',
    amazonLink: 'https://www.amazon.com/dp/B01N6X9YBS?tag=robinfrench-20',
    vetNote: 'Natural sugar compound supporting urinary tract health by preventing bacterial adhesion.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'egg yolks': {
    productName: 'Egg yolks',
    amazonLink: 'https://www.amazon.com/dp/B00M1QWODW?tag=robinfrench-20',
    vetNote: 'High-quality eggs from pasture-raised hens, rich in protein, healthy fats, and essential nutrients.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'eggplant': {
    productName: 'Eggplant (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B001PLGQPQ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Low-calorie vegetable with fiber and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'eggshells (crushed)': {
    productName: 'Calcium carbonate',
    amazonLink: 'https://www.amazon.com/dp/B004421K68?tag=robinfrench-20',
    vetNote: 'Crushed eggshells provide natural calcium carbonate. Can be prepared at home from organic eggs or use calcium supplement.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'fish broth (no salt)': {
    productName: 'Fish broth (no salt)',
    amazonLink: 'https://www.amazon.com/dp/B07DFQFLJL?tag=robinfrench-20',
    vetNote: 'Concentrated fish broth providing omega-3s, collagen, and natural flavor without added salt.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'fructooligosaccharides (fos)': {
    productName: 'Fructooligosaccharides (fos)',
    amazonLink: 'https://www.amazon.com/dp/B08Q7KZYKC?tag=robinfrench-20',
    vetNote: 'Prebiotic fiber supporting beneficial gut bacteria growth and digestive health.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'glucosamine sulfate': {
    productName: 'Glucosamine sulfate',
    amazonLink: 'https://www.amazon.com/dp/B003ULL1NQ?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated glucosamine sulfate for joint cartilage health and mobility support.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'green beans': {
    productName: 'Green beans (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0DDTC6QNY?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Low-calorie vegetable rich in fiber and vitamins.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'green beans (cooked)': {
    productName: 'Green beans (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0DDTC6QNY?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Steam or boil until tender for optimal digestibility.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'hairball control paste': {
    productName: 'Hairball paste',
    amazonLink: 'https://www.amazon.com/dp/B07B282MR4?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated paste for hairball prevention and digestive health in cats.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'hyaluronic acid': {
    productName: 'Hyaluronic acid',
    amazonLink: 'https://www.amazon.com/dp/B07XHNCJMC?tag=robinfrench-20',
    vetNote: 'Joint health supplement supporting cartilage hydration and joint lubrication.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'inulin (prebiotic)': {
    productName: 'Chicory root',
    amazonLink: 'https://www.amazon.com/dp/B08Q7KZYKC?tag=robinfrench-20',
    vetNote: 'Prebiotic fiber from chicory root supporting healthy gut bacteria and digestive function.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'jerusalem artichoke': {
    productName: 'Jerusalem artichoke',
    amazonLink: 'https://www.amazon.com/dp/B0CQK5XCVZ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Prebiotic-rich root vegetable supporting gut health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'joint health supplement': {
    productName: 'Joint supplement',
    amazonLink: 'https://www.amazon.com/dp/B003ULL1NQ?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated joint supplement with glucosamine, chondroitin, and MSM for joint health and mobility.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'l-carnitine powder': {
    productName: 'L-carnitine powder',
    amazonLink: 'https://www.amazon.com/dp/B06Y1BTLGK?tag=robinfrench-20',
    vetNote: 'Amino acid supporting heart health, energy metabolism, and weight management.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'lysine powder': {
    productName: 'Lysine powder',
    amazonLink: 'https://www.amazon.com/dp/B00V3MR88G?tag=robinfrench-20',
    vetNote: 'Essential amino acid supporting immune function, collagen production, and overall health.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'malabar spinach': {
    productName: 'Malabar spinach',
    amazonLink: 'https://www.amazon.com/dp/B0DLT7BSNJ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Nutrient-rich leafy green with vitamins and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'mannanoligosaccharides (mos)': {
    productName: 'Mannanoligosaccharides (mos)',
    amazonLink: 'https://www.amazon.com/dp/B0CRFWM2Z6?tag=robinfrench-20',
    vetNote: 'Prebiotic supplement supporting beneficial gut bacteria and immune function.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'milk thistle': {
    productName: 'Milk thistle',
    amazonLink: 'https://www.amazon.com/dp/B0019LVFD0?tag=robinfrench-20',
    vetNote: 'Liver-supporting herb with antioxidant properties for hepatic health and detoxification.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'new zealand spinach': {
    productName: 'New zealand spinach',
    amazonLink: 'https://www.amazon.com/dp/B0C8VD126M?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Nutrient-rich leafy green alternative to traditional spinach.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'niacinamide': {
    productName: 'Niacinamide',
    amazonLink: 'https://www.amazon.com/dp/B0CZMBZPLV?tag=robinfrench-20',
    vetNote: 'B-vitamin (B3) supporting energy metabolism, skin health, and nervous system function.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'oats (rolled)': {
    productName: "Quinoa\\'s Red Mill Old Fashioned Rolled Oats",
    amazonLink: 'https://www.amazon.com/dp/B07VCM66N6?tag=robinfrench-20',
    vetNote: 'Whole grain rolled oats providing fiber, B vitamins, and sustained energy. Cook thoroughly before serving.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'peas': {
    productName: 'Peas (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07D1NGQ6B?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Protein-rich legume with fiber and vitamins.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'peas (mashed)': {
    productName: 'Peas (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07D1NGQ6B?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Steam and mash for optimal digestibility.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'pectin (from apples)': {
    productName: 'Pectin (from apples)',
    amazonLink: 'https://www.amazon.com/dp/B01CO69SYG?tag=robinfrench-20',
    vetNote: \\'soluble fiber from apples supporting digestive health and blood sugar regulation.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'pumpkin seed oil': {
    productName: 'Pumpkin seed oil',
    amazonLink: 'https://www.amazon.com/dp/B0FKYLMWYG?tag=robinfrench-20',
    vetNote: 'Omega-3 and omega-6 rich oil supporting urinary health, skin, and coat condition.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'quail eggs': {
    productName: 'Quail eggs',
    amazonLink: 'https://www.amazon.com/dp/B0BSRGV9PR?tag=robinfrench-20',
    vetNote: \\'small nutrient-dense eggs from quail, rich in protein, healthy fats, and essential nutrients.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'quercetin': {
    productName: 'Quercetin',
    amazonLink: 'https://www.amazon.com/dp/B08M5L372P?tag=robinfrench-20',
    vetNote: 'Antioxidant flavonoid supporting immune function, allergy relief, and anti-inflammatory benefits.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'rice (hulled)': {
    productName: 'Rice (hulled) (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B072JNNB33?tag=robinfrench-20',
    vetNote: 'Whole grain brown rice with hull removed, providing fiber, B vitamins, and sustained energy.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'romanesco broccoli': {
    productName: 'Romanesco broccoli',
    amazonLink: 'https://www.amazon.com/dp/B01I1Q74MQ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Nutrient-rich cruciferous vegetable with vitamins C and K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'s-adenosyl methionine (sam-e)': {
    productName: \\'s-adenosyl methionine (sam-e)',
    amazonLink: 'https://www.amazon.com/dp/B000OSSQFY?tag=robinfrench-20',
    vetNote: 'Methyl donor supporting liver health, joint function, and mood regulation.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  \\'sardines (in water)': {
    productName: \\'sardines (canned in water)',
    amazonLink: 'https://www.amazon.com/dp/B01FUWYO2M?tag=robinfrench-20',
    vetNote: 'Wild-caught sardines canned in water without added salt. Rich in omega-3s, calcium, and protein.',
    category: 'Meat',
    commissionRate: 0.03
  },
  \\'snap peas': {
    productName: \\'snap peas (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B077L6C7YB?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Edible-pod peas rich in fiber and vitamins.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'snow peas': {
    productName: \\'snow peas (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B07MGSDD7L?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Flat-podded peas with tender texture and mild flavor.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'snow peas (mashed)': {
    productName: \\'snow peas (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B08KRNKC9G?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Steam and mash for optimal digestibility.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'split peas': {
    productName: "Quinoa\\'s Red Mill Split Peas",
    amazonLink: 'https://www.amazon.com/dp/B08DVGSW58?tag=robinfrench-20',
    vetNote: 'Dried split peas providing protein, fiber, and B vitamins. Soak and cook thoroughly before serving.',
    category: 'Carb',
    commissionRate: 0.03
  },
  \\'split peas (mashed)': {
    productName: "Quinoa\\'s Red Mill Split Peas",
    amazonLink: 'https://www.amazon.com/dp/B08DVGSW58?tag=robinfrench-20',
    vetNote: 'Dried split peas providing protein, fiber, and B vitamins. Cook and mash for optimal digestibility.',
    category: 'Carb',
    commissionRate: 0.03
  },
  \\'sugar snap peas': {
    productName: \\'sugar snap peas (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B08DVGSW58?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Sweet, crisp peas with edible pods rich in fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  \\'sugar snap peas (mashed)': {
    productName: \\'sugar snap peas (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B08DVGSW58?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Steam and mash for optimal digestibility.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'turkey broth (no salt)': {
    productName: 'Turkey broth (no salt)',
    amazonLink: 'https://www.amazon.com/dp/B07DFQFLJL?tag=robinfrench-20',
    vetNote: 'Concentrated turkey broth providing protein, collagen, and natural flavor without added salt.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'vitamin b complex': {
    productName: 'B-complex',
    amazonLink: 'https://www.amazon.com/dp/B01INRFW0E?tag=robinfrench-20',
    vetNote: 'Complete B vitamin complex for energy metabolism, nervous system health, and overall vitality.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'vitamin c (small amounts)': {
    productName: 'Vitamin c (small amounts)',
    amazonLink: 'https://www.amazon.com/dp/B074GCB1ND?tag=robinfrench-20',
    vetNote: 'Antioxidant vitamin supporting immune function and collagen production. Use in small amounts as directed.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'watercress': {
    productName: 'Watercress (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0BSK8P8KS?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Nutrient-dense leafy green with vitamins A, C, and K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'watercress (small amounts)': {
    productName: 'Watercress (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B0BSK8P8KS?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Use in small amounts due to strong flavor and oxalate content.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'wheat germ': {
    productName: "Quinoa\\'s Red Mill Wheat Germ",
    amazonLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: 'Nutrient-dense wheat germ providing vitamin E, B vitamins, and healthy fats for skin and coat health.',
    category: \\'supplement',
    commissionRate: 0.03
  },
  'wild rice': {
    productName: 'Wild rice (Organic)',
    amazonLink: 'https://www.amazon.com/dp/B089CP461X?tag=robinfrench-20',
    vetNote: 'Whole grain wild rice providing protein, fiber, and B vitamins. Cook thoroughly before serving.',
    category: 'Carb',
    commissionRate: 0.03
  },
};

/**
 * Normalizes ingredient names to match vetted product keys
 * @param name The raw ingredient name from recipes
 */
function normalizeIngredientName(name: string): string {
  let normalized = name
    .toLowerCase()
    .trim()
    // Remove common descriptors
    .replace(/\b(boneless|skinless|fresh|frozen|dried|canned|cooked|raw|organic|whole|ground|diced|chopped|minced|sliced|grated|shredded|crushed|powdered|pureed|no sugar|low-sodium)\b/g, '')
    // Remove quantities and measurements
    .replace(/\b(\d+(?:\.\d+)?)\s*(g|kg|lb|oz|cup|cups|tbsp|tsp|ml|l|pinch|dash)\b/g, '')
    // Remove parentheses and their contents
    .replace(/\([^)]*\)/g, '')
    // Remove commas and everything after
    .replace(/,.*/, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Handle specific mappings to existing keys
  const mappings: Record<string, string> = {
    'chicken breast': 'chicken breast',
    'turkey breast': 'turkey breast',
    'beef liver': 'beef liver',
    'chicken liver': 'chicken liver',
    'chicken hearts': 'chicken hearts',
    'turkey giblets': 'turkey giblets',
    'chicken giblets': 'chicken giblets',
    'duck breast': 'duck breast',
    'venison': 'venison',
    'rabbit meat': 'rabbit meat',
    'ground pork lean': 'ground pork (lean)',
    'turkey necks': 'turkey necks',
    'rabbit': 'rabbit meat',
    'brown rice': 'brown rice',
    'white rice': 'white rice',
    'quinoa': 'quinoa',
    \\'sweet potato': \\'sweet potato',
    'pumpkin': 'pumpkin puree',
    'butternut squash': 'butternut squash',
    'lentils': 'lentils',
    'chickpeas': 'chickpeas',
    'black beans': 'black beans',
    'green peas': 'green peas',
    'carrots': 'carrots',
    \\'spinach': \\'spinach',
    'broccoli': 'broccoli',
    'zucchini': 'zucchini',
    'kale': 'kale',
    'celery': 'celery',
    'brussels sprouts': 'brussels sprouts',
    'asparagus': 'asparagus',
    'parsley': 'parsley',
    'cucumber': 'cucumber',
    'lettuce romaine': 'lettuce (romaine)',
    'arugula': 'arugula',
    'endive': 'endive',
    'escarole': 'escarole',
    'dandelion greens': 'dandelion greens',
    'collard greens': 'collard greens',
    'mustard greens': 'mustard greens',
    'turnip greens': 'turnip greens',
    'beet greens': 'beet greens',
    'radish greens': 'radish greens',
    'coconut oil': 'coconut oil',
    'olive oil': 'olive oil',
    \\'salmon oil': \\'salmon oil',
    'flaxseed oil': 'flaxseed oil',
    'fish oil': 'fish oil',
    'taurine powder': 'taurine powder',
    'calcium carbonate': 'calcium carbonate',
    'vitamin e': 'vitamin e',
    'b-complex': 'b-complex',
    'probiotic powder': 'probiotic powder',
    'psyllium husk': 'psyllium husk',
    'joint supplement': 'joint supplement',
    'omega-3 capsules': 'omega-3 capsules',
    'digestive enzymes': 'digestive enzymes',
    'hairball paste': 'hairball paste',
    'chicken broth': 'chicken broth',
    'vitamin e oil': 'vitamin e oil',
    \\'salmon': \\'salmon (boneless)',
    'ground chicken': 'ground chicken',
    'ground turkey': 'ground turkey',
    'ground beef lean': 'ground beef (lean)',
    'ground lamb': 'ground lamb',
    'eggs': 'eggs',
    \\'sardines water': \\'sardines (canned in water)',
    'quail': 'quail',
    'millet white red': 'millet (white/red)',
    'canary seed': 'canary seed',
    'niger seed': 'niger seed',
    'oat groats': 'oat groats',
    'hemp seeds': 'hemp seeds',
    'flaxseeds': 'flaxseeds',
    \\'sesame seeds': \\'sesame seeds',
    'chia seeds': 'chia seeds',
    'quinoa cooked': 'quinoa (cooked)',
    'rapeseed': 'rapeseed',
    \\'sunflower seeds small amounts': \\'sunflower seeds (small amounts)',
    'pumpkin seeds': 'pumpkin seeds',
    'bell peppers': 'bell peppers',
    'corn fresh': 'corn (fresh)',
    'apples no seeds': 'apples (no seeds)',
    'blueberries': 'blueberries',
    \\'strawberries': \\'strawberries',
    'mango': 'mango',
    'banana': 'banana',
    'grapes chopped': 'grapes (chopped)',
    'papaya': 'papaya',
    'melon': 'melon',
    'egg hard-boiled': 'egg (hard-boiled)',
    'pellets fortified': 'pellets (fortified)',
    'cuttlebone': 'cuttlebone',
    'honey tiny amounts': 'honey (tiny amounts)',
    'peanut butter unsalted tiny amounts': 'peanut butter (unsalted, tiny amounts)',
    'dubia roaches': 'dubia roaches',
    'crickets': 'crickets',
    'mealworms': 'mealworms',
    \\'superworms': \\'superworms',
    'black soldier fly larvae': 'black soldier fly larvae',
    'hornworms': 'hornworms',
    'acorn squash': 'acorn squash',
    'figs': 'figs',
    'timothy hay': 'timothy hay',
    'meadow hay': 'meadow hay',
    'orchard grass hay': 'orchard grass hay',
    'alfalfa hay': 'alfalfa hay',
    'romaine lettuce': 'romaine lettuce',
    'cilantro': 'cilantro',
    'basil': 'basil'
  };

  return mappings[normalized] || normalized;
}

/**
 * Looks up a generic ingredient and returns the vetted product details if available.
 * @param genericName The generic ingredient name (e.g., "Ground Turkey").
 */
export function getVettedProduct(genericName: string): VettedProduct | undefined {
  // First try exact match
  const exactMatch = VETTED_PRODUCTS[genericName.toLowerCase().trim()];
  if (exactMatch) return exactMatch;

  // Then try normalized match
  const normalized = normalizeIngredientName(genericName);
  return VETTED_PRODUCTS[normalized];
}

/**
 * Gets the best affiliate link for an ingredient, prioritizing higher commission rates.
 * @param genericName The generic ingredient name.
 * @returns The best affiliate link URL or undefined if not found.
 */
export function getBestAffiliateLink(genericName: string): string | undefined {
  const product = getVettedProduct(genericName);
  if (!product) return undefined;

  // Priority: Chewy (8% commission) > Specialty > Amazon (3%)
  if (product.chewyLink && product.commissionRate === 0.08) {
    return product.chewyLink;
  }
  if (product.specialtyLink) {
    return product.specialtyLink;
  }
  return product.amazonLink;
}

/**
 * Gets all available affiliate links for an ingredient.
 * @param genericName The generic ingredient name.
 * @returns Array of affiliate link objects with vendor and URL.
 */
export function getAllAffiliateLinks(genericName: string): Array<{vendor: string, url: string, commission: number}> {
  const product = getVettedProduct(genericName);
  if (!product) return [];

  const links = [];

  if (product.amazonLink) {
    links.push({ vendor: 'Amazon', url: product.amazonLink, commission: product.commissionRate || 0.03 });
  }
  if (product.chewyLink) {
    links.push({ vendor: 'Chewy', url: product.chewyLink, commission: product.commissionRate || 0.08 });
  }
  if (product.specialtyLink) {
    links.push({ vendor: \\'specialty', url: product.specialtyLink, commission: product.commissionRate || 0.10 });
  }

  return links.sort((a, b) => b.commission - a.commission); // Sort by commission descending
}

/**
 * Generates an Amazon cart URL for multiple ingredients.
 * @param ingredientNames Array of generic ingredient names.
 * @returns Amazon cart URL or null if no valid products found.
 */
export function generateAmazonCartUrl(ingredientNames: string[]): string | null {
  const asinList: string[] = [];

  for (const name of ingredientNames) {
    const product = getVettedProduct(name);
    if (product?.amazonLink) {
      // Extract ASIN from Amazon URL (format: https://www.amazon.com/dp/ASIN or /gp/product/ASIN)
      const asinMatch = product.amazonLink.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
      if (asinMatch) {
        asinList.push(asinMatch[1]);
      }
    }
  }

  if (asinList.length === 0) return null;

  // Create Amazon cart URL with multiple items
  const cartUrl = `https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=robinfrench-20&ASIN.1=${asinList[0]}${asinList.slice(1).map((asin, index) => `&ASIN.${index + 2}=${asin}&Quantity.${index + 2}=1`).join('')}&Quantity.1=1`;

  return cartUrl;
}

/**
 * Generates a bulk shopping list with optimized affiliate links.
 * @param ingredientNames Array of generic ingredient names.
 * @returns Object with cart URLs and individual links organized by vendor.
 */
export function generateBulkShoppingList(ingredientNames: string[]): {
  amazonCartUrl: string | null;
  vendorLinks: Record<string, Array<{name: string, url: string, productName?: string}>>;
  totalCommission: number;
} {
  const vendorLinks: Record<string, Array<{name: string, url: string, productName?: string}>> = {
    Amazon: [],
    Chewy: [],
    Specialty: []
  };

  let totalCommission = 0;

  for (const name of ingredientNames) {
    const allLinks = getAllAffiliateLinks(name);
    const bestLink = allLinks[0]; // Already sorted by commission

    if (bestLink) {
      const product = getVettedProduct(name);
      vendorLinks[bestLink.vendor].push({
        name,
        url: bestLink.url,
        productName: product?.productName
      });
      totalCommission += bestLink.commission;
    }
  }

  // Generate Amazon cart URL for Amazon items
  const amazonCartUrl = generateAmazonCartUrl(ingredientNames);

  return {
    amazonCartUrl,
    vendorLinks,
    totalCommission: Math.round(totalCommission * 100) / 100 // Round to 2 decimal places
  };
}


