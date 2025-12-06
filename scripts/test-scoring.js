// Quick test script to verify scoring logic
// Run with: node scripts/test-scoring.js

const testRecipe = {
  id: "test-1",
  name: "Joint Support Chicken Stew",
  category: "dogs",
  healthConcerns: ["joint-health", "arthritis"],
  ageGroup: ["adult", "senior"],
  ingredients: [{ name: "chicken" }, { name: "turmeric" }],
  nutritionalInfo: { protein: "High" },
  tags: ["low-calorie", "anti-inflammatory"]
};

const testPet = {
  type: "dogs",
  age: "senior",
  breed: "Labrador",
  healthConcerns: ["Arthritis/joint pain", "Obesity/weight management"],
  allergies: [],
  weightKg: 25
};

console.log("🧪 Testing Recipe Scoring");
console.log("Recipe:", testRecipe.name);
console.log("Pet:", {
  type: testPet.type,
  age: testPet.age,
  healthConcerns: testPet.healthConcerns
});

// Simulate the scoring logic
let score = 40; // Base score
console.log("\n📊 Scoring Breakdown:");
console.log(`Base score: ${score}`);

// Age match
if (testRecipe.ageGroup && testPet.age && testRecipe.ageGroup.includes(testPet.age)) {
  score += 10;
  console.log(`+10 Age match (${testPet.age})`);
}

// Health concerns
const petConcerns = (testPet.healthConcerns || []).map(c => c.toLowerCase().trim());
const recipeConcerns = (testRecipe.healthConcerns || []).map(c => c.toLowerCase().trim());

console.log("\n💊 Health Concerns:");
console.log("Pet concerns:", petConcerns);
console.log("Recipe concerns:", recipeConcerns);

let healthMatchScore = 0;
if (petConcerns.length > 0) {
  petConcerns.forEach(concern => {
    // Normalize
    const normalized = concern.replace(/[^a-z0-9]+/g, '-').toLowerCase();
    console.log(`  Checking "${concern}" -> normalized: "${normalized}"`);
    
    const hasMatch = recipeConcerns.some(rc => {
      const match = rc.includes(normalized) || normalized.includes(rc) || rc === normalized;
      if (match) console.log(`    ✓ Matches "${rc}"`);
      return match;
    });
    
    if (hasMatch) {
      healthMatchScore += 12;
      console.log(`    +12 for match`);
    } else {
      score -= 3;
      console.log(`    -3 no match`);
    }
  });
  
  score += Math.min(healthMatchScore, 30);
  console.log(`\nHealth bonus: ${Math.min(healthMatchScore, 30)}`);
}

// Nutrition
if (testRecipe.nutritionalInfo) {
  score += 8;
  console.log(`+8 Nutrition info present`);
}

// Random variation
const randomVariation = Math.random() * 4 - 2;
score = Math.max(20, Math.min(100, score + randomVariation));

console.log(`\n🎯 Final Score: ${Math.round(score)}%`);
console.log(`Expected range: 50-70% (with health matches)`);

