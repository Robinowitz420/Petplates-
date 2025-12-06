// scripts/add-all-vetted-products.ts
// Add all 128 ingredients from comprehensive sourcing guide

import fs from 'fs';
import path from 'path';

// All 128 ingredients with their vetted product data
const ALL_VETTED_PRODUCTS: Record<string, {
  productName: string;
  amazonLink: string;
  vetNote: string;
  category: 'Meat' | 'Supplement' | 'Carb' | 'Vegetable' | 'Oil' | 'Seed' | 'Fruit' | 'Insect' | 'Hay' | 'Pellet';
}> = {
  // === ORGANS & MEATS (15) ===
  'duck hearts': {
    productName: 'Vital Essentials Freeze Dried Duck Hearts',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Vital Essentials freeze dried duck hearts') + '&tag=robinfrench-20',
    vetNote: 'Vital Essentials or Raw Paws Pet Food. Freeze-dried for convenience and safety.',
    category: 'Meat'
  },
  'lamb liver': {
    productName: 'Stella & Chewy\'s Freeze Dried Lamb Liver',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('freeze dried lamb liver Stella & Chewy\'s') + '&tag=robinfrench-20',
    vetNote: 'Northwest Naturals or Stella & Chewy\'s. Freeze-dried organ meat.',
    category: 'Meat'
  },
  'duck liver': {
    productName: 'Vital Essentials Freeze Dried Duck Liver',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('freeze dried duck liver Vital Essentials') + '&tag=robinfrench-20',
    vetNote: 'Vital Essentials freeze-dried duck liver treat.',
    category: 'Meat'
  },
  'chicken necks': {
    productName: 'Raw Paws Pet Food Raw Chicken Necks',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Raw Paws Pet Food raw chicken necks') + '&tag=robinfrench-20',
    vetNote: 'Raw Paws Pet Food or My Pet Carnivore. Raw chicken necks for dental health.',
    category: 'Meat'
  },
  'turkey thighs': {
    productName: 'Boneless Skinless Turkey Thighs',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('boneless skinless turkey thighs') + '&tag=robinfrench-20',
    vetNote: 'Human-grade source from butcher or grocery store.',
    category: 'Meat'
  },
  'ground duck': {
    productName: 'Raw Paws Pet Food Raw Ground Duck',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('raw ground duck pet food') + '&tag=robinfrench-20',
    vetNote: 'Raw Paws Pet Food or Darwins Pet Food. Frozen/raw ground duck.',
    category: 'Meat'
  },
  'ground lamb (lean)': {
    productName: 'Lean Ground Lamb Meat',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('lean ground lamb meat') + '&tag=robinfrench-20',
    vetNote: 'Human-grade lean ground lamb from quality source.',
    category: 'Meat'
  },
  'ground herring': {
    productName: 'K9 Natural Hoki Fish Blend',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('K9 Natural Hoki fish blend') + '&tag=robinfrench-20',
    vetNote: 'K9 Natural hoki/fish blend for pets.',
    category: 'Meat'
  },
  'ground mackerel': {
    productName: 'Northwest Naturals Raw Fish Blend',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Northwest Naturals raw fish blend') + '&tag=robinfrench-20',
    vetNote: 'Northwest Naturals raw fish blend.',
    category: 'Meat'
  },
  'mackerel (canned)': {
    productName: 'Wild Planet Canned Mackerel',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Wild Planet canned mackerel no salt') + '&tag=robinfrench-20',
    vetNote: 'Wild Planet or Safe Catch. Canned in water, no salt added.',
    category: 'Meat'
  },
  'herring (canned)': {
    productName: 'Crown Prince Canned Herring',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('canned herring no salt in water Crown Prince') + '&tag=robinfrench-20',
    vetNote: 'Crown Prince or Season. Canned in water, no salt added.',
    category: 'Meat'
  },
  'chicken sausage (no additives)': {
    productName: 'Applegate Naturals Chicken Sausage',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Applegate Naturals chicken sausage no nitrates') + '&tag=robinfrench-20',
    vetNote: 'Niman Ranch or Applegate. Read labels carefully for nitrates/sugar.',
    category: 'Meat'
  },
  'turkey sausage (no additives)': {
    productName: 'Applegate Naturals Turkey Sausage',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Applegate turkey sausage no sugar no nitrates') + '&tag=robinfrench-20',
    vetNote: 'Applegate Naturals. Read labels carefully.',
    category: 'Meat'
  },
  'ground pork (lean, small amounts)': {
    productName: 'Lean Ground Pork',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('lean ground pork for human consumption') + '&tag=robinfrench-20',
    vetNote: 'Human-grade lean ground pork.',
    category: 'Meat'
  },
  'regular potato': {
    productName: 'Fresh Russet Potatoes',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh russet potatoes') + '&tag=robinfrench-20',
    vetNote: 'Human-grade standard russet potato.',
    category: 'Vegetable'
  },

  // === OILS & FATS (18) ===
  'walnut oil': {
    productName: 'La Tourangelle Walnut Oil',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('La Tourangelle walnut oil cold pressed') + '&tag=robinfrench-20',
    vetNote: 'La Tourangelle or NOW Foods. Cold-pressed, human-grade.',
    category: 'Oil'
  },
  'black currant oil': {
    productName: 'NOW Foods Black Currant Seed Oil',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('black currant seed oil NOW Foods') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods or Life-Flo. Capsules often best.',
    category: 'Oil'
  },
  'almond oil': {
    productName: 'Viva Naturals Sweet Almond Oil',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Viva Naturals sweet almond oil cold pressed edible') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods or Viva Naturals. Cold-pressed, edible grade.',
    category: 'Oil'
  },
  'sunflower oil': {
    productName: 'High Oleic Sunflower Oil Cold Pressed',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('high oleic sunflower oil cold pressed') + '&tag=robinfrench-20',
    vetNote: 'Goya or BetterBody Foods. High oleic, cold-pressed.',
    category: 'Oil'
  },
  'chia seed oil': {
    productName: 'Healthworks Organic Chia Seed Oil',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('organic chia seed oil Healthworks') + '&tag=robinfrench-20',
    vetNote: 'Healthworks or Organic Veda. Cold-pressed.',
    category: 'Oil'
  },
  'herring oil': {
    productName: 'Nordic Naturals Pet Herring Oil',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Nordic Naturals pet herring oil') + '&tag=robinfrench-20',
    vetNote: 'Nordic Naturals Pet or Grizzly Pet Products.',
    category: 'Oil'
  },
  'anchovy oil': {
    productName: 'Carlson Labs Fish Oil Anchovy',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Carlson Labs fish oil anchovy') + '&tag=robinfrench-20',
    vetNote: 'Nordic Naturals Pet or Carlson Labs.',
    category: 'Oil'
  },
  'evening primrose oil': {
    productName: 'Nature\'s Way Evening Primrose Oil',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('evening primrose oil supplement Nature\'s Way') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods or Nature\'s Way. Capsules often best.',
    category: 'Oil'
  },
  'mackerel oil': {
    productName: 'Jarrow Formulas Fish Oil Supplement',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Jarrow Formulas fish oil supplement') + '&tag=robinfrench-20',
    vetNote: 'Nordic Naturals Pet or Jarrow Formulas.',
    category: 'Oil'
  },
  'sardine oil': {
    productName: 'Zesty Paws Sardine Oil for Dogs',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Zesty Paws sardine oil for dogs') + '&tag=robinfrench-20',
    vetNote: 'Zesty Paws or Grizzly Salmon Oil.',
    category: 'Oil'
  },
  'borage oil': {
    productName: 'NOW Foods Borage Oil Softgels',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('borage oil softgels NOW Foods') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods or Barleans. Cold-pressed.',
    category: 'Oil'
  },
  'sesame oil': {
    productName: 'Spectrum Cold Pressed Sesame Oil',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('cold pressed sesame oil Spectrum') + '&tag=robinfrench-20',
    vetNote: 'Chosen Foods or Spectrum. Toasted or un-toasted.',
    category: 'Oil'
  },
  'avocado oil': {
    productName: 'Chosen Foods Pure Avocado Oil',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Chosen Foods avocado oil pure') + '&tag=robinfrench-20',
    vetNote: 'Chosen Foods or La Tourangelle. Pure avocado oil.',
    category: 'Oil'
  },
  'avocado oil (tiny amounts)': {
    productName: 'Chosen Foods Pure Avocado Oil',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Chosen Foods avocado oil pure') + '&tag=robinfrench-20',
    vetNote: 'Chosen Foods or La Tourangelle. Pure avocado oil.',
    category: 'Oil'
  },
  'wheat germ oil': {
    productName: 'NOW Foods Wheat Germ Oil Liquid',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('wheat germ oil liquid NOW Foods edible') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods or Solgar. High potency liquid.',
    category: 'Oil'
  },
  'krill oil': {
    productName: 'Kori Krill Oil Pure Supplement',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Kori Krill Oil pure supplement') + '&tag=robinfrench-20',
    vetNote: 'Viva Labs or Kori Krill Oil. Pure krill oil supplement.',
    category: 'Oil'
  },
  'algae oil (dha)': {
    productName: 'Nordic Naturals Algae Omega DHA',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Nordic Naturals Algae Omega DHA') + '&tag=robinfrench-20',
    vetNote: 'Nordic Naturals Algae Omega or Ovega-3. Vegan DHA.',
    category: 'Oil'
  },
  'omega-3 oil': {
    productName: 'Grizzly Salmon Oil for Pets',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Grizzly Salmon Oil for pets') + '&tag=robinfrench-20',
    vetNote: 'Grizzly Salmon Oil or Nordic Naturals Pet.',
    category: 'Oil'
  },

  // === SUPPLEMENTS & POWDERS (8) ===
  'kelp powder': {
    productName: 'NOW Foods Organic Kelp Powder',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('NOW Foods organic kelp powder') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods or Starwest Botanicals. Organic kelp powder.',
    category: 'Supplement'
  },
  'joint health powder': {
    productName: 'Nutramax Dasuquin Joint Health Powder',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Dasuquin joint health powder for pets') + '&tag=robinfrench-20',
    vetNote: 'Nutramax Dasuquin or VetriScience Glycoflex.',
    category: 'Supplement'
  },
  'amino acid supplement': {
    productName: 'Purina Pro Plan Amino Acid Supplement',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Purina Pro Plan amino acid supplement') + '&tag=robinfrench-20',
    vetNote: 'Purina Pro Plan Veterinary Diets amino acid supplement.',
    category: 'Supplement'
  },
  'calcium supplement': {
    productName: 'Thomas Labs Calcium Carbonate Powder',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('calcium carbonate powder unflavored Thomas Labs') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods Calcium Carbonate or Thomas Labs Calciboost.',
    category: 'Supplement'
  },
  'spirulina powder': {
    productName: 'Vimergy Organic Spirulina Powder',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('organic spirulina powder Vimergy high purity') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods or Vimergy. Organic, high purity.',
    category: 'Supplement'
  },
  'electrolyte powder': {
    productName: 'ReptoBoost Electrolyte Powder',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('ReptoBoost electrolyte powder for reptiles') + '&tag=robinfrench-20',
    vetNote: 'ReptoBoost or Pedialyte. Unflavored, read labels.',
    category: 'Supplement'
  },
  'vitamin d3 drops': {
    productName: 'Ddrops Liquid Vitamin D3 Drops',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Vitamin D3 drops 1000 IU Ddrops') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods or Ddrops. 1000 IU per drop.',
    category: 'Supplement'
  },
  'brewer\'s yeast': {
    productName: 'Bob\'s Red Mill Brewer\'s Yeast Flakes',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('brewer\'s yeast flakes unfortified Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'NOW Foods or Bob\'s Red Mill. Nutritional or brewer\'s yeast.',
    category: 'Supplement'
  },

  // === GRAINS & SEEDS (20) ===
  'buckwheat': {
    productName: 'Bob\'s Red Mill Raw Hulled Buckwheat Groats',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Bob\'s Red Mill raw hulled buckwheat groats') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Raw hulled buckwheat groats.',
    category: 'Carb'
  },
  'buckwheat (tiny amounts)': {
    productName: 'Bob\'s Red Mill Raw Hulled Buckwheat Groats',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Bob\'s Red Mill raw hulled buckwheat groats') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Raw hulled buckwheat groats.',
    category: 'Carb'
  },
  'buckwheat (hulled)': {
    productName: 'Anthony\'s Goods Hulled Buckwheat Groats',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('hulled buckwheat groats Anthony\'s Goods') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Hulled buckwheat groats.',
    category: 'Carb'
  },
  'sorghum': {
    productName: 'Bob\'s Red Mill Whole Grain Sorghum',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('whole grain sorghum Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Shiloh Farms. Whole grain sorghum.',
    category: 'Carb'
  },
  'barley': {
    productName: 'Bob\'s Red Mill Hulled Barley Grain',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Bob\'s Red Mill hulled barley grain') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill hulled barley grain.',
    category: 'Carb'
  },
  'barley (cooked, minimal)': {
    productName: 'Bob\'s Red Mill Hulled Barley Grain',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Bob\'s Red Mill hulled barley grain') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill hulled barley grain.',
    category: 'Carb'
  },
  'barley (hulled)': {
    productName: 'Bob\'s Red Mill Hulled Barley Grain',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Bob\'s Red Mill hulled barley grain') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill hulled barley grain.',
    category: 'Carb'
  },
  'millet': {
    productName: 'Bob\'s Red Mill Whole Grain Millet',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('whole grain millet Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Organic Grains. Whole grain millet.',
    category: 'Carb'
  },
  'millet (tiny amounts)': {
    productName: 'Bob\'s Red Mill Whole Grain Millet',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('whole grain millet Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Organic Grains. Whole grain millet.',
    category: 'Carb'
  },
  'farro': {
    productName: 'Bob\'s Red Mill Farro Grain',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Bob\'s Red Mill farro grain') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Thrive Market. Farro grain.',
    category: 'Carb'
  },
  'bulgur': {
    productName: 'Bob\'s Red Mill Fine Bulgur Wheat',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fine bulgur wheat Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Ziyad. Fine bulgur wheat.',
    category: 'Carb'
  },
  'amaranth (tiny amounts)': {
    productName: 'Bob\'s Red Mill Whole Grain Amaranth Seed',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('whole grain amaranth seed Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Whole grain amaranth seed.',
    category: 'Carb'
  },
  'amaranth seeds': {
    productName: 'Bob\'s Red Mill Whole Grain Amaranth Seed',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('whole grain amaranth seed Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Anthony\'s Goods. Whole grain amaranth seed.',
    category: 'Seed'
  },
  'teff seeds': {
    productName: 'Bob\'s Red Mill Whole Grain Teff Seeds',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Bob\'s Red Mill whole grain teff seeds') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill whole grain teff seeds.',
    category: 'Seed'
  },
  'wheat (hulled)': {
    productName: 'Bob\'s Red Mill Whole Hulled Wheat Berries',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('whole hulled wheat berries Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or SpeltLife. Whole hulled wheat berries.',
    category: 'Carb'
  },
  'oat bran (small amounts)': {
    productName: 'Bob\'s Red Mill Pure Oat Bran Cereal',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('pure oat bran cereal Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Quaker. Pure oat bran cereal.',
    category: 'Carb'
  },
  'oatmeal (cooked, small amounts)': {
    productName: 'Quaker Rolled Oats Old Fashioned',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Quaker rolled oats old fashioned') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Quaker. Rolled oats old fashioned.',
    category: 'Carb'
  },
  'corn (cracked)': {
    productName: 'Scratch and Peck Cracked Corn Non-GMO',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Scratch and Peck cracked corn non-gmo') + '&tag=robinfrench-20',
    vetNote: 'Scratch and Peck Feeds or Purina. Cracked corn non-GMO.',
    category: 'Carb'
  },
  'safflower seeds': {
    productName: 'Wagner\'s Pure Safflower Seed Bird Food',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('pure safflower seed bird food Wagner\'s') + '&tag=robinfrench-20',
    vetNote: 'Wagner\'s or Kaytee. Pure safflower seed bird food.',
    category: 'Seed'
  },
  'nyjer seeds': {
    productName: 'Wagner\'s Nyjer Seed Bird Food',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('nyjer seed bird food Kaytee') + '&tag=robinfrench-20',
    vetNote: 'Wagner\'s or Kaytee. Nyjer seed bird food.',
    category: 'Seed'
  },

  // === VEGETABLES & GREENS (25) ===
  'bok choi': {
    productName: 'Fresh Baby Bok Choy',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh baby bok choy') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'bok choy (small amounts)': {
    productName: 'Fresh Baby Bok Choy',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh baby bok choy') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'navy beans (mashed)': {
    productName: 'Goya Canned Navy Beans Low Sodium',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('canned navy beans low sodium Goya') + '&tag=robinfrench-20',
    vetNote: 'Goya or Bush\'s. Canned navy beans, low sodium, rinse well.',
    category: 'Vegetable'
  },
  'kidney beans (mashed)': {
    productName: 'Goya Canned Dark Red Kidney Beans Low Sodium',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('canned dark red kidney beans low sodium') + '&tag=robinfrench-20',
    vetNote: 'Goya or Bush\'s. Canned dark red kidney beans, low sodium, rinse well.',
    category: 'Vegetable'
  },
  'kidney beans (mashed, tiny amounts)': {
    productName: 'Goya Canned Dark Red Kidney Beans Low Sodium',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('canned dark red kidney beans low sodium') + '&tag=robinfrench-20',
    vetNote: 'Goya or Bush\'s. Canned dark red kidney beans, low sodium, rinse well.',
    category: 'Vegetable'
  },
  'pinto beans (mashed)': {
    productName: 'Bush\'s Canned Pinto Beans Low Sodium',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('canned pinto beans low sodium Bush\'s') + '&tag=robinfrench-20',
    vetNote: 'Goya or Bush\'s. Canned pinto beans, low sodium, rinse well.',
    category: 'Vegetable'
  },
  'purslane': {
    productName: 'Fresh Purslane Leaves',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh purslane leaves') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'purslane (small amounts)': {
    productName: 'Fresh Purslane Leaves',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh purslane leaves') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'miner\'s lettuce': {
    productName: 'Miner\'s Lettuce Seeds for Planting',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('miner\'s lettuce seeds for planting') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce or seeds for growing.',
    category: 'Vegetable'
  },
  'flaxseed (ground)': {
    productName: 'Bob\'s Red Mill Organic Ground Flaxseed Meal',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('organic ground flaxseed meal Bob\'s Red Mill') + '&tag=robinfrench-20',
    vetNote: 'Bob\'s Red Mill or Spectrum. Organic ground flaxseed meal.',
    category: 'Seed'
  },
  'fennel': {
    productName: 'Fresh Fennel Bulb',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh fennel bulb') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'delicata squash': {
    productName: 'Fresh Delicata Squash',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh delicata squash') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'yellow squash': {
    productName: 'Fresh Yellow Summer Squash',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh yellow summer squash') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'leeks': {
    productName: 'Fresh Leeks',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh leeks') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'shallots': {
    productName: 'Fresh Shallots',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh shallots') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'tomatoes (small amounts)': {
    productName: 'Fresh Ripe Vine Tomatoes',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh ripe vine tomatoes') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'napa cabbage': {
    productName: 'Fresh Napa Cabbage',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh napa cabbage') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'napa cabbage (small amounts)': {
    productName: 'Fresh Napa Cabbage',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh napa cabbage') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'artichokes': {
    productName: 'Fresh Artichoke Hearts',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh artichoke hearts') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'frisee': {
    productName: 'Fresh Frisee Lettuce',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh frisee lettuce') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'radicchio': {
    productName: 'Fresh Radicchio Lettuce',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh radicchio lettuce') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'red cabbage': {
    productName: 'Fresh Red Cabbage Head',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh red cabbage head') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'green cabbage': {
    productName: 'Fresh Green Cabbage Head',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh green cabbage head') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'swiss chard': {
    productName: 'Fresh Swiss Chard',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh swiss chard') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'swiss chard (cooked, tiny amounts)': {
    productName: 'Fresh Swiss Chard',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh swiss chard') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'lettuce (romaine, small amounts)': {
    productName: 'Fresh Romaine Lettuce Hearts',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh romaine lettuce hearts') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'red leaf lettuce': {
    productName: 'Fresh Red Leaf Lettuce',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh red leaf lettuce') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'mache': {
    productName: 'Fresh Mache Lamb\'s Lettuce',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh mache lamb\'s lettuce') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'alfalfa sprouts (small amounts)': {
    productName: 'Fresh Alfalfa Sprouts',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh alfalfa sprouts') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'cat grass (wheatgrass)': {
    productName: 'SmartyKat Cat Grass Growing Kit Wheatgrass',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Cat Grass growing kit wheatgrass SmartyKat') + '&tag=robinfrench-20',
    vetNote: 'SmartyKat or Catit. Cat Grass growing kit wheatgrass.',
    category: 'Vegetable'
  },
  'squash (cooked)': {
    productName: 'Fresh Butternut Squash',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh butternut squash') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },
  'lamb\'s quarters': {
    productName: 'Lamb\'s Quarters Seeds',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('lamb\'s quarters seeds') + '&tag=robinfrench-20',
    vetNote: 'Wild harvested or seeds for growing.',
    category: 'Vegetable'
  },
  'amaranth leaves': {
    productName: 'Fresh Amaranth Leaves',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh amaranth leaves') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },

  // === HERBS & SPICES (6) ===
  'ginger (small amounts)': {
    productName: 'Simply Organic Fresh Ginger Root',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('organic ginger root fresh') + '&tag=robinfrench-20',
    vetNote: 'McCormick or Simply Organic. Organic ginger root fresh.',
    category: 'Vegetable'
  },
  'turmeric': {
    productName: 'Simply Organic Pure Turmeric Powder',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Simply Organic pure turmeric powder') + '&tag=robinfrench-20',
    vetNote: 'Simply Organic or Tummydrops. Pure turmeric powder.',
    category: 'Supplement'
  },
  'rosemary': {
    productName: 'Frontier Co-op Dried Organic Rosemary',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Frontier Co-op dried organic rosemary') + '&tag=robinfrench-20',
    vetNote: 'Simply Organic or Frontier Co-op. Dried organic rosemary.',
    category: 'Vegetable'
  },
  'sage': {
    productName: 'Simply Organic Dried Sage Leaf',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Simply Organic dried sage leaf') + '&tag=robinfrench-20',
    vetNote: 'Simply Organic or Frontier Co-op. Dried sage leaf.',
    category: 'Vegetable'
  },
  'mint': {
    productName: 'Fresh Mint Leaves',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh mint leaves') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce or Mountain Rose Herbs. Fresh mint leaves.',
    category: 'Vegetable'
  },
  'garlic chives': {
    productName: 'Fresh Garlic Chives',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh garlic chives') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Vegetable'
  },

  // === FRUITS (9) ===
  'raisins (unsweetened)': {
    productName: 'Sun-Maid Organic Raisins Unsweetened',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('organic raisins unsweetened no oil Sun-Maid') + '&tag=robinfrench-20',
    vetNote: 'Sun-Maid or Trader Joe\'s. Organic raisins unsweetened no oil.',
    category: 'Fruit'
  },
  'plums (pitted)': {
    productName: 'Fresh Plums Pitted',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh plums pitted') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit'
  },
  'apricots (pitted)': {
    productName: 'NOW Foods Dried Apricots Unsulphured',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('dried apricots unsulphured no sugar NOW Foods') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce or NOW Foods. Dried apricots unsulphured no sugar.',
    category: 'Fruit'
  },
  'kiwi': {
    productName: 'Fresh Kiwi Fruit',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh kiwi fruit') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit'
  },
  'mulberries': {
    productName: 'Terrasoul Dried Mulberries Organic',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Terrasoul dried mulberries organic') + '&tag=robinfrench-20',
    vetNote: 'Navitas Organics or Terrasoul Superfoods. Dried mulberries organic.',
    category: 'Fruit'
  },
  'raspberries': {
    productName: 'Fresh Raspberries Organic',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh raspberries organic') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit'
  },
  'cranberries': {
    productName: 'NOW Foods Dried Cranberries Unsweetened',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('NOW Foods dried cranberries unsweetened') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce or NOW Foods. Dried cranberries unsweetened.',
    category: 'Fruit'
  },
  'pineapple (small amounts)': {
    productName: 'Fresh Pineapple Fruit',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh pineapple fruit') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit'
  },
  'pears (no seeds)': {
    productName: 'Fresh Pears No Seeds',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('fresh pears no seeds') + '&tag=robinfrench-20',
    vetNote: 'Fresh produce from grocery store or farmers market.',
    category: 'Fruit'
  },

  // === INSECTS (for reptiles/birds) (7) ===
  'pinhead crickets': {
    productName: 'Josh\'s Frogs Live Pinhead Crickets',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Josh\'s Frogs live pinhead crickets') + '&tag=robinfrench-20',
    vetNote: 'Josh\'s Frogs or Fluker\'s. Live pinhead crickets.',
    category: 'Insect'
  },
  'locusts': {
    productName: 'Exo Terra Canned Locusts Reptile Food',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Exo Terra canned locusts reptile food') + '&tag=robinfrench-20',
    vetNote: 'Rainbow Mealworms or Exo Terra. Canned locusts reptile food.',
    category: 'Insect'
  },
  'butterworms': {
    productName: 'Rainbow Mealworms Live Butterworms',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Rainbow Mealworms live butterworms') + '&tag=robinfrench-20',
    vetNote: 'Josh\'s Frogs or Rainbow Mealworms. Live butterworms.',
    category: 'Insect'
  },
  'grasshoppers': {
    productName: 'Fluker\'s Dried Grasshoppers Reptile Food',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Fluker\'s dried grasshoppers reptile food') + '&tag=robinfrench-20',
    vetNote: 'Fluker\'s or Exo Terra. Dried grasshoppers reptile food.',
    category: 'Insect'
  },
  'small dubia roaches': {
    productName: 'Small Live Dubia Roaches Feeder',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('small live dubia roaches feeder') + '&tag=robinfrench-20',
    vetNote: 'DubiaRoaches.com or Josh\'s Frogs. Small live dubia roaches feeder.',
    category: 'Insect'
  },
  'silkworms': {
    productName: 'Live Silkworms Reptile Food',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('live silkworms reptile food') + '&tag=robinfrench-20',
    vetNote: 'Coastal Silkworms or SilkwormShop. Live silkworms reptile food.',
    category: 'Insect'
  },
  'earthworms': {
    productName: 'Uncle Jim\'s Live Earthworms',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Uncle Jim\'s live earthworms') + '&tag=robinfrench-20',
    vetNote: 'Uncle Jim\'s Worm Farm. Live earthworms.',
    category: 'Insect'
  },

  // === HAY & PELLETS (for pocket pets) (12) ===
  'wheat hay': {
    productName: 'Oxbow Wheat Hay Small Animal',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Oxbow wheat hay small animal') + '&tag=robinfrench-20',
    vetNote: 'Oxbow Animal Health or Small Pet Select. Wheat hay small animal.',
    category: 'Hay'
  },
  'fescue hay': {
    productName: 'Small Pet Select Fescue Hay',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Small Pet Select fescue hay') + '&tag=robinfrench-20',
    vetNote: 'Small Pet Select fescue hay.',
    category: 'Hay'
  },
  'oat hay': {
    productName: 'Oxbow Oat Hay Small Animal',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Oxbow oat hay small animal') + '&tag=robinfrench-20',
    vetNote: 'Oxbow Animal Health or Small Pet Select. Oat hay small animal.',
    category: 'Hay'
  },
  'bluegrass hay': {
    productName: 'Small Pet Select Bluegrass Hay',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Small Pet Select bluegrass hay') + '&tag=robinfrench-20',
    vetNote: 'Small Pet Select bluegrass hay.',
    category: 'Hay'
  },
  'straw (wheat/pine)': {
    productName: 'Oxbow Wheat Straw Bedding',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Oxbow wheat straw bedding') + '&tag=robinfrench-20',
    vetNote: 'Kaytee or Oxbow. Wheat straw bedding.',
    category: 'Hay'
  },
  'dried grass': {
    productName: 'Kaytee Dried Natural Grass Small Animal',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('dried natural grass small animal Kaytee') + '&tag=robinfrench-20',
    vetNote: 'Kaytee or Timothy Grass. Dried natural grass small animal.',
    category: 'Hay'
  },
  'bermuda hay': {
    productName: 'Standlee Premium Bermuda Hay',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Standlee premium bermuda hay') + '&tag=robinfrench-20',
    vetNote: 'Oxbow Animal Health or Standlee Hay. Premium bermuda hay.',
    category: 'Hay'
  },
  'barley hay': {
    productName: 'Standlee Barley Hay',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Standlee barley hay') + '&tag=robinfrench-20',
    vetNote: 'Small Pet Select or Standlee Hay. Barley hay.',
    category: 'Hay'
  },
  'guinea pig pellets (with vitamin c)': {
    productName: 'Oxbow Essentials Cavy Cuisine Guinea Pig Pellets',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Oxbow guinea pig pellets vitamin c') + '&tag=robinfrench-20',
    vetNote: 'Oxbow Essentials Cavy Cuisine or Sherwood. Guinea pig pellets with vitamin C.',
    category: 'Pellet'
  },
  'rabbit pellets (high fiber)': {
    productName: 'Oxbow Essentials Rabbit Food High Fiber',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Oxbow adult rabbit pellets high fiber') + '&tag=robinfrench-20',
    vetNote: 'Oxbow Essentials Rabbit Food. Adult rabbit pellets high fiber.',
    category: 'Pellet'
  },
  'hamster pellets (higher protein)': {
    productName: 'Oxbow Essentials Hamster Food Higher Protein',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Oxbow hamster food higher protein') + '&tag=robinfrench-20',
    vetNote: 'Higgins Sunburst or Oxbow Essentials. Hamster food higher protein.',
    category: 'Pellet'
  },
  'wild bird mix': {
    productName: 'Lyric Wild Bird Mix No Filler',
    amazonLink: 'https://www.amazon.com/s?k=' + encodeURIComponent('Lyric wild bird mix no filler') + '&tag=robinfrench-20',
    vetNote: 'Lyric or Kaytee. Wild bird mix no filler.',
    category: 'Pellet'
  }
};

async function main() {
  console.log('📦 Adding all 128 vetted products to vetted-products.ts...\n');
  
  const vettedProductsPath = path.join(__dirname, '../lib/data/vetted-products.ts');
  const existingContent = fs.readFileSync(vettedProductsPath, 'utf-8');
  
  // Create backup
  fs.writeFileSync(vettedProductsPath + '.backup', existingContent);
  console.log('✅ Backup created: vetted-products.ts.backup\n');
  
  // Find where to insert (before the closing brace of VETTED_PRODUCTS object)
  // Look for the pattern: '  },\n};' followed by a blank line and then function or comment
  const vetProductsStart = existingContent.indexOf('export const VETTED_PRODUCTS');
  if (vetProductsStart === -1) {
    console.error('❌ Could not find VETTED_PRODUCTS declaration');
    process.exit(1);
  }
  
  // Find the closing }; of VETTED_PRODUCTS (should be after the last entry)
  // Look for }; that appears after VETTED_PRODUCTS and before any function definitions
  const afterVetProducts = existingContent.substring(vetProductsStart);
  const functionMatch = afterVetProducts.match(/\n\s*\/\*\*|\n\s*function|\n\s*export\s+function/);
  
  if (!functionMatch) {
    console.error('❌ Could not find function after VETTED_PRODUCTS');
    process.exit(1);
  }
  
  // Find the }; before the function
  const beforeFunction = afterVetProducts.substring(0, functionMatch.index);
  const lastBraceIndex = beforeFunction.lastIndexOf('};');
  
  if (lastBraceIndex === -1) {
    console.error('❌ Could not find closing brace of VETTED_PRODUCTS');
    process.exit(1);
  }
  
  const insertPosition = vetProductsStart + lastBraceIndex;
  
  // Generate new entries
  let newEntries = '\n  // === COMPREHENSIVE VETTED PRODUCTS (128 ingredients from sourcing guide) ===\n';
  
  Object.entries(ALL_VETTED_PRODUCTS).forEach(([key, product]) => {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, ' ').trim().replace(/'/g, "\\'");
    newEntries += `  '${normalizedKey}': {\n`;
    newEntries += `    productName: '${product.productName.replace(/'/g, "\\'")}',\n`;
    // Escape single quotes in the URL string
    // Properly escape the URL - replace any unescaped apostrophes with %27
    let escapedUrl = product.amazonLink;
    // If URL contains unescaped apostrophes in the query string, encode them
    if (escapedUrl.includes("'")) {
      // Replace apostrophes in the query string part with %27
      escapedUrl = escapedUrl.replace(/'/g, "%27");
    }
    newEntries += `    amazonLink: '${escapedUrl}',\n`;
    newEntries += `    vetNote: '${product.vetNote.replace(/'/g, "\\'")}',\n`;
    newEntries += `    category: '${product.category}',\n`;
    newEntries += `    commissionRate: 0.03\n`;
    newEntries += `  },\n`;
  });
  
  // Insert new entries before closing brace
  const updatedContent = 
    existingContent.slice(0, insertPosition) + 
    newEntries + 
    existingContent.slice(insertPosition);
  
  // Write updated file
  fs.writeFileSync(vettedProductsPath, updatedContent);
  
  console.log(`✅ Successfully added ${Object.keys(ALL_VETTED_PRODUCTS).length} vetted products!`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Review lib/data/vetted-products.ts`);
  console.log(`   2. Run: npm run vet:recipes`);
  console.log(`   3. Review recipes-complete.vetted.ts`);
}

main().catch(console.error);

