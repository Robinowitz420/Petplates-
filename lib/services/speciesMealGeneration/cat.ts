import type {
  Archetype,
  CandidateIssueSummary,
  RecipeCandidate,
  SpeciesEngineContext,
} from './index';

export function getArchetypes(): Archetype[] {
  return [
    {
      name: 'High-Protein Meat + Fat (low carb)',
      description:
        'Cat-appropriate, protein-forward meal with adequate fat. Minimal carbs.',
    },
    {
      name: 'Fish + Poultry Blend (low carb)',
      description:
        'Fish-forward cat meal blended with poultry for amino acid profile. Avoid carb-heavy bases.',
    },
    {
      name: 'Simple Poultry + Small Fiber',
      description:
        'Very low-carb poultry base with a small fiber/veg addition for GI tolerance.',
    },
  ];
}

export function getCompletenessMechanismRules(): string[] {
  return [
    'Do NOT include vitamin/mineral blends, supplements, powders, capsules, or "vitamin" ingredients. This app handles supplement recommendations separately.',
    'Avoid organ meats (liver/heart/kidney/etc) unless medically indicated by the pet profile health concerns.',
    'Keep carbs minimal. Avoid grain-heavy or starchy, high-carb bases unless medically indicated.',
  ];
}

export function getTargetScoreThreshold(perfectPet: boolean): number {
  return perfectPet ? 90 : 65;
}

function baseHeader(ctx: SpeciesEngineContext): string {
  return [
    'ACT AS A PHD VETERINARY NUTRITIONIST FORMULATOR FOR CATS.',
    'YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATIONS.',
    `Species engine: CAT. Targeting high compatibility for ${ctx.perfectPet ? 'perfect' : 'non-perfect'} pet profile.`,
    `Pet: name=${ctx.petName}, ageGroup=${ctx.ageGroup}${typeof ctx.weightKg === 'number' ? `, weightKg=${ctx.weightKg}` : ''}.`,
  ].join('\n');
}

function constraintsBlock(ctx: SpeciesEngineContext): string {
  return [
    'HARD CONSTRAINTS:',
    `- Output must include up to ${ctx.requestedCount} recipes in the recipes array.`,
    '- Each recipe MUST be a plausible single meal for a cat (not a snack).',
    '- Amounts must be in grams (e.g., "80g").',
    '- Total meal mass MUST be >= 60g (sum of ingredient grams).',
    '- Macro style: high protein, higher fat, low carbs.',
    '- Whole-food meals only: do NOT include supplements, vitamins/minerals, powders, capsules, or oils-as-supplements. Any supplement suggestions will be returned separately by the app.',
    ...(ctx.healthConcerns.length
      ? [`- Health concerns to consider (avoid contraindications): ${ctx.healthConcerns.join(', ')}`]
      : ['- No health concerns.']),
    ...(ctx.allergies.length ? [`- Allergies (zero tolerance): ${ctx.allergies.join(', ')}`] : ['- No allergies.']),
    ...(ctx.bannedIngredients.length
      ? [`- Banned ingredients (zero tolerance): ${ctx.bannedIngredients.join(', ')}`]
      : ['- No banned ingredients.']),
    ...getCompletenessMechanismRules().map((r) => `- ${r}`),
  ].join('\n');
}

function archetypeBlock(): string {
  return [
    'RECIPE ARCHETYPES (diversify across recipes):',
    ...getArchetypes().map((a) => `- ${a.name}: ${a.description}`),
  ].join('\n');
}

export function buildPrompt(ctx: SpeciesEngineContext): string {
  const schema = {
    recipes: [
      {
        name: 'string',
        description: 'string (optional)',
        servings: 'number (optional, default 1)',
        ingredients: [{ name: 'string', amount: 'string (e.g., "80g")' }],
        instructions: ['string (optional)'],
        estimatedCostPerMeal: 'number (optional)',
      },
    ],
  };

  return [
    baseHeader(ctx),
    '',
    constraintsBlock(ctx),
    '',
    archetypeBlock(),
    '',
    'OUTPUT JSON SCHEMA (top-level must match exactly; no extra keys):',
    JSON.stringify(schema, null, 2),
    '',
    'IMPORTANT:',
    '- Every ingredient.name MUST be chosen from the allowed ingredient vocabulary provided by the caller.',
    '- Use grams only for amounts.',
  ].join('\n');
}

export function buildRevisionPrompt(
  ctx: SpeciesEngineContext,
  failingCandidates: RecipeCandidate[],
  topIssuesByCandidate: CandidateIssueSummary[]
): string {
  const schema = {
    recipes: [
      {
        name: 'string',
        description: 'string (optional)',
        servings: 'number (optional, default 1)',
        ingredients: [{ name: 'string', amount: 'string (e.g., "80g")' }],
        instructions: ['string (optional)'],
        estimatedCostPerMeal: 'number (optional)',
      },
    ],
  };

  const issuesText = topIssuesByCandidate
    .slice(0, 10)
    .map((c) => `- ${c.name} (score=${typeof c.score === 'number' ? c.score : 'n/a'}): ${c.topIssues.join(' | ')}`)
    .join('\n');

  const failingNames = failingCandidates
    .slice(0, 10)
    .map((c) => `- ${c.name}: ${c.ingredients.map((i) => `${i.name} ${i.amount}`).join(', ')}`)
    .join('\n');

  return [
    baseHeader(ctx),
    '',
    'REVISION TASK:',
    `- Previous attempt did not meet target score threshold (${getTargetScoreThreshold(ctx.perfectPet)}).`,
    '- Generate a NEW set of cat recipes that fix the listed issues.',
    '- Keep cat meal mass >= 60g, high protein/higher fat, low carb.',
    '- Ensure taurine-aware choices and completeness mechanism.',
    '',
    'TOP ISSUES TO FIX (per candidate):',
    issuesText || '- (no issues provided)',
    '',
    'FAILING CANDIDATES (reference only; do not copy; improve):',
    failingNames || '- (none)',
    '',
    'OUTPUT JSON SCHEMA (top-level must match exactly; no extra keys):',
    JSON.stringify(schema, null, 2),
    '',
    'IMPORTANT:',
    '- Ingredient names must come from the allowed vocabulary.',
    '- Amounts in grams only.',
  ].join('\n');
}
