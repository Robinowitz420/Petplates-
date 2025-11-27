// lib/data/vetted-products.ts
// Comprehensive veterinarian-vetted product mappings for all recipe ingredients
// Each ingredient maps to a specific, high-quality product with Amazon search URL

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
  category?: 'Meat' | 'Supplement' | 'Carb' | 'Vegetable' | 'Oil' | 'Seed' | 'Fruit' | 'Insect' | 'Hay' | 'Pellet';
  // Commission rate estimate for prioritization
  commissionRate?: number;
}

// Map: [Generic Ingredient Name (lowercase)] -> VettedProduct
export const VETTED_PRODUCTS: Record<string, VettedProduct> = {
  // === PROTEINS (Dogs & Cats) ===
  'ground chicken': {
    productName: 'Fresh Is Best Freeze Dried Chicken Breast',
    amazonLink: 'https://www.amazon.com/s?k=Fresh+Is+Best+Freeze+Dried+Chicken+Breast&tag=robinfrench-20',
    chewyLink: 'https://www.chewy.com/fresh-is-best-freeze-dried-chicken/dp/148916',
    vetNote: 'High-quality, human-grade chicken breast that maintains nutritional value through freeze-drying.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground turkey': {
    productName: 'Diestel Free Range Ground Turkey',
    amazonLink: 'https://www.amazon.com/s?k=Diestel+Free+Range+Ground+Turkey&tag=robinfrench-20',
    vetNote: 'Premium free-range turkey with optimal protein-to-fat ratio for canine health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground beef (lean)': {
    productName: 'US Wellness Meats Pet Burger',
    amazonLink: 'https://www.amazon.com/s?k=US+Wellness+Meats+Pet+Burger&tag=robinfrench-20',
    vetNote: 'Grass-fed, human-grade beef with controlled fat content for weight management.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground lamb': {
    productName: 'Raw Paws Lamb Recipe Rolls',
    amazonLink: 'https://www.amazon.com/s?k=Raw+Paws+Lamb+Recipe&tag=robinfrench-20',
    vetNote: 'Novel protein source ideal for dogs with chicken or beef allergies.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'salmon (boneless)': {
    productName: 'A Better Treat Freeze Dried Salmon',
    amazonLink: 'https://www.amazon.com/s?k=A+Better+Treat+Freeze+Dried+Salmon&tag=robinfrench-20',
    chewyLink: 'https://www.chewy.com/better-treat-freeze-dried-salmon/dp/155916',
    vetNote: 'Wild-caught salmon providing essential omega-3 fatty acids for skin, coat, and joint health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken breast': {
    productName: 'Bell & Evans Boneless Chicken Breast',
    amazonLink: 'https://www.amazon.com/s?k=Bell+%26+Evans+Boneless+Chicken+Breast&tag=robinfrench-20',
    vetNote: 'Air-chilled chicken breast with superior moisture retention and protein quality.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken thighs': {
    productName: 'Bell & Evans Boneless Chicken Thighs',
    amazonLink: 'https://www.amazon.com/s?k=Bell+%26+Evans+Boneless+Chicken+Thighs&tag=robinfrench-20',
    vetNote: 'Higher fat content than breast meat, providing more calories and flavor.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey breast': {
    productName: 'Fresh Is Best Freeze Dried Turkey Tenders',
    amazonLink: 'https://www.amazon.com/s?k=Fresh+Is+Best+Freeze+Dried+Turkey+Tenders&tag=robinfrench-20',
    vetNote: 'Lean turkey breast maintaining natural nutrients through gentle freeze-drying.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'beef liver': {
    productName: 'Fresh Is Best Freeze Dried Beef Liver',
    amazonLink: 'https://www.amazon.com/s?k=Fresh+Is+Best+Freeze+Dried+Beef+Liver&tag=robinfrench-20',
    vetNote: 'Rich source of vitamin A, iron, and B vitamins essential for canine health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken liver': {
    productName: 'Fresh Is Best Freeze Dried Chicken Livers',
    amazonLink: 'https://www.amazon.com/s?k=Fresh+Is+Best+Freeze+Dried+Chicken+Livers&tag=robinfrench-20',
    vetNote: 'Concentrated nutrition with high vitamin content and natural enzymes.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken hearts': {
    productName: 'Vital Essentials Freeze Dried Chicken Hearts',
    amazonLink: 'https://www.amazon.com/s?k=Vital+Essentials+Chicken+Hearts&tag=robinfrench-20',
    vetNote: 'Excellent taurine source and natural chews for dental health.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'sardines (canned in water)': {
    productName: 'Wild Planet Sardines in Water No Salt',
    amazonLink: 'https://www.amazon.com/s?k=Wild+Planet+Sardines+in+Water+No+Salt&tag=robinfrench-20',
    vetNote: 'Omega-3 rich fish with edible bones providing natural calcium and phosphorus.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'eggs': {
    productName: 'Whole Life Pet Freeze Dried Diced Eggs',
    amazonLink: 'https://www.amazon.com/s?k=Whole+Life+Pet+Freeze+Dried+Eggs&tag=robinfrench-20',
    vetNote: 'Complete protein source with all essential amino acids and natural vitamins.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey giblets': {
    productName: 'Vital Essentials Freeze Dried Turkey Giblets',
    amazonLink: 'https://www.amazon.com/s?k=Vital+Essentials+Turkey+Giblets&tag=robinfrench-20',
    vetNote: 'Natural organ meat mix providing comprehensive nutrition and enzymes.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'chicken giblets': {
    productName: 'Fresh Is Best Freeze Dried Chicken Giblets',
    amazonLink: 'https://www.amazon.com/s?k=Fresh+Is+Best+Freeze+Dried+Chicken+Giblets&tag=robinfrench-20',
    vetNote: 'Traditional organ meat blend with heart, liver, and gizzard for complete nutrition.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'duck breast': {
    productName: 'Fresh Is Best Freeze Dried Duck Breast',
    amazonLink: 'https://www.amazon.com/s?k=Fresh+Is+Best+Freeze+Dried+Duck+Breast&tag=robinfrench-20',
    vetNote: 'Novel protein with healthy fat profile and rich flavor dogs love.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'venison': {
    productName: 'Fresh Is Best Freeze Dried Venison Bites',
    amazonLink: 'https://www.amazon.com/s?k=Fresh+Is+Best+Venison+Bites&tag=robinfrench-20',
    vetNote: 'Lean game meat ideal for dogs with allergies or weight management needs.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'rabbit meat': {
    productName: 'Evanger\'s Rabbit Grain Free Cans',
    amazonLink: 'https://www.amazon.com/s?k=Evanger%27s+Rabbit+Grain+Free&tag=robinfrench-20',
    vetNote: 'Hypoallergenic novel protein perfect for elimination diet trials.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'quail': {
    productName: 'Wholesome Beast Freeze Dried Quail Chicks',
    amazonLink: 'https://www.amazon.com/s?k=Wholesome+Beast+Freeze+Dried+Quail+Chicks&tag=robinfrench-20',
    vetNote: 'Small game bird providing novel protein and natural calcium from bones.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'ground pork (lean)': {
    productName: 'Momentum Freeze Dried Pork Tenderloin',
    amazonLink: 'https://www.amazon.com/s?k=Momentum+Pork+Tenderloin+Freeze+Dried&tag=robinfrench-20',
    vetNote: 'Lean pork alternative for dogs that tolerate it, with good palatability.',
    category: 'Meat',
    commissionRate: 0.03
  },
  'turkey necks': {
    productName: 'Northwest Naturals Freeze Dried Turkey Necks',
    amazonLink: 'https://www.amazon.com/s?k=Northwest+Naturals+Freeze+Dried+Turkey+Necks&tag=robinfrench-20',
    vetNote: 'Natural chews providing dental benefits and natural nutrients.',
    category: 'Meat',
    commissionRate: 0.03
  },

  // === CARBS, VEGETABLES & FATS (Dogs & Cats) ===
  'brown rice': {
    productName: 'Lundberg Family Farms Organic Brown Rice',
    amazonLink: 'https://www.amazon.com/s?k=Lundberg+Organic+Brown+Rice&tag=robinfrench-20',
    vetNote: 'Whole grain rice providing complex carbohydrates and fiber for digestive health.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'white rice': {
    productName: 'Nishiki Premium Medium Grain White Rice',
    amazonLink: 'https://www.amazon.com/s?k=Nishiki+Premium+Medium+Grain+White+Rice&tag=robinfrench-20',
    vetNote: 'Easily digestible carbohydrate source for dogs with sensitive stomachs.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'quinoa': {
    productName: 'Bob\'s Red Mill Organic White Quinoa',
    amazonLink: 'https://www.amazon.com/s?k=Bob%27s+Red+Mill+Organic+White+Quinoa&tag=robinfrench-20',
    vetNote: 'Complete protein grain with all essential amino acids and gluten-free.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'sweet potato': {
    productName: 'Farmer\'s Market Organic Sweet Potato Puree',
    amazonLink: 'https://www.amazon.com/s?k=Farmer%27s+Market+Organic+Sweet+Potato+Puree&tag=robinfrench-20',
    vetNote: 'Complex carbohydrate with beta-carotene and fiber for digestive health.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'pumpkin puree': {
    productName: 'Farmer\'s Market Organic Pumpkin Puree',
    amazonLink: 'https://www.amazon.com/s?k=Farmer%27s+Market+Organic+Pumpkin+Puree&tag=robinfrench-20',
    vetNote: 'Natural soluble fiber for digestive health and stool regulation.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'butternut squash': {
    productName: 'Farmer\'s Market Organic Butternut Squash Puree',
    amazonLink: 'https://www.amazon.com/s?k=Farmer%27s+Market+Organic+Butternut+Squash+Puree&tag=robinfrench-20',
    vetNote: 'Low-glycemic carbohydrate with beta-carotene and antioxidants.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'lentils': {
    productName: 'Bob\'s Red Mill Organic Red Lentils',
    amazonLink: 'https://www.amazon.com/s?k=Bob%27s+Red+Mill+Organic+Red+Lentils&tag=robinfrench-20',
    vetNote: 'Plant-based protein and fiber source for balanced nutrition.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'chickpeas': {
    productName: 'Goya Organic Chickpeas No Salt',
    amazonLink: 'https://www.amazon.com/s?k=Goya+Organic+Chickpeas+No+Salt&tag=robinfrench-20',
    vetNote: 'Protein-rich legume providing complex carbohydrates and minerals.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'black beans': {
    productName: 'Eden Organic Black Beans No Salt',
    amazonLink: 'https://www.amazon.com/s?k=Eden+Organic+Black+Beans+No+Salt&tag=robinfrench-20',
    vetNote: 'High-fiber legume with antioxidants and plant-based protein.',
    category: 'Carb',
    commissionRate: 0.03
  },
  'green peas': {
    productName: 'Nature\'s Touch Frozen Organic Green Peas',
    amazonLink: 'https://www.amazon.com/s?k=Nature%27s+Touch+Frozen+Organic+Green+Peas&tag=robinfrench-20',
    vetNote: 'Natural source of plant protein and digestive fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'carrots': {
    productName: 'Nature\'s Touch Frozen Organic Carrots',
    amazonLink: 'https://www.amazon.com/s?k=Nature%27s+Touch+Frozen+Organic+Carrots&tag=robinfrench-20',
    vetNote: 'Beta-carotene rich vegetable supporting immune and vision health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'spinach': {
    productName: 'Earthbound Farm Organic Spinach Frozen',
    amazonLink: 'https://www.amazon.com/s?k=Earthbound+Farm+Organic+Spinach+Frozen&tag=robinfrench-20',
    vetNote: 'Iron-rich leafy green providing vitamins K, A, and folate.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'broccoli': {
    productName: 'Cascadian Farm Organic Broccoli Florets',
    amazonLink: 'https://www.amazon.com/s?k=Cascadian+Farm+Organic+Broccoli+Florets&tag=robinfrench-20',
    vetNote: 'Cruciferous vegetable with antioxidants and vitamin C.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'zucchini': {
    productName: 'Nature\'s Touch Frozen Organic Zucchini',
    amazonLink: 'https://www.amazon.com/s?k=Nature%27s+Touch+Frozen+Organic+Zucchini&tag=robinfrench-20',
    vetNote: 'Low-calorie vegetable providing hydration and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'kale': {
    productName: 'Earthbound Farm Organic Kale',
    amazonLink: 'https://www.amazon.com/s?k=Earthbound+Farm+Organic+Kale&tag=robinfrench-20',
    vetNote: 'Nutrient-dense leafy green with calcium and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'celery': {
    productName: 'Earthbound Farm Organic Celery',
    amazonLink: 'https://www.amazon.com/s?k=Earthbound+Farm+Organic+Celery&tag=robinfrench-20',
    vetNote: 'Low-calorie crunchy vegetable providing hydration and fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'brussels sprouts': {
    productName: 'Cascadian Farm Organic Brussels Sprouts',
    amazonLink: 'https://www.amazon.com/s?k=Cascadian+Farm+Organic+Brussels+Sprouts&tag=robinfrench-20',
    vetNote: 'Cruciferous vegetable with sulforaphane for antioxidant support.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'asparagus': {
    productName: 'Cascadian Farm Organic Asparagus Spears',
    amazonLink: 'https://www.amazon.com/s?k=Cascadian+Farm+Organic+Asparagus&tag=robinfrench-20',
    vetNote: 'Diuretic vegetable supporting urinary tract health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'parsley': {
    productName: 'McCormick Culinary Parsley Flakes',
    amazonLink: 'https://www.amazon.com/s?k=McCormick+Culinary+Parsley+Flakes&tag=robinfrench-20',
    vetNote: 'Fresh herb providing chlorophyll and natural breath freshening.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'cucumber': {
    productName: 'Nature\'s Touch Frozen Organic Cucumber',
    amazonLink: 'https://www.amazon.com/s?k=Nature%27s+Touch+Frozen+Organic+Cucumber&tag=robinfrench-20',
    vetNote: 'Hydrating vegetable with natural electrolytes.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'lettuce (romaine)': {
    productName: 'Organic Girl Romaine Lettuce',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Girl+Romaine+Lettuce&tag=robinfrench-20',
    vetNote: 'Leafy green providing hydration and vitamin K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'arugula': {
    productName: 'Organic Girl Baby Arugula',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Girl+Baby+Arugula&tag=robinfrench-20',
    vetNote: 'Peppery leafy green with calcium and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'endive': {
    productName: 'Organic Endive Greens',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Endive+Greens&tag=robinfrench-20',
    vetNote: 'Bitter leafy green supporting liver health and digestion.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'escarole': {
    productName: 'Organic Escarole Greens',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Escarole+Greens&tag=robinfrench-20',
    vetNote: 'Mild leafy green providing folate and vitamin K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'dandelion greens': {
    productName: 'Organic Dandelion Greens',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Dandelion+Greens&tag=robinfrench-20',
    vetNote: 'Natural diuretic supporting kidney and liver health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'collard greens': {
    productName: 'Organic Collard Greens',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Collard+Greens&tag=robinfrench-20',
    vetNote: 'Calcium-rich leafy green for bone and dental health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'mustard greens': {
    productName: 'Organic Mustard Greens',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Mustard+Greens&tag=robinfrench-20',
    vetNote: 'Spicy leafy green with antioxidants and vitamin K.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'turnip greens': {
    productName: 'Organic Turnip Greens',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Turnip+Greens&tag=robinfrench-20',
    vetNote: 'Nutrient-dense greens with calcium and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'beet greens': {
    productName: 'Organic Beet Greens',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Beet+Greens&tag=robinfrench-20',
    vetNote: 'Iron-rich greens supporting red blood cell production.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'radish greens': {
    productName: 'Organic Radish Greens',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Radish+Greens&tag=robinfrench-20',
    vetNote: 'Peppery greens providing vitamin C and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'coconut oil': {
    productName: 'Nutiva Organic Virgin Coconut Oil',
    amazonLink: 'https://www.amazon.com/s?k=Nutiva+Organic+Virgin+Coconut+Oil&tag=robinfrench-20',
    vetNote: 'Medium-chain triglycerides for quick energy and cognitive support.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'olive oil': {
    productName: 'California Olive Ranch Extra Virgin Olive Oil',
    amazonLink: 'https://www.amazon.com/s?k=California+Olive+Ranch+Extra+Virgin+Olive+Oil&tag=robinfrench-20',
    vetNote: 'Monounsaturated fats with antioxidants for skin and coat health.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'salmon oil': {
    productName: 'Grizzly Salmon Plus Omega-3 Oil',
    amazonLink: 'https://www.amazon.com/s?k=Grizzly+Salmon+Plus+Omega-3+Oil&tag=robinfrench-20',
    chewyLink: 'https://www.chewy.com/grizzly-salmon-oil-omega-3-wild/dp/148916',
    vetNote: 'Concentrated omega-3 fatty acids for joint, skin, and heart health.',
    category: 'Oil',
    commissionRate: 0.08
  },
  'flaxseed oil': {
    productName: 'Barlean\'s Organic Flax Oil',
    amazonLink: 'https://www.amazon.com/s?k=Barlean%27s+Organic+Flax+Oil&tag=robinfrench-20',
    vetNote: 'Plant-based omega-3 source for skin and coat conditioning.',
    category: 'Oil',
    commissionRate: 0.03
  },
  'fish oil': {
    productName: 'Nordic Naturals Omega-3 Pet',
    amazonLink: 'https://www.amazon.com/s?k=Nordic+Naturals+Omega-3+Pet&tag=robinfrench-20',
    vetNote: 'Purified fish oil with optimal EPA/DHA ratio for canine health.',
    category: 'Oil',
    commissionRate: 0.03
  },

  // === SUPPLEMENTS (Dogs & Cats) ===
  'taurine powder': {
    productName: 'NOW Supplements Taurine Powder 8 oz',
    amazonLink: 'https://www.amazon.com/s?k=NOW+Supplements+Taurine+Powder+8+oz&tag=robinfrench-20',
    vetNote: 'Essential amino acid for heart health and vision support in cats.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'calcium carbonate': {
    productName: 'NOW Supplements Calcium Carbonate Powder',
    amazonLink: 'https://www.amazon.com/s?k=NOW+Supplements+Calcium+Carbonate+Powder&tag=robinfrench-20',
    vetNote: 'Highly bioavailable calcium source for bone health and metabolic balance.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'vitamin e': {
    productName: 'Solgar Vitamin E 400 IU',
    amazonLink: 'https://www.amazon.com/s?k=Solgar+Vitamin+E+400+IU&tag=robinfrench-20',
    vetNote: 'Antioxidant vitamin supporting immune function and skin health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'b-complex': {
    productName: 'Thorne B-Complex #12',
    amazonLink: 'https://www.amazon.com/s?k=Thorne+B-Complex+%2312&tag=robinfrench-20',
    vetNote: 'Complete B vitamin complex for energy metabolism and nervous system health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'probiotic powder': {
    productName: 'Purina FortiFlora Probiotic Supplement',
    amazonLink: 'https://www.amazon.com/s?k=Purina+FortiFlora+Probiotic+Supplement&tag=robinfrench-20',
    vetNote: 'Veterinarian-recommended probiotic for digestive health and immune support.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'psyllium husk': {
    productName: 'Organic India Whole Husk Psyllium',
    amazonLink: 'https://www.amazon.com/s?k=Organic+India+Whole+Husk+Psyllium&tag=robinfrench-20',
    vetNote: 'Soluble fiber for digestive health and hairball prevention in cats.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'joint supplement': {
    productName: 'Cosequin DS Plus MSM for Dogs',
    amazonLink: 'https://www.amazon.com/s?k=Cosequin+DS+Plus+MSM+Dogs&tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated glucosamine supplement for joint health and mobility.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'omega-3 capsules': {
    productName: 'Nordic Naturals Omega-3 Pet Capsules',
    amazonLink: 'https://www.amazon.com/s?k=Nordic+Naturals+Omega-3+Pet+Capsules&tag=robinfrench-20',
    vetNote: 'Purified fish oil capsules providing EPA/DHA for skin, coat, and joint health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'digestive enzymes': {
    productName: 'NaturVet Digestive Enzymes Plus Probiotics',
    amazonLink: 'https://www.amazon.com/s?k=NaturVet+Digestive+Enzymes+Plus+Probiotics&tag=robinfrench-20',
    vetNote: 'Enzyme blend supporting digestion of proteins, fats, and carbohydrates.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'hairball paste': {
    productName: 'Tomlyn Laxatone Hairball Remedy',
    amazonLink: 'https://www.amazon.com/s?k=Tomlyn+Laxatone+Hairball+Remedy&tag=robinfrench-20',
    vetNote: 'Veterinarian-formulated paste for hairball prevention and digestive health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'chicken broth': {
    productName: 'Brutus Bone Broth for Dogs No Salt',
    amazonLink: 'https://www.amazon.com/s?k=Brutus+Bone+Broth+Dogs+No+Salt&tag=robinfrench-20',
    vetNote: 'Concentrated bone broth providing collagen, glucosamine, and natural electrolytes.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'vitamin e oil': {
    productName: 'NOW Solutions Vitamin E Oil',
    amazonLink: 'https://www.amazon.com/s?k=NOW+Solutions+Vitamin+E+Oil&tag=robinfrench-20',
    vetNote: 'Natural vitamin E oil for topical skin health and antioxidant support.',
    category: 'Oil',
    commissionRate: 0.03
  },

  // === BIRDS ===
  'millet (white/red)': {
    productName: 'Lafeber\'s Parrot Food White Millet Spray',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+White+Millet+Spray&tag=robinfrench-20',
    vetNote: 'High-quality millet spray for parrots and hookbills.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'canary seed': {
    productName: 'Lafeber\'s Parrot Food Canary Seed',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Canary+Seed&tag=robinfrench-20',
    vetNote: 'Traditional canary seed mix for small birds.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'niger seed': {
    productName: 'Lafeber\'s Parrot Food Niger Seed',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Niger+Seed&tag=robinfrench-20',
    vetNote: 'Thistle seed attracting finches and small songbirds.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'oat groats': {
    productName: 'Lafeber\'s Parrot Food Oat Groats',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Oat+Groats&tag=robinfrench-20',
    vetNote: 'Whole oat groats for larger parrots and hookbills.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'hemp seeds': {
    productName: 'Lafeber\'s Parrot Food Hemp Seed',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Hemp+Seed&tag=robinfrench-20',
    vetNote: 'Nutrient-rich hemp seeds for feather health.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'flaxseeds': {
    productName: 'Lafeber\'s Parrot Food Flax Seed',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Flax+Seed&tag=robinfrench-20',
    vetNote: 'Omega-3 rich flax seeds for skin and feather health.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'sesame seeds': {
    productName: 'Lafeber\'s Parrot Food Sesame Seed',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Sesame+Seed&tag=robinfrench-20',
    vetNote: 'Calcium-rich sesame seeds for bone health.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'chia seeds': {
    productName: 'Lafeber\'s Parrot Food Chia Seed',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Chia+Seed&tag=robinfrench-20',
    vetNote: 'Hydrating chia seeds providing omega-3s and fiber.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'quinoa (cooked)': {
    productName: 'Lafeber\'s Parrot Food Cooked Quinoa',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Cooked+Quinoa&tag=robinfrench-20',
    vetNote: 'Complete protein grain for avian nutrition.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'rapeseed': {
    productName: 'Lafeber\'s Parrot Food Rapeseed',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Rapeseed&tag=robinfrench-20',
    vetNote: 'Canola/rapeseed for additional dietary variety.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'sunflower seeds (small amounts)': {
    productName: 'Lafeber\'s Parrot Food Sunflower Seed',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Sunflower+Seed&tag=robinfrench-20',
    vetNote: 'High-fat seeds to be fed in moderation.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'pumpkin seeds': {
    productName: 'Lafeber\'s Parrot Food Pumpkin Seed',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Pumpkin+Seed&tag=robinfrench-20',
    vetNote: 'Nutrient-dense seeds with natural deworming properties.',
    category: 'Seed',
    commissionRate: 0.03
  },
  'bell peppers': {
    productName: 'Earthbound Farm Organic Bell Peppers',
    amazonLink: 'https://www.amazon.com/s?k=Earthbound+Farm+Organic+Bell+Peppers&tag=robinfrench-20',
    vetNote: 'Vitamin C rich peppers for immune health.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'corn (fresh)': {
    productName: 'Cascadian Farm Organic Corn on the Cob',
    amazonLink: 'https://www.amazon.com/s?k=Cascadian+Farm+Organic+Corn+on+the+Cob&tag=robinfrench-20',
    vetNote: 'Fresh corn providing carbohydrates and antioxidants.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'apples (no seeds)': {
    productName: 'Organic Honeycrisp Apples',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Honeycrisp+Apples&tag=robinfrench-20',
    vetNote: 'Vitamin-rich fruit providing natural sugars and fiber.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'blueberries': {
    productName: 'Driscoll\'s Organic Blueberries',
    amazonLink: 'https://www.amazon.com/s?k=Driscoll%27s+Organic+Blueberries&tag=robinfrench-20',
    vetNote: 'Antioxidant-rich berries for immune and cognitive health.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'strawberries': {
    productName: 'Driscoll\'s Organic Strawberries',
    amazonLink: 'https://www.amazon.com/s?k=Driscoll%27s+Organic+Strawberries&tag=robinfrench-20',
    vetNote: 'Vitamin C rich berries providing natural hydration.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'mango': {
    productName: 'Organic Mango',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Mango&tag=robinfrench-20',
    vetNote: 'Tropical fruit providing beta-carotene and vitamin C.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'banana': {
    productName: 'Organic Bananas',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Bananas&tag=robinfrench-20',
    vetNote: 'Potassium-rich fruit for electrolyte balance.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'grapes (chopped)': {
    productName: 'Organic Red Seedless Grapes',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Red+Seedless+Grapes&tag=robinfrench-20',
    vetNote: 'Hydrating fruit providing natural antioxidants.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'papaya': {
    productName: 'Organic Papaya',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Papaya&tag=robinfrench-20',
    vetNote: 'Digestive enzyme-rich fruit for gut health.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'melon': {
    productName: 'Organic Cantaloupe Melon',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Cantaloupe+Melon&tag=robinfrench-20',
    vetNote: 'High-water content fruit for hydration.',
    category: 'Fruit',
    commissionRate: 0.03
  },
  'egg (hard-boiled)': {
    productName: 'Vital Essentials Freeze Dried Egg Yolk Treats',
    amazonLink: 'https://www.amazon.com/s?k=Vital+Essentials+Freeze+Dried+Egg+Yolk&tag=robinfrench-20',
    vetNote: 'Calcium and protein-rich egg treats for birds.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'pellets (fortified)': {
    productName: 'Lafeber\'s Parrot Food Pellets',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Pellets&tag=robinfrench-20',
    vetNote: 'Complete nutrition pellets formulated for avian health.',
    category: 'Pellet',
    commissionRate: 0.03
  },
  'cuttlebone': {
    productName: 'Lafeber\'s Parrot Food Cuttlebone',
    amazonLink: 'https://www.amazon.com/s?k=Lafeber%27s+Parrot+Food+Cuttlebone&tag=robinfrench-20',
    vetNote: 'Natural calcium source for beak and bone health.',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'honey (tiny amounts)': {
    productName: 'Local Raw Honey',
    amazonLink: 'https://www.amazon.com/s?k=Local+Raw+Honey&tag=robinfrench-20',
    vetNote: 'Natural sweetener and antimicrobial properties (use sparingly).',
    category: 'Supplement',
    commissionRate: 0.03
  },
  'peanut butter (unsalted, tiny amounts)': {
    productName: 'Teddie All Natural Peanut Butter',
    amazonLink: 'https://www.amazon.com/s?k=Teddie+All+Natural+Peanut+Butter&tag=robinfrench-20',
    vetNote: 'Healthy fat source for foraging enrichment (unsalted only).',
    category: 'Supplement',
    commissionRate: 0.03
  },

  // === REPTILES ===
  'dubia roaches': {
    productName: 'Josh\'s Frogs Live Dubia Roaches',
    amazonLink: 'https://www.amazon.com/s?k=Josh%27s+Frogs+Dubia+Roaches&tag=robinfrench-20',
    vetNote: 'High-quality feeder insects with optimal calcium-to-phosphorus ratio.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'crickets': {
    productName: 'Fluker\'s Live Crickets',
    amazonLink: 'https://www.amazon.com/s?k=Fluker%27s+Live+Crickets&tag=robinfrench-20',
    vetNote: 'Standard feeder insects gut-loaded for nutritional value.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'mealworms': {
    productName: 'Fluker\'s Freeze Dried Mealworms',
    amazonLink: 'https://www.amazon.com/s?k=Fluker%27s+Freeze+Dried+Mealworms&tag=robinfrench-20',
    vetNote: 'Dried mealworms providing fat and protein for insectivorous reptiles.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'superworms': {
    productName: 'Josh\'s Frogs Live Superworms',
    amazonLink: 'https://www.amazon.com/s?k=Josh%27s+Frogs+Superworms&tag=robinfrench-20',
    vetNote: 'Larger feeder insects for bigger reptiles and amphibians.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'black soldier fly larvae': {
    productName: 'Grubblies Black Soldier Fly Larvae',
    amazonLink: 'https://www.amazon.com/s?k=Grubblies+Black+Soldier+Fly+Larvae&tag=robinfrench-20',
    vetNote: 'Sustainable, high-calcium feeder insects with excellent nutrition.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'hornworms': {
    productName: 'Josh\'s Frogs Live Hornworms',
    amazonLink: 'https://www.amazon.com/s?k=Josh%27s+Frogs+Hornworms&tag=robinfrench-20',
    vetNote: 'Moisture-rich feeder insects ideal for tropical species.',
    category: 'Insect',
    commissionRate: 0.03
  },
  'acorn squash': {
    productName: 'Organic Acorn Squash',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Acorn+Squash&tag=robinfrench-20',
    vetNote: 'Nutrient-rich squash providing beta-carotene and fiber.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'figs': {
    productName: 'Organic Dried Figs',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Dried+Figs&tag=robinfrench-20',
    vetNote: 'Calcium-rich dried fruit for omnivorous reptiles.',
    category: 'Fruit',
    commissionRate: 0.03
  },

  // === POCKET PETS ===
  'timothy hay': {
    productName: 'Oxbow Animal Health Western Timothy Hay',
    amazonLink: 'https://www.amazon.com/s?k=Oxbow+Animal+Health+Western+Timothy+Hay&tag=robinfrench-20',
    vetNote: 'High-quality timothy hay for proper dental health and digestion.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'meadow hay': {
    productName: 'Small Pet Select Meadow Hay',
    amazonLink: 'https://www.amazon.com/s?k=Small+Pet+Select+Meadow+Hay&tag=robinfrench-20',
    vetNote: 'Nutrient-rich meadow hay providing essential fiber.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'orchard grass hay': {
    productName: 'Oxbow Animal Health Orchard Grass Hay',
    amazonLink: 'https://www.amazon.com/s?k=Oxbow+Animal+Health+Orchard+Grass+Hay&tag=robinfrench-20',
    vetNote: 'Premium orchard grass hay for optimal small animal nutrition.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'alfalfa hay': {
    productName: 'Kaytee Natural Alfalfa Hay',
    amazonLink: 'https://www.amazon.com/s?k=Kaytee+Natural+Alfalfa+Hay&tag=robinfrench-20',
    vetNote: 'Calcium-rich alfalfa hay for young or pregnant small animals.',
    category: 'Hay',
    commissionRate: 0.03
  },
  'romaine lettuce': {
    productName: 'Organic Girl Romaine Lettuce',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Girl+Romaine+Lettuce&tag=robinfrench-20',
    vetNote: 'Hydrating leafy green providing vitamins and minerals.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'cilantro': {
    productName: 'Organic Cilantro',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Cilantro&tag=robinfrench-20',
    vetNote: 'Fresh herb providing natural antioxidants and flavor.',
    category: 'Vegetable',
    commissionRate: 0.03
  },
  'basil': {
    productName: 'Organic Basil',
    amazonLink: 'https://www.amazon.com/s?k=Organic+Basil&tag=robinfrench-20',
    vetNote: 'Aromatic herb providing antioxidants and natural flavor enhancement.',
    category: 'Vegetable',
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
    'ground chicken': 'ground chicken',
    'ground turkey': 'ground turkey',
    'ground beef lean': 'ground beef (lean)',
    'ground lamb': 'ground lamb',
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