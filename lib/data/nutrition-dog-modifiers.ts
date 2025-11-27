export const dogModifiers = {
  allergies: {
    add: [
      {
        name: "Novel Proteins (Duck, Venison, Lamb)",
        benefit: "Lower antigen exposure reduces allergy flare-ups",
        amazon: "https://www.amazon.com/s?k=duck+dog+food"
      },
      {
        name: "Omega-3 Fish Oil",
        benefit: "Improves skin barrier function, reduces itching",
        amazon: "https://www.amazon.com/s?k=omega+3+fish+oil+for+dogs"
      }
    ],
    avoid: [
      "Chicken",
      "Dairy",
      "Wheat",
      "Soy",
      "Artificial colors"
    ],
    scoreBoost: 25 // % buff to recipe rating if supportive
  },

  gi_issues: {
    add: [
      {
        name: "Pumpkin Purée",
        benefit: "Soluble fiber stabilizes digestion",
        amazon: "https://www.amazon.com/s?k=pumpkin+puree+for+dogs"
      },
      {
        name: "Probiotic Supplement",
        benefit: "Restores healthy gut microbiome",
        amazon: "https://www.amazon.com/s?k=probiotic+supplement+for+dogs"
      },
      {
        name: "White Rice",
        benefit: "Highly digestible carbohydrate source",
        amazon: "https://www.amazon.com/s?k=white+rice+for+dogs"
      }
    ],
    avoid: [
      "High-fat meats",
      "Spicy ingredients",
      "Excess vegetables causing gas (broccoli, cauliflower)"
    ],
    scoreBoost: 20
  },

  joint_issues: {
    add: [
      {
        name: "Green Lipped Mussel",
        benefit: "Chondroprotective + anti-inflammatory",
        amazon: "https://www.amazon.com/s?k=green+lipped+mussel+supplement+for+dogs"
      },
      {
        name: "Glucosamine & Chondroitin",
        benefit: "Slows cartilage breakdown",
        amazon: "https://www.amazon.com/s?k=glucosamine+chondroitin+for+dogs"
      },
      {
        name: "Turmeric (Curcumin)",
        benefit: "Supports reduced inflammation",
        amazon: "https://www.amazon.com/s?k=turmeric+curcumin+for+dogs"
      }
    ],
    avoid: [
      "Calorie-dense starchy fillers",
      "Excess phosphorus (cheap organ meat overload)"
    ],
    scoreBoost: 15
  },

  weight_management: {
    add: [
      {
        name: "Lean Protein",
        benefit: "Preserves muscle while reducing calories",
        amazon: "https://www.amazon.com/s?k=lean+protein+dog+food"
      },
      {
        name: "Low-cal Veggies (Zucchini, Green Beans)",
        benefit: "Satiety without calorie load",
        amazon: "https://www.amazon.com/s?k=zucchini+for+dogs"
      }
    ],
    avoid: [
      "Added fats",
      "Cheese",
      "Peanut butter",
      "High-carb kibble mixers"
    ],
    scoreBoost: 10
  },

  kidney_support: {
    add: [
      {
        name: "Low-Phosphorus Dog Food",
        benefit: "Reduces kidney workload",
        amazon: "https://www.amazon.com/s?k=low+phosphorus+dog+food"
      },
      {
        name: "Omega-3 Fish Oil",
        benefit: "Reduces kidney inflammation",
        amazon: "https://www.amazon.com/s?k=omega+3+fish+oil+for+dogs"
      }
    ],
    avoid: [
      "High-phosphorus ingredients",
      "Excess protein",
      "Dehydrating kibble"
    ],
    scoreBoost: 20
  },

  skin_coat: {
    add: [
      {
        name: "Omega-3 Fatty Acids",
        benefit: "Improves skin health and coat quality",
        amazon: "https://www.amazon.com/s?k=omega+3+supplement+for+dogs"
      },
      {
        name: "Biotin Supplement",
        benefit: "Strengthens skin and fur",
        amazon: "https://www.amazon.com/s?k=biotin+for+dogs"
      }
    ],
    avoid: [
      "Excessive grains",
      "Artificial preservatives"
    ],
    scoreBoost: 12
  },

  dental: {
    add: [
      {
        name: "Dental Chews",
        benefit: "Helps clean teeth and freshen breath",
        amazon: "https://www.amazon.com/s?k=dental+chews+for+dogs"
      },
      {
        name: "Enzyme Dental Supplements",
        benefit: "Reduces plaque buildup",
        amazon: "https://www.amazon.com/s?k=dental+enzyme+supplement+for+dogs"
      }
    ],
    avoid: [
      "Sugary treats",
      "Hard bones that can crack teeth"
    ],
    scoreBoost: 8
  }
};