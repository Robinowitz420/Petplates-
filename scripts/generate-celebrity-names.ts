// scripts/generate-celebrity-names.ts
// Generates 850 celebrity pet names + quotes using Claude API

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key-here'
});

interface CelebrityPet {
  name: string;
  quote: string;
  petType: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
}

// We already have 150, need 850 more
const EXISTING_COUNT = 150;
const TOTAL_NEEDED = 1000;
const TO_GENERATE = TOTAL_NEEDED - EXISTING_COUNT;

// Distribution by pet type
const DISTRIBUTION = {
  dog: 350,    // Dogs are most popular
  cat: 300,    // Cats second
  bird: 75,    // Birds less common
  reptile: 75, // Reptiles less common
  'pocket-pet': 50 // Smallest category
};

async function generateCelebrityBatch(
  petType: string,
  count: number,
  startIndex: number
): Promise<CelebrityPet[]> {

  const prompt = `Generate ${count} celebrity pet names for ${petType}s.

RULES:
1. Name must be a pun on a famous person/character
2. Must be funny but not offensive
3. Quote must be in-character, 1 sentence, about food/nutrition
4. Variety: mix historical figures, actors, musicians, fictional characters
5. Avoid duplicates

FORMAT (return ONLY valid JSON array):
[
  {
    "name": "Bark Obama",
    "quote": "Yes we can... eat healthy and nutritious meals!"
  },
  {
    "name": "Sherlock Bones",
    "quote": "Elementary, my dear Woofson - this meal is excellent!"
  }
]

Generate ${count} unique ${petType} celebrity names now.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    // Parse JSON response
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const celebrities = JSON.parse(jsonMatch[0]);

    // Add pet type to each
    return celebrities.map((c: any) => ({
      ...c,
      petType: petType
    }));

  } catch (error) {
    console.error(`Error generating ${petType} batch:`, error);
    return [];
  }
}

async function generateAllCelebrities(): Promise<CelebrityPet[]> {
  console.log('🎭 Generating 850 Celebrity Pet Names + Quotes...\n');

  const allCelebrities: CelebrityPet[] = [];
  let totalGenerated = 0;

  for (const [petType, count] of Object.entries(DISTRIBUTION)) {
    console.log(`\n📝 Generating ${count} ${petType} celebrities...`);

    // Generate in batches of 50 to avoid token limits
    const batchSize = 50;
    const batches = Math.ceil(count / batchSize);

    for (let i = 0; i < batches; i++) {
      const batchCount = Math.min(batchSize, count - (i * batchSize));
      const startIndex = totalGenerated + (i * batchSize);

      console.log(`  Batch ${i + 1}/${batches}: Generating ${batchCount} names...`);

      const batch = await generateCelebrityBatch(
        petType as any,
        batchCount,
        startIndex
      );

      allCelebrities.push(...batch);
      totalGenerated += batch.length;

      console.log(`  ✅ Generated ${batch.length} names (Total: ${totalGenerated}/${TO_GENERATE})`);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return allCelebrities;
}

async function main() {
  console.log('🚀 Celebrity Pet Name Generator\n');
  console.log(`Target: Generate ${TO_GENERATE} new celebrity pets`);
  console.log(`(We already have ${EXISTING_COUNT})\n`);

  // Generate all celebrities
  const celebrities = await generateAllCelebrities();

  console.log(`\n✅ Generated ${celebrities.length} celebrity pets!\n`);

  // Save to file
  const outputPath = path.join(process.cwd(), 'lib', 'data', 'generated-celebrities.ts');

  const fileContent = `// Generated Celebrity Pet Names
// Auto-generated on ${new Date().toISOString()}

export interface GeneratedCelebrity {
  name: string;
  quote: string;
  petType: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
}

export const generatedCelebrities: GeneratedCelebrity[] = ${JSON.stringify(celebrities, null, 2)};

// Statistics:
// Total: ${celebrities.length}
// Dogs: ${celebrities.filter(c => c.petType === 'dog').length}
// Cats: ${celebrities.filter(c => c.petType === 'cat').length}
// Birds: ${celebrities.filter(c => c.petType === 'bird').length}
// Reptiles: ${celebrities.filter(c => c.petType === 'reptile').length}
// Pocket Pets: ${celebrities.filter(c => c.petType === 'pocket-pet').length}
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');

  console.log(`📁 Saved to: ${outputPath}\n`);

  // Statistics
  console.log('📊 Final Statistics:');
  console.log(`   Total Generated: ${celebrities.length}`);
  console.log(`   Dogs: ${celebrities.filter(c => c.petType === 'dog').length}`);
  console.log(`   Cats: ${celebrities.filter(c => c.petType === 'cat').length}`);
  console.log(`   Birds: ${celebrities.filter(c => c.petType === 'bird').length}`);
  console.log(`   Reptiles: ${celebrities.filter(c => c.petType === 'reptile').length}`);
  console.log(`   Pocket Pets: ${celebrities.filter(c => c.petType === 'pocket-pet').length}`);

  console.log('\n💰 Cost Estimate: ~$5 in API calls');
  console.log('⏱️  Total Time: ~10-15 minutes\n');
  console.log('✅ Done! Use these in your recipes.');
}

