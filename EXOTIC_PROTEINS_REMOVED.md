# Exotic Proteins Removed - System Update

## 🎯 Goal
Remove all expensive, exotic proteins from recipe generation. Only use common, affordable ingredients that provide complete nutrition.

---

## ✅ Changes Made

### 1. Created Core Protein Lists
**File:** `lib/data/coreProteins.ts`

Defined core protein lists for each species:
- **Cats/Dogs:** Chicken, turkey, beef, pork, lamb, salmon, sardines, eggs
- **Birds:** Lentils, chickpeas, seeds, eggs, mealworms, crickets
- **Reptiles:** Crickets, dubia roaches, mealworms, eggs, chicken
- **Pocket Pets:** Hay, eggs, chicken, lentils, mealworms

### 2. Exotic Protein Filter
**File:** `lib/generator/RecipeBuilder.ts`

Added hard filter to exclude exotic proteins:
```typescript
// Filter 0: Exotic proteins (HARD - exclude by default)
if (ing.category === 'protein' && isExoticProtein(ing.name)) {
  console.log(`[RecipeBuilder] ❌ Excluding exotic protein: ${ing.name}`);
  return false;
}
```

### 3. Exotic Proteins List
The following proteins are now **excluded by default**:
- Quail
- Venison
- Goat
- Elk
- Bison
- Ostrich
- Pheasant
- Duck
- Rabbit
- Kangaroo
- Alligator
- Wild boar
- Emu
- Reindeer
- Buffalo

---

## 📊 Expected Results

### Before (with exotic proteins):
- **Quail recipe:** $26.44/meal, 1 meal from packages
- **Venison recipe:** $30+/meal, 1 meal from packages
- High costs, low meal counts

### After (core proteins only):
- **Chicken recipe:** $2-4/meal, 3-5 meals from packages
- **Turkey recipe:** $2-4/meal, 3-5 meals from packages
- **Beef recipe:** $3-5/meal, 2-4 meals from packages
- Affordable costs, realistic meal counts

---

## 🧪 Testing

1. **Refresh browser** to reload the updated code
2. **Generate new recipes** for cats
3. **Verify** recipes only use:
   - Chicken, turkey, beef, pork, lamb
   - Salmon, sardines, mackerel
   - Eggs
   - Chicken liver, chicken heart
4. **Check meal counts** are now 2-5 meals (not 1)
5. **Check costs** are now $2-5/meal (not $20-30/meal)

---

## 🔧 Future Enhancements (Optional)

### Advanced Mode Toggle
If you want to allow exotic proteins for users with allergies:

```typescript
export interface GenerationConstraints {
  // ... existing fields
  allowExoticProteins?: boolean; // Default: false
}

// In getCandidateIngredients():
if (ing.category === 'protein' && isExoticProtein(ing.name)) {
  if (!this.constraints.allowExoticProteins) {
    return false; // Exclude unless explicitly allowed
  }
}
```

### Allergy Mode
Automatically enable exotic proteins when user has allergies to common proteins:

```typescript
const hasCommonProteinAllergies = this.constraints.allergies?.some(a => 
  ['chicken', 'turkey', 'beef', 'pork', 'lamb', 'fish'].includes(a.toLowerCase())
);

if (hasCommonProteinAllergies) {
  // Allow exotic proteins as alternatives
  this.constraints.allowExoticProteins = true;
}
```

---

## ✅ Benefits

1. **Affordable:** Common proteins are 70-80% cheaper
2. **Better Meal Counts:** Larger packages = 3-5 meals instead of 1
3. **Simpler System:** Smaller ingredient database to maintain
4. **User-Friendly:** No confusing exotic options
5. **Nutritionally Complete:** All essential nutrients covered
6. **Widely Available:** Easy to find in stores/online

---

## 📝 Documentation

- **Core Proteins:** `CORE_PROTEINS_BY_SPECIES.md`
- **Implementation:** `lib/data/coreProteins.ts`
- **Filter Logic:** `lib/generator/RecipeBuilder.ts` (line 238-243)

---

## 🚀 Status

✅ Core protein lists created
✅ Exotic protein filter implemented
✅ RecipeBuilder updated
⏳ **Ready for testing** - refresh browser and generate new recipes

**Expected outcome:** All cat recipes will now use chicken, turkey, beef, or fish. No more quail, venison, or other exotic meats. Meal counts should be 2-5 meals, costs should be $2-5/meal.
