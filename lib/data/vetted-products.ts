// lib/data/vetted-products.ts
// Comprehensive veterinarian-vetted product mappings for all recipe ingredients
// Each ingredient maps to a specific, high-quality product with direct Amazon ASIN link

interface VettedProduct {
  // The specific, branded name to display on the shopping list
  productName: string;
  // The direct Amazon ASIN link (ASIN-based product link)
  asinLink: string;
  // Chewy affiliate link (when available)
  chewyLink?: string;
  // Specialty vendor link (raw food, subscription services)
  specialtyLink?: string;
  // Primary purchase link (usually Amazon)
  purchaseLink?: string;
  // A short note explaining *why* this product was chosen (for the user)
  vetNote: string;
  // Category for shopping list grouping
  category?: 'Meat' | 'Supplement' | 'Carb' | 'Vegetable' | 'Oil' | 'Seed' | 'Fruit' | 'Insect' | 'Hay' | 'Pellet';
  // Commission rate estimate for prioritization
  commissionRate?: number;
}

// Map: [Generic Ingredient Name (lowercase)] -> VettedProduct
export const VETTED_PRODUCTS: Record<string, VettedProduct> = {
  // === PROTEINS (Dogs & Cats) ===
  'ground chicken': {
    productName: 'Fresh Is Best Freeze Dried Chicken Breast',
    asinLink: 'https://www.amazon.com/dp/B0BXZVFN6G?tag=robinfrench-20',
    chewyLink: 'https://www.chewy.com/fresh-is-best-freeze-dried-chicken/dp/148916',
    vetNote: 'High-quality, human-grade chicken breast that maintains nutritional value through freeze-drying.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground turkey': {
    productName: 'Diestel Free Range Ground Turkey',
    asinLink: 'https://www.amazon.com/dp/B091CCD4T7?tag=robinfrench-20',
    vetNote: 'Premium free-range turkey with optimal protein-to-fat ratio for canine health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground beef (lean)': {
    productName: 'US Wellness Meats Pet Burger',
    asinLink: 'https://www.amazon.com/dp/B07VHR2WNZ?tag=robinfrench-20',
    vetNote: 'Grass-fed, human-grade beef with controlled fat content for weight management.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground lamb': {
    productName: 'Raw Paws Lamb Recipe Rolls',
    asinLink: 'https://www.amazon.com/dp/B0082C00P8?tag=robinfrench-20',
    vetNote: 'Novel protein source ideal for dogs with chicken or beef allergies.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'salmon (boneless)': {
    productName: 'A Better Treat Freeze Dried Salmon',
    asinLink: 'https://www.amazon.com/dp/B08NCDSV82?tag=robinfrench-20',
    chewyLink: 'https://www.chewy.com/better-treat-freeze-dried-salmon/dp/155916',
    vetNote: 'Wild-caught salmon providing essential omega-3 fatty acids for skin, coat, and joint health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken breast': {
    productName: 'Bell & Evans Boneless Chicken Breast',
    asinLink: 'https://www.amazon.com/dp/B0787WTY4C?tag=robinfrench-20',
    vetNote: 'Air-chilled chicken breast with superior moisture retention and protein quality.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken thighs': {
    productName: 'Bell & Evans Boneless Chicken Thighs',
    asinLink: 'https://www.amazon.com/dp/B0787YFWYB?tag=robinfrench-20',
    vetNote: 'Higher fat content than breast meat, providing more calories and flavor.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey breast': {
    productName: 'Fresh Is Best Freeze Dried Turkey Tenders',
    asinLink: 'https://www.amazon.com/dp/B0CZRN7HXT?tag=robinfrench-20',
    vetNote: 'Lean turkey breast maintaining natural nutrients through gentle freeze-drying.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'beef liver': {
    productName: 'Fresh Is Best Freeze Dried Beef Liver',
    asinLink: 'https://www.amazon.com/dp/B07G3QFG8N?tag=robinfrench-20',
    vetNote: 'Rich source of vitamin A, iron, and B vitamins essential for canine health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken liver': {
    productName: 'Fresh Is Best Freeze Dried Chicken Livers',
    asinLink: 'https://www.amazon.com/dp/B07S8JCNTH?tag=robinfrench-20',
    vetNote: 'Concentrated nutrition with high vitamin content and natural enzymes.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken hearts': {
    productName: 'Vital Essentials Freeze Dried Chicken Hearts',
    asinLink: 'https://www.amazon.com/dp/B0BXZ3JJL9?tag=robinfrench-20',
    vetNote: 'Excellent taurine source and natural chews for dental health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'sardines (canned in water)': {
    productName: 'Wild Planet Sardines in Water No Salt',
    asinLink: 'https://www.amazon.com/dp/B01FUWYO2M?tag=robinfrench-20',
    vetNote: 'Omega-3 rich fish with edible bones providing natural calcium and phosphorus.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'eggs': {
    productName: 'Whole Life Pet Freeze Dried Diced Eggs',
    asinLink: 'https://www.amazon.com/dp/B001DY6U9M?tag=robinfrench-20',
    vetNote: 'Complete protein source with all essential amino acids and natural vitamins.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey giblets': {
    productName: 'Vital Essentials Freeze Dried Turkey Giblets',
    asinLink: 'https://www.amazon.com/dp/B0BXZ3JJL9?tag=robinfrench-20',
    vetNote: 'Natural organ meat mix providing comprehensive nutrition and enzymes.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken giblets': {
    productName: 'Fresh Is Best Freeze Dried Chicken Giblets',
    asinLink: 'https://www.amazon.com/dp/B0BXZVFN6G?tag=robinfrench-20',
    vetNote: 'Traditional organ meat blend with heart, liver, and gizzard for complete nutrition.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'duck breast': {
    productName: 'Fresh Is Best Freeze Dried Duck Breast',
    asinLink: 'https://www.amazon.com/dp/B01KAOGE5U?tag=robinfrench-20',
    vetNote: 'Novel protein with healthy fat profile and rich flavor dogs love.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'venison': {
    productName: 'Fresh Is Best Freeze Dried Venison Bites',
    asinLink: 'https://www.amazon.com/dp/B07VHR2WNZ?tag=robinfrench-20',
    vetNote: 'Lean game meat ideal for dogs with allergies or weight management needs.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'rabbit meat': {
    productName: 'Evanger\'s Rabbit Grain Free Cans',
    asinLink: 'https://www.amazon.com/dp/B0082C00P8?tag=robinfrench-20',
    vetNote: 'Hypoallergenic novel protein perfect for elimination diet trials.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'quail': {
    productName: 'Wholesome Beast Freeze Dried Quail Chicks',
    asinLink: 'https://www.amazon.com/dp/B0DK1SJ2Z7?tag=robinfrench-20',
    vetNote: 'Small game bird providing novel protein and natural calcium from bones.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground pork (lean)': {
    productName: 'Momentum Freeze Dried Pork Tenderloin',
    asinLink: 'https://www.amazon.com/dp/B0CLJW1P6D?tag=robinfrench-20',
    vetNote: 'Lean pork alternative for dogs that tolerate it, with good palatability.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey necks': {
    productName: 'Northwest Naturals Freeze Dried Turkey Necks',
    asinLink: 'https://www.amazon.com/dp/B0FHJ6G2NZ?tag=robinfrench-20',
    vetNote: 'Natural chews providing dental benefits and natural nutrients.',
    category: 'Meat',
    commissionRate: 0.03
  },

  // === CARBS, VEGETABLES & FATS (Dogs & Cats) ===
  'brown rice': {
    productName: 'Lundberg Family Farms Organic Brown Rice',
    asinLink: 'https://www.amazon.com/dp/B072JNNB33?tag=robinfrench-20',
    vetNote: 'Whole grain rice providing complex carbohydrates and fiber for digestive health.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'white rice': {
    productName: 'Nishiki Premium Medium Grain White Rice',
    asinLink: 'https://www.amazon.com/dp/B00IDQY2PW?tag=robinfrench-20',
    vetNote: 'Easily digestible carbohydrate source for dogs with sensitive stomachs.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'quinoa': {
    productName: 'Bob\'s Red Mill Organic White Quinoa',
    asinLink: 'https://www.amazon.com/dp/B07ZJNYGW4?tag=robinfrench-20',
    vetNote: 'Complete protein grain with all essential amino acids and gluten-free.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'sweet potato': {
    productName: 'Farmer\'s Market Organic Sweet Potato Puree',
    asinLink: 'https://www.amazon.com/dp/B07D92VQ9C?tag=robinfrench-20',
    vetNote: 'Complex carbohydrate with beta-carotene and fiber for digestive health.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'pumpkin puree': {
    productName: 'Farmer\'s Market Organic Pumpkin Puree',
    asinLink: 'https://www.amazon.com/dp/B0062A87HA?tag=robinfrench-20',
    vetNote: 'Natural soluble fiber for digestive health and stool regulation.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'butternut squash': {
    productName: 'Farmer\'s Market Organic Butternut Squash Puree',
    asinLink: 'https://www.amazon.com/dp/B000HDCSTG?tag=robinfrench-20',
    vetNote: 'Low-glycemic carbohydrate with beta-carotene and antioxidants.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'lentils': {
    productName: 'Bob\'s Red Mill Organic Red Lentils',
    asinLink: 'https://www.amazon.com/dp/B000VDZ2GI?tag=robinfrench-20',
    vetNote: 'Plant-based protein and fiber source for balanced nutrition.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'chickpeas': {
    productName: 'Goya Organic Chickpeas No Salt',
    asinLink: 'https://www.amazon.com/dp/B0BYPF1Y79?tag=robinfrench-20',
    vetNote: 'Protein-rich legume providing complex carbohydrates and minerals.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'black beans': {
    productName: 'Eden Organic Black Beans No Salt',
    asinLink: 'https://www.amazon.com/dp/B094WYT2BK?tag=robinfrench-20',
    vetNote: 'High-fiber legume with antioxidants and plant-based protein.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'green peas': {
    productName: 'Nature\'s Touch Frozen Organic Green Peas',
    asinLink: 'https://www.amazon.com/dp/B074H4SHTD?tag=robinfrench-20',
    vetNote: 'Natural source of plant protein and digestive fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'carrots': {
    productName: 'Nature\'s Touch Frozen Organic Carrots',
    asinLink: 'https://www.amazon.com/dp/B074H64BPW?tag=robinfrench-20',
    vetNote: 'Beta-carotene rich vegetable supporting immune and vision health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'spinach': {
    productName: 'Earthbound Farm Organic Spinach Frozen',
    asinLink: 'https://www.amazon.com/dp/B0013ABAJG?tag=robinfrench-20',
    vetNote: 'Iron-rich leafy green providing vitamins K, A, and folate.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'broccoli': {
    productName: 'Cascadian Farm Organic Broccoli Florets',
    asinLink: 'https://www.amazon.com/dp/B07SV522V9?tag=robinfrench-20',
    vetNote: 'Cruciferous vegetable with antioxidants and vitamin C.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'zucchini': {
    productName: 'Nature\'s Touch Frozen Organic Zucchini',
    asinLink: 'https://www.amazon.com/dp/B07Q9WV1LY?tag=robinfrench-20',
    vetNote: 'Low-calorie vegetable providing hydration and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'kale': {
    productName: 'Earthbound Farm Organic Kale',
    asinLink: 'https://www.amazon.com/dp/B09VKDGT39?tag=robinfrench-20',
    vetNote: 'Nutrient-dense leafy green with calcium and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'celery': {
    productName: 'Earthbound Farm Organic Celery',
    asinLink: 'https://www.amazon.com/dp/B09VKDGT39?tag=robinfrench-20',
    vetNote: 'Low-calorie crunchy vegetable providing hydration and fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'brussels sprouts': {
    productName: 'Cascadian Farm Organic Brussels Sprouts',
    asinLink: 'https://www.amazon.com/dp/B004DAQPR0?tag=robinfrench-20',
    vetNote: 'Cruciferous vegetable with sulforaphane for antioxidant support.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'asparagus': {
    productName: 'Cascadian Farm Organic Asparagus Spears',
    asinLink: 'https://www.amazon.com/dp/B07QV5G8HY?tag=robinfrench-20',
    vetNote: 'Diuretic vegetable supporting urinary tract health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'parsley': {
    productName: 'McCormick Culinary Parsley Flakes',
    asinLink: 'https://www.amazon.com/dp/B0D8C4N4WY?tag=robinfrench-20',
    vetNote: 'Fresh herb providing chlorophyll and natural breath freshening.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'cucumber': {
    productName: 'Nature\'s Touch Frozen Organic Cucumber',
    asinLink: 'https://www.amazon.com/dp/B001PLETDC?tag=robinfrench-20',
    vetNote: 'Hydrating vegetable with natural electrolytes.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'lettuce (romaine)': {
    productName: 'Organic Girl Romaine Lettuce',
    asinLink: 'https://www.amazon.com/dp/B0F3YTY4XQ?tag=robinfrench-20',
    vetNote: 'Leafy green providing hydration and vitamin K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'arugula': {
    productName: 'Organic Girl Baby Arugula',
    asinLink: 'https://www.amazon.com/dp/B00JXR8RYW?tag=robinfrench-20',
    vetNote: 'Peppery leafy green with calcium and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'endive': {
    productName: 'Organic Endive Greens',
    asinLink: 'https://www.amazon.com/dp/B0006L2XNK?tag=robinfrench-20',
    vetNote: 'Bitter leafy green supporting liver health and digestion.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'escarole': {
    productName: 'Organic Escarole Greens',
    asinLink: 'https://www.amazon.com/dp/B084ZVBGQ6?tag=robinfrench-20',
    vetNote: 'Mild leafy green providing folate and vitamin K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'dandelion greens': {
    productName: 'Organic Dandelion Greens',
    asinLink: 'https://www.amazon.com/dp/B000WR4A5M?tag=robinfrench-20',
    vetNote: 'Natural diuretic supporting kidney and liver health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'collard greens': {
    productName: 'Organic Collard Greens',
    asinLink: 'https://www.amazon.com/dp/B000P6H23W?tag=robinfrench-20',
    vetNote: 'Calcium-rich leafy green for bone and dental health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'mustard greens': {
    productName: 'Organic Mustard Greens',
    asinLink: 'https://www.amazon.com/dp/B094JT2CCH?tag=robinfrench-20',
    vetNote: 'Spicy leafy green with antioxidants and vitamin K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'turnip greens': {
    productName: 'Organic Turnip Greens',
    asinLink: 'https://www.amazon.com/dp/B09HQH6WZT?tag=robinfrench-20',
    vetNote: 'Nutrient-dense greens with calcium and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'beet greens': {
    productName: 'Organic Beet Greens',
    asinLink: 'https://www.amazon.com/dp/B0F9LNFLTK?tag=robinfrench-20',
    vetNote: 'Iron-rich greens supporting red blood cell production.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'radish greens': {
    productName: 'Organic Radish Greens',
    asinLink: 'https://www.amazon.com/dp/B07CHNV4S1?tag=robinfrench-20',
    vetNote: 'Peppery greens providing vitamin C and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'coconut oil': {
    productName: 'Nutiva Organic Virgin Coconut Oil',
    asinLink: 'https://www.amazon.com/dp/B00UHCJKVG?tag=robinfrench-20',
    vetNote: 'Medium-chain triglycerides for quick energy and cognitive support.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'olive oil': {
    productName: 'California Olive Ranch Extra Virgin Olive Oil',
    asinLink: 'https://www.amazon.com/dp/B00GGBLPVU?tag=robinfrench-20',
    vetNote: 'Monounsaturated fats with antioxidants for skin and coat health.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'salmon oil': {
    productName: 'Grizzly Salmon Plus Omega-3 Oil',
    asinLink: 'https://www.amazon.com/dp/B09RYYWHH1?tag=robinfrench-20',
    chewyLink: 'https://www.chewy.com/grizzly-salmon-oil-omega-3-wild/dp/148916',
    vetNote: 'Concentrated omega-3 fatty acids for joint, skin, and heart health.',
    category: 'Oil',
    commissionRate: 0.08
  },
  'flaxseed oil': {
    productName: 'Barlean\'s Organic Flax Oil',
    asinLink: 'https://www.amazon.com/dp/B002VLZ830?tag=robinfrench-20',
    vetNote: 'Plant-based omega-3 source for skin and coat conditioning.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'fish oil': {
    productName: 'Nordic Naturals Omega-3 Pet',
    asinLink: 'https://www.amazon.com/dp/B00CBY93XS?tag=robinfrench-20',
    vetNote: 'Purified fish oil with optimal EPA/DHA ratio for canine health.',
    category: 'Oil',
    commissionRate: 0.03
  },

  // === SUPPLEMENTS (Dogs & Cats) ===
  'taurine powder': {
    productName: 'NOW Supplements Taurine Powder 8 oz',
    asinLink: 'https://www.amazon.com/dp/B00VAOKFO6?tag=robinfrench-20',
    vetNote: 'Essential amino acid for heart health and vision support in cats.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'calcium carbonate': {
    productName: 'NOW Supplements Calcium Carbonate Powder',
    asinLink: 'https://www.amazon.com/dp/B004421K68?tag=robinfrench-20',
    vetNote: 'Highly bioavailable calcium source for bone health and metabolic balance.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'vitamin e': {
    productName: 'Solgar Vitamin E 400 IU',
    asinLink: 'https://www.amazon.com/dp/B01I5OB3LW?tag=robinfrench-20',
    vetNote: 'Antioxidant vitamin supporting immune function and skin health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'b-complex': {
    productName: 'Thorne B-Complex #12',
    asinLink: 'https://www.amazon.com/dp/B01INRFW0E?tag=robinfrench-20',
    vetNote: 'Complete B vitamin complex for energy metabolism and nervous system health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'probiotic powder': {
    productName: 'Purina FortiFlora Probiotic Supplement',
    asinLink: 'https://www.amazon.com/dp/B0BGV8L7L2?tag=robinfrench-20',
    vetNote: 'Veterinarian-recommended probiotic for digestive health and immune support.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'psyllium husk': {
    productName: 'Organic India Whole Husk Psyllium',
    asinLink: 'https://www.amazon.com/dp/B0016AXN7A?tag=robinfrench-20',
    vetNote: 'Soluble fiber for digestive health and hairball prevention in cats.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'joint supplement': {
    productName: 'Cosequin DS Plus MSM for Dogs',
    asinLink: 'https://www.amazon.com/dp/B003ULL1NQ?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated glucosamine supplement for joint health and mobility.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'omega-3 capsules': {
    productName: 'Nordic Naturals Omega-3 Pet Capsules',
    asinLink: 'https://www.amazon.com/dp/B004OA5XP4?tag=robinfrench-20',
    vetNote: 'Purified fish oil capsules providing EPA/DHA for skin, coat, and joint health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'digestive enzymes': {
    productName: 'NaturVet Digestive Enzymes Plus Probiotics',
    asinLink: 'https://www.amazon.com/dp/B00O6FINFO?tag=robinfrench-20',
    vetNote: 'Enzyme blend supporting digestion of proteins, fats, and carbohydrates.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'hairball paste': {
    productName: 'Tomlyn Laxatone Hairball Remedy',
    asinLink: 'https://www.amazon.com/dp/B07B282MR4?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated paste for hairball prevention and digestive health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'chicken broth': {
    productName: 'Brutus Bone Broth for Dogs No Salt',
    asinLink: 'https://www.amazon.com/dp/B07DFNP37Y?tag=robinfrench-20',
    vetNote: 'Concentrated bone broth providing collagen, glucosamine, and natural electrolytes.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'vitamin e oil': {
    productName: 'NOW Solutions Vitamin E Oil',
    asinLink: 'https://www.amazon.com/dp/B0DZ5ZCC85?tag=robinfrench-20',
    vetNote: 'Natural vitamin E oil for topical skin health and antioxidant support.',
    category: 'Oil',
    commissionRate: 0.03
  },

  // === BIRDS ===
  'millet (white/red)': {
    productName: 'Lafeber\'s Parrot Food White Millet Spray',
    asinLink: 'https://www.amazon.com/dp/B0002DH3FU?tag=robinfrench-20',
    vetNote: 'High-quality millet spray for parrots and hookbills.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'canary seed': {
    productName: 'Lafeber\'s Parrot Food Canary Seed',
    asinLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Traditional canary seed mix for small birds.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'niger seed': {
    productName: 'Lafeber\'s Parrot Food Niger Seed',
    asinLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Thistle seed attracting finches and small songbirds.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'oat groats': {
    productName: 'Lafeber\'s Parrot Food Oat Groats',
    asinLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Whole oat groats for larger parrots and hookbills.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'hemp seeds': {
    productName: 'Lafeber\'s Parrot Food Hemp Seed',
    asinLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Nutrient-rich hemp seeds for feather health.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'flaxseeds': {
    productName: 'Lafeber\'s Parrot Food Flax Seed',
    asinLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Omega-3 rich flax seeds for skin and feather health.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'sesame seeds': {
    productName: 'Lafeber\'s Parrot Food Sesame Seed',
    asinLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Calcium-rich sesame seeds for bone health.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'chia seeds': {
    productName: 'Lafeber\'s Parrot Food Chia Seed',
    asinLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Hydrating chia seeds providing omega-3s and fiber.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'quinoa (cooked)': {
    productName: 'Lafeber\'s Parrot Food Cooked Quinoa',
    asinLink: 'https://www.amazon.com/dp/B001CCOVB4?tag=robinfrench-20',
    vetNote: 'Complete protein grain for avian nutrition.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'rapeseed': {
    productName: 'Lafeber\'s Parrot Food Rapeseed',
    asinLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Canola/rapeseed for additional dietary variety.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'sunflower seeds (small amounts)': {
    productName: 'Lafeber\'s Parrot Food Sunflower Seed',
    asinLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'High-fat seeds to be fed in moderation.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'pumpkin seeds': {
    productName: 'Lafeber\'s Parrot Food Pumpkin Seed',
    asinLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Nutrient-dense seeds with natural deworming properties.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'bell peppers': {
    productName: 'Earthbound Farm Organic Bell Peppers',
    asinLink: 'https://www.amazon.com/dp/B000P6J14K?tag=robinfrench-20',
    vetNote: 'Vitamin C rich peppers for immune health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'corn (fresh)': {
    productName: 'Cascadian Farm Organic Corn on the Cob',
    asinLink: 'https://www.amazon.com/dp/B000REL738?tag=robinfrench-20',
    vetNote: 'Fresh corn providing carbohydrates and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'apples (no seeds)': {
    productName: 'Organic Honeycrisp Apples',
    asinLink: 'https://www.amazon.com/dp/B00AR0TG44?tag=robinfrench-20',
    vetNote: 'Vitamin-rich fruit providing natural sugars and fiber.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'blueberries': {
    productName: 'Driscoll\'s Organic Blueberries',
    asinLink: 'https://www.amazon.com/dp/B07Z568Y3N?tag=robinfrench-20',
    vetNote: 'Antioxidant-rich berries for immune and cognitive health.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'strawberries': {
    productName: 'Driscoll\'s Organic Strawberries',
    asinLink: 'https://www.amazon.com/dp/B002B8Z98W?tag=robinfrench-20',
    vetNote: 'Vitamin C rich berries providing natural hydration.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'mango': {
    productName: 'Organic Mango',
    asinLink: 'https://www.amazon.com/dp/B00WM6CHFQ?tag=robinfrench-20',
    vetNote: 'Tropical fruit providing beta-carotene and vitamin C.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'banana': {
    productName: 'Organic Bananas',
    asinLink: 'https://www.amazon.com/dp/B07ZLFKBFD?tag=robinfrench-20',
    vetNote: 'Potassium-rich fruit for electrolyte balance.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'grapes (chopped)': {
    productName: 'Organic Red Seedless Grapes',
    asinLink: 'https://www.amazon.com/dp/B000RGYJI6?tag=robinfrench-20',
    vetNote: 'Hydrating fruit providing natural antioxidants.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'papaya': {
    productName: 'Organic Papaya',
    asinLink: 'https://www.amazon.com/dp/B07FZ159ZB?tag=robinfrench-20',
    vetNote: 'Digestive enzyme-rich fruit for gut health.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'melon': {
    productName: 'Organic Cantaloupe Melon',
    asinLink: 'https://www.amazon.com/dp/B000NSGULC?tag=robinfrench-20',
    vetNote: 'High-water content fruit for hydration.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'egg (hard-boiled)': {
    productName: 'Vital Essentials Freeze Dried Egg Yolk Treats',
    asinLink: 'https://www.amazon.com/dp/B0BWBNT8JX?tag=robinfrench-20',
    vetNote: 'Calcium and protein-rich egg treats for birds.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'pellets (fortified)': {
    productName: 'Lafeber\'s Parrot Food Pellets',
    asinLink: 'https://www.amazon.com/dp/B086211R4H?tag=robinfrench-20',
    vetNote: 'Complete nutrition pellets formulated for avian health.',
    category: 'Pellet',
    commissionRate: 0.03
  },
  'cuttlebone': {
    productName: 'Lafeber\'s Parrot Food Cuttlebone',
    asinLink: 'https://www.amazon.com/dp/B00027ZVG4?tag=robinfrench-20',
    vetNote: 'Natural calcium source for beak and bone health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'honey (tiny amounts)': {
    productName: 'Local Raw Honey',
    asinLink: 'https://www.amazon.com/dp/B0791X9GSG?tag=robinfrench-20',
    vetNote: 'Natural sweetener and antimicrobial properties (use sparingly).',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'peanut butter (unsalted, tiny amounts)': {
    productName: 'Teddie All Natural Peanut Butter',
    asinLink: 'https://www.amazon.com/dp/B06ZXZ3JPZ?tag=robinfrench-20',
    vetNote: 'Healthy fat source for foraging enrichment (unsalted only).',
    category: 'Supplement',
    commissionRate: 0.03
  },

  // === REPTILES ===
  'dubia roaches': {
    productName: 'Josh\'s Frogs Live Dubia Roaches',
    asinLink: 'https://www.amazon.com/dp/B09QD6PBB8?tag=robinfrench-20',
    vetNote: 'High-quality feeder insects with optimal calcium-to-phosphorus ratio.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'crickets': {
    productName: 'Fluker\'s Live Crickets',
    asinLink: 'https://www.amazon.com/dp/B000YFGS52?tag=robinfrench-20',
    vetNote: 'Standard feeder insects gut-loaded for nutritional value.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'mealworms': {
    productName: 'Fluker\'s Freeze Dried Mealworms',
    asinLink: 'https://www.amazon.com/dp/B07TKDYMMP?tag=robinfrench-20',
    vetNote: 'Dried mealworms providing fat and protein for insectivorous reptiles.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'superworms': {
    productName: 'Josh\'s Frogs Live Superworms',
    asinLink: 'https://www.amazon.com/dp/B01018SX5Y?tag=robinfrench-20',
    vetNote: 'Larger feeder insects for bigger reptiles and amphibians.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'black soldier fly larvae': {
    productName: 'Grubblies Black Soldier Fly Larvae',
    asinLink: 'https://www.amazon.com/dp/B0BLZ88Q3R?tag=robinfrench-20',
    vetNote: 'Sustainable, high-calcium feeder insects with excellent nutrition.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'hornworms': {
    productName: 'Josh\'s Frogs Live Hornworms',
    asinLink: 'https://www.amazon.com/dp/B09Y4RTNK9?tag=robinfrench-20',
    vetNote: 'Moisture-rich feeder insects ideal for tropical species.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'acorn squash': {
    productName: 'Organic Acorn Squash',
    asinLink: 'https://www.amazon.com/dp/B07FZ34ZS4?tag=robinfrench-20',
    vetNote: 'Nutrient-rich squash providing beta-carotene and fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'figs': {
    productName: 'Organic Dried Figs',
    asinLink: 'https://www.amazon.com/dp/B08MDKF98D?tag=robinfrench-20',
    vetNote: 'Calcium-rich dried fruit for omnivorous reptiles.',
    category: 'Fruit',
    commissionRate: 0.03
  },

  // === POCKET PETS ===
  'timothy hay': {
    productName: 'Oxbow Animal Health Western Timothy Hay',
    asinLink: 'https://www.amazon.com/dp/B006AYMMRY?tag=robinfrench-20',
    vetNote: 'High-quality timothy hay for proper dental health and digestion.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'meadow hay': {
    productName: 'Small Pet Select Meadow Hay',
    asinLink: 'https://www.amazon.com/dp/B07CJ2FRNC?tag=robinfrench-20',
    vetNote: 'Nutrient-rich meadow hay providing essential fiber.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'orchard grass hay': {
    productName: 'Oxbow Animal Health Orchard Grass Hay',
    asinLink: 'https://www.amazon.com/dp/B00S6Y8MHU?tag=robinfrench-20',
    vetNote: 'Premium orchard grass hay for optimal small animal nutrition.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'alfalfa hay': {
    productName: 'Kaytee Natural Alfalfa Hay',
    asinLink: 'https://www.amazon.com/dp/B0CM34Z4BQ?tag=robinfrench-20',
    vetNote: 'Calcium-rich alfalfa hay for young or pregnant small animals.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'romaine lettuce': {
    productName: 'Organic Girl Romaine Lettuce',
    asinLink: 'https://www.amazon.com/dp/B0F3YTY4XQ?tag=robinfrench-20',
    vetNote: 'Hydrating leafy green providing vitamins and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'cilantro': {
    productName: 'Organic Cilantro',
    asinLink: 'https://www.amazon.com/dp/B07M9FWTRC?tag=robinfrench-20',
    vetNote: 'Fresh herb providing natural antioxidants and flavor.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'basil': {
    productName: 'Organic Basil',
    asinLink: 'https://www.amazon.com/dp/B097F282FC?tag=robinfrench-20',
    vetNote: 'Aromatic herb providing antioxidants and natural flavor enhancement.',
    category: 'Vegetable',
    commissionRate: 0.03
  },

  // === COMPREHENSIVE VETTED PRODUCTS (128 ingredients from sourcing guide) ===
  'duck hearts': {
    productName: 'Vital Essentials Freeze Dried Duck Hearts',
    asinLink: 'https://www.amazon.com/dp/B0BWBNT8JX?tag=robinfrench-20',
    vetNote: 'Vital Essentials or Raw Paws Pet Food. Freeze-dried for convenience and safety.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'lamb liver': {
    productName: 'Stella & Chewy\'s Freeze Dried Lamb Liver',
    asinLink: 'https://www.amazon.com/dp/B0015G862M?tag=robinfrench-20',
    vetNote: 'Northwest Naturals or Stella & Chewy\'s. Freeze-dried organ meat.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'duck liver': {
    productName: 'Vital Essentials Freeze Dried Duck Liver',
    asinLink: 'https://www.amazon.com/dp/B0BWBV5PRJ?tag=robinfrench-20',
    vetNote: 'Vital Essentials freeze-dried duck liver treat.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken necks': {
    productName: 'Raw Paws Pet Food Raw Chicken Necks',
    asinLink: 'https://www.amazon.com/dp/B0821PF71M?tag=robinfrench-20',
    vetNote: 'Raw Paws Pet Food or My Pet Carnivore. Raw chicken necks for dental health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey thighs': {
    productName: 'Boneless Skinless Turkey Thighs',
    asinLink: 'https://www.amazon.com/dp/B00AR100NE?tag=robinfrench-20',
    vetNote: 'Human-grade source from butcher or grocery store.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground duck': {
    productName: 'Raw Paws Pet Food Raw Ground Duck',
    asinLink: 'https://www.amazon.com/dp/B0BY3CNR3Q?tag=robinfrench-20',
    vetNote: 'Raw Paws Pet Food or Darwins Pet Food. Frozen/raw ground duck.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground lamb (lean)': {
    productName: 'Lean Ground Lamb Meat',
    asinLink: 'https://www.amazon.com/dp/B088Y2N6WC?tag=robinfrench-20',
    vetNote: 'Human-grade lean ground lamb from quality source.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground herring': {
    productName: 'K9 Natural Hoki Fish Blend',
    asinLink: 'https://www.amazon.com/dp/B00B3G89MQ?tag=robinfrench-20',
    vetNote: 'K9 Natural hoki/fish blend for pets.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground mackerel': {
    productName: 'Northwest Naturals Raw Fish Blend',
    asinLink: 'https://www.amazon.com/dp/B079Z4MZTG?tag=robinfrench-20',
    vetNote: 'Northwest Naturals raw fish blend.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'mackerel (canned)': {
    productName: 'Wild Planet Canned Mackerel',
    asinLink: 'https://www.amazon.com/dp/B017J9X8IA?tag=robinfrench-20',
    vetNote: 'Wild Planet or Safe Catch. Canned in water, no salt added.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'herring (canned)': {
    productName: 'Crown Prince Canned Herring',
    asinLink: 'https://www.amazon.com/dp/B01FUWYO2M?tag=robinfrench-20',
    vetNote: 'Crown Prince or Season. Canned in water, no salt added.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken sausage (no additives)': {
    productName: 'Applegate Naturals Chicken Sausage',
    asinLink: 'https://www.amazon.com/dp/B001JO4O80?tag=robinfrench-20',
    vetNote: 'Niman Ranch or Applegate. Read labels carefully for nitrates/sugar.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey sausage (no additives)': {
    productName: 'Applegate Naturals Turkey Sausage',
    asinLink: 'https://www.amazon.com/dp/B00I2VLI5A?tag=robinfrench-20',
    vetNote: 'Applegate Naturals. Read labels carefully.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground pork (lean, small amounts)': {
    productName: 'Lean Ground Pork',
    asinLink: 'https://www.amazon.com/dp/B01H0AI6J4?tag=robinfrench-20',
    vetNote: 'Human-grade lean ground pork.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'regular potato': {
    productName: 'Fresh Russet Potatoes',
    asinLink: 'https://www.amazon.com/dp/B09SHBJWBR?tag=robinfrench-20',
    vetNote: 'Human-grade standard russet potato.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'walnut oil': {
    productName: 'La Tourangelle Walnut Oil',
    asinLink: 'https://www.amazon.com/dp/B00QGWLZ3C?tag=robinfrench-20',
    vetNote: 'La Tourangelle or NOW Foods. Cold-pressed, human-grade.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'black currant oil': {
    productName: 'NOW Foods Black Currant Seed Oil',
    asinLink: 'https://www.amazon.com/dp/B01FXEM0BY?tag=robinfrench-20',
    vetNote: 'NOW Foods or Life-Flo. Capsules often best.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'almond oil': {
    productName: 'Viva Naturals Sweet Almond Oil',
    asinLink: 'https://www.amazon.com/dp/B0BXMMDNJ8?tag=robinfrench-20',
    vetNote: 'NOW Foods or Viva Naturals. Cold-pressed, edible grade.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'sunflower oil': {
    productName: 'High Oleic Sunflower Oil Cold Pressed',
    asinLink: 'https://www.amazon.com/dp/B00MNTRVPS?tag=robinfrench-20',
    vetNote: 'Goya or BetterBody Foods. High oleic, cold-pressed.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'chia seed oil': {
    productName: 'Healthworks Organic Chia Seed Oil',
    asinLink: 'https://www.amazon.com/dp/B00WM6CHFQ?tag=robinfrench-20',
    vetNote: 'Healthworks or Organic Veda. Cold-pressed.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'herring oil': {
    productName: 'Nordic Naturals Pet Herring Oil',
    asinLink: 'https://www.amazon.com/dp/B00CBY93XS?tag=robinfrench-20',
    vetNote: 'Nordic Naturals Pet or Grizzly Pet Products.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'anchovy oil': {
    productName: 'Carlson Labs Fish Oil Anchovy',
    asinLink: 'https://www.amazon.com/dp/B0FDNB2DVS?tag=robinfrench-20',
    vetNote: 'Nordic Naturals Pet or Carlson Labs.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'evening primrose oil': {
    productName: 'Nature\'s Way Evening Primrose Oil',
    asinLink: 'https://www.amazon.com/dp/B07FPBQ31W?tag=robinfrench-20',
    vetNote: 'NOW Foods or Nature\'s Way. Capsules often best.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'mackerel oil': {
    productName: 'Jarrow Formulas Fish Oil Supplement',
    asinLink: 'https://www.amazon.com/dp/B01NBTJFJB?tag=robinfrench-20',
    vetNote: 'Nordic Naturals Pet or Jarrow Formulas.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'sardine oil': {
    productName: 'Zesty Paws Sardine Oil for Dogs',
    asinLink: 'https://www.amazon.com/dp/B0CXKHT5K2?tag=robinfrench-20',
    vetNote: 'Zesty Paws or Grizzly Salmon Oil.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'borage oil': {
    productName: 'NOW Foods Borage Oil Softgels',
    asinLink: 'https://www.amazon.com/dp/B01FXEM0BY?tag=robinfrench-20',
    vetNote: 'NOW Foods or Barleans. Cold-pressed.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'sesame oil': {
    productName: 'Spectrum Cold Pressed Sesame Oil',
    asinLink: 'https://www.amazon.com/dp/B0797GTG2C?tag=robinfrench-20',
    vetNote: 'Chosen Foods or Spectrum. Toasted or un-toasted.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'avocado oil': {
    productName: 'Chosen Foods Pure Avocado Oil',
    asinLink: 'https://www.amazon.com/dp/B0C3WCRNPN?tag=robinfrench-20',
    vetNote: 'Chosen Foods or La Tourangelle. Pure avocado oil.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'avocado oil (tiny amounts)': {
    productName: 'Chosen Foods Pure Avocado Oil',
    asinLink: 'https://www.amazon.com/dp/B0C3WCRNPN?tag=robinfrench-20',
    vetNote: 'Chosen Foods or La Tourangelle. Pure avocado oil.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'wheat germ oil': {
    productName: 'NOW Foods Wheat Germ Oil Liquid',
    asinLink: 'https://www.amazon.com/dp/B001GAOHK2?tag=robinfrench-20',
    vetNote: 'NOW Foods or Solgar. High potency liquid.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'krill oil': {
    productName: 'Kori Krill Oil Pure Supplement',
    asinLink: 'https://www.amazon.com/dp/B004HIQ9CY?tag=robinfrench-20',
    vetNote: 'Viva Labs or Kori Krill Oil. Pure krill oil supplement.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'algae oil (dha)': {
    productName: 'Nordic Naturals Algae Omega DHA',
    asinLink: 'https://www.amazon.com/dp/B079J5YZSS?tag=robinfrench-20',
    vetNote: 'Nordic Naturals Algae Omega or Ovega-3. Vegan DHA.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'omega-3 oil': {
    productName: 'Grizzly Salmon Oil for Pets',
    asinLink: 'https://www.amazon.com/dp/B09RYYWHH1?tag=robinfrench-20',
    vetNote: 'Grizzly Salmon Oil or Nordic Naturals Pet.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'kelp powder': {
    productName: 'NOW Foods Organic Kelp Powder',
    asinLink: 'https://www.amazon.com/dp/B0002JG1GG?tag=robinfrench-20',
    vetNote: 'NOW Foods or Starwest Botanicals. Organic kelp powder.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'joint health powder': {
    productName: 'Nutramax Dasuquin Joint Health Powder',
    asinLink: 'https://www.amazon.com/dp/B00PXK1G50?tag=robinfrench-20',
    vetNote: 'Nutramax Dasuquin or VetriScience Glycoflex.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'amino acid supplement': {
    productName: 'Purina Pro Plan Amino Acid Supplement',
    asinLink: 'https://www.amazon.com/dp/B0C2JFLZHF?tag=robinfrench-20',
    vetNote: 'Purina Pro Plan Veterinary Diets amino acid supplement.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'calcium supplement': {
    productName: 'Thomas Labs Calcium Carbonate Powder',
    asinLink: 'https://www.amazon.com/dp/B0CKNK682W?tag=robinfrench-20',
    vetNote: 'NOW Foods Calcium Carbonate or Thomas Labs Calciboost.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'spirulina powder': {
    productName: 'Vimergy Organic Spirulina Powder',
    asinLink: 'https://www.amazon.com/dp/B08S4982CC?tag=robinfrench-20',
    vetNote: 'NOW Foods or Vimergy. Organic, high purity.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'electrolyte powder': {
    productName: 'ReptoBoost Electrolyte Powder',
    asinLink: 'https://www.amazon.com/dp/B0FMZHN6M1?tag=robinfrench-20',
    vetNote: 'ReptoBoost or Pedialyte. Unflavored, read labels.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'vitamin d3 drops': {
    productName: 'Ddrops Liquid Vitamin D3 Drops',
    asinLink: 'https://www.amazon.com/dp/B0062QD5LM?tag=robinfrench-20',
    vetNote: 'NOW Foods or Ddrops. 1000 IU per drop.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'brewer\'s yeast': {
    productName: 'Bob\'s Red Mill Brewer\'s Yeast Flakes',
    asinLink: 'https://www.amazon.com/dp/B084JL2R77?tag=robinfrench-20',
    vetNote: 'NOW Foods or Bob\'s Red Mill. Nutritional or brewer\'s yeast.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'buckwheat': {
    productName: 'Bob\'s Red Mill Raw Hulled Buckwheat Groats',
    asinLink: 'https://www.amazon.com/dp/B00KQ17MDG?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Raw hulled buckwheat groats.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'buckwheat (tiny amounts)': {
    productName: 'Bob\'s Red Mill Raw Hulled Buckwheat Groats',
    asinLink: 'https://www.amazon.com/dp/B00KQ17MDG?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Raw hulled buckwheat groats.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'buckwheat (hulled)': {
    productName: 'Anthony\'s Goods Hulled Buckwheat Groats',
    asinLink: 'https://www.amazon.com/dp/B0D15QDVW7?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Hulled buckwheat groats.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'sorghum': {
    productName: 'Bob\'s Red Mill Whole Grain Sorghum',
    asinLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Shiloh Farms. Whole grain sorghum.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'barley': {
    productName: 'Bob\'s Red Mill Hulled Barley Grain',
    asinLink: 'https://www.amazon.com/dp/B0D481997Z?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill hulled barley grain.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'barley (cooked, minimal)': {
    productName: 'Bob\'s Red Mill Hulled Barley Grain',
    asinLink: 'https://www.amazon.com/dp/B00QKP257A?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill hulled barley grain.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'barley (hulled)': {
    productName: 'Bob\'s Red Mill Hulled Barley Grain',
    asinLink: 'https://www.amazon.com/dp/B00QKP257A?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill hulled barley grain.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'millet': {
    productName: 'Bob\'s Red Mill Whole Grain Millet',
    asinLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Organic Grains. Whole grain millet.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'millet (tiny amounts)': {
    productName: 'Bob\'s Red Mill Whole Grain Millet',
    asinLink: 'https://www.amazon.com/dp/B07XPCWYP2?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Organic Grains. Whole grain millet.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'farro': {
    productName: 'Bob\'s Red Mill Farro Grain',
    asinLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Thrive Market. Farro grain.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'bulgur': {
    productName: 'Bob\'s Red Mill Fine Bulgur Wheat',
    asinLink: 'https://www.amazon.com/dp/B081DQ5NG5?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Ziyad. Fine bulgur wheat.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'amaranth (tiny amounts)': {
    productName: 'Bob\'s Red Mill Whole Grain Amaranth Seed',
    asinLink: 'https://www.amazon.com/dp/B000V1O40U?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Whole grain amaranth seed.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'amaranth seeds': {
    productName: 'Bob\'s Red Mill Whole Grain Amaranth Seed',
    asinLink: 'https://www.amazon.com/dp/B000V1O40U?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Whole grain amaranth seed.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'teff seeds': {
    productName: 'Bob\'s Red Mill Whole Grain Teff Seeds',
    asinLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill whole grain teff seeds.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'wheat (hulled)': {
    productName: 'Bob\'s Red Mill Whole Hulled Wheat Berries',
    asinLink: 'https://www.amazon.com/dp/B000YFB5NC?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or SpeltLife. Whole hulled wheat berries.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'oat bran (small amounts)': {
    productName: 'Bob\'s Red Mill Pure Oat Bran Cereal',
    asinLink: 'https://www.amazon.com/dp/B07CC9RF6Y?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Quaker. Pure oat bran cereal.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'oatmeal (cooked, small amounts)': {
    productName: 'Quaker Rolled Oats Old Fashioned',
    asinLink: 'https://www.amazon.com/dp/B00CTLAIH8?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Quaker. Rolled oats old fashioned.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'corn (cracked)': {
    productName: 'Scratch and Peck Cracked Corn Non-GMO',
    asinLink: 'https://www.amazon.com/dp/B01HHGD81C?tag=robinfrench-20',
    vetNote: 'Scratch and Peck Feeds or Purina. Cracked corn non-GMO.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'safflower seeds': {
    productName: 'Wagner\'s Pure Safflower Seed Bird Food',
    asinLink: 'https://www.amazon.com/dp/B0FWLFGG21?tag=robinfrench-20',
    vetNote: 'Wagner\'s or Kaytee. Pure safflower seed bird food.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'nyjer seeds': {
    productName: 'Wagner\'s Nyjer Seed Bird Food',
    asinLink: 'https://www.amazon.com/dp/B0D6688V7C?tag=robinfrench-20',
    vetNote: 'Wagner\'s or Kaytee. Nyjer seed bird food.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'bok choi': {
    productName: 'Fresh Baby Bok Choy',
    asinLink: 'https://www.amazon.com/dp/B0FN4YGSK6?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'bok choy (small amounts)': {
    productName: 'Fresh Baby Bok Choy',
    asinLink: 'https://www.amazon.com/dp/B0FN4YGSK6?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'navy beans (mashed)': {
    productName: 'Goya Canned Navy Beans Low Sodium',
    asinLink: 'https://www.amazon.com/dp/B006AZE13G?tag=robinfrench-20',
    vetNote: 'Goya or Bush\'s. Canned navy beans, low sodium, rinse well.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'kidney beans (mashed)': {
    productName: 'Goya Canned Dark Red Kidney Beans Low Sodium',
    asinLink: 'https://www.amazon.com/dp/B00552005I?tag=robinfrench-20',
    vetNote: 'Goya or Bush\'s. Canned dark red kidney beans, low sodium, rinse well.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'kidney beans (mashed, tiny amounts)': {
    productName: 'Goya Canned Dark Red Kidney Beans Low Sodium',
    asinLink: 'https://www.amazon.com/dp/B00552005I?tag=robinfrench-20',
    vetNote: 'Goya or Bush\'s. Canned dark red kidney beans, low sodium, rinse well.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'pinto beans (mashed)': {
    productName: 'Bush\'s Canned Pinto Beans Low Sodium',
    asinLink: 'https://www.amazon.com/dp/B0C4G2PR58?tag=robinfrench-20',
    vetNote: 'Goya or Bush\'s. Canned pinto beans, low sodium, rinse well.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'purslane': {
    productName: 'Fresh Purslane Leaves',
    asinLink: 'https://www.amazon.com/dp/B09MDXM2YQ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'purslane (small amounts)': {
    productName: 'Fresh Purslane Leaves',
    asinLink: 'https://www.amazon.com/dp/B0BWY8JWVL?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'miner\'s lettuce': {
    productName: 'Miner\'s Lettuce Seeds for Planting',
    asinLink: 'https://www.amazon.com/dp/B0D3J7FZFD?tag=robinfrench-20',
    vetNote: 'Fresh produce or seeds for growing.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'flaxseed (ground)': {
    productName: 'Bob\'s Red Mill Organic Ground Flaxseed Meal',
    asinLink: 'https://www.amazon.com/dp/B075XC6C69?tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Spectrum. Organic ground flaxseed meal.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'fennel': {
    productName: 'Fresh Fennel Bulb',
    asinLink: 'https://www.amazon.com/dp/B00E3J6RC4?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'delicata squash': {
    productName: 'Fresh Delicata Squash',
    asinLink: 'https://www.amazon.com/dp/B07KHH8K4L?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'yellow squash': {
    productName: 'Fresh Yellow Summer Squash',
    asinLink: 'https://www.amazon.com/dp/B08QVBFGDC?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'leeks': {
    productName: 'Fresh Leeks',
    asinLink: 'https://www.amazon.com/dp/B09HQJGQDG?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'shallots': {
    productName: 'Fresh Shallots',
    asinLink: 'https://www.amazon.com/dp/B09B2ZWHKQ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'tomatoes (small amounts)': {
    productName: 'Fresh Ripe Vine Tomatoes',
    asinLink: 'https://www.amazon.com/dp/B086WX15TH?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'napa cabbage': {
    productName: 'Fresh Napa Cabbage',
    asinLink: 'https://www.amazon.com/dp/B07FTVYNM3?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'napa cabbage (small amounts)': {
    productName: 'Fresh Napa Cabbage',
    asinLink: 'https://www.amazon.com/dp/B079VV1K9L?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'artichokes': {
    productName: 'Fresh Artichoke Hearts',
    asinLink: 'https://www.amazon.com/dp/B0DF91JXND?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'frisee': {
    productName: 'Fresh Frisee Lettuce',
    asinLink: 'https://www.amazon.com/dp/B07FZGKZL4?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'radicchio': {
    productName: 'Fresh Radicchio Lettuce',
    asinLink: 'https://www.amazon.com/dp/B00BJPTZLA?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'red cabbage': {
    productName: 'Fresh Red Cabbage Head',
    asinLink: 'https://www.amazon.com/dp/B000RH1MXK?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'green cabbage': {
    productName: 'Fresh Green Cabbage Head',
    asinLink: 'https://www.amazon.com/dp/B09HQGDCKV?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'swiss chard': {
    productName: 'Fresh Swiss Chard',
    asinLink: 'https://www.amazon.com/dp/B07F12P248?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'swiss chard (cooked, tiny amounts)': {
    productName: 'Fresh Swiss Chard',
    asinLink: 'https://www.amazon.com/dp/B07F12P248?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'lettuce (romaine, small amounts)': {
    productName: 'Fresh Romaine Lettuce Hearts',
    asinLink: 'https://www.amazon.com/dp/B074H5J9G2?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'red leaf lettuce': {
    productName: 'Fresh Red Leaf Lettuce',
    asinLink: 'https://www.amazon.com/dp/B0BX76BG5V?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'mache': {
    productName: 'Fresh Mache Lamb\'s Lettuce',
    asinLink: 'https://www.amazon.com/dp/B00AWLAQFG?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'alfalfa sprouts (small amounts)': {
    productName: 'Fresh Alfalfa Sprouts',
    asinLink: 'https://www.amazon.com/dp/B0DFZTWLTY?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'cat grass (wheatgrass)': {
    productName: 'SmartyKat Cat Grass Growing Kit Wheatgrass',
    asinLink: 'https://www.amazon.com/dp/B0D45F9TGG?tag=robinfrench-20',
    vetNote: 'SmartyKat or Catit. Cat Grass growing kit wheatgrass.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'squash (cooked)': {
    productName: 'Fresh Butternut Squash',
    asinLink: 'https://www.amazon.com/dp/B002QY3U5A?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'lamb\'s quarters': {
    productName: 'Lamb\'s Quarters Seeds',
    asinLink: 'https://www.amazon.com/dp/B0DYPHGW89?tag=robinfrench-20',
    vetNote: 'Wild harvested or seeds for growing.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'amaranth leaves': {
    productName: 'Fresh Amaranth Leaves',
    asinLink: 'https://www.amazon.com/dp/B0F2YRBGS6?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'ginger (small amounts)': {
    productName: 'Simply Organic Fresh Ginger Root',
    asinLink: 'https://www.amazon.com/dp/B0C6V3416T?tag=robinfrench-20',
    vetNote: 'McCormick or Simply Organic. Organic ginger root fresh.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'turmeric': {
    productName: 'Simply Organic Pure Turmeric Powder',
    asinLink: 'https://www.amazon.com/dp/B018GPDCV4?tag=robinfrench-20',
    vetNote: 'Simply Organic or Tummydrops. Pure turmeric powder.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'rosemary': {
    productName: 'Frontier Co-op Dried Organic Rosemary',
    asinLink: 'https://www.amazon.com/dp/B004JWLMNY?tag=robinfrench-20',
    vetNote: 'Simply Organic or Frontier Co-op. Dried organic rosemary.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'sage': {
    productName: 'Simply Organic Dried Sage Leaf',
    asinLink: 'https://www.amazon.com/dp/B0CH3R9TVY?tag=robinfrench-20',
    vetNote: 'Simply Organic or Frontier Co-op. Dried sage leaf.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'mint': {
    productName: 'Fresh Mint Leaves',
    asinLink: 'https://www.amazon.com/dp/B097F3NT7N?tag=robinfrench-20',
    vetNote: 'Fresh produce or Mountain Rose Herbs. Fresh mint leaves.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'garlic chives': {
    productName: 'Fresh Garlic Chives',
    asinLink: 'https://www.amazon.com/dp/B097F3J1PY?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'raisins (unsweetened)': {
    productName: 'Sun-Maid Organic Raisins Unsweetened',
    asinLink: 'https://www.amazon.com/dp/B01GXPRIQY?tag=robinfrench-20',
    vetNote: 'Sun-Maid or Trader Joe\'s. Organic raisins unsweetened no oil.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'plums (pitted)': {
    productName: 'Fresh Plums Pitted',
    asinLink: 'https://www.amazon.com/dp/B07P6Z8L76?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'apricots (pitted)': {
    productName: 'NOW Foods Dried Apricots Unsulphured',
    asinLink: 'https://www.amazon.com/dp/B07FZWBPC5?tag=robinfrench-20',
    vetNote: 'Fresh produce or NOW Foods. Dried apricots unsulphured no sugar.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'kiwi': {
    productName: 'Fresh Kiwi Fruit',
    asinLink: 'https://www.amazon.com/dp/B01LASWK7G?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'mulberries': {
    productName: 'Terrasoul Dried Mulberries Organic',
    asinLink: 'https://www.amazon.com/dp/B074153BXC?tag=robinfrench-20',
    vetNote: 'Navitas Organics or Terrasoul Superfoods. Dried mulberries organic.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'raspberries': {
    productName: 'Fresh Raspberries Organic',
    asinLink: 'https://www.amazon.com/dp/B000P6G12U?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'cranberries': {
    productName: 'NOW Foods Dried Cranberries Unsweetened',
    asinLink: 'https://www.amazon.com/dp/B074153BXC?tag=robinfrench-20',
    vetNote: 'Fresh produce or NOW Foods. Dried cranberries unsweetened.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'pineapple (small amounts)': {
    productName: 'Fresh Pineapple Fruit',
    asinLink: 'https://www.amazon.com/dp/B000P6L3V4?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'pears (no seeds)': {
    productName: 'Fresh Pears No Seeds',
    asinLink: 'https://www.amazon.com/dp/B0DYKVQ3XZ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'pinhead crickets': {
    productName: 'Josh\'s Frogs Live Pinhead Crickets',
    asinLink: 'https://www.amazon.com/dp/B07196FX9W?tag=robinfrench-20',
    vetNote: 'Josh\'s Frogs or Fluker\'s. Live pinhead crickets.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'locusts': {
    productName: 'Exo Terra Canned Locusts Reptile Food',
    asinLink: 'https://www.amazon.com/dp/B000CMKHBS?tag=robinfrench-20',
    vetNote: 'Rainbow Mealworms or Exo Terra. Canned locusts reptile food.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'butterworms': {
    productName: 'Rainbow Mealworms Live Butterworms',
    asinLink: 'https://www.amazon.com/dp/B093BD8NXR?tag=robinfrench-20',
    vetNote: 'Josh\'s Frogs or Rainbow Mealworms. Live butterworms.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'grasshoppers': {
    productName: 'Fluker\'s Dried Grasshoppers Reptile Food',
    asinLink: 'https://www.amazon.com/dp/B004HSQRG2?tag=robinfrench-20',
    vetNote: 'Fluker\'s or Exo Terra. Dried grasshoppers reptile food.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'small dubia roaches': {
    productName: 'Small Live Dubia Roaches Feeder',
    asinLink: 'https://www.amazon.com/dp/B09QD6PBB8?tag=robinfrench-20',
    vetNote: 'DubiaRoaches.com or Josh\'s Frogs. Small live dubia roaches feeder.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'silkworms': {
    productName: 'Live Silkworms Reptile Food',
    asinLink: 'https://www.amazon.com/dp/B08JKNZPSF?tag=robinfrench-20',
    vetNote: 'Coastal Silkworms or SilkwormShop. Live silkworms reptile food.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'earthworms': {
    productName: 'Uncle Jim\'s Live Earthworms',
    asinLink: 'https://www.amazon.com/dp/B097PDMK47?tag=robinfrench-20',
    vetNote: 'Uncle Jim\'s Worm Farm. Live earthworms.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'wheat hay': {
    productName: 'Oxbow Wheat Hay Small Animal',
    asinLink: 'https://www.amazon.com/dp/B0CLC76V98?tag=robinfrench-20',
    vetNote: 'Oxbow Animal Health or Small Pet Select. Wheat hay small animal.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'fescue hay': {
    productName: 'Small Pet Select Fescue Hay',
    asinLink: 'https://www.amazon.com/dp/B00S6YIF36?tag=robinfrench-20',
    vetNote: 'Small Pet Select fescue hay.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'oat hay': {
    productName: 'Oxbow Oat Hay Small Animal',
    asinLink: 'https://www.amazon.com/dp/B000WFKP80?tag=robinfrench-20',
    vetNote: 'Oxbow Animal Health or Small Pet Select. Oat hay small animal.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'bluegrass hay': {
    productName: 'Small Pet Select Bluegrass Hay',
    asinLink: 'https://www.amazon.com/dp/B00S6Y8MHU?tag=robinfrench-20',
    vetNote: 'Small Pet Select bluegrass hay.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'straw (wheat/pine)': {
    productName: 'Oxbow Wheat Straw Bedding',
    asinLink: 'https://www.amazon.com/dp/B0CDQMD1CB?tag=robinfrench-20',
    vetNote: 'Kaytee or Oxbow. Wheat straw bedding.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'dried grass': {
    productName: 'Kaytee Dried Natural Grass Small Animal',
    asinLink: 'https://www.amazon.com/dp/B0002DK8OI?tag=robinfrench-20',
    vetNote: 'Kaytee or Timothy Grass. Dried natural grass small animal.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'bermuda hay': {
    productName: 'Standlee Premium Bermuda Hay',
    asinLink: 'https://www.amazon.com/dp/B0FSVM5P3D?tag=robinfrench-20',
    vetNote: 'Oxbow Animal Health or Standlee Hay. Premium bermuda hay.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'barley hay': {
    productName: 'Standlee Barley Hay',
    asinLink: 'https://www.amazon.com/dp/B08YM9VJC5?tag=robinfrench-20',
    vetNote: 'Small Pet Select or Standlee Hay. Barley hay.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'guinea pig pellets (with vitamin c)': {
    productName: 'Oxbow Essentials Cavy Cuisine Guinea Pig Pellets',
    asinLink: 'https://www.amazon.com/dp/B00E4KT5NA?tag=robinfrench-20',
    vetNote: 'Oxbow Essentials Cavy Cuisine or Sherwood. Guinea pig pellets with vitamin C.',
    category: 'Pellet',
    commissionRate: 0.03
  },
  'rabbit pellets (high fiber)': {
    productName: 'Oxbow Essentials Rabbit Food High Fiber',
    asinLink: 'https://www.amazon.com/dp/B0017JANQY?tag=robinfrench-20',
    vetNote: 'Oxbow Essentials Rabbit Food. Adult rabbit pellets high fiber.',
    category: 'Pellet',
    commissionRate: 0.03
  },
  'hamster pellets (higher protein)': {
    productName: 'Oxbow Essentials Hamster Food Higher Protein',
    asinLink: 'https://www.amazon.com/dp/B0053SYJVA?tag=robinfrench-20',
    vetNote: 'Higgins Sunburst or Oxbow Essentials. Hamster food higher protein.',
    category: 'Pellet',
    commissionRate: 0.03
  },
  'wild bird mix': {
    productName: 'Lyric Wild Bird Mix No Filler',
    asinLink: 'https://www.amazon.com/dp/B0FWLFGG21?tag=robinfrench-20',
    vetNote: 'Lyric or Kaytee. Wild bird mix no filler.',
    category: 'Pellet',
    commissionRate: 0.03
  },

  // === MISSING INGREDIENTS - Added to complete coverage ===
  'beta-glucans': {
    productName: 'NOW Supplements Beta Glucans 60 Capsules',
    asinLink: 'https://www.amazon.com/dp/B01LWVNL9J?tag=robinfrench-20',
    vetNote: 'Immune-supporting beta-glucans from yeast or mushrooms for enhanced immune function.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'biotin': {
    productName: 'NOW Supplements Biotin 5000 mcg',
    asinLink: 'https://www.amazon.com/dp/B01AMJCHB8?tag=robinfrench-20',
    vetNote: 'B-complex vitamin essential for healthy skin, coat, and metabolic function.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'bone broth (low sodium)': {
    productName: 'Brutus Bone Broth for Dogs Low Sodium',
    asinLink: 'https://www.amazon.com/dp/B07DFNP37Y?tag=robinfrench-20',
    vetNote: 'Concentrated bone broth providing collagen, glucosamine, and natural electrolytes without excess sodium.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'cauliflower': {
    productName: 'Fresh Organic Cauliflower',
    asinLink: 'https://www.amazon.com/dp/B000P6G0GM?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Low-calorie vegetable rich in fiber and vitamins.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'chicory root': {
    productName: 'NOW Supplements Inulin Prebiotic Fiber',
    asinLink: 'https://www.amazon.com/dp/B08Q7KZYKC?tag=robinfrench-20',
    vetNote: 'Prebiotic fiber from chicory root supporting healthy gut bacteria and digestive function.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'chondroitin sulfate': {
    productName: 'Cosequin DS Plus MSM with Chondroitin',
    asinLink: 'https://www.amazon.com/dp/B003ULL1NQ?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated joint supplement with chondroitin for cartilage health and mobility.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'cranberry extract': {
    productName: 'NOW Supplements Cranberry Extract 5000 mg',
    asinLink: 'https://www.amazon.com/dp/B01N7KMPU3?tag=robinfrench-20',
    vetNote: 'Concentrated cranberry extract supporting urinary tract health and preventing bacterial adhesion.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'curcumin (turmeric extract)': {
    productName: 'NOW Supplements Curcumin with BioPerine',
    asinLink: 'https://www.amazon.com/dp/B0CK3C31JP?tag=robinfrench-20',
    vetNote: 'Anti-inflammatory curcumin from turmeric with enhanced absorption for joint and immune support.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'd-mannose': {
    productName: 'NOW Supplements D-Mannose Powder',
    asinLink: 'https://www.amazon.com/dp/B01N6X9YBS?tag=robinfrench-20',
    vetNote: 'Natural sugar compound supporting urinary tract health by preventing bacterial adhesion.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'egg yolks': {
    productName: 'Vital Farms Pasture-Raised Eggs',
    asinLink: 'https://www.amazon.com/dp/B00M1QWODW?tag=robinfrench-20',
    vetNote: 'High-quality eggs from pasture-raised hens, rich in protein, healthy fats, and essential nutrients.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'eggplant': {
    productName: 'Fresh Organic Eggplant',
    asinLink: 'https://www.amazon.com/dp/B001PLGQPQ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Low-calorie vegetable with fiber and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'eggshells (crushed)': {
    productName: 'NOW Supplements Calcium Carbonate Powder',
    asinLink: 'https://www.amazon.com/dp/B004421K68?tag=robinfrench-20',
    vetNote: 'Crushed eggshells provide natural calcium carbonate. Can be prepared at home from organic eggs or use calcium supplement.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'fish broth (no salt)': {
    productName: 'Brutus Fish Broth for Dogs No Salt',
    asinLink: 'https://www.amazon.com/dp/B07DFQFLJL?tag=robinfrench-20',
    vetNote: 'Concentrated fish broth providing omega-3s, collagen, and natural flavor without added salt.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'fructooligosaccharides (fos)': {
    productName: 'NOW Supplements FOS Prebiotic Fiber',
    asinLink: 'https://www.amazon.com/dp/B08Q7KZYKC?tag=robinfrench-20',
    vetNote: 'Prebiotic fiber supporting beneficial gut bacteria growth and digestive health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'glucosamine sulfate': {
    productName: 'Cosequin DS Plus MSM Glucosamine',
    asinLink: 'https://www.amazon.com/dp/B003ULL1NQ?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated glucosamine sulfate for joint cartilage health and mobility support.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'green beans': {
    productName: 'Fresh Organic Green Beans',
    asinLink: 'https://www.amazon.com/dp/B0DDTC6QNY?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Low-calorie vegetable rich in fiber and vitamins.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'green beans (cooked)': {
    productName: 'Fresh Organic Green Beans',
    asinLink: 'https://www.amazon.com/dp/B0DDTC6QNY?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Steam or boil until tender for optimal digestibility.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'hairball control paste': {
    productName: 'Tomlyn Laxatone Hairball Remedy',
    asinLink: 'https://www.amazon.com/dp/B07B282MR4?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated paste for hairball prevention and digestive health in cats.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'hyaluronic acid': {
    productName: 'NOW Supplements Hyaluronic Acid 100 mg',
    asinLink: 'https://www.amazon.com/dp/B07XHNCJMC?tag=robinfrench-20',
    vetNote: 'Joint health supplement supporting cartilage hydration and joint lubrication.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'inulin (prebiotic)': {
    productName: 'NOW Supplements Inulin Prebiotic Fiber',
    asinLink: 'https://www.amazon.com/dp/B08Q7KZYKC?tag=robinfrench-20',
    vetNote: 'Prebiotic fiber from chicory root supporting healthy gut bacteria and digestive function.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'jerusalem artichoke': {
    productName: 'Fresh Jerusalem Artichoke Sunchokes',
    asinLink: 'https://www.amazon.com/dp/B0CQK5XCVZ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Prebiotic-rich root vegetable supporting gut health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'joint health supplement': {
    productName: 'Cosequin DS Plus MSM for Dogs',
    asinLink: 'https://www.amazon.com/dp/B003ULL1NQ?tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated joint supplement with glucosamine, chondroitin, and MSM for joint health and mobility.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'l-carnitine powder': {
    productName: 'NOW Supplements L-Carnitine 500 mg',
    asinLink: 'https://www.amazon.com/dp/B06Y1BTLGK?tag=robinfrench-20',
    vetNote: 'Amino acid supporting heart health, energy metabolism, and weight management.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'lysine powder': {
    productName: 'NOW Supplements L-Lysine 1000 mg',
    asinLink: 'https://www.amazon.com/dp/B00V3MR88G?tag=robinfrench-20',
    vetNote: 'Essential amino acid supporting immune function, collagen production, and overall health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'malabar spinach': {
    productName: 'Fresh Malabar Spinach Leaves',
    asinLink: 'https://www.amazon.com/dp/B0DLT7BSNJ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Nutrient-rich leafy green with vitamins and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'mannanoligosaccharides (mos)': {
    productName: 'NOW Supplements MOS Prebiotic',
    asinLink: 'https://www.amazon.com/dp/B0CRFWM2Z6?tag=robinfrench-20',
    vetNote: 'Prebiotic supplement supporting beneficial gut bacteria and immune function.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'milk thistle': {
    productName: 'NOW Supplements Milk Thistle 150 mg',
    asinLink: 'https://www.amazon.com/dp/B0019LVFD0?tag=robinfrench-20',
    vetNote: 'Liver-supporting herb with antioxidant properties for hepatic health and detoxification.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'new zealand spinach': {
    productName: 'Fresh New Zealand Spinach',
    asinLink: 'https://www.amazon.com/dp/B0C8VD126M?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Nutrient-rich leafy green alternative to traditional spinach.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'niacinamide': {
    productName: 'NOW Supplements Niacinamide 500 mg',
    asinLink: 'https://www.amazon.com/dp/B0CZMBZPLV?tag=robinfrench-20',
    vetNote: 'B-vitamin (B3) supporting energy metabolism, skin health, and nervous system function.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'oats (rolled)': {
    productName: 'Bob\'s Red Mill Old Fashioned Rolled Oats',
    asinLink: 'https://www.amazon.com/dp/B07VCM66N6?tag=robinfrench-20',
    vetNote: 'Whole grain rolled oats providing fiber, B vitamins, and sustained energy. Cook thoroughly before serving.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'peas': {
    productName: 'Fresh Organic Green Peas',
    asinLink: 'https://www.amazon.com/dp/B07D1NGQ6B?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Protein-rich legume with fiber and vitamins.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'peas (mashed)': {
    productName: 'Fresh Organic Green Peas',
    asinLink: 'https://www.amazon.com/dp/B07D1NGQ6B?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Steam and mash for optimal digestibility.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'pectin (from apples)': {
    productName: 'NOW Supplements Apple Pectin Powder',
    asinLink: 'https://www.amazon.com/dp/B01CO69SYG?tag=robinfrench-20',
    vetNote: 'Soluble fiber from apples supporting digestive health and blood sugar regulation.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'pumpkin seed oil': {
    productName: 'NOW Solutions Pumpkin Seed Oil',
    asinLink: 'https://www.amazon.com/dp/B0FKYLMWYG?tag=robinfrench-20',
    vetNote: 'Omega-3 and omega-6 rich oil supporting urinary health, skin, and coat condition.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'quail eggs': {
    productName: 'Fresh Quail Eggs',
    asinLink: 'https://www.amazon.com/dp/B0BSRGV9PR?tag=robinfrench-20',
    vetNote: 'Small nutrient-dense eggs from quail, rich in protein, healthy fats, and essential nutrients.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'quercetin': {
    productName: 'NOW Supplements Quercetin with Bromelain',
    asinLink: 'https://www.amazon.com/dp/B08M5L372P?tag=robinfrench-20',
    vetNote: 'Antioxidant flavonoid supporting immune function, allergy relief, and anti-inflammatory benefits.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'rice (hulled)': {
    productName: 'Lundberg Organic Brown Rice',
    asinLink: 'https://www.amazon.com/dp/B072JNNB33?tag=robinfrench-20',
    vetNote: 'Whole grain brown rice with hull removed, providing fiber, B vitamins, and sustained energy.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'romanesco broccoli': {
    productName: 'Fresh Romanesco Broccoli',
    asinLink: 'https://www.amazon.com/dp/B01I1Q74MQ?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Nutrient-rich cruciferous vegetable with vitamins C and K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  's-adenosyl methionine (sam-e)': {
    productName: 'NOW Supplements SAM-e 200 mg',
    asinLink: 'https://www.amazon.com/dp/B000OSSQFY?tag=robinfrench-20',
    vetNote: 'Methyl donor supporting liver health, joint function, and mood regulation.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'sardines (in water)': {
    productName: 'Wild Planet Sardines in Water No Salt',
    asinLink: 'https://www.amazon.com/dp/B01FUWYO2M?tag=robinfrench-20',
    vetNote: 'Wild-caught sardines canned in water without added salt. Rich in omega-3s, calcium, and protein.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'snap peas': {
    productName: 'Fresh Organic Snap Peas',
    asinLink: 'https://www.amazon.com/dp/B077L6C7YB?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Edible-pod peas rich in fiber and vitamins.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'snow peas': {
    productName: 'Fresh Organic Snow Peas',
    asinLink: 'https://www.amazon.com/dp/B07MGSDD7L?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Flat-podded peas with tender texture and mild flavor.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'snow peas (mashed)': {
    productName: 'Fresh Organic Snow Peas',
    asinLink: 'https://www.amazon.com/dp/B08KRNKC9G?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Steam and mash for optimal digestibility.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'split peas': {
    productName: 'Bob\'s Red Mill Split Peas',
    asinLink: 'https://www.amazon.com/dp/B08DVGSW58?tag=robinfrench-20',
    vetNote: 'Dried split peas providing protein, fiber, and B vitamins. Soak and cook thoroughly before serving.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'split peas (mashed)': {
    productName: 'Bob\'s Red Mill Split Peas',
    asinLink: 'https://www.amazon.com/dp/B08DVGSW58?tag=robinfrench-20',
    vetNote: 'Dried split peas providing protein, fiber, and B vitamins. Cook and mash for optimal digestibility.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'sugar snap peas': {
    productName: 'Fresh Organic Sugar Snap Peas',
    asinLink: 'https://www.amazon.com/dp/B08DVGSW58?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Sweet, crisp peas with edible pods rich in fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'sugar snap peas (mashed)': {
    productName: 'Fresh Organic Sugar Snap Peas',
    asinLink: 'https://www.amazon.com/dp/B08DVGSW58?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Steam and mash for optimal digestibility.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'turkey broth (no salt)': {
    productName: 'Brutus Turkey Broth for Dogs No Salt',
    asinLink: 'https://www.amazon.com/dp/B07DFQFLJL?tag=robinfrench-20',
    vetNote: 'Concentrated turkey broth providing protein, collagen, and natural flavor without added salt.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'vitamin b complex': {
    productName: 'Thorne B-Complex #12',
    asinLink: 'https://www.amazon.com/dp/B01INRFW0E?tag=robinfrench-20',
    vetNote: 'Complete B vitamin complex for energy metabolism, nervous system health, and overall vitality.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'vitamin c (small amounts)': {
    productName: 'NOW Supplements Vitamin C 1000 mg',
    asinLink: 'https://www.amazon.com/dp/B074GCB1ND?tag=robinfrench-20',
    vetNote: 'Antioxidant vitamin supporting immune function and collagen production. Use in small amounts as directed.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'watercress': {
    productName: 'Fresh Organic Watercress',
    asinLink: 'https://www.amazon.com/dp/B0BSK8P8KS?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Nutrient-dense leafy green with vitamins A, C, and K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'watercress (small amounts)': {
    productName: 'Fresh Organic Watercress',
    asinLink: 'https://www.amazon.com/dp/B0BSK8P8KS?tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market. Use in small amounts due to strong flavor and oxalate content.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'wheat germ': {
    productName: 'Bob\'s Red Mill Wheat Germ',
    asinLink: 'https://www.amazon.com/dp/B0FKBVN6XP?tag=robinfrench-20',
    vetNote: 'Nutrient-dense wheat germ providing vitamin E, B vitamins, and healthy fats for skin and coat health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'wild rice': {
    productName: 'Lundberg Organic Wild Rice',
    asinLink: 'https://www.amazon.com/dp/B089CP461X?tag=robinfrench-20',
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
    .trim();
  
  // Handle specific mappings FIRST (before removing descriptors)
  // This ensures "ground chicken" maps correctly before "ground" could be removed
  const mappings: Record<string, string> = {
    'ground chicken': 'ground chicken',
    'ground turkey': 'ground turkey',
    'ground beef': 'ground beef (lean)',
    'ground lamb': 'ground lamb',
    'ground pork': 'ground pork (lean)',
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
    'sweet potato': 'sweet potato',
    'pumpkin': 'pumpkin puree',
    'butternut squash': 'butternut squash',
    'lentils': 'lentils',
    'chickpeas': 'chickpeas',
    'black beans': 'black beans',
    'green peas': 'green peas',
    'carrots': 'carrots',
    'spinach': 'spinach',
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
    'salmon oil': 'salmon oil',
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
    'salmon': 'salmon (boneless)',
    'eggs': 'eggs',
    'sardines water': 'sardines (canned in water)',
    'quail': 'quail',
    'millet white red': 'millet (white/red)',
    'canary seed': 'canary seed',
    'niger seed': 'niger seed',
    'oat groats': 'oat groats',
    'hemp seeds': 'hemp seeds',
    'flaxseeds': 'flaxseeds',
    'sesame seeds': 'sesame seeds',
    'chia seeds': 'chia seeds',
    'quinoa cooked': 'quinoa (cooked)',
    'rapeseed': 'rapeseed',
    'sunflower seeds small amounts': 'sunflower seeds (small amounts)',
    'pumpkin seeds': 'pumpkin seeds',
    'bell peppers': 'bell peppers',
    'corn fresh': 'corn (fresh)',
    'apples no seeds': 'apples (no seeds)',
    'blueberries': 'blueberries',
    'strawberries': 'strawberries',
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
    'superworms': 'superworms',
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
  
  // Check mappings FIRST (before removing descriptors)
  if (mappings[normalized]) {
    return mappings[normalized];
  }
  
  // Then do normalization (remove descriptors, etc.)
  // NOTE: "ground" is NOT removed because it's part of valid ingredient names
  normalized = normalized
    // Remove common descriptors (but NOT "ground" since it's part of ingredient names)
    .replace(/\b(boneless|skinless|fresh|frozen|dried|canned|cooked|raw|organic|whole|diced|chopped|minced|sliced|grated|shredded|crushed|powdered|pureed|no sugar|low-sodium)\b/g, '')
    // Remove quantities and measurements
    .replace(/\b(\d+(?:\.\d+)?)\s*(g|kg|lb|oz|cup|cups|tbsp|tsp|ml|l|pinch|dash)\b/g, '')
    // Remove parentheses and their contents
    .replace(/\([^)]*\)/g, '')
    // Remove commas and everything after
    .replace(/,.*/, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  // Check mappings again after normalization
  return mappings[normalized] || normalized;
}

/**
 * Looks up a generic ingredient and returns the vetted product details if available.
 * @param genericName The generic ingredient name (e.g., "Ground Turkey").
 */
export function getVettedProduct(genericName: string): VettedProduct | undefined {
  const normalizedName = genericName.toLowerCase().trim();
  
  // First try exact match
  const exactMatch = VETTED_PRODUCTS[normalizedName];
  if (exactMatch) {
    // Exact match found - no logging needed in production
    return exactMatch;
  }

  // Then try normalized match
  const normalized = normalizeIngredientName(genericName);
  const normalizedMatch = VETTED_PRODUCTS[normalized];
  
  if (normalizedMatch) {
    // Normalized match found - no logging needed in production
    return normalizedMatch;
  }
  
  // No match found - silently return undefined (product not available)
  return undefined;
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
  return product.asinLink;
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

  if (product.asinLink) {
    links.push({ vendor: 'Amazon', url: product.asinLink, commission: product.commissionRate || 0.03 });
  }
  if (product.chewyLink) {
    links.push({ vendor: 'Chewy', url: product.chewyLink, commission: product.commissionRate || 0.08 });
  }
  if (product.specialtyLink) {
    links.push({ vendor: 'Specialty', url: product.specialtyLink, commission: product.commissionRate || 0.10 });
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
    if (product?.asinLink) {
      // Extract ASIN from Amazon URL (format: https://www.amazon.com/dp/ASIN or /gp/product/ASIN)
      const asinMatch = product.asinLink.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
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