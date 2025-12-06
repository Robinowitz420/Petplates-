# Supported Species List

This document lists all species currently supported in the Pet Plates platform, organized by category.

## 🦜 Birds (10 species)

1. **Budgie** (Budgerigar/Parakeet)
2. **Cockatiel**
3. **Lovebird**
4. **Parrot** (generic)
5. **Cockatoo**
6. **Canary**
7. **Finch**
8. **Conure**
9. **African Grey**
10. **Macaw**
11. **Quaker Parrot**

**Notes:**
- Coverage Level: **Beta** (ingredient data available, actively being expanded)
- Subtypes: Larger parrots (Macaw, Cockatoo, African Grey) vs smaller birds (Finch, Canary, Budgie)
- Special considerations: Seed-eating birds vs carnivorous birds (raptors, corvids)

---

## 🦎 Reptiles (10 species)

1. **Bearded Dragon**
2. **Leopard Gecko**
3. **Ball Python**
4. **Red-Eared Slider** (Turtle)
5. **Corn Snake**
6. **Iguana** (Green Iguana)
7. **Chameleon**
8. **Crested Gecko**
9. **Monitor Lizard**
10. **Blue-Tongued Skink**

**Notes:**
- Coverage Level: **Beta** (ingredient data available, actively being expanded)
- Subtypes:
  - **Herbivore**: Bearded Dragon, Iguana, Red-Eared Slider (adult)
  - **Insectivore**: Leopard Gecko, Crested Gecko
  - **Omnivore**: Bearded Dragon (young), Blue-Tongued Skink
  - **Carnivore**: Ball Python, Corn Snake, Monitor Lizard, Chameleon
- Special considerations: Ca:P ratio critical for herbivorous species

---

## 🐰 Pocket Pets (9 species)

1. **Rabbit**
2. **Guinea Pig**
3. **Hamster**
4. **Gerbil**
5. **Chinchilla**
6. **Rat**
7. **Mouse**
8. **Ferret**
9. **Hedgehog**

**Notes:**
- Coverage Level: **Beta** (ingredient data available, actively being expanded)
- Subtypes:
  - **Hay-based**: Rabbit, Guinea Pig (require high-fiber hay)
  - **Variety-based**: Hamster, Gerbil, Rat, Mouse (can handle more fruits/grains)
  - **Specialized**: Chinchilla (dust baths, specific hay), Ferret (carnivorous), Hedgehog (insectivorous)
- Special considerations:
  - Guinea Pigs: Require vitamin C supplementation
  - Rabbits: Require unlimited hay, limit fruits
  - Ferrets: Obligate carnivores (similar to cats)

---

## Coverage Status

| Category | Coverage Level | Status |
|----------|---------------|--------|
| Dogs | Full | ✅ Complete ingredient database |
| Cats | Full | ✅ Complete ingredient database |
| Birds | Beta | 🔄 Expanding ingredient data |
| Reptiles | Beta | 🔄 Expanding ingredient data |
| Pocket Pets | Beta | 🔄 Expanding ingredient data |

---

## Species-Specific Features

### Birds
- **Ingredient Categories**: Seeds, Vegetables, Fruits, Supplements
- **Key Nutrients**: Calcium (for egg-laying), Vitamin A, Variety of textures
- **Special Notes**: Larger parrots can handle more variety; smaller birds need smaller portions

### Reptiles
- **Ingredient Categories**: Insects (for insectivores), Vegetables, Fruits
- **Key Nutrients**: Calcium, Phosphorus, Ca:P ratio (critical for herbivores)
- **Special Notes**: Dietary needs vary dramatically by type (herbivore vs carnivore)

### Pocket Pets
- **Ingredient Categories**: Hay, Vegetables, Pellets, Fruits, Hamster Additions
- **Key Nutrients**: 
  - Rabbits/Guinea Pigs: Unlimited hay, vitamin C (guinea pigs)
  - Hamsters/Gerbils: More variety, can handle grains
  - Ferrets: High protein, low carb (carnivorous)
- **Special Notes**: Each species has unique dietary requirements

---

## Adding New Species

To add a new species:

1. Add breed to appropriate array in:
   - `lib/data/pets.ts`
   - `components/AddPetModal.tsx`
   - `app/profile/page.tsx`

2. Update ingredient whitelists in:
   - `lib/utils/ingredientWhitelists.ts`

3. Add species-specific nutrition standards (if needed):
   - `lib/data/avian-nutrition-standards.ts` (for birds)
   - `lib/data/reptile-nutrition.ts` (for reptiles)
   - `lib/data/aafco-standards.ts` (for dogs/cats)

4. Update normalization logic in:
   - `lib/analyzeCustomMeal.ts` (`normalizeSpecies` function)
   - `lib/utils/ingredientCompatibility.ts`

---

## Last Updated

2025-01-XX - Initial comprehensive species list compiled

