# Pet Plates — Programmatic URL Taxonomy Proposal (Content/Structure Only)

Scope constraints:
- This is a **future-facing taxonomy**.
- We only publish the **10 pages now**.
- Taxonomy should allow scaling later without rework.

Goals:
- Consistent, human-readable URL patterns.
- Clear separation of:
  - ingredient safety
  - conditions
  - education/basics
  - shopping
  - trust/standards
- Avoid thin pages and keyword stuffing.

---

## 1) Global rules

- **Lowercase**
- **Hyphen-separated**
- **No dates in URLs** (use `dateModified` and changelog instead)
- **Canonical**: one canonical per page
- **Breadcrumb alignment**: taxonomy should match breadcrumbs

---

## 2) Primary taxonomy buckets

### A) Trust / E‑E‑A‑T
- `/trust/recipes-created/`
- `/trust/nutrition-standards/`
- `/trust/aafco-guidelines/`
- `/trust/what-we-are-and-are-not/`
- `/trust/food-safety-and-allergies/`

### B) Species hubs (optional but recommended later)
- `/dogs/`
- `/cats/`
- `/birds/`
- `/reptiles/`
- `/pocket-pets/`

### C) Ingredient safety
Pattern:
- `/{species}/ingredients/{ingredient-slug}/`

Examples (our 10 pages):
- `/dogs/ingredients/garlic/`
- `/cats/ingredients/tuna/` (or `/cats/ingredients/tuna-every-day/` if needed for clarity)
- `/birds/ingredients/avocado/`
- `/reptiles/ingredients/spinach/`
- `/pocket-pets/ingredients/iceberg-lettuce/`

Optional future sub-buckets (do not publish now):
- `/{species}/ingredients/{ingredient}/safety/` (only if you later need multiple pages per ingredient)

### D) Health conditions
Pattern:
- `/{species}/conditions/{condition-slug}/`

Examples (our 10 pages):
- `/dogs/conditions/pancreatitis-diet/`
- `/cats/conditions/kidney-disease-diet/`

### E) Education / basics
Pattern:
- `/{species}/basics/{topic-slug}/`

Examples (our 10 pages):
- `/birds/basics/pellets-vs-seeds/`
- `/reptiles/basics/calcium-basics/`

### F) Shopping (content-only guides)
Pattern:
- `/{species}/shopping/{topic-slug}/`

Examples (our 10 pages):
- `/pocket-pets/shopping/guinea-pig-grocery-list-budget/`

---

## 3) Canonical mapping for the 10 pages (recommended)

- Dogs
  - Garlic: `/dogs/ingredients/garlic/`
  - Pancreatitis: `/dogs/conditions/pancreatitis-diet/`

- Cats
  - Tuna: `/cats/ingredients/tuna/`
  - CKD: `/cats/conditions/kidney-disease-diet/`

- Birds
  - Avocado: `/birds/ingredients/avocado/`
  - Pellets vs seeds: `/birds/basics/pellets-vs-seeds/`

- Reptiles
  - Spinach: `/reptiles/ingredients/spinach/`
  - Calcium basics: `/reptiles/basics/calcium-basics/`

- Pocket pets
  - Iceberg lettuce: `/pocket-pets/ingredients/iceberg-lettuce/`
  - Budget grocery list: `/pocket-pets/shopping/guinea-pig-grocery-list-budget/`

---

## 4) Pagination and programmatic scaling (later)

If you later create ingredient indexes, prefer:
- `/{species}/ingredients/` (index)
- `/{species}/conditions/` (index)
- `/{species}/basics/` (index)

Avoid generating low-value pages at scale without unique content.

---

## 5) Naming conventions

- Use plain slugs:
  - `kidney-disease-diet` (not `ckd-cat-food-best`)
  - `pellets-vs-seeds` (not `best-bird-diet-2025`)
- Keep slugs stable even if titles change.

---

## 6) Redirect policy

If any URLs change:
- Add 301 from old to new.
- Preserve UTM parameters.
- Update internal links.

---

## 7) Why this works

- Supports internal linking and breadcrumb clarity.
- Keeps YMYL pages in clear “conditions” buckets.
- Keeps shopping separate from medical contexts.
- Allows future hubs without breaking existing URLs.
