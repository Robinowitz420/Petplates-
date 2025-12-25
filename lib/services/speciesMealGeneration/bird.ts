import type {
  Archetype,
  CandidateIssueSummary,
  RecipeCandidate,
  SpeciesEngineContext,
} from './index';

type BirdSubtype = 'finch-canary' | 'parrot' | 'poultry' | 'waterfowl' | 'unknown';

function inferBirdSubtype(breed?: string): BirdSubtype {
  const b = String(breed || '').toLowerCase();

  // finch/canary group
  if (b.includes('finch') || b.includes('zebra finch') || b.includes('society finch') || b.includes('canary')) return 'finch-canary';

  // parrots
  if (
    b.includes('parrot') ||
    b.includes('parakeet') ||
    b.includes('cockatiel') ||
    b.includes('macaw') ||
    b.includes('conure') ||
    b.includes('african grey') ||
    b.includes('amazon')
  ) return 'parrot';

  // poultry
  if (b.includes('chicken') || b.includes('hen') || b.includes('rooster') || b.includes('quail')) return 'poultry';

  // waterfowl
  if (b.includes('duck') || b.includes('goose')) return 'waterfowl';

  return 'unknown';
}

export function getArchetypes(): Archetype[] {
  return [
    {
      name: 'Pellet-Forward + Veg Chop + Seed Accent',
      description:
        'Formulated pellet base with a vegetable chop and only a small seed accent (avoid seed-only diets).',
    },
    {
      name: 'Legume/Grain + Veg + Calcium Support',
      description:
        'Cooked legume or grain base plus mixed vegetables; include a calcium-supporting ingredient if present in vocabulary.',
    },
    {
      name: 'Sprout/Grain + Veg + Protein Boost',
      description:
        'Sprouted/cooked grain base with veg and a modest protein booster; balanced, not seed-only.',
    },
  ];
}

export function getCompletenessMechanismRules(): string[] {
  return [
    'Avoid seed-only meals. Seeds may be included only as a minority accent, not the base.',
    'Prefer a formulated base (pellets) OR a legume/veg balanced base if pellets are not available in the allowed vocabulary.',
    'Keep ingredients purposeful; avoid sugary fruit-heavy meals unless appropriate.',
  ];
}

export function getTargetScoreThreshold(perfectPet: boolean): number {
  return perfectPet ? 80 : 65;
}

function baseHeader(ctx: SpeciesEngineContext): string {
  const subtype = inferBirdSubtype(ctx.breed);
  const breed = (ctx.breed || '').trim();
  return [
    'ACT AS A PHD VETERINARY NUTRITIONIST FORMULATOR FOR BIRDS.',
    'YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATIONS.',
    `Species engine: BIRD (${subtype}). Targeting high compatibility for ${ctx.perfectPet ? 'perfect' : 'non-perfect'} pet profile.`,
    `Pet: name=${ctx.petName}, ageGroup=${ctx.ageGroup}${typeof ctx.weightKg === 'number' ? `, weightKg=${ctx.weightKg}` : ''}${breed ? `, breed=${breed}` : ''}.`,
  ].join('\n');
}

function constraintsBlock(ctx: SpeciesEngineContext): string {
  const subtype = inferBirdSubtype(ctx.breed);
  const minMass =
    subtype === 'finch-canary' ? 4 :
    subtype === 'parrot' ? 20 :
    subtype === 'poultry' ? 35 :
    subtype === 'waterfowl' ? 45 :
    20;

  const subtypeRules =
    subtype === 'finch-canary'
      ? [
          '- Subtype rules (finch/canary): small portions are normal; prefer fortified pellets if available; seeds are allowed but avoid seed-only if pellets exist; avoid fruit-heavy meals.',
        ]
      : subtype === 'parrot'
      ? [
          '- Subtype rules (parrot): MUST be pellet-forward if pellets exist in vocabulary; seeds only as a small minority accent; include veg chop; avoid seed-only diets.',
        ]
      : subtype === 'poultry'
      ? [
          '- Subtype rules (poultry): higher total mass; allow grains/veg; avoid seed-only meals; keep it practical and feed-like.',
        ]
      : subtype === 'waterfowl'
      ? [
          '- Subtype rules (waterfowl): higher total mass; allow grains/veg; avoid seed-only meals; keep it practical and feed-like.',
        ]
      : [
          '- Subtype rules (unknown bird): prefer fortified pellets if available; avoid seed-only meals; keep it balanced and practical.',
        ];

  return [
    'HARD CONSTRAINTS:',
    `- Output must include exactly ${ctx.requestedCount} recipes in the recipes array.`,
    '- Each recipe MUST be a plausible single meal/portion for a bird.',
    '- Amounts must be in grams (e.g., "12g").',
    `- Total meal mass MUST be >= ${minMass}g (sum of ingredient grams).`,
    ...subtypeRules,
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
    'RECIPE ARCHETYPES (rotate for diversity):',
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
        ingredients: [{ name: 'string', amount: 'string (e.g., "12g")' }],
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
  const subtype = inferBirdSubtype(ctx.breed);
  const minMass =
    subtype === 'finch-canary' ? 4 :
    subtype === 'parrot' ? 20 :
    subtype === 'poultry' ? 35 :
    subtype === 'waterfowl' ? 45 :
    20;

  const schema = {
    recipes: [
      {
        name: 'string',
        description: 'string (optional)',
        servings: 'number (optional, default 1)',
        ingredients: [{ name: 'string', amount: 'string (e.g., "12g")' }],
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
    `- Generate a NEW set of bird meals that fix the listed issues.`,
    `- Enforce subtype=${subtype} rules and keep total mass >= ${minMass}g.`,
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
