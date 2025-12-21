import { IngredientOption, ModifierRule, Species } from '@/lib/types';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

export const ingredientAlternatives: Record<string, string[]> = {
  chicken: ['turkey', 'duck', 'rabbit'],
  beef: ['venison', 'bison', 'lamb'],
  wheat: ['oats', 'quinoa', 'buckwheat'],
  rice: ['sweet potato', 'pumpkin', 'butternut squash'],
  dairy: ['goat milk kefir', 'bone broth'],
  salmon: ['sardine', 'mackerel', 'anchovy'],
};

export const healthConcernGuidelines: Record<
  string,
  {
    focus: string;
    avoid?: string[];
    preferredIngredients?: string[];
    supplementIdeas?: string[];
  }
> = {
  allergies: {
    focus: 'Novel proteins + anti-inflammatory omegas',
    avoid: ['chicken', 'beef', 'wheat'],
    preferredIngredients: ['duck', 'rabbit', 'pumpkin'],
    supplementIdeas: ['fish oil', 'quercetin'],
  },
  'weight-management': {
    focus: 'Lower calorie density, higher fiber for satiety',
    avoid: ['rendered fats', 'simple carbs'],
    preferredIngredients: ['green beans', 'lean turkey', 'cauliflower rice'],
    supplementIdeas: ['L-carnitine'],
  },
  'joint-health': {
    focus: 'Anti-inflammatory fats + joint supplements',
    preferredIngredients: ['wild salmon', 'turmeric', 'bone broth'],
    supplementIdeas: ['glucosamine', 'fish oil'],
  },
  digestive: {
    focus: 'Gentle proteins + prebiotic fiber + probiotics',
    avoid: ['dairy', 'fried fats', 'spices'],
    preferredIngredients: ['pumpkin', 'bone broth', 'cooked rice'],
    supplementIdeas: ['probiotics'],
  },
  kidney: {
    focus: 'Controlled phosphorus, moderate protein, high moisture',
    avoid: ['organ meats high in phosphorus'],
    preferredIngredients: ['white fish', 'egg whites', 'low-sodium broth'],
    supplementIdeas: ['omega-3 fish oil'],
  },
  'urinary-health': {
    focus: 'Moisture + urinary acidifiers',
    preferredIngredients: ['bone broth', 'cranberry', 'DL-methionine'],
  },
  diabetes: {
    focus: 'High protein, very low carbs, consistent calories',
    avoid: ['high-sugar', 'simple-carbs', 'corn-syrup', 'white-rice'],
    preferredIngredients: ['lean-protein', 'complex-carbs', 'high-fiber-vegetables'],
    supplementIdeas: ['chromium', 'alpha-lipoic-acid'],
  },
  hyperthyroidism: {
    focus: 'Controlled iodine + higher calories to offset metabolism',
  },
  pancreatitis: {
    focus: 'Ultra low fat, easily digestible proteins, MCT support',
    avoid: ['high-fat', 'pork', 'lamb', 'duck', 'fried', 'greasy', 'fatty-cuts'],
    preferredIngredients: ['lean-turkey', 'white-fish', 'chicken-breast', 'pumpkin'],
    supplementIdeas: ['digestive-enzymes', 'probiotics'],
  },
  'heart-disease': {
    focus: 'Low sodium, taurine-rich, omega-3 support, controlled calories',
    avoid: ['high-sodium', 'processed', 'excessive-fat'],
    preferredIngredients: ['lean-protein', 'omega-3-rich-fish', 'taurine-sources'],
    supplementIdeas: ['taurine', 'omega-3', 'coenzyme-q10'],
  },
  'heart disease': {
    focus: 'Low sodium, taurine-rich, omega-3 support, controlled calories',
    avoid: ['high-sodium', 'processed', 'excessive-fat'],
    preferredIngredients: ['lean-protein', 'omega-3-rich-fish', 'taurine-sources'],
    supplementIdeas: ['taurine', 'omega-3', 'coenzyme-q10'],
  },
  'skin-conditions': {
    focus: 'Omega-3 rich, quality protein, vitamin E, anti-inflammatory',
    avoid: ['artificial-colors', 'preservatives', 'low-quality-protein'],
    preferredIngredients: ['salmon', 'sardines', 'sweet-potato', 'pumpkin'],
    supplementIdeas: ['omega-3', 'vitamin-e', 'zinc', 'biotin'],
  },
  'skin conditions': {
    focus: 'Omega-3 rich, quality protein, vitamin E, anti-inflammatory',
    avoid: ['artificial-colors', 'preservatives', 'low-quality-protein'],
    preferredIngredients: ['salmon', 'sardines', 'sweet-potato', 'pumpkin'],
    supplementIdeas: ['omega-3', 'vitamin-e', 'zinc', 'biotin'],
  },
  hairball: {
    focus: 'Insoluble & soluble fiber blend + omega oils',
  },
};

