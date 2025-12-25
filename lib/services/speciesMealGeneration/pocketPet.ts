import type {
  Archetype,
  CandidateIssueSummary,
  RecipeCandidate,
  SpeciesEngineContext,
} from './index';

type PocketSubtype = 'hay-eater' | 'omnivore' | 'ferret-type';

function inferPocketSubtype(breed?: string): PocketSubtype {
  const b = String(breed || '').toLowerCase();

  if (b.includes('ferret')) return 'ferret-type';

  if (b.includes('rabbit') || b.includes('guinea') || b.includes('guinea pig') || b.includes('chinchilla') || b.includes('degu'))
    return 'hay-eater';

  if (b.includes('hamster') || b.includes('rat') || b.includes('mouse') || b.includes('gerbil')) return 'omnivore';

  return 'omnivore';
}

export function getArchetypes(): Archetype[] {
  return [
    {
      name: 'Hay-eater: Hay/Pellet Base + Leafy Greens',
      description:
        'Fiber-forward template for rabbits/chinchillas/degus: hay/pellet base plus leafy greens; keep sugars low.',
    },
    {
      name: 'Guinea Pig: Hay + Fortified Pellets + High-Vitamin-C Veg',
      description:
        'Guinea pig template: hay base, fortified pellets, and vitamin-C-forward veg (e.g., bell pepper). Keep sugars low.',
    },
    {
      name: 'Omnivore: Protein Accent + Veg + Fiber',
      description:
        'Moderate omnivore template (hamster/rat/mouse/gerbil): small protein accent, veg variety, and a fiber source.',
    },
    {
      name: 'Ferret-type: High Protein + Higher Fat (Low Fiber)',
      description:
        'Ferret-style template: high animal protein and fat, very low fiber/carbs.',
    },
  ];
}

export function getCompletenessMechanismRules(): string[] {
  return [
    'Pocket-pets vary widely: choose the archetype based on breed string when provided (hay-eater vs omnivore vs ferret-type).',
    'Hay-eaters: emphasize fiber and avoid sugary fruit-heavy meals.',
    'Ferret-type: keep carbs/fiber low; prioritize animal protein and fat.',
  ];
}

export function getTargetScoreThreshold(perfectPet: boolean): number {
  return perfectPet ? 80 : 65;
}

function baseHeader(ctx: SpeciesEngineContext, subtype: PocketSubtype): string {
  const breed = (ctx.breed || '').trim();
  return [
    'ACT AS A PHD VETERINARY NUTRITIONIST FORMULATOR FOR POCKET-PETS.',
    'YOU MUST RETURN ONLY VALID JSON. NO MARKDOWN. NO EXPLANATIONS.',
    `Species engine: POCKET-PET (${subtype}). Targeting high compatibility for ${ctx.perfectPet ? 'perfect' : 'non-perfect'} pet profile.`,
    `Pet: name=${ctx.petName}, ageGroup=${ctx.ageGroup}${typeof ctx.weightKg === 'number' ? `, weightKg=${ctx.weightKg}` : ''}${breed ? `, breed=${breed}` : ''}.`,
  ].join('\n');
}

function constraintsBlock(ctx: SpeciesEngineContext, subtype: PocketSubtype): string {
  const breed = (ctx.breed || '').trim();
  const minMass = subtype === 'hay-eater' ? 15 : subtype === 'ferret-type' ? 20 : 15;

  const subtypeRules =
    subtype === 'hay-eater'
      ? [
          '- Subtype rules (hay-eater): hay/pellet base SHOULD dominate if available; leafy greens; very low sugar; avoid fruit-heavy meals; include vitamin C support for guinea pigs if such an ingredient exists in vocabulary.',
        ]
      : subtype === 'ferret-type'
      ? [
          '- Subtype rules (ferret-type): high animal protein and higher fat; very low fiber/carbs; avoid grain/veg-heavy meals.',
        ]
      : [
          '- Subtype rules (omnivore): balanced small-pet omnivore template; moderate fiber; small protein accent; avoid extreme diets.',
        ];

  return [
    'HARD CONSTRAINTS:',
    `- Output must include exactly ${ctx.requestedCount} recipes in the recipes array.`,
    '- Each recipe MUST be a plausible single portion for a pocket-pet (not a snack).',
    '- Amounts must be in grams (e.g., "15g").',
    `- Total meal mass MUST be >= ${minMass}g (sum of ingredient grams).`,
    ...(breed
      ? [`- Breed hint: "${breed}" -> inferred subtype: ${subtype}.`]
      : ['- No breed provided -> inferred subtype: omnivore (conservative).']),
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
    'RECIPE ARCHETYPES:',
    ...getArchetypes().map((a) => `- ${a.name}: ${a.description}`),
  ].join('\n');
}

export function buildPrompt(ctx: SpeciesEngineContext): string {
  const subtype = inferPocketSubtype(ctx.breed);

  const schema = {
    recipes: [
      {
        name: 'string',
        description: 'string (optional)',
        servings: 'number (optional, default 1)',
        ingredients: [{ name: 'string', amount: 'string (e.g., "15g")' }],
        instructions: ['string (optional)'],
        estimatedCostPerMeal: 'number (optional)',
      },
    ],
  };

  return [
    baseHeader(ctx, subtype),
    '',
    constraintsBlock(ctx, subtype),
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
  const subtype = inferPocketSubtype(ctx.breed);
  const minMass = subtype === 'hay-eater' ? 15 : subtype === 'ferret-type' ? 20 : 15;

  const schema = {
    recipes: [
      {
        name: 'string',
        description: 'string (optional)',
        servings: 'number (optional, default 1)',
        ingredients: [{ name: 'string', amount: 'string (e.g., "15g")' }],
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
    baseHeader(ctx, subtype),
    '',
    'REVISION TASK:',
    `- Previous attempt did not meet target score threshold (${getTargetScoreThreshold(ctx.perfectPet)}).`,
    `- Generate a NEW set of pocket-pet meals for subtype=${subtype} that fix the listed issues.`,
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
