export const guideCommon = {
  disclaimer:
    'Paws & Plates provides educational meal planning tools and ingredient safety checks. It is not medical advice. Consult a qualified animal health professional for medical conditions or prescription diets.',
  ctaDefaults: {
    primaryText: 'See example meals',
    primaryHref: '/',
    secondaryText: 'Choose a pet type',
    secondaryHref: '/species',
  },
  avoidListConservative: [
    'Alcohol',
    'Caffeine (coffee/tea/energy drinks)',
    'Chocolate/cocoa',
    'Xylitol (sweetener in many sugar-free products)',
  ],
  transitionPlanDays: [
    'Days 1–2: 25% new + 75% current',
    'Days 3–4: 50% new + 50% current',
    'Days 5–6: 75% new + 25% current',
    'Day 7+: 100% new (if appetite and stool look good)',
  ],
} as const;

export type GuideCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

export type GuideTemplate = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: Array<{ heading: string; bullets: string[] }>;
  faq: Array<{ q: string; a: string }>;
};

export const guideTemplates: Record<GuideCategory, GuideTemplate> = {
  dogs: {
    metaTitle: '{entityName} Feeding Guide: Homemade Meal Prep Plan | Paws & Plates',
    metaDescription:
      'Meal-prep friendly feeding guide for {entityName}: safe staples, foods to limit/avoid, a simple routine, and how to build a personalized plan with Paws & Plates.',
    h1: '{entityName} feeding guide: meal prep routine, safe staples, and what to avoid',
    intro:
      'This guide gives you a practical, meal-prep friendly way to answer “what should I feed a {entityName}?”—with safe staples, a simple routine, and clear avoid/limit boundaries.',
    sections: [
      {
        heading: 'Quick answer',
        bullets: [
          'Start with a consistent base routine you can repeat weekly.',
          'Use safe staples, then add planned variety (don’t change everything daily).',
          'Transition changes over 5–7 days.',
          'Use Paws & Plates to see example meals and save a personalized plan.',
        ],
      },
      {
        heading: 'Safe staples (build your base)',
        bullets: [
          'Pick 1–2 primary proteins and a few rotation options.',
          'Use simple, recognizable ingredients over heavily processed add-ins.',
          'Keep recipes consistent so you can observe how your dog responds.',
        ],
      },
      {
        heading: 'Foods to limit',
        bullets: [
          'Highly processed foods, salty foods, and heavily seasoned foods.',
          'Treat-style extras that add lots of calories without much nutrition.',
          'Frequent rapid swaps (makes it hard to know what’s working).',
        ],
      },
      {
        heading: 'Foods to avoid',
        bullets: ['{avoidListConservative} (plus anything unknown—confirm first with a trusted source).'],
      },
      {
        heading: 'Switching foods (5–7 day transition)',
        bullets: ['{transitionPlanDays}'],
      },
      {
        heading: 'Serving & storage notes',
        bullets: [
          'Portions vary by size, age, and activity—create a pet profile for tailored guidance.',
          'Storage guidance should match the recipe’s food form (fresh vs dry).',
          'Discard perishable leftovers that sit out too long.',
        ],
      },
      {
        heading: 'FAQ',
        bullets: ['Can I use Paws & Plates without signing up?', 'Is this veterinary advice?', 'How do portions work?'],
      },
    ],
    faq: [
      {
        q: 'Can I use Paws & Plates without signing up?',
        a: 'Yes—example meals can be viewed without signup. You’ll need a free account to save pets, save meals, and generate personalized plans.',
      },
      {
        q: 'Is this veterinary advice?',
        a: 'No. Paws & Plates provides educational meal planning tools. If your pet has a diagnosed medical condition or is on a prescription diet, consult a qualified animal health professional before changing diet.',
      },
      {
        q: 'How do portions work?',
        a: 'Portions vary by size, age, and activity. Create a pet profile for more tailored serving guidance.',
      },
    ],
  },

  cats: {
    metaTitle: '{entityName} Feeding Guide: Homemade Meal Prep Plan | Paws & Plates',
    metaDescription:
      'Meal-prep friendly feeding guide for {entityName}: safe staples, foods to limit/avoid, a simple routine, and how to build a personalized plan with Paws & Plates.',
    h1: '{entityName} feeding guide: meal prep routine, safe staples, and what to avoid',
    intro:
      'This guide gives you a practical, meal-prep friendly way to answer “what should I feed a {entityName}?”—with safe staples, a simple routine, and clear avoid/limit boundaries.',
    sections: [
      {
        heading: 'Quick answer',
        bullets: [
          'Keep routines consistent—cats often prefer predictability.',
          'Use safe staples, then planned variety.',
          'Transition changes over 5–7 days.',
          'Use Paws & Plates for examples and saving plans.',
        ],
      },
      {
        heading: 'Why cats are different',
        bullets: [
          'Cats have distinct nutritional needs and may not tolerate rapid diet changes.',
          'Consistency and observation are key.',
        ],
      },
      {
        heading: 'Safe staples (build your base)',
        bullets: ['Pick a repeatable protein base and rotate intentionally.', 'Keep textures and preparation consistent when possible.'],
      },
      {
        heading: 'Foods to limit',
        bullets: ['Highly processed foods, salty foods, and heavily seasoned foods.', 'Frequent swaps that make picky eating worse.'],
      },
      {
        heading: 'Foods to avoid',
        bullets: ['{avoidListConservative} (plus anything unknown—confirm first with a trusted source).'],
      },
      {
        heading: 'Switching foods (5–7 day transition)',
        bullets: ['{transitionPlanDays}'],
      },
      {
        heading: 'Serving & storage notes',
        bullets: [
          'Portions vary by size, age, and activity—create a pet profile for tailored guidance.',
          'Storage guidance should match the recipe’s food form (fresh vs dry).',
          'Discard perishable leftovers that sit out too long.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I use Paws & Plates without signing up?',
        a: 'Yes—example meals can be viewed without signup. You’ll need a free account to save pets, save meals, and generate personalized plans.',
      },
      {
        q: 'Is this veterinary advice?',
        a: 'No. Paws & Plates provides educational meal planning tools. If your pet has a diagnosed medical condition or is on a prescription diet, consult a qualified animal health professional before changing diet.',
      },
      {
        q: 'How do portions work?',
        a: 'Portions vary by size, age, and activity. Create a pet profile for more tailored serving guidance.',
      },
    ],
  },

  birds: {
    metaTitle: 'What to Feed a {entityName}: Safe Foods & Routine | Paws & Plates',
    metaDescription:
      'Practical {entityName} feeding guide: safe staples, foods to avoid, dry vs fresh routines, and storage/leftover tips. See example meals on Paws & Plates.',
    h1: 'What to feed a {entityName}: safe foods, routine, and what to avoid',
    intro:
      'This guide gives you a practical way to answer “what should I feed a {entityName}?”—with a clear dry-vs-fresh routine, a simple schedule, and conservative safety notes.',
    sections: [
      {
        heading: 'Quick answer',
        bullets: [
          'Build a consistent dry routine, then add planned fresh variety.',
          'Serve fresh foods in small portions and remove leftovers promptly.',
          'Store dry foods cool, dry, airtight (avoid moisture).',
          'Use Paws & Plates for example meals and routine planning.',
        ],
      },
      {
        heading: 'Dry base vs fresh add-ons (why it matters)',
        bullets: [
          'Dry routine is the dependable baseline (pellets/mixes).',
          'Fresh add-ons are for variety (produce/chop-style).',
          'Storage and leftovers differ—don’t treat them the same.',
        ],
      },
      {
        heading: 'Foods to limit',
        bullets: ['Sugary treats and fruit-heavy routines.', 'Highly salted/seasoned human foods.', 'Big changes all at once.'],
      },
      {
        heading: 'Foods to avoid',
        bullets: ['{avoidListConservative} (plus anything unknown—confirm first with a trusted avian source).'],
      },
      {
        heading: 'Meal prep + storage (food-form aware)',
        bullets: [
          'Dry foods: airtight, cool, dry (not the fridge).',
          'Fresh chop: small batches; refrigerate briefly or freeze portions; remove leftovers.',
          'Paws & Plates storage guidance should match recipe type.',
        ],
      },
      {
        heading: 'FAQ',
        bullets: [
          'Can I use Paws & Plates without signing up?',
          'Should I refrigerate pellets/seed mixes?',
          'Is this veterinary advice?',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I use Paws & Plates without signing up?',
        a: 'Yes—example meals can be viewed without signup. You’ll need a free account to save pets, save meals, and generate personalized plans.',
      },
      {
        q: 'Should I refrigerate pellets or seed mixes?',
        a: 'Typically no—dry foods are best stored sealed, cool, and dry. Refrigeration can introduce moisture. Fresh produce mixes are different and may require refrigeration.',
      },
      {
        q: 'Is this veterinary advice?',
        a: 'No. Paws & Plates provides educational meal planning tools. If your bird has special needs, consult an avian veterinarian before making major changes.',
      },
    ],
  },

  reptiles: {
    metaTitle: '{entityName} Diet Guide: What to Feed & Simple Schedule | Paws & Plates',
    metaDescription:
      'Practical {entityName} diet guide: staple foods vs variety, a simple feeding framework, handling/storage tips, and common mistakes to avoid.',
    h1: '{entityName} diet: what to feed and how to build a simple routine',
    intro:
      'This guide helps you build a repeatable reptile feeding routine (staples + planned variety) without relying on rigid numbers that don’t generalize.',
    sections: [
      {
        heading: 'Quick answer',
        bullets: [
          'Use a weekly framework: staples + planned variety (not random feeding).',
          'Feeding frequency and staples vary by age and species—personalize slowly.',
          'Keep ingredients clean and safely handled; remove spoiled leftovers.',
          'Use Paws & Plates for example meals and routine planning.',
        ],
      },
      {
        heading: 'Staples vs variety',
        bullets: ['Staples are the consistent foundation you repeat.', 'Variety is planned rotation to reduce over-reliance on one food.'],
      },
      {
        heading: 'Foods to limit',
        bullets: ['Unknown wild plants or unidentified items.', 'Heavily processed human foods.', 'Frequent rapid changes.'],
      },
      {
        heading: 'Foods to avoid',
        bullets: ['{avoidListConservative} (plus anything spoiled/moldy or left out too long).'],
      },
      {
        heading: 'Handling + storage',
        bullets: ['Wash produce, store perishables properly, and avoid cross-contamination.', 'Remove leftovers promptly to prevent spoilage.'],
      },
      {
        heading: 'FAQ',
        bullets: ['Do you provide exact feeding schedules?', 'Can I use Paws & Plates without signing up?', 'Is this veterinary advice?'],
      },
    ],
    faq: [
      {
        q: 'Do you provide exact feeding schedules?',
        a: 'We focus on a simple, repeatable framework and examples. Exact frequency and portions depend on species, age, and your setup—use trusted care resources for specifics.',
      },
      {
        q: 'Can I use Paws & Plates without signing up?',
        a: 'Yes—example meals can be viewed without signup. You’ll need a free account to save pets, save meals, and generate personalized plans.',
      },
      {
        q: 'Is this veterinary advice?',
        a: 'No. Paws & Plates provides educational meal planning tools. Consult a veterinarian for medical concerns.',
      },
    ],
  },

  'pocket-pets': {
    metaTitle: 'What Should I Feed My {entityName}? Safe Foods & Routine | Paws & Plates',
    metaDescription:
      'Simple {entityName} feeding guide: safe foods, foods to limit/avoid, a repeatable routine, and meal-prep/storage tips. See examples on Paws & Plates.',
    h1: '{entityName} safe foods: what to feed, what to limit, and what to avoid',
    intro:
      'Pocket pets are underserved online. This guide gives you a consistent base routine, small planned variety, and conservative avoid/limit guardrails.',
    sections: [
      {
        heading: 'Quick answer',
        bullets: [
          'Keep a consistent base routine, then add small planned variety.',
          'Portions are small—avoid overfeeding treats.',
          'Store dry foods sealed and dry; remove fresh leftovers promptly.',
          'Use Paws & Plates for example meals and routine planning.',
        ],
      },
      {
        heading: 'Treats vs staples',
        bullets: ['Staples make up the routine; treats are planned and small.', 'Introduce new foods slowly so you can observe responses.'],
      },
      {
        heading: 'Foods to limit',
        bullets: ['Sugary treats and high-fat snacks.', 'Too many new foods at once.', 'Human processed foods (salty/seasoned).'],
      },
      {
        heading: 'Foods to avoid',
        bullets: ['{avoidListConservative} (plus anything spoiled/moldy or left out too long).'],
      },
      {
        heading: 'Meal prep + storage',
        bullets: ['Dry foods: airtight, cool, dry (avoid moisture).', 'Fresh foods: tiny portions; remove leftovers; refrigerate safely if prepping.'],
      },
      {
        heading: 'FAQ',
        bullets: ['Are treats okay?', 'Can I use Paws & Plates without signing up?', 'Is this veterinary advice?'],
      },
    ],
    faq: [
      {
        q: 'Are treats okay?',
        a: 'Yes in small amounts. The goal is a consistent base routine with planned variety, not frequent snack feeding.',
      },
      {
        q: 'Can I use Paws & Plates without signing up?',
        a: 'Yes—example meals can be viewed without signup. You’ll need a free account to save pets, save meals, and generate personalized plans.',
      },
      {
        q: 'Is this veterinary advice?',
        a: 'No. Paws & Plates provides educational meal planning tools. Consult a veterinarian for medical concerns.',
      },
    ],
  },
};