export const breedPredispositions: Record<
  string,
  {
    concerns: string[];
    notes: string;
  }
> = {
  labrador: {
    concerns: ['weight-management', 'joint-health'],
    notes: 'Prone to obesity and hip dysplasia; monitor calories and joints.',
  },
  'german-shepherd': {
    concerns: ['joint-health', 'digestive'],
    notes: 'Hip issues and sensitive gut benefit from joint + probiotic support.',
  },
  'golden-retriever': {
    concerns: ['joint-health', 'allergies'],
    notes: 'Seasonal allergies and hips respond to omega-3s.',
  },
  beagle: {
    concerns: ['weight-management'],
    notes: 'Small frame with big appetite – portion discipline is critical.',
  },
  mainecoon: {
    concerns: ['joint-health', 'heart'],
    notes: 'Large frame cats need taurine and joint support.',
  },
  siamese: {
    concerns: ['hyperthyroidism'],
    notes: 'Breed predisposition for thyroid imbalance.',
  },
  persian: {
    concerns: ['hairball', 'urinary-health'],
    notes: 'Long coats and kidney sensitivities.',
  },
};

export const healthConcernCalorieAdjustments: Record<string, number> = {
  'weight-management': -20,
  obesity: -20,
  allergies: 0,
  'joint-health': -5,
  digestive: -5,
  kidney: -10,
  'urinary-health': -5,
  diabetes: -15,
  hyperthyroidism: +10,
  pancreatitis: -15,
  hairball: 0,
};

const addIngredient = (
  options: IngredientOption[],
  weightKg: number
): IngredientOption[] =>
  options.map((opt) => {
    if (!opt.amountPer10kg) {
      return opt;
    }
    const numeric = parseFloat(opt.amountPer10kg);
    if (Number.isNaN(numeric)) {
      return { ...opt, amount: opt.amountPer10kg };
    }
    const amountValue = ((weightKg / 10) * numeric).toFixed(0);
    const unit = opt.amountPer10kg.replace(/[0-9.]/g, '').trim() || 'g';
    return {
      ...opt,
      amount: `${amountValue}${unit}`,
    };
  });

