# Species Whitelist & Safety Features

## Overview

Implemented comprehensive whitelist system for safe ingredient selection, especially for exotic species (birds, reptiles, pocket pets).

## Features Implemented

### 1. Species-Specific Whitelists

- **`lib/utils/ingredientWhitelists.ts`** - Core whitelist system
- Filters ingredients by species compatibility
- Supports subtypes (herbivore/insectivore/omnivore reptiles, rabbit/guinea-pig/hamster pocket pets)
- Returns only safe ingredients ('ok', 'limit', 'caution' - excludes 'avoid')

### 2. Warning System

When users try to add non-whitelisted ingredients:
- Shows confirmation dialog: "Not recommended for this species. Please check with your vet before using."
- Allows override (users can add anyway with vet approval)
- Prevents accidental dangerous combinations

### 3. Species Coverage Badges

- **Full Coverage** (green) - Dogs, Cats - comprehensive ingredient data
- **Beta** (yellow) - Birds, Reptiles, Pocket Pets - expanding data
- **Limited** (gray) - Other species - minimal data

Displayed in meal builder header to set user expectations.

### 4. Blacklist Display

Shows count of ingredients marked as 'avoid' for the species:
- "X ingredients to avoid" badge
- Helps users understand safety boundaries

## Usage

### In Meal Builder

```typescript
import { getWhitelistForSpecies, isWhitelisted, getSpeciesCoverageLevel } from '@/lib/utils/ingredientWhitelists';

// Get whitelist for species
const whitelist = getWhitelistForSpecies('bird');

// Check if ingredient is safe
if (isWhitelisted('Blueberries', 'bird')) {
  // Safe to add
}

// Get coverage level
const level = getSpeciesCoverageLevel('reptile'); // 'beta'
```

### Filtering Ingredients

The meal builder automatically filters available ingredients through the whitelist:
- Only whitelisted ingredients appear in picker (by default)
- Non-whitelisted ingredients show warning if manually added
- Blacklisted ingredients are excluded entirely

## Future Enhancements

### 1. Confidence Levels

Add `confidenceLevel` field to ingredients:
- `high` - Vet-verified, research-backed
- `medium` - Generally accepted, needs review
- `low` - Limited data, use caution

### 2. User Feedback System

- "Report unsafe ingredient" button per ingredient
- "My vet says this is safe/unsafe for X" feedback
- Community-vetted ingredient tags

### 3. Vet-Approved Custom Ingredients

- "Add your own vet-approved ingredient" flow
- Stores user notes separately from core safe list
- Allows personal ingredient database

### 4. Subtype Detection

Auto-detect reptile/pocket pet subtypes:
- Reptile: Check if herbivore (no meat) vs insectivore (insects only) vs omnivore
- Pocket Pet: Detect rabbit (hay-based) vs hamster (more variety)

## Data Enrichment Strategy

### Incremental Data Growth

1. **Start with reputable sources**
   - AAFCO-approved ingredients
   - Commercial exotic pet food ingredient lists
   - Veterinary nutrition databases

2. **Tag existing ingredients**
   - Review current `INGREDIENT_COMPOSITIONS`
   - Add species compatibility flags
   - Set max inclusion percentages

3. **Harvest commercial diets**
   - Bird pellet ingredient lists
   - Reptile formula ingredients
   - Small mammal feed ingredients
   - Map each to your schema

4. **Add confidence levels**
   - Mark high-confidence ingredients
   - Hide low-confidence until reviewed
   - Prioritize vet-verified data

## Product Features to Ship

### 1. Supported Species Badge

Show in meal builder:
- "✓ Full Support" for dogs/cats
- "β Beta" for birds/reptiles/pocket pets
- Sets clear expectations

### 2. Feedback Button

Per ingredient in meal builder:
- "Report Issue" button
- "My vet says this is not safe for [species]"
- Collects feedback for data refinement

### 3. Custom Ingredient Flow

- "Add Vet-Approved Ingredient" button
- User enters: name, nutritional data, vet notes
- Stored in user's personal ingredient list
- Doesn't affect core whitelist

## Safety Philosophy

**Conservative by Default:**
- Whitelist approach (only show safe ingredients)
- Warn on non-whitelisted additions
- Allow override with vet approval
- Clear communication about data confidence

**User Empowerment:**
- Users can add custom ingredients
- Feedback loop for data improvement
- Transparency about coverage levels
- Education through warnings and notes

