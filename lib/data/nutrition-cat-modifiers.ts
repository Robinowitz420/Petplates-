export const catModifiers = {
  kidney_support: {
    add: [
      {
        name: "Omega-3 Fish Oil (EPA/DHA)",
        benefit:
          "Reduces kidney inflammation and slows progression of CKD",
        amazon: "https://www.amazon.com/Zesty-Paws-Omega-Salmon-Supplement/dp/B07P8Z8Z8Z"
      },
      {
        name: "Low-Phosphorus Protein Sources (Rabbit, Egg Whites)",
        benefit:
          "Low renal load improves longevity in kidney disease cats",
        amazon: "https://www.amazon.com/Stella-Schmitt-Freeze-Dried-Rabbit/dp/B08L9Q8Z8Z"
      },
      {
        name: "Hydration Enhancers (Bone Broth)",
        benefit:
          "Improves urine dilution and reduces toxin buildup",
        amazon: "https://www.amazon.com/Open-Farm-Chicken-Free-Surface/dp/B08L9Q8Z8Z"
      }
    ],
    avoid: [
      "High-phosphorus organ meats (liver, kidney)",
      "High-sodium ingredients",
      "Dehydrating kibble-only meals"
    ],
    scoreBoost: 25
  },

  urinary_health: {
    add: [
      {
        name: "DL-Methionine",
        benefit:
          "Maintains acidic urine pH to prevent struvite crystals",
        amazon: "https://www.amazon.com/Vetoquinol-Enzymatic-Tablets-Count-Pack/dp/B004Y4Z4Z4"
      },
      {
        name: "Cranberry Extract (D-Mannose)",
        benefit:
          "Prevents bacterial adhesion and UTIs",
        amazon: "https://www.amazon.com/Nutramax-Cosequin-Cranberry-Supplement-Capsules/dp/B07P8Z8Z8Z"
      },
      {
        name: "Wet Food / Hydration Boosters",
        benefit: "Flushes bladder and prevents stone formation",
        amazon: "https://www.amazon.com/Royal-Canin-Veterinary-Diet-Feline/dp/B004Y4Z4Z4"
      }
    ],
    avoid: [
      "High-magnesium ingredients (peas, legumes)",
      "Dehydrating kibble-only diets",
      "Over-supplemented fish meals"
    ],
    scoreBoost: 20
  },

  diabetes: {
    add: [
      {
        name: "High-Protein, Low-Carb Meat Sources",
        benefit:
          "Stabilizes insulin response and reduces glucose spikes",
        amazon: "https://www.amazon.com/Royal-Canin-Veterinary-Diet-Glycemic/dp/B004Y4Z4Z4"
      },
      {
        name: "Fiber (Pumpkin, Psyllium)",
        benefit:
          "Improves glycemic control and stool regularity",
        amazon: "https://www.amazon.com/Zesty-Paws-Probiotic-Prebiotic-Supplement/dp/B07P8Z8Z8Z"
      }
    ],
    avoid: [
      "Any carbs > 10% dry matter",
      "Sugars, syrups, sweet potatoes",
      "Grain fillers (corn, rice, wheat)"
    ],
    scoreBoost: 15
  },

  allergies: {
    add: [
      {
        name: "Novel Proteins (Duck, Venison)",
        benefit:
          "Reduces skin flare-ups from food allergies",
        amazon: "https://www.amazon.com/Stella-Schmitt-Freeze-Dried-Duck/dp/B08L9Q8Z8Z"
      }
    ],
    avoid: ["Chicken", "Beef", "Fish"],
    scoreBoost: 10
  },

  hairball: {
    add: [
      {
        name: "Hairball Control Supplements",
        benefit: "Helps cats pass hairballs naturally",
        amazon: "https://www.amazon.com/Hartz-Hairball-Control-Tablets-Count/dp/B004Y4Z4Z4"
      },
      {
        name: "Psyllium Husk Fiber",
        benefit: "Promotes healthy digestion and hair passage",
        amazon: "https://www.amazon.com/Zesty-Paws-Probiotic-Prebiotic-Supplement/dp/B07P8Z8Z8Z"
      }
    ],
    avoid: [
      "Excessive fiber that causes diarrhea",
      "Low-quality fillers"
    ],
    scoreBoost: 12
  },

  joint_health: {
    add: [
      {
        name: "Glucosamine for Cats",
        benefit: "Supports joint health and mobility",
        amazon: "https://www.amazon.com/s?k=glucosamine+for+cats"
      },
      {
        name: "Omega-3 Fatty Acids",
        benefit: "Reduces joint inflammation",
        amazon: "https://www.amazon.com/s?k=omega+3+for+cats"
      }
    ],
    avoid: [
      "Excessive calcium supplements",
      "Over-supplementation"
    ],
    scoreBoost: 15
  }
};