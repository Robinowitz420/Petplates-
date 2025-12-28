import type {
  Archetype,
  CandidateIssueSummary,
  RecipeCandidate,
  SpeciesEngineContext,
} from './index';

export function getArchetypes(): Archetype[] {
  return [
    {
      name: 'Lean Protein + Complex Carb + Veg + Omega-3',
      description:
        'Balanced dog meal with a lean animal protein, a complex carb, a fibrous vegetable, and an omega-3 source.',
    },
    {
      name: 'Novel Protein + Gentle Carb + Veg',
      description:
        'Allergy-friendly leaning (novel protein), gentle carb, and a single veg for simplicity.',
    },
    {
      name: 'Fish-forward + Fiber + Carb',
      description:
        'Fish as primary protein with a fiber source and a moderate carb for energy.',
    },
  ];
}

export function getCompletenessMechanismRules(): string[] {
  return [
    'Do NOT include vitamin/mineral blends, supplements, powders, capsules, or "vitamin" ingredients. This app handles supplement recommendations separately.',
    'Avoid organ meats (liver/heart/kidney/etc) unless medically indicated by the pet profile health concerns.',
    'Keep ingredients purposeful; avoid filler items.',
  ];
}

export function getTargetScoreThreshold(perfectPet: boolean): number {
  return perfectPet ? 90 : 65;
}

function baseHeader(ctx: SpeciesEngineContext): string {
  return [
    'ACT AS A PHD VETERINARY NUTRITIONIST FORMULATOR FOR DOGS.',
    'YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATIONS.',
    `Species engine: DOG. Targeting high compatibility for ${ctx.perfectPet ? 'perfect' : 'non-perfect'} pet profile.`,
    `Pet: name=${ctx.petName}, ageGroup=${ctx.ageGroup}${typeof ctx.weightKg === 'number' ? `, weightKg=${ctx.weightKg}` : ''}.`,
  ].join('\n');
}

function constraintsBlock(ctx: SpeciesEngineContext): string {
  return [
    'HARD CONSTRAINTS:',
    `- Output must include up to ${ctx.requestedCount} recipes in the recipes array.`,
    '- Each recipe MUST be a plausible single meal for a dog (not a snack).',
    '- Amounts must be in grams (e.g., "120g").',
    '- Total meal mass MUST be >= 80g (sum of ingredient grams).',
    '- Balanced macro style: protein + carb/veg + fat source.',
    '- Whole-food meals only: do NOT include supplements, vitamins/minerals, powders, capsules, or oils-as-supplements. Any supplement suggestions will be returned separately by the app.',
    '- Avoid ultra-low-mass meals; dogs must meet minimum meal mass.',
    '- Avoid toxic foods (onion/garlic/grapes/raisins/xylitol/chocolate/macadamia/alcohol/caffeine).',
    ...(ctx.healthConcerns.length
      ? [`- Health concerns to consider (do not include contraindicated items): ${ctx.healthConcerns.join(', ')}`]
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
    'RECIPE ARCHETYPES (pick different ones to diversify):',
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
        ingredients: [{ name: 'string', amount: 'string (e.g., "120g")' }],
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
    '- Use clear, standard ingredient names (no new inventions).',
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
        ingredients: [{ name: 'string', amount: 'string (e.g., "120g")' }],
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
    '- Generate a NEW set of recipes that fix the listed issues.',
    '- Keep dog meal mass >= 80g and enforce a completeness mechanism.',
    '',
    'TOP ISSUES TO FIX (per candidate):',
    issuesText || '- (no issues provided)',
    '',
    'FAILING CANDIDATES (for reference; do NOT copy 그대로; improve them):',
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
