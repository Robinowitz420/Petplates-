export type HealthConcernDef = {
  value: string;
  label: string;
  short: string;         // one-liner for badges
  long: string;          // 2-4 sentence explainer for education panels
  recommendedIngredients: { name: string; why: string }[];
  recommendedProducts?: { title: string; affiliateUrl?: string }[]; // first-pass affiliate suggestions
};

const healthConcerns: HealthConcernDef[] = [
  {
    value: 'kidney-disease',
    label: 'Kidney Disease',
    short: 'Low phosphorus, increased moisture',
    long:
      'Kidney disease increases phosphorus burden and reduces the ability to concentrate urine. Dietary changes focus on lowering phosphorus, moderating protein, and increasing moisture to reduce renal workload.',
    recommendedIngredients: [
      { name: 'White fish (cod)', why: 'Lower phosphorus, lean protein source' },
      { name: 'Pumpkin', why: 'Digestive fiber and moisture' },
      { name: 'Potato / rice', why: 'Lower phosphorus carbohydrates' }
    ],
    recommendedProducts: [
      { title: 'Low Phosphorus Supplement (example)', affiliateUrl: 'https://www.amazon.com/s?k=low+phosphorus+dog&tag=robinfrench-20' }
    ]
  },

  {
    value: 'heart-disease',
    label: 'Heart Disease',
    short: 'Moderate sodium, lean protein',
    long:
      'Heart disease management often includes sodium moderation and controlled calories to prevent fluid retention and obesity. Ingredients should favor lean proteins, omega-3s, and high-quality fiber.',
    recommendedIngredients: [
      { name: 'White fish', why: 'Lean protein, lower sodium potential' },
      { name: 'Oats', why: 'Soluble fiber supports cholesterol balance' },
      { name: 'Fish oil', why: 'Omega-3 for anti-inflammatory / cardiac support' }
    ],
    recommendedProducts: [
      { title: 'Fish Oil (example)', affiliateUrl: 'https://www.amazon.com/s?k=dog+fish+oil&tag=robinfrench-20' }
    ]
  },

  {
    value: 'diabetes',
    label: 'Diabetes',
    short: 'Low glycemic, consistent carbs',
    long:
      'Diabetic management emphasizes consistent carbohydrate sources, low glycemic carbs, appropriate protein, and portion control to stabilize blood sugar. High-fiber, low-sugar ingredients are prioritized.',
    recommendedIngredients: [
      { name: 'Sweet potato (in moderation)', why: 'Lower glycemic than some carbs' },
      { name: 'Green beans', why: 'Low-calorie fiber to add bulk' },
      { name: 'Lean poultry', why: 'Stable protein source' }
    ],
    recommendedProducts: [
      { title: 'Gluco-support supplement (example)', affiliateUrl: 'https://www.amazon.com/s?k=dog+glucose+support&tag=robinfrench-20' }
    ]
  },

  {
    value: 'allergies',
    label: 'Food Allergies',
    short: 'Novel proteins & limited ingredients',
    long:
      'Food allergies are often triggered by common proteins (chicken, beef) or certain grains. Management uses novel proteins and limited-ingredient recipes to reduce immune triggers.',
    recommendedIngredients: [
      { name: 'Venison or rabbit', why: 'Novel protein less likely to trigger allergy' },
      { name: 'Sweet potato', why: 'Limited-ingredient carb' },
      { name: 'Quinoa', why: 'Alternative carbohydrate for some pets' }
    ],
    recommendedProducts: [
      { title: 'Hydrolyzed protein topper (example)', affiliateUrl: 'https://www.amazon.com/s?k=hydrolyzed+protein+dog&tag=robinfrench-20' }
    ]
  },

  {
    value: 'obesity',
    label: 'Weight Management/Obesity',
    short: 'Calorie control & high satiety',
    long:
      'Weight management requires calorie control, increased activity, and ingredients that increase satiety (fiber, lean protein). Small portion adjustments and tracking matter most.',
    recommendedIngredients: [
      { name: 'Lean turkey', why: 'High protein, lower fat' },
      { name: 'Pumpkin', why: 'Fiber for satiety' },
      { name: 'Green beans', why: 'Low-calorie bulk' }
    ],
    recommendedProducts: [
      { title: 'Weight management supplement (example)', affiliateUrl: 'https://www.amazon.com/s?k=dog+weight+management&tag=robinfrench-20' }
    ]
  },

  {
    value: 'pancreatitis',
    label: 'Pancreatitis',
    short: 'Low fat, highly digestible',
    long:
      'Pancreatitis is worsened by high-fat diets. Safe recipes prioritize low-fat proteins, avoid fatty organ meats, and use easily digestible carbs to reduce pancreatic stress.',
    recommendedIngredients: [
      { name: 'White fish (cod)', why: 'Low fat protein source' },
      { name: 'Rice', why: 'Easily digestible carbohydrate' },
      { name: 'Boiled potato', why: 'Gentle on digestion' }
    ],
    recommendedProducts: [
      { title: 'Low-fat dog food topper (example)', affiliateUrl: 'https://www.amazon.com/s?k=low+fat+dog+topper&tag=robinfrench-20' }
    ]
  },

  {
    value: 'digestive-issues',
    label: 'Digestive Issues',
    short: 'Soothing fiber & probiotics',
    long:
      'Digestive upset benefits from soluble fiber, hydration, and probiotic support. Gentle carbohydrates and short ingredient lists can reduce gastrointestinal irritation.',
    recommendedIngredients: [
      { name: 'Pumpkin', why: 'Digestive fiber, soothes stool consistency' },
      { name: 'Rice', why: 'Gentle carbohydrate' },
      { name: 'Probiotic powder', why: 'Restores healthy gut flora' }
    ],
    recommendedProducts: [
      { title: 'Probiotic for dogs (example)', affiliateUrl: 'https://www.amazon.com/s?k=dog+probiotic&tag=robinfrench-20' }
    ]
  },

  {
    value: 'joint-health',
    label: 'Joint Problems/Arthritis',
    short: 'Omega-3s & joint support',
    long:
      'Joint support focuses on omega-3 fatty acids, glucosamine, and chondroitin to reduce inflammation and support cartilage. High omega-3 inclusion and targeted supplements help mobility.',
    recommendedIngredients: [
      { name: 'Salmon', why: 'Omega-3 source for inflammation control' },
      { name: 'Ground flaxseed', why: 'Plant-sourced omega-3' },
      { name: 'Sweet potato', why: 'Good carbohydrate + antioxidant support' }
    ],
    recommendedProducts: [
      { title: 'Glucosamine & chondroitin (example)', affiliateUrl: 'https://www.amazon.com/s?k=glucosamine+dog&tag=robinfrench-20' }
    ]
  },

  {
    value: 'dental-issues',
    label: 'Dental Issues',
    short: 'Crunchy textures & cleaning support',
    long:
      'Dental health is supported by crunchy textures that mechanically clean teeth and by supplements that reduce plaque. Avoid sticky, sugary ingredients that adhere to teeth.',
    recommendedIngredients: [
      { name: 'Carrot (raw pieces)', why: 'Crunchy texture helps cleaning' },
      { name: 'Dental chews (as recommended)', why: 'Designed for plaque control' }
    ],
    recommendedProducts: [
      { title: 'Dental chew (example)', affiliateUrl: 'https://www.amazon.com/s?k=dental+chew+dog&tag=robinfrench-20' }
    ]
  },

  {
    value: 'hip-dysplasia',
    label: 'Hip Dysplasia',
    short: 'Joint support & weight control',
    long:
      'Hip dysplasia management pairs weight control with joint support supplements. Lower body weight reduces joint load while omega-3 and joint supplements help tissue health.',
    recommendedIngredients: [
      { name: 'Lean turkey', why: 'Lean protein for weight control' },
      { name: 'Salmon (for omega-3s)', why: 'Reduce inflammation' }
    ],
    recommendedProducts: [
      { title: 'Joint supplement (example)', affiliateUrl: 'https://www.amazon.com/s?k=joint+supplement+dog&tag=robinfrench-20' }
    ]
  },

  {
    value: 'skin-conditions',
    label: 'Skin Conditions',
    short: 'Omega-3s & hypoallergenic options',
    long:
      'Skin issues respond well to omega-3 fatty acids, limited-ingredient diets, and elimination of suspected triggers. Topical care plus dietary steps improves the skin barrier over time.',
    recommendedIngredients: [
      { name: 'Salmon oil', why: 'Omega-3 support for skin' },
      { name: 'Limited-ingredient protein (rabbit/venison)', why: 'Reduce triggers' }
    ],
    recommendedProducts: [
      { title: 'Omega-3 supplement (example)', affiliateUrl: 'https://www.amazon.com/s?k=omega+3+dog&tag=robinfrench-20' }
    ]
  }
];

export default healthConcerns;