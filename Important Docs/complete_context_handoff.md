# 🐾 PetPlates - Complete Project Context

**For AI Assistants Taking Over This Project**

---

## 🎯 **WHAT IS PETPLATES?**

A personalized pet meal planning platform that recommends homemade recipes based on:
- Pet type (dogs, cats, birds, reptiles, pocket-pets)
- Age (baby, young, adult, senior)
- Health concerns (kidney disease, allergies, etc.)
- Dietary restrictions
- Breed-specific needs

**Core Value:** Like a veterinary nutritionist in your pocket - tells owners EXACTLY what to cook for their specific pet's health needs.

---

## 🏗️ **ARCHITECTURE**

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Clerk (Google OAuth)
- **Data Storage:** localStorage (will migrate to Firebase/Supabase)
- **Deployment:** Vercel (planned)

### Key Design Decisions
1. **No database yet** - All recipe data in TypeScript files
2. **localStorage for pets** - User pet profiles stored client-side
3. **Client-side rating** - Compatibility calculated in browser
4. **Static recipe data** - 1000+ recipes as TypeScript objects

---

## 🧠 **CORE CONCEPT: COMPATIBILITY RATING**

**Problem:** Generic pet food doesn't account for individual health needs.

**Solution:** Rate each recipe 0-100% for each specific pet.

**Example:**
- Recipe: "Chicken & Rice Bowl"
- Pet: Senior cat with kidney disease
- Rating: 85% (Excellent)
- Why: Low phosphorus, bland diet, age-appropriate

**Another Example:**
- Recipe: "Beef & Liver Stew"
- Same Pet: Senior cat with kidney disease
- Rating: 42% (Poor)
- Why: Liver has HIGH phosphorus - dangerous for kidneys
- Warning: "⚠️ Contains organ meats - not recommended for kidney disease"

---

## 📊 **HOW RATING WORKS**

### 5 Factors (Weighted)

**1. Pet Type Match (25%)**
- Recipe for cats? Pet is cat? → 100%
- Recipe for dogs? Pet is cat? → 0%

**2. Age Appropriate (15%)**
- Puppy recipes have high protein/calcium for growth
- Senior recipes have lower phosphorus for kidney health
- Adult recipes are general maintenance

**3. Nutritional Fit (25%)**
- Analyzes protein %, fat %, phosphorus mg
- Compares to ideal ranges for pet type
- Example: Cats need 35% protein, dogs need 28%

**4. Health Compatibility (25%)**
- Kidney disease → penalize high phosphorus recipes
- Digestive issues → bonus for chicken + rice
- Pancreatitis → penalize high fat
- Joint health → bonus for salmon/omega-3

**5. Allergen Safety (10%)**
- Pet allergic to chicken? Recipe has chicken? → 0%
- No allergen conflicts? → 100%

**Math:** `(100×0.25) + (75×0.15) + (85×0.25) + (60×0.25) + (100×0.10) = 82%`

---

## 🗃️ **DATA MODELS**

### Pet Profile
```typescript
{
  id: 'pet_abc123',
  name: 'Fluffy',
  type: 'cats',
  breed: 'Persian',
  age: 10,
  weight: 12,
  activityLevel: 'moderate',
  healthConcerns: ['kidney-disease', 'dental'],
  dietaryRestrictions: ['no-chicken'],
  mealPlan: ['cat-11', 'cat-23'] // Array of saved recipe IDs
}
```

### Recipe
```typescript
{
  id: 'cat-11',
  name: 'Salmon & Sweet Potato',
  category: 'cats',
  ageGroup: ['adult', 'senior'],
  healthConcerns: ['joint-health', 'skin-conditions'], // What it HELPS with
  notSuitableFor: ['pancreatitis'], // What it's BAD for
  ingredients: [
    { name: 'Salmon', amount: '200g' },
    { name: 'Sweet potato', amount: '100g' }
  ],
  nutrition: {
    protein_g: 32,
    fat_g: 14,
    phosphorus_mg: 180,
    calories: 320
  }
}
```

### Rating Result
```typescript
{
  overallScore: 85,
  compatibility: 'excellent',
  breakdown: {
    petTypeMatch: { score: 100, reason: 'Perfect for cats' },
    ageAppropriate: { score: 100, reason: 'Great for seniors' },
    nutritionalFit: { score: 90, reason: 'High protein' },
    healthCompatibility: { score: 80, reason: 'Supports joint health' },
    allergenSafety: { score: 100, reason: 'No allergens detected' }
  },
  warnings: ['High fat - not for pancreatitis'],
  strengths: ['Excellent for joint health', 'Low phosphorus'],
  recommendations: ['Monitor portion sizes']
}
```

---

## 🔄 **USER FLOW**

### 1. Sign Up / Login (Clerk)
- Google OAuth
- Creates user session
- Redirects to homepage

### 2. Add Pet Profile
- Select type (dog, cat, bird, etc.)
- Choose breed from dropdown
- Set age (number or dropdown)
- Check health concerns (multi-select)
- Add dietary restrictions
- Save to localStorage: `pets_${userId}`

### 3. Browse Recipes
**Option A: View All Recipes** (`/recipes`)
- Shows all 1000+ recipes
- Filter by category
- Search by name

**Option B: Category Page** (`/category/cats`)
- Filter by breed
- Filter by age group
- Filter by health concern
- Shows matching recipes

**Option C: Recommended for Pet** (`/recipes/recommended/[petId]`)
- Automatically filtered for that pet
- Sorted by compatibility score
- Shows 20+ best matches

### 4. View Recipe Details (`/recipe/[id]`)
- Full ingredient list with nutrition
- Step-by-step instructions
- **Compatibility score for selected pet**
- Warnings if dangerous
- "Save to [Pet Name]'s meal plan" button

### 5. Manage Meal Plans (`/profile`)
- View all pets
- See saved recipes per pet
- Generate weekly meal plan (planned feature)
- Download shopping list (planned)

---

## 🏥 **HEALTH CONCERN RULES** (Veterinary Research-Based)

### Kidney Disease (CKD)
**Most Important Dietary Factor**

**Key Restriction:** Phosphorus < 150mg per serving

**Why:** Damaged kidneys can't filter phosphorus → builds up in blood → causes bone disease, further kidney damage

**Good Foods:**
- Chicken breast (low phosphorus)
- White rice
- Egg whites
- White fish

**Bad Foods:**
- Liver (350+ mg phosphorus per serving)
- Kidney, organ meats
- Dairy products
- Whole eggs

**Code Logic:**
```typescript
if (recipe.ingredients.includes('liver')) {
  notSuitableFor.push('kidney-disease');
  healthScore -= 40;
}
```

---

### Digestive Issues / Sensitive Stomach
**Veterinary "Bland Diet" Protocol**

**Key Indicator:** Chicken + rice

**Why:** Easily digested, low-fat, gentle on stomach, proven in veterinary medicine for GI upset

**Good Foods:**
- Boiled chicken
- White rice
- Pumpkin (soluble fiber)
- Sweet potato
- Low-fat

**Bad Foods:**
- High-fat foods
- Spicy ingredients
- Raw vegetables
- Artificial additives

**Code Logic:**
```typescript
if (recipe.name.includes('chicken') && recipe.name.includes('rice')) {
  healthConcerns.push('digestive-issues');
  healthScore += 25;
}
```

---

### Pancreatitis
**CRITICAL Fat Restriction**

**Key Restriction:** Fat < 10% (STRICTLY)

**Why:** Fat triggers pancreas inflammation → pain, vomiting, life-threatening

**Good Foods:**
- Skinless chicken breast
- Turkey breast
- White fish
- Rice, sweet potato

**Bad Foods:**
- Salmon (even though healthy for other conditions)
- Any fatty meat
- Beef
- Oils

**Code Logic:**
```typescript
if (nutrition.fat > 12) {
  notSuitableFor.push('pancreatitis');
  warnings.push('High fat - dangerous for pancreatitis');
}
```

---

### Joint Health / Arthritis
**Focus on Anti-Inflammatory Omega-3**

**Key Nutrient:** Omega-3 fatty acids (EPA/DHA)

**Why:** Reduces inflammation in joints, proven to help arthritis pain

**Good Foods:**
- Salmon
- Fish oil
- Sardines
- Mackerel

**Bad Foods:** (None specific, but maintain healthy weight)

**Code Logic:**
```typescript
if (recipe.ingredients.includes('salmon') || 
    recipe.ingredients.includes('fish oil')) {
  healthConcerns.push('joint-health');
  healthScore += 20;
}
```

---

### Allergies
**Novel Proteins + Elimination**

**Key Strategy:** Avoid common allergens, use novel proteins

**Common Allergens:**
- Chicken (most common)
- Beef
- Dairy
- Wheat
- Soy

**Novel Proteins (Safer):**
- Rabbit
- Duck
- Venison
- Bison
- Fish (sometimes)

**Code Logic:**
```typescript
if (recipe.ingredients.includes('rabbit') || 
    recipe.ingredients.includes('duck')) {
  healthConcerns.push('allergies');
  strengths.push('Novel protein - hypoallergenic');
}
```

---

### Weight Management / Obesity
**Calorie Deficit + Satiety**

**Key Factors:**
- Low fat (<12%)
- High fiber (>3%) for fullness
- High protein (maintains muscle)
- Lower calories overall

**Good Foods:**
- Lean chicken/turkey
- Vegetables (green beans, carrots)
- Pumpkin
- Low-fat formulas

**Code Logic:**
```typescript
if (recipe.tags.includes('low-fat') || 
    recipe.tags.includes('lean')) {
  healthConcerns.push('obesity');
}
```

---

### Dental Issues
**Soft Texture + No Sugar**

**Key Factors:**
- Soft foods (if chewing painful)
- No sugar
- Wet/canned format

**Good Foods:**
- Stews
- Soft cooked meats
- Well-cooked vegetables

**Bad Foods:**
- Hard kibble (if painful)
- Bones
- Hard treats
- Sugar

---

### Heart Disease
**Sodium Restriction**

**Key Restriction:** Sodium < 80mg per 100g

**Why:** High sodium increases blood pressure → strains heart

**Good Foods:**
- Unsalted meats
- Low-sodium recipes
- Fresh ingredients

**Bad Foods:**
- Cured meats
- High-sodium broths
- Processed foods
- Added salt

---

### Diabetes
**Carb Control + Fiber**

**Key Factors:**
- Low carbohydrates
- High fiber (slows glucose absorption)
- High protein
- Consistent meals

**Good Foods:**
- Lean meats
- Low-glycemic vegetables
- Minimal grains

**Bad Foods:**
- White rice (high glycemic)
- Sugars
- Simple carbs
- Corn syrup

---

### Skin Conditions
**Omega-3 + Quality Protein**

**Key Nutrients:**
- Omega-3 (anti-inflammatory)
- Quality protein
- Vitamins A & E

**Good Foods:**
- Salmon
- Fish oil
- High-quality protein sources

**Bad Foods:**
- Artificial colors
- Chemical preservatives

---

## 🎨 **CURRENT HEALTH CONCERNS IN SYSTEM**

**Implemented:**
1. Weight Management ✅
2. Allergies ✅
3. Joint Health ✅
4. Digestive Issues ✅
5. Kidney Disease ✅
6. Dental Health ✅

**Need to Add:**
7. Pancreatitis ⚠️ (CRITICAL)
8. Heart Disease
9. Diabetes
10. Skin Conditions

---

## 📁 **KEY FILES TO UNDERSTAND**

### 1. Pet Rating Engine
**File:** `lib/utils/petRatingSystem.ts`

**Main Function:**
```typescript
rateRecipeForPet(recipe: Recipe, pet: Pet): CompatibilityRating
```

**What it does:**
- Takes recipe + pet data
- Calculates 5-factor weighted score
- Returns 0-100% rating + detailed breakdown
- Generates warnings, strengths, recommendations

---

### 2. Recipe Database
**File:** `lib/data/recipes-complete.ts`

**Structure:**
- 1000+ recipe objects
- Each has ingredients, nutrition, tags
- **Problem:** Most missing `healthConcerns` tags
- **Solution:** Auto-tag script adds them

---

### 3. Pet Profiles
**File:** `app/profile/page.tsx`

**Manages:**
- Add/edit/delete pets
- localStorage persistence
- Pet list display
- Links to meal plans

---

### 4. Recipe Detail Page
**File:** `app/recipe/[id]/page.tsx`

**Shows:**
- Full recipe details
- Compatibility rating (if pet selected)
- Warnings/strengths/recommendations
- "Save to meal plan" button
- Ingredient nutrition breakdown

---

### 5. Auto-Tag Script
**File:** `scripts/auto-tag-recipes.ts`

**Purpose:** Bulk add health tags to all recipes

**Logic:**
- Reads recipe name + ingredients
- Detects patterns (chicken+rice, salmon, liver, etc.)
- Adds `healthConcerns: ['digestive-issues']`
- Adds `notSuitableFor: ['kidney-disease']`
- Saves back to recipes file

---

## 🔴 **CURRENT PROBLEM**

**Issue:** All recipes showing 74% compatibility (same score)

**Root Cause:** Recipes missing `healthConcerns` tags

**Why This Breaks Rating:**
- Pet has kidney disease
- Recipe has liver (high phosphorus)
- But recipe doesn't have `notSuitableFor: ['kidney-disease']` tag
- So system doesn't know to penalize it
- Result: Generic score based only on pet type/age

**Fix:** Run auto-tag script to add tags

**After Fix:**
- Liver recipe gets `notSuitableFor: ['kidney-disease']`
- System penalizes it -40 points
- Pet with kidney disease sees 42% (Poor) instead of 74%
- Warning shows: "Contains organ meats - avoid for kidney disease"

---

## 🎯 **PROJECT GOALS**

### Phase 1: Core Rating ✅
- [x] Build rating algorithm
- [x] Create auto-tag script
- [ ] Run auto-tag script
- [ ] Verify different scores

### Phase 2: User Experience
- [ ] Recommended recipes page
- [ ] Saved recipes page
- [ ] Meal plan generator
- [ ] Shopping list export
- [ ] Recipe shortNames for cards

### Phase 3: Backend
- [ ] Migrate to Firebase/Supabase
- [ ] User profiles (sync across devices)
- [ ] Recipe favorites/ratings
- [ ] Community features

### Phase 4: Advanced
- [ ] Nutrition calculator (based on pet weight)
- [ ] Custom recipe builder
- [ ] Vet consultation booking
- [ ] Ingredient substitution suggestions

---

## 🧪 **TESTING SCENARIOS**

### Test Case 1: Kidney Disease Cat
**Pet:** Senior cat (10 yrs), kidney disease, 12 lbs

**Recipe A: "Chicken & Rice Bowl"**
- Expected: 80-85% (Good)
- Why: Low phosphorus, appropriate protein

**Recipe B: "Beef & Liver Stew"**
- Expected: 40-55% (Poor)
- Why: Liver has 350mg phosphorus - dangerous
- Should show warning

---

### Test Case 2: Puppy with Digestive Issues
**Pet:** Puppy (0.5 yrs), sensitive stomach

**Recipe A: "Chicken & Rice Puppy Formula"**
- Expected: 85-95% (Excellent)
- Why: Bland diet + age-appropriate

**Recipe B: "Beef & Sweet Potato Adult"**
- Expected: 60-70% (Fair)
- Why: Not specifically for puppies, not bland diet

---

### Test Case 3: Senior Dog with Joint Issues
**Pet:** Senior dog (12 yrs), arthritis

**Recipe A: "Salmon & Omega-3 Senior"**
- Expected: 85-95% (Excellent)
- Why: Omega-3 for joints, senior formula

**Recipe B: "Chicken Breast Lean"**
- Expected: 70-75% (Good)
- Why: Age-appropriate but no joint support

---

## 💡 **KEY INSIGHTS FOR AI ASSISTANTS**

### 1. Health Concerns Are Tags, Not Filters
- Recipes are TAGGED with what they help (e.g., `healthConcerns: ['joint-health']`)
- Rating system gives bonuses when tags match pet needs
- Also penalizes recipes tagged `notSuitableFor`

### 2. Veterinary Research Matters
- This isn't arbitrary - based on AAFCO standards and vet research
- Kidney disease phosphorus limits are critical
- Pancreatitis fat restrictions are life-or-death
- Don't make up rules - they must be evidence-based

### 3. localStorage Is Temporary
- Current solution for MVP
- Will migrate to database later
- Data structure must stay compatible

### 4. TypeScript Types Are Your Friend
- All interfaces defined in `lib/types.ts`
- Rating system is fully typed
- Don't break the types

### 5. The Auto-Tag Script Is One-Time
- Runs once to fix missing tags
- After that, new recipes get tagged manually
- Or could run periodically to catch new recipes

---

## 🚨 **WHAT NOT TO DO**

❌ **Don't** change rating weights without veterinary research
❌ **Don't** ignore phosphorus limits for kidney disease
❌ **Don't** assume all fish is good (salmon too fatty for pancreatitis)
❌ **Don't** break localStorage key format (`pets_${userId}`)
❌ **Don't** add health concerns without evidence
❌ **Don't** remove warnings - they protect pets
❌ **Don't** deploy before running auto-tag script

---

## ✅ **WHAT TO DO NEXT**

1. **Understand the rating algorithm** (`petRatingSystem.ts`)
2. **Run auto-tag script** to fix 74% issue
3. **Test with different pet profiles** to verify scores vary
4. **Add missing health concerns** (pancreatitis, diabetes, heart, skin)
5. **Update auto-tag script** to include new health concerns
6. **Create recommended recipes page**
7. **Build meal plan generator**

---

## 📞 **QUICK COMMANDS**

```bash
# Start dev server
npm run dev

# Run auto-tagger
npm run tag-recipes

# Install dependencies
npm install

# Build for production
npm run build

# Kill stuck Node process
taskkill /F /IM node.exe  # Windows
killall node              # Mac/Linux
```

---

## 🎓 **LEARNING RESOURCES**

**Pet Nutrition:**
- AAFCO nutrient profiles (Google "AAFCO dog cat nutrient profiles")
- WSAVA guidelines (World Small Animal Veterinary Association)
- Veterinary textbooks on clinical nutrition

**Technical:**
- Next.js docs: https://nextjs.org/docs
- Clerk auth: https://clerk.com/docs
- Tailwind: https://tailwindcss.com/docs

---

**END OF CONTEXT HANDOFF**

This document contains everything an AI assistant needs to understand and continue building PetPlates. Treat the health concern rules as sacred - they're based on veterinary research and protect real pets' lives.