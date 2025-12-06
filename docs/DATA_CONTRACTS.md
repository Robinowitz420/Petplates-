# Data Contracts

This document defines the input/output contracts for all utility functions to ensure clean migration to Firebase/Supabase.

## Core Contracts

### Recipe Scoring

#### `rateRecipeForPet(recipe: Recipe, pet: Pet): CompatibilityRating`

**Purpose**: Calculates compatibility score between a recipe and pet profile.

**Input**:
- `recipe`: Recipe object from `lib/data/recipes-complete.ts`
- `pet`: Pet object (from localStorage/backend)

**Output**:
```typescript
{
  overallScore: number;        // 0-100
  compatibility: 'excellent' | 'good' | 'fair' | 'poor';
  breakdown: Record<string, RatingFactor>;
  warnings: string[];
  strengths: string[];
  recommendations: string[];
}
```

**Migration Notes**: Pure function, no storage access. Compatible with any backend.

---

### Custom Meal Analysis

#### `generateCustomMealAnalysis(petProfile: PetProfile, selections: IngredientSelection[]): MealAnalysis`

**Purpose**: Analyzes custom meal composition for nutritional completeness and safety.

**Input**:
- `petProfile`: Pet profile with species, life stage, weight, allergies
- `selections`: Array of ingredient selections with keys and grams

**Output**:
```typescript
{
  nutrients: Record<string, number>;  // Total nutrients in meal
  totalRecipeGrams: number;
  energyDensityKcalPerGram: number;
  recommendedServingGrams: number;
  score: number;                       // 0-100 compatibility score
  breakdown: {
    nutrientCoverageScore: number;
    toxicityPenalty: number;
    balanceVarietyScore: number;
  };
  toxicityWarnings: WarningItem[];
  allergyWarnings: WarningItem[];
  nutrientWarnings: WarningItem[];
  suggestions: Suggestion[];
}
```

**Migration Notes**: Pure function, no storage access. Compatible with any backend.

---

### Pet Storage (Abstracted)

#### `getPets(userId: string): Pet[]`

**Purpose**: Retrieves all pets for a user.

**Input**: `userId` (string)

**Output**: `Pet[]` (always array, never null)

**Current Implementation**: localStorage

**Migration**: Swap implementation in `lib/utils/petStorage.ts` only. All callers unchanged.

---

#### `savePet(userId: string, pet: Pet): void`

**Purpose**: Saves or updates a pet.

**Input**: `userId` (string), `pet` (Pet object)

**Output**: `void`

**Current Implementation**: localStorage

**Migration**: Swap implementation in `lib/utils/petStorage.ts` only.

---

#### `deletePet(userId: string, petId: string): void`

**Purpose**: Deletes a pet.

**Input**: `userId` (string), `petId` (string)

**Output**: `void`

**Current Implementation**: localStorage

**Migration**: Swap implementation in `lib/utils/petStorage.ts` only.

---

#### `getPet(userId: string, petId: string): Pet | null`

**Purpose**: Gets a single pet by ID.

**Input**: `userId` (string), `petId` (string)

**Output**: `Pet | null`

**Current Implementation**: localStorage

**Migration**: Swap implementation in `lib/utils/petStorage.ts` only.

---

## Type Definitions

### Pet
```typescript
interface Pet {
  id: string;
  names: string[];
  type: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
  breed: string;
  age: string;  // e.g., 'adult', 'senior'
  weight: string;  // e.g., '20 lbs'
  healthConcerns: string[];
  allergies?: string[];
  image?: string;
}
```

### Recipe
```typescript
interface Recipe {
  id: string;
  name: string;
  category: string;
  ageGroup: string[];
  healthConcerns: string[];
  ingredients: Ingredient[];
  nutritionalInfo: NutritionalInfo;
  // ... other fields
}
```

### PetProfile (for custom meal analysis)
```typescript
interface PetProfile {
  id?: string;
  name?: string;
  species: 'dog' | 'cat' | 'bearded-dragon' | 'parrot' | 'guinea-pig' | 'hamster' | string;
  lifeStage?: string;  // 'adult', 'juvenile', 'pregnant'
  weightKg?: number;
  allergies?: string[];
  meds?: string[];
  activity?: 'low' | 'moderate' | 'high';
}
```

### IngredientSelection
```typescript
interface IngredientSelection {
  key: string;   // Composition key (e.g., 'chicken_breast')
  grams: number; // Amount in grams
}
```

---

## Migration Checklist

When migrating to Firebase/Supabase:

1. ✅ **Pet Storage**: Update `lib/utils/petStorage.ts` only
   - All callers use same functions
   - No component changes needed

2. ✅ **Recipe Scoring**: No changes needed
   - Pure functions, no storage access

3. ✅ **Custom Meal Analysis**: No changes needed
   - Pure functions, no storage access

4. ✅ **Components**: No changes needed
   - They call utils functions, not storage directly

5. ✅ **Routes**: Minimal changes
   - Replace `localStorage.getItem` with `getPets(userId)`
   - Use `savePet()` instead of manual localStorage

---

## Example Migration

### Before (localStorage in route):
```tsx
// app/profile/page.tsx
const stored = localStorage.getItem(`pets_${userId}`);
const pets = stored ? JSON.parse(stored) : [];
```

### After (abstracted utils):
```tsx
// app/profile/page.tsx
import { getPets } from '@/lib/utils/petStorage';
const pets = getPets(userId);
```

### Future (Firebase):
```tsx
// lib/utils/petStorage.ts
export async function getPets(userId: string): Promise<Pet[]> {
  const snapshot = await db.collection('pets').where('userId', '==', userId).get();
  return snapshot.docs.map(doc => doc.data() as Pet);
}
```

**No component changes needed!** ✅

