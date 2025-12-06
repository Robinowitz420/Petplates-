# PetPlates Architecture Guide

## Core Principles

### 1. Business Logic Isolation
**Rule**: All scoring, calculations, and business logic live in `lib/utils/`, never in components.

**✅ Compliant Examples:**
- `lib/utils/petRatingSystem.ts` - `rateRecipeForPet()` calculates compatibility scores
- `lib/analyzeCustomMeal.ts` - `generateCustomMealAnalysis()` analyzes custom meals
- `lib/utils/recipeScoring.ts` - Recipe scoring algorithms

**❌ Violations to Fix:**
- Components should only call utils functions, never calculate scores inline
- UI calculations (like recommended amounts) should be extracted to utils if reusable

### 2. Single Source of Truth
**Rule**: `lib/data/recipes-complete.ts` is the canonical recipe database.

**✅ Compliant:**
- `scripts/auto-tag-recipes.ts` updates `recipes-complete.ts`
- `scripts/addRecipeImages.ts` updates `recipes-complete.ts`
- All app routes import from `recipes-complete.ts`

**❌ Avoid:**
- Creating duplicate recipe files (`recipes.ts`, `recipes-full.ts` should be deprecated)
- Directly modifying recipes in components

### 3. Presentation-Only Components
**Rule**: Components receive data and scores as props, never calculate them.

**✅ Compliant:**
```tsx
// Component receives pre-calculated score
<RecipeCard recipe={recipe} score={rateRecipeForPet(recipe, pet)} />
```

**❌ Violation:**
```tsx
// Component calculates score internally
const score = calculateScore(recipe, pet); // ❌ Move to parent or utils
```

### 4. Thin Route Controllers
**Rule**: App routes (`app/**/page.tsx`) orchestrate components and pass props.

**✅ Compliant Pattern:**
```tsx
// app/recipe/[id]/page.tsx
export default function RecipePage() {
  const recipe = getRecipe(id);
  const pet = getPet(petId);
  const score = rateRecipeForPet(recipe, pet); // Utils function
  return <RecipeDetail recipe={recipe} pet={pet} score={score} />;
}
```

**❌ Avoid:**
- Complex business logic in route files
- Direct localStorage access (abstract to utils)
- Inline calculations

### 5. Documented Data Contracts
**Rule**: All utility functions must have TypeScript interfaces and JSDoc comments.

**Required Documentation:**
- Function purpose
- Parameter types and descriptions
- Return type and structure
- Example usage
- Migration notes (if applicable)

## Data Flow

```
scripts/ → lib/data/ → lib/utils/ → components/ → app/
```

### Example Flow: Recipe Scoring

1. **Script** (`scripts/auto-tag-recipes.ts`)
   - Enriches `recipes-complete.ts` with health tags

2. **Data** (`lib/data/recipes-complete.ts`)
   - Exports `recipes: Recipe[]` array

3. **Utils** (`lib/utils/petRatingSystem.ts`)
   - `rateRecipeForPet(recipe: Recipe, pet: Pet): CompatibilityRating`
   - Calculates score, warnings, recommendations

4. **Component** (`components/RecipeCard.tsx`)
   - Receives `recipe` and `score` as props
   - Displays UI only

5. **Route** (`app/recipe/[id]/page.tsx`)
   - Fetches recipe and pet
   - Calls `rateRecipeForPet()`
   - Passes props to `RecipeCard`

## Migration Path (Firebase/Supabase)

When migrating from localStorage to a backend:

1. **Abstract Data Access**
   - Create `lib/utils/petStorage.ts` with functions:
     - `getPets(userId): Promise<Pet[]>`
     - `savePet(userId, pet): Promise<void>`
   - Currently uses localStorage, later swaps to Firebase

2. **Keep Contracts Identical**
   - Same function signatures
   - Same return types
   - Components don't need changes

3. **Update One File**
   - Only `lib/utils/petStorage.ts` changes
   - All components continue working

## File Organization

```
lib/
├── data/              # Static datasets (single source of truth)
│   ├── recipes-complete.ts
│   ├── nutritional-guidelines.ts
│   └── pets.ts
├── utils/             # Business logic (no UI)
│   ├── petRatingSystem.ts
│   ├── analyzeCustomMeal.ts
│   └── recipeScoring.ts
└── types.ts           # Shared TypeScript interfaces

components/            # Presentation only
├── RecipeCard.tsx     # Receives props, renders UI
└── CompatibilityPanel.tsx

app/                   # Thin controllers
└── recipe/[id]/
    └── page.tsx       # Orchestrates, passes props

scripts/               # Data preparation
└── auto-tag-recipes.ts # Updates lib/data/
```

## Checklist for New Features

- [ ] Business logic in `lib/utils/`?
- [ ] Components only receive props (no calculations)?
- [ ] Route files are thin (orchestration only)?
- [ ] Data contracts documented with JSDoc?
- [ ] Single source of truth maintained?
- [ ] localStorage abstracted to utils (for future migration)?