export const modifierRules: ModifierRule[] = [
  {
    id: 'mod-allergies-01',
    appliesTo: {
      species: ['dogs'],
      healthConcerns: ['allergies'],
    },
    ingredientChanges: {
      remove: ['chicken', 'beef', 'wheat'],
      substitute: [
        { from: 'chicken', to: 'turkey breast' },
        { from: 'beef', to: 'venison' },
      ],
      add: [
        {
          name: 'Pumpkin Puree',
          amountPer10kg: '50g',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=organic+pumpkin+puree+dog'),
          notes: 'Adds fiber & beta carotene for gut healing.',
        },
        {
          name: 'Fish Oil Supplement',
          amountPer10kg: '250mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=dog+fish+oil'),
          notes: 'Provides EPA/DHA for anti-inflammatory support.',
        },
      ],
    },
    nutritionalTargets: {
      fatMax: 15,
    },
    rationale:
      'Removes common allergens and boosts anti-inflammatory omega-3 intake.',
    ruleWeight: 12,
  },
  {
    id: 'mod-weight-01',
    appliesTo: {
      species: ['dogs'],
      healthConcerns: ['weight-management', 'obesity'],
    },
    ingredientChanges: {
      add: [
        {
          name: 'Green Bean Fiber Boost',
          amountPer10kg: '80g',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=freeze+dried+green+beans+dog'),
          notes: 'Adds bulk without calories.',
        },
      ],
      substitute: [{ from: 'white rice', to: 'steamed cauliflower rice' }],
    },
    nutritionalTargets: {
      fatMax: 12,
      caloriesAdjust: -20,
    },
    rationale:
      'Increases fiber and swaps starches to support caloric deficit safely.',
    ruleWeight: 15,
  },
  {
    id: 'mod-joints-01',
    appliesTo: {
      species: ['dogs'],
      healthConcerns: ['joint-health', 'arthritis'],
      ageGroups: ['senior'],
    },
    ingredientChanges: {
      add: [
        {
          name: 'Fish Oil Supplement',
          amountPer10kg: '250mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=fish+oil+for+dogs'),
          notes: 'EPA/DHA for inflammation control.',
        },
        {
          name: 'Golden Paste (Turmeric + Black Pepper)',
          amountPer10kg: '10g',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=turmeric+paste+dog'),
          notes: 'Natural COX-2 inhibitor to ease joint pain.',
        },
      ],
    },
    nutritionalTargets: {
      fatMax: 15,
    },
    rationale: 'Supports anti-inflammatory pathways in senior joints.',
    ruleWeight: 14,
  },
  {
    id: 'mod-digest-01',
    appliesTo: {
      species: ['dogs'],
      healthConcerns: ['digestive'],
    },
    ingredientChanges: {
      remove: ['dairy'],
      add: [
        {
          name: 'Bone Broth',
          amountPer10kg: '120ml',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=dog+bone+broth'),
          notes: 'Adds collagen + hydration for gut lining.',
        },
        {
          name: 'Probiotic Powder',
          amountPer10kg: '1g',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=dog+probiotic+powder'),
          notes: 'Rebalances microbiome after GI upset.',
        },
      ],
    },
    nutritionalTargets: {
      fatMax: 14,
    },
    rationale:
      'Removes irritants, increases moisture, and replenishes beneficial bacteria.',
    ruleWeight: 11,
  },
  {
    id: 'mod-kidney-01',
    appliesTo: {
      species: ['dogs'],
      healthConcerns: ['kidney'],
    },
    ingredientChanges: {
      remove: ['organ meat'],
      substitute: [{ from: 'bone meal', to: 'egg shell powder' }],
      add: [
        {
          name: 'Low-Sodium Bone Broth',
          amountPer10kg: '150ml',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=low+sodium+bone+broth+dog'),
          notes: 'Boosts hydration without excess sodium.',
        },
        {
          name: 'Omega-3 Fish Oil',
          amountPer10kg: '200mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=renal+support+fish+oil+dog'),
          notes: 'Slows kidney inflammation.',
        },
      ],
    },
    nutritionalTargets: {
      proteinMin: 18,
      phosphorusMax: 0.6,
      fatMax: 14,
    },
    rationale: 'Controls phosphorus and supports renal hydration.',
    ruleWeight: 16,
  },
  {
    id: 'mod-urinary-01',
    appliesTo: {
      species: ['cats'],
      healthConcerns: ['urinary-health'],
    },
    ingredientChanges: {
      add: [
        {
          name: 'Unsalted Bone Broth',
          amountPer10kg: '120ml',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=unsalted+bone+broth+cat'),
          notes: 'Raises moisture intake to dilute urine.',
        },
        {
          name: 'Cranberry Powder',
          amountPer10kg: '500mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=cranberry+cat+urinary'),
          notes: 'Helps acidify urine to reduce crystals.',
        },
      ],
    },
    nutritionalTargets: {
      phosphorusMax: 0.7,
    },
    rationale:
      'Increases moisture and adds mild acidifiers for urinary tract protection.',
    ruleWeight: 15,
  },
  {
    id: 'mod-diabetes-01',
    appliesTo: {
      species: ['cats'],
      healthConcerns: ['diabetes'],
    },
    ingredientChanges: {
      remove: ['white rice', 'peas'],
      substitute: [{ from: 'sweet potato', to: 'steamed zucchini' }],
      add: [
        {
          name: 'Chromium + Cinnamon Blend',
          amountPer10kg: '250mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=chromium+cinnamon+blend+cat'),
          notes: 'Helps insulin sensitivity (vet-approved doses).',
        },
      ],
    },
    nutritionalTargets: {
      proteinMin: 40,
      fatMax: 18,
      caloriesAdjust: -10,
    },
    rationale: 'Cuts starches and supports glycemic control.',
    ruleWeight: 16,
  },
  {
    id: 'mod-hyperthyroid-01',
    appliesTo: {
      species: ['cats'],
      healthConcerns: ['hyperthyroidism'],
    },
    ingredientChanges: {
      add: [
        {
          name: 'L-Carnitine Supplement',
          amountPer10kg: '200mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=l-carnitine+for+cats'),
          notes: 'Supports muscle mass during hypermetabolic states.',
        },
      ],
      substitute: [{ from: 'kelp', to: 'dulse (low iodine)' }],
    },
    nutritionalTargets: {
      proteinMin: 42,
      caloriesAdjust: +10,
    },
    rationale:
      'Maintains lean mass and avoids iodine spikes that can worsen thyroid storms.',
    ruleWeight: 12,
  },
  {
    id: 'mod-pancreatitis-01',
    appliesTo: {
      species: ['cats'],
      healthConcerns: ['pancreatitis'],
    },
    ingredientChanges: {
      remove: ['salmon skin', 'added oils'],
      add: [
        {
          name: 'Skinless White Fish',
          amountPer10kg: '120g',
          notes: 'Ultra-lean protein swap to rest pancreas.',
        },
        {
          name: 'MCT Oil (Caprylic/Capric)',
          amountPer10kg: '3ml',
          notes: 'Easy energy source without pancreatic enzymes.',
        },
      ],
    },
    nutritionalTargets: {
      fatMax: 10,
    },
    rationale: 'Removes fats requiring pancreatic lipase and adds safe energy.',
    ruleWeight: 17,
  },
  {
    id: 'mod-hairball-01',
    appliesTo: {
      species: ['cats'],
      healthConcerns: ['hairball'],
    },
    ingredientChanges: {
      add: [
        {
          name: 'Psyllium Husk',
          amountPer10kg: '1g',
          notes: 'Adds soluble fiber to move ingested hair.',
        },
        {
          name: 'Sardine Oil',
          amountPer10kg: '150mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=sardine+oil+for+cats'),
          notes: 'Lubricates GI tract and boosts omegas for coat.',
        },
      ],
    },
    nutritionalTargets: {},
    rationale: 'Fibers plus omegas reduce shedding and lubricate transit.',
    ruleWeight: 10,
  },
  {
    id: 'mod-heart-disease-dog-01',
    appliesTo: {
      species: ['dogs'],
      healthConcerns: ['heart-disease', 'heart disease'],
    },
    ingredientChanges: {
      remove: ['high-sodium', 'processed'],
      add: [
        {
          name: 'Taurine Supplement',
          amountPer10kg: '500mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=taurine+supplement+dog'),
          notes: 'Essential amino acid for heart muscle function.',
        },
        {
          name: 'Omega-3 Fish Oil',
          amountPer10kg: '300mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=omega-3+fish+oil+dog'),
          notes: 'EPA/DHA support cardiovascular health.',
        },
        {
          name: 'Coenzyme Q10',
          amountPer10kg: '30mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=coq10+for+dogs'),
          notes: 'Supports heart muscle energy production.',
        },
      ],
    },
    nutritionalTargets: {
      fatMax: 15,
      sodiumMax: 0.3,
    },
    rationale: 'Low sodium, taurine-rich diet with omega-3 support for cardiac function.',
    ruleWeight: 18,
  },
  {
    id: 'mod-heart-disease-cat-01',
    appliesTo: {
      species: ['cats'],
      healthConcerns: ['heart-disease', 'heart disease'],
    },
    ingredientChanges: {
      remove: ['high-sodium', 'processed'],
      add: [
        {
          name: 'Taurine Supplement',
          amountPer10kg: '250mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=taurine+supplement+cat'),
          notes: 'Critical for feline heart health - cats cannot synthesize taurine.',
        },
        {
          name: 'Omega-3 Fish Oil',
          amountPer10kg: '200mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=omega-3+fish+oil+cat'),
          notes: 'EPA/DHA for cardiovascular support.',
        },
        {
          name: 'L-Carnitine',
          amountPer10kg: '250mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=l-carnitine+for+cats'),
          notes: 'Supports heart muscle metabolism.',
        },
      ],
    },
    nutritionalTargets: {
      fatMax: 15,
      sodiumMax: 0.25,
      proteinMin: 40,
    },
    rationale: 'Taurine-rich, low-sodium diet essential for feline cardiac health.',
    ruleWeight: 20,
  },
  {
    id: 'mod-skin-conditions-dog-01',
    appliesTo: {
      species: ['dogs'],
      healthConcerns: ['skin-conditions', 'skin conditions'],
    },
    ingredientChanges: {
      remove: ['artificial-colors', 'preservatives'],
      add: [
        {
          name: 'Omega-3 Fish Oil',
          amountPer10kg: '400mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=omega-3+fish+oil+dog'),
          notes: 'Anti-inflammatory omega-3s for skin health.',
        },
        {
          name: 'Vitamin E Supplement',
          amountPer10kg: '100IU',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=vitamin+e+for+dogs'),
          notes: 'Antioxidant support for skin barrier function.',
        },
        {
          name: 'Zinc Supplement',
          amountPer10kg: '15mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=zinc+supplement+dog'),
          notes: 'Essential for skin healing and immune function.',
        },
      ],
    },
    nutritionalTargets: {
      fatMin: 10,
    },
    rationale: 'Omega-3s, vitamin E, and zinc support healthy skin barrier and reduce inflammation.',
    ruleWeight: 14,
  },
  {
    id: 'mod-skin-conditions-cat-01',
    appliesTo: {
      species: ['cats'],
      healthConcerns: ['skin-conditions', 'skin conditions'],
    },
    ingredientChanges: {
      remove: ['artificial-colors', 'preservatives'],
      add: [
        {
          name: 'Omega-3 Fish Oil',
          amountPer10kg: '300mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=omega-3+fish+oil+cat'),
          notes: 'EPA/DHA for skin health and anti-inflammatory support.',
        },
        {
          name: 'Biotin Supplement',
          amountPer10kg: '250mcg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=biotin+for+cats'),
          notes: 'B-vitamin essential for healthy skin and coat.',
        },
        {
          name: 'Vitamin E',
          amountPer10kg: '50IU',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=vitamin+e+for+cats'),
          notes: 'Antioxidant for skin barrier protection.',
        },
      ],
    },
    nutritionalTargets: {
      fatMin: 12,
      proteinMin: 38,
    },
    rationale: 'Quality protein, omega-3s, and skin-supporting vitamins for healthy coat.',
    ruleWeight: 15,
  },
  {
    id: 'mod-diabetes-dog-01',
    appliesTo: {
      species: ['dogs'],
      healthConcerns: ['diabetes'],
    },
    ingredientChanges: {
      remove: ['high-sugar', 'simple-carbs', 'corn-syrup', 'white-rice'],
      substitute: [
        { from: 'white rice', to: 'steamed cauliflower rice' },
        { from: 'sweet potato', to: 'green beans' },
      ],
      add: [
        {
          name: 'Chromium Supplement',
          amountPer10kg: '50mcg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=chromium+supplement+dog'),
          notes: 'Helps improve insulin sensitivity.',
        },
        {
          name: 'Alpha-Lipoic Acid',
          amountPer10kg: '25mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=alpha-lipoic-acid+dog'),
          notes: 'Antioxidant that may help with glucose metabolism.',
        },
      ],
    },
    nutritionalTargets: {
      proteinMin: 25,
      fatMax: 15,
      caloriesAdjust: -10,
    },
    rationale: 'Low-glycemic, high-protein diet with consistent calories for blood sugar control.',
    ruleWeight: 17,
  },
  {
    id: 'mod-diabetes-cat-01',
    appliesTo: {
      species: ['cats'],
      healthConcerns: ['diabetes'],
    },
    ingredientChanges: {
      remove: ['high-sugar', 'simple-carbs', 'corn-syrup', 'white-rice'],
      substitute: [
        { from: 'white rice', to: 'steamed cauliflower rice' },
        { from: 'sweet potato', to: 'green beans' },
      ],
      add: [
        {
          name: 'Chromium Supplement',
          amountPer10kg: '25mcg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=chromium+supplement+cat'),
          notes: 'Helps improve insulin sensitivity in cats.',
        },
        {
          name: 'Alpha-Lipoic Acid',
          amountPer10kg: '15mg',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=alpha-lipoic-acid+cat'),
          notes: 'Antioxidant support for glucose metabolism.',
        },
      ],
    },
    nutritionalTargets: {
      proteinMin: 40,
      fatMax: 15,
      caloriesAdjust: -10,
    },
    rationale: 'High-protein, low-carb diet with consistent calories for feline diabetes management.',
    ruleWeight: 18,
  },
  {
    id: 'mod-pancreatitis-dog-01',
    appliesTo: {
      species: ['dogs'],
      healthConcerns: ['pancreatitis'],
    },
    ingredientChanges: {
      remove: ['high-fat', 'pork', 'lamb', 'duck', 'fried', 'greasy'],
      substitute: [
        { from: 'ground beef', to: 'lean turkey breast' },
        { from: 'salmon', to: 'white fish (cod/tilapia)' },
      ],
      add: [
        {
          name: 'MCT Oil',
          amountPer10kg: '5ml',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=mct+oil+for+dogs'),
          notes: 'Easy energy source that bypasses pancreatic enzymes.',
        },
        {
          name: 'Digestive Enzymes',
          amountPer10kg: '1 capsule',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=digestive+enzymes+dog'),
          notes: 'Supports digestion during pancreatic recovery.',
        },
        {
          name: 'Probiotics',
          amountPer10kg: '1g',
          amazonLink: ensureSellerId('https://www.amazon.com/s?k=probiotics+for+dogs'),
          notes: 'Supports gut health during low-fat diet.',
        },
      ],
    },
    nutritionalTargets: {
      fatMax: 10,
    },
    rationale: 'Ultra-low fat diet with easily digestible proteins to rest the pancreas.',
    ruleWeight: 19,
  },
];

/**
 * Utility helper to inject weight-aware additions inline.
 * Exported for tests and future dynamic adjustments.
 */
export const expandWeightAwareIngredients = (
  additions: IngredientOption[] | undefined,
  weightKg: number
): IngredientOption[] => {
  if (!additions?.length) return [];
  return addIngredient(additions, weightKg);
};

