# Core Protein Lists by Species

**Philosophy:** Only common, affordable, nutritionally complete proteins. No exotic meats, no expensive specialty items.

---

## 🐱 CATS & 🐶 DOGS

### Primary Muscle Meats (Foundation)
- **Chicken** (breast, thigh, ground)
- **Turkey** (breast, thigh, ground)
- **Beef** (lean ground, chuck)
- **Pork** (lean)
- **Lamb** (ground, shoulder)

### Organs (Required for Completeness)
- **Chicken liver**
- **Chicken heart**
- **Beef liver**
- **Turkey liver**
- **Kidney** (optional)

### Fish (Secondary Protein, Omega-3 Source)
- **Salmon**
- **Sardines** (canned in water)
- **Mackerel**
- **Anchovies**
- **Herring**

### Eggs
- **Whole eggs**
- **Egg yolks**

### ❌ REMOVE (Exotic/Expensive)
- Quail
- Venison
- Goat
- Elk
- Bison
- Ostrich
- Pheasant
- Duck (unless priced competitively)
- Rabbit (unless priced competitively)
- Any freeze-dried meats (unless specifically budget tier)

---

## 🐦 BIRDS

### Seed/Plant-Forward Birds (Parrots, Parakeets, Finches)
**Protein Sources:**
- Lentils (cooked)
- Chickpeas (cooked)
- Mung beans
- Split peas
- Quinoa
- Hemp seeds
- Pumpkin seeds
- Sunflower seeds (limited)
- Chia seeds

**Occasional Animal Protein (Optional):**
- Hard-boiled eggs
- Egg yolks

### Omnivorous Birds (Parrots, Mynahs)
**Protein Sources:**
- Eggs
- Chicken (cooked, unseasoned)
- Turkey
- Mealworms
- Crickets
- Black soldier fly larvae

### Insectivorous Birds
**Protein Sources:**
- Mealworms
- Crickets
- Dubia roaches
- Black soldier fly larvae
- Silkworms

### ❌ REMOVE
- Quail
- Exotic meats
- Freeze-dried meat treats
- Large mammal organs

---

## 🦎 REPTILES

### Insectivores (Geckos, Anoles)
**Protein Sources:**
- Crickets
- Dubia roaches
- Mealworms
- Superworms
- Silkworms
- Black soldier fly larvae

### Carnivores (Snakes, Monitors)
**Protein Sources:**
- Mice (whole prey)
- Rats (whole prey)
- Chicks (whole prey)
- Fish (species-appropriate)

⚠️ Whole-prey feeders - recipes are informational only

### Omnivores (Bearded Dragons, Tegus)
**Protein Sources:**
- Crickets
- Dubia roaches
- Mealworms
- Black soldier fly larvae
- Eggs
- Chicken (cooked, small amounts)
- Turkey (cooked, small amounts)

### Herbivores (Iguanas, Tortoises)
**Protein Sources:**
- Lentils (very limited)
- Split peas (limited)
- Protein comes mainly from plants

❌ No animal protein needed

---

## 🐹 POCKET PETS

### Herbivores (Rabbits, Guinea Pigs)
**Protein Sources:**
- Timothy hay
- Orchard grass
- Alfalfa (young animals only)
- Leafy greens

❌ NO animal protein
❌ NO legumes in large amounts

### Omnivores (Hamsters, Rats, Mice)
**Protein Sources:**
- Eggs
- Chicken
- Turkey
- Lentils (cooked)
- Chickpeas (cooked)
- Mealworms
- Crickets

### Insectivores (Hedgehogs)
**Protein Sources:**
- Mealworms
- Crickets
- Black soldier fly larvae
- Eggs
- Chicken

---

## 🎯 Implementation Strategy

### 1. Core Protein Pools
Create ingredient pools by feeding type:
- `core_carnivore` (cats, dogs)
- `core_omnivore_bird`
- `core_insectivore`
- `core_herbivore`
- `core_omnivore_small_mammal`

### 2. Recipe Generation
- **Default:** Only use core proteins
- **Advanced mode:** Allow exotic proteins if user explicitly enables
- **Allergy mode:** Allow novel proteins only when needed

### 3. Cost Targets
- Cat/Dog meals: $2-4 per meal
- Bird meals: $1-3 per meal
- Reptile meals: $1-3 per meal
- Pocket pet meals: $0.50-2 per meal

---

## ✅ Benefits

1. **Affordable:** Common proteins are widely available and cheap
2. **Nutritionally Complete:** All essential nutrients covered
3. **Safe:** Well-researched, proven ingredients
4. **Maintainable:** Smaller ingredient database
5. **User-Friendly:** No confusing exotic options
6. **Better Meal Counts:** Larger packages = more meals per purchase

---

## 🚀 Next Steps

1. Filter ingredient pools to remove exotic proteins
2. Update RecipeBuilder to use core protein lists by default
3. Add "advanced mode" toggle for users who want variety
4. Test that all recipes stay under cost targets
