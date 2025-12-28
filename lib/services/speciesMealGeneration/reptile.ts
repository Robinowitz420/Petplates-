import type {
  Archetype,
  CandidateIssueSummary,
  RecipeCandidate,
  SpeciesEngineContext,
} from './index';

type ReptileSubtype = 'herbivore' | 'insectivore' | 'carnivore' | 'unknown';

function inferReptileSubtype(breed?: string): ReptileSubtype {
  const b = String(breed || '').toLowerCase();

  // herbivores / mostly herbivores
  if (
    b.includes('iguana') ||
    b.includes('tortoise') ||
    b.includes('uromastyx') ||
    b.includes('turtle') ||
    b.includes('terrapin')
  ) return 'herbivore';

  // insectivore/omnivore leaning (common pet lizards)
  if (
    b.includes('bearded dragon') ||
    b.includes('chameleon') ||
    b.includes('anole') ||
    b.includes('skink') ||
    b.includes('gecko') ||
    b.includes('leopard gecko')
  ) return 'insectivore';

  // snakes
  if (b.includes('snake') || b.includes('python') || b.includes('ball python') || b.includes('boa')) return 'carnivore';

  return 'unknown';
}

export function getArchetypes(): Archetype[] {
  return [
    {
      name: 'Herbivore Base (greens + veg + calcium support)',
      description:
        'Greens-forward template for herbivores: mixed leafy greens + veg, calcium support if available.',
    },
    {
      name: 'Insectivore Base (insects + greens + calcium support)',
      description:
        'Insect-based protein with small greens/veg and calcium support if available.',
    },
    {
      name: 'Omnivore Base (greens + insects/protein accent + calcium)',
      description:
        'Mixed template for omnivores; include both veg and a protein accent.',
    },
  ];
}

export function getCompletenessMechanismRules(): string[] {
  return [
    'If available in the vocabulary, include an explicit calcium support ingredient (e.g., calcium supplement/powder or calcium-rich staple).',
    'Subtype matters: herbivores should be greens-forward; insectivores should be insect-forward; carnivorous snakes should be prey-forward if vocabulary allows.',
    'Keep ingredients purposeful; avoid high-sugar or overly fatty combinations.',
  ];
}

export function getTargetScoreThreshold(perfectPet: boolean): number {
  return perfectPet ? 80 : 65;
}

function baseHeader(ctx: SpeciesEngineContext): string {
  const subtype = inferReptileSubtype(ctx.breed);
  const breed = (ctx.breed || '').trim();
  return [
    'ACT AS A PHD VETERINARY NUTRITIONIST FORMULATOR FOR REPTILES.',
    'YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATIONS.',
    `Species engine: REPTILE (${subtype}). Targeting high compatibility for ${ctx.perfectPet ? 'perfect' : 'non-perfect'} pet profile.`,
    `Pet: name=${ctx.petName}, ageGroup=${ctx.ageGroup}${typeof ctx.weightKg === 'number' ? `, weightKg=${ctx.weightKg}` : ''}${breed ? `, breed=${breed}` : ''}.`,
  ].join('\n');
}

function constraintsBlock(ctx: SpeciesEngineContext): string {
  const subtype = inferReptileSubtype(ctx.breed);
  const minMass =
    subtype === 'herbivore' ? 30 :
    subtype === 'insectivore' ? 35 :
    subtype === 'carnivore' ? 60 :
    30;

  const subtypeRules =
    subtype === 'herbivore'
      ? [
          '- Subtype rules (herbivore): greens/veg MUST be the clear majority; avoid high animal-protein bases; include calcium support if available.',
        ]
      : subtype === 'insectivore'
      ? [
          '- Subtype rules (insectivore): insects should be a major protein component; include leafy greens/veg; include calcium support if available; avoid high-sugar items.',
        ]
      : subtype === 'carnivore'
      ? [
          '- Subtype rules (carnivore): animal protein MUST dominate; avoid veg-forward meals; if whole-prey items exist in vocabulary use them; keep it conservative.',
        ]
      : [
          '- Subtype rules (unknown reptile): stay conservative omnivore; mixed veg + modest protein + calcium support if available; avoid extremes.',
        ];

  return [
    'HARD CONSTRAINTS:',
    `- Output must include up to ${ctx.requestedCount} recipes in the recipes array.`,
    '- Each recipe MUST be a plausible single meal/portion for a reptile.',
    '- Amounts must be in grams (e.g., "30g").',
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
    'RECIPE ARCHETYPES (vary across recipes):',
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
        ingredients: [{ name: 'string', amount: 'string (e.g., "30g")' }],
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
  const subtype = inferReptileSubtype(ctx.breed);
  const minMass =
    subtype === 'herbivore' ? 30 :
    subtype === 'insectivore' ? 35 :
    subtype === 'carnivore' ? 60 :
    30;

  const schema = {
    recipes: [
      {
        name: 'string',
        description: 'string (optional)',
        servings: 'number (optional, default 1)',
        ingredients: [{ name: 'string', amount: 'string (e.g., "30g")' }],
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
    `- Generate a NEW set of reptile meals that fix the listed issues.`,
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
