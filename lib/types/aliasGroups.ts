// Ingredient alias groups - handles one ASIN serving multiple ingredient concepts
// Separates retail identity (one product) from ingredient semantics (multiple names)

export interface IngredientAliasGroup {
  groupId: string;                    // e.g., "green_peas_fresh"
  canonicalName: string;              // Primary ingredient name
  aliases: string[];                  // All ingredient names sharing this ASIN
  sharedASIN: string;                 // The Amazon ASIN they all use
  
  // Validation happens once per group, not per ingredient
  validationStatus: 'valid' | 'structurally-valid' | 'ambiguous' | 'invalid';
  confidence: 'high' | 'medium' | 'low';
  lastVerified: Date;
  
  // Why these are grouped together
  groupingReason: 'same-base-ingredient' | 'known-synonyms' | 'manual-override';
  
  // Optional: differences between aliases handled in recipe logic
  preparationVariants?: Map<string, string>; // e.g., "peas (mashed)" -> "mashed"
  
  // Audit trail
  notes?: string;
}

export interface AliasGroupValidationResult {
  group: IngredientAliasGroup;
  validationResult: any; // Will use ValidationResult from retailValidation.ts
  appliesTo: string[];   // Which ingredients inherit this result
}

// Known synonym patterns for alias detection
export const KNOWN_SYNONYM_PAIRS: Array<[string, string]> = [
  // Rice variants
  ['brown rice', 'rice (hulled)'],
  
  // Fish - same product, different descriptions
  ['sardines (canned in water)', 'sardines (in water)'],
  
  // Supplements - naming variations
  ['b-complex', 'vitamin b complex'],
  ['hairball paste', 'hairball control paste'],
  
  // Broths - same product line
  ['chicken broth', 'bone broth (low sodium)'],
  ['fish broth (no salt)', 'turkey broth (no salt)'],
  
  // Oils - same oil, different names
  ['salmon oil', 'omega-3 oil'],
  ['fish oil', 'herring oil'],
  
  // Calcium sources
  ['calcium carbonate', 'eggshells (crushed)'],
  
  // Lettuce variants
  ['lettuce (romaine)', 'romaine lettuce'],
  
  // Watercress
  ['watercress', 'watercress (small amounts)'],
  
  // Peas - preparation variants
  ['peas', 'peas (mashed)'],
  ['peas', 'peas (cooked)'],
  ['green beans', 'green beans (cooked)'],
  
  // Prebiotic supplements - same family
  ['chicory root', 'inulin (prebiotic)'],
  ['chicory root', 'fructooligosaccharides (fos)'],
  ['inulin (prebiotic)', 'fructooligosaccharides (fos)'],
  
  // Joint supplements - same product line
  ['joint supplement', 'joint health supplement'],
  ['glucosamine sulfate', 'chondroitin sulfate'],
  ['joint supplement', 'glucosamine sulfate'],
  ['joint supplement', 'chondroitin sulfate'],
  
  // Bok choy variants
  ['bok choi', 'bok choy (small amounts)'],
  
  // Dubia roaches
  ['dubia roaches', 'small dubia roaches'],
  
  // Hay variants
  ['timothy hay', 'bluegrass hay'],
];

// Known conflict patterns - these should NOT be grouped
export const KNOWN_CONFLICT_PATTERNS: Array<[string, string]> = [
  // Different meats
  ['venison', 'beef'],
  ['rabbit', 'lamb'],
  ['turkey', 'chicken'],
  ['duck', 'chicken'],
  
  // Different fish
  ['herring', 'sardines'],
  
  // Completely different products
  ['mango', 'chia'],
  ['egg', 'duck'],
];