// Alternative: Assign celebrities to recipes automatically
async function assignCelebritiesToRecipes() {
  console.log('\n🔗 Assigning celebrities to recipes...\n');

  // Load recipes
  const recipesPath = path.join(process.cwd(), 'lib', 'data', 'recipes-complete.ts');
  let recipesContent = fs.readFileSync(recipesPath, 'utf8');

  // Load generated celebrities
  const celebsPath = path.join(process.cwd(), 'lib', 'data', 'generated-celebrities.ts');
  const celebsContent = fs.readFileSync(celebsPath, 'utf8');

  // Parse celebrities (simplified)
  const celebMatch = celebsContent.match(/export const generatedCelebrities.*?=.*?(\[[\s\S]*?\]);/);
  if (!celebMatch) {
    console.error('Could not parse celebrities');
    return;
  }

  const celebrities = JSON.parse(celebMatch[1]);

  // Group by pet type
  const celebsByType: Record<string, CelebrityPet[]> = {
    dogs: celebrities.filter((c: CelebrityPet) => c.petType === 'dog'),
    cats: celebrities.filter((c: CelebrityPet) => c.petType === 'cat'),
    birds: celebrities.filter((c: CelebrityPet) => c.petType === 'bird'),
    reptiles: celebrities.filter((c: CelebrityPet) => c.petType === 'reptile'),
    'pocket-pets': celebrities.filter((c: CelebrityPet) => c.petType === 'pocket-pet')
  };

  // Find recipes and add celebrities
  let recipeCount = 0;
  recipesContent = recipesContent.replace(
    /createRecipe\(\{([^}]+category:\s*['"](\w+)['"][^}]*)\}/g,
    (match, recipeContent, category) => {
      const celebPool = celebsByType[category] || [];
      if (celebPool.length === 0) return match;

      // Pick a random celebrity (or sequential)
      const celeb = celebPool[recipeCount % celebPool.length];
      recipeCount++;

      // Check if already has celebrity
      if (match.includes('celebrityName')) return match;

      // Add celebrity fields
      const withCeleb = match.replace(
        /\}$/,
        `,\n  celebrityName: '${celeb.name}',\n  celebrityQuote: '${celeb.quote}'\n}`
      );

      return withCeleb;
    }
  );

  // Save updated recipes
  fs.writeFileSync(recipesPath, recipesContent, 'utf8');

  console.log(`✅ Added celebrities to ${recipeCount} recipes`);
  console.log('📁 Updated: lib/data/recipes-complete.ts\n');
}

// Run it
main()
  .then(() => {
    console.log('\n🎉 Generation complete!');
    console.log('\nNext steps:');
    console.log('1. Review generated-celebrities.ts');
    console.log('2. Run: npm run assign-celebrities (assigns to recipes)');
    console.log('3. Restart dev server\n');
  })
  .catch(console.error);

export { generateAllCelebrities, assignCelebritiesToRecipes };