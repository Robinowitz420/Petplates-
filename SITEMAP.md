# PetPlates Website Sitemap

## Site Structure

```
PetPlates Website
│
├── 🏠 Home (/)
│   ├── Hero Section
│   ├── Pet Categories Grid (5 categories)
│   ├── Benefits Section (6 benefits)
│   ├── Trending Recipes (top 6)
│   ├── How It Works (4 steps)
│   └── CTA Section
│
├── 🐾 Category Pages (/category/[category])
│   ├── /category/dogs
│   │   ├── Breed Filter (10 breeds)
│   │   ├── Age Filter (4 age groups)
│   │   ├── Health Concerns Filter (7 options)
│   │   ├── Nutritional Guidelines Panel
│   │   └── Filtered Recipe Results
│   │
│   ├── /category/cats
│   │   └── (Same structure as dogs)
│   │
│   ├── /category/birds
│   │   └── (Same structure)
│   │
│   ├── /category/reptiles
│   │   └── (Same structure)
│   │
│   └── /category/pocket-pets
│       └── (Same structure)
│
├── 📖 Recipe Pages (/recipe/[id])
│   ├── Recipe Header
│   │   ├── Hero Image
│   │   ├── Title & Description
│   │   ├── Prep Time, Servings, Rating
│   │   └── Tags
│   │
│   ├── Ingredients Section
│   │   ├── Ingredient List with Nutrition
│   │   ├── Individual Amazon Links
│   │   └── "Buy All Ingredients" Button
│   │
│   ├── Instructions Section
│   │   └── Step-by-Step Guide
│   │
│   └── Sidebar
│       ├── Nutritional Information Panel
│       │   ├── Calorie Count
│       │   ├── Macronutrient Progress Bars
│       │   ├── Target Ranges
│       │   └── Vitamins List
│       │
│       ├── Action Buttons
│       │   ├── Add to Meal Plan
│       │   ├── Download Recipe
│       │   └── Share Recipe
│       │
│       └── Suitability Info
│           ├── Age Groups
│           └── Health Concerns
│
├── 🔍 All Recipes (/recipes)
│   ├── Search Bar
│   ├── Category Filter
│   ├── Tag Filter
│   ├── Active Filters Display
│   └── Recipe Grid (all recipes)
│
├── 📅 Meal Plans (/meal-plans)
│   ├── Pet Category Selection (5 options)
│   ├── Plan Type Selection
│   │   ├── One-Time Meal
│   │   │   ├── Price: $12.99
│   │   │   ├── Features List
│   │   │   └── Select Button
│   │   │
│   │   └── Weekly Plan
│   │       ├── Price: $89.99/week
│   │       ├── Savings Badge
│   │       ├── Features List
│   │       └── Select Button
│   │
│   ├── Sample Weekly Menu
│   │   └── 7-Day Calendar (2 meals/day)
│   │
│   ├── CTA Section
│   └── Features Section
│
├── ℹ️ About (/about)
│   ├── Mission Statement
│   ├── Core Values (4 cards)
│   │   ├── Science-Based
│   │   ├── Pet-First
│   │   ├── Community Driven
│   │   └── Transparency
│   │
│   ├── Why All Pet Types
│   │   ├── Dogs
│   │   ├── Cats
│   │   ├── Birds
│   │   ├── Reptiles
│   │   └── Pocket Pets
│   │
│   └── Nutritional Standards
│       ├── AAFCO Guidelines
│       ├── WSAVA Recommendations
│       ├── Veterinary Review
│       └── Regular Updates
│
└── 📧 Subscribe (/subscribe)
    ├── Benefits List (4 items)
    ├── Subscription Form
    │   ├── Email Input
    │   ├── Pet Type Select
    │   └── Submit Button
    │
    ├── Success Page (after submission)
    └── Social Proof Section

```

## Navigation Structure

### Header Navigation (All Pages)
```
🐾 PetPlates Logo
├── Home
├── Recipes
├── Meal Plans
├── About
└── [Subscribe Button]
```

### Footer Navigation (All Pages)
```
Footer
├── Brand Column
│   └── Logo + Description
│
├── Quick Links Column
│   ├── Home
│   ├── Recipes
│   ├── Meal Plans
│   └── About
│
├── Pet Categories Column
│   ├── 🐕 Dogs
│   ├── 🐈 Cats
│   ├── 🦜 Birds
│   ├── 🦎 Reptiles
│   └── 🐰 Pocket Pets
│
├── Support Column
│   ├── Contact Us
│   ├── FAQ
│   ├── Nutrition Guide
│   └── Privacy Policy
│
└── Copyright Notice
```

## User Journey Flows

### Journey 1: New Visitor → Recipe Discovery
```
Home Page
  → Click Pet Category (e.g., Dogs)
    → Category Page
      → Select Breed (e.g., Labrador)
        → Select Age (e.g., Adult)
          → Select Health Concern (e.g., None)
            → View Filtered Recipes
              → Click Recipe Card
                → Recipe Detail Page
                  → Click "Buy All Ingredients"
                    → Amazon (external)
```

### Journey 2: Recipe Search → Purchase
```
Home Page
  → Click "Browse Recipes"
    → All Recipes Page
      → Search for recipe
        → Click recipe
          → Recipe Detail Page
            → Review ingredients
              → Click individual Amazon links
                → Purchase ingredients
```

### Journey 3: Meal Plan Selection
```
Home Page
  → Click "Meal Plans"
    → Meal Plans Page
      → Select Pet Category
        → Choose Plan Type
          → Review Sample Menu
            → Click "Customize My Plan"
              → Category Page (with selections)
                → Browse & Select Recipes
```

### Journey 4: Information Seeking
```
Home Page
  → Click "About"
    → About Page
      → Read Mission & Values
        → Learn about AAFCO/WSAVA
          → Return to Home
            → Click "Get Started"
```

## Page Interconnections

### Home Page Links To:
- All 5 Category Pages (via category cards)
- All Recipes Page (via "Browse Recipes" buttons)
- Meal Plans Page (via "Get Started" buttons)
- Individual Recipe Pages (via trending recipes)

### Category Pages Link To:
- Individual Recipe Pages (via recipe cards)
- All Recipes Page (via "Browse All Recipes")

### Recipe Pages Link To:
- Amazon (external, for ingredients)
- Other Recipe Pages (via related recipes, if implemented)
- Meal Plans Page (via "Add to Meal Plan")

### All Recipes Page Links To:
- Individual Recipe Pages (via recipe cards)
- Category Pages (implicitly via filters)

### Meal Plans Page Links To:
- Category Pages (via "Customize My Plan")
- All Recipes Page (via "Browse Recipes")

## Mobile Navigation

### Hamburger Menu (Mobile Only)
```
☰ Menu
├── Home
├── Recipes
├── Meal Plans
├── About
└── Subscribe
```

## Dynamic Routes

### Category Pages
```
/category/dogs
/category/cats
/category/birds
/category/reptiles
/category/pocket-pets
```

### Recipe Pages
```
/recipe/dog-chicken-rice
/recipe/dog-beef-veggie
/recipe/cat-salmon-feast
/recipe/cat-chicken-liver
/recipe/bird-seed-mix
/recipe/reptile-veggie-mix
/recipe/guinea-pig-salad
```

## Filter Combinations

Each Category Page supports:
- **Breeds**: 7-10 options per category
- **Age Groups**: 4 options (Baby/Puppy, Young Adult, Adult, Senior)
- **Health Concerns**: 7 options (Weight Management, Allergies, Joint Health, Digestive, Kidney, Dental, None)

Total possible combinations per category: ~280-400 unique filter states

## Search & Discovery Features

### On All Recipes Page:
1. **Text Search**: Search by recipe name or description
2. **Category Filter**: Filter by pet type
3. **Tag Filter**: Filter by recipe tags (high-protein, grain-free, etc.)
4. **Combined Filters**: All three can work together

### On Category Pages:
1. **Breed/Type**: Specific breed selection
2. **Age Group**: Life stage filtering
3. **Health Concern**: Special dietary needs
4. **Nutritional Guidelines**: Dynamic display based on selections

## Content Pages

### Implemented:
- ✅ Home
- ✅ All Categories (5 pages)
- ✅ All Recipes
- ✅ Individual Recipes (7 samples)
- ✅ Meal Plans
- ✅ About
- ✅ Subscribe

### Can Be Added:
- Contact Us
- FAQ
- Nutrition Guide
- Privacy Policy
- Terms of Service
- Blog/Articles
- Success Stories
- Vet Directory

## External Links

Currently linking to:
- **Amazon**: For ingredient purchases
- **Social Media**: Placeholders in footer (can add links)

## SEO Structure

Each page has:
- Semantic HTML headings (h1, h2, h3)
- Descriptive page titles
- Meta descriptions (can be added)
- Clean URLs
- Proper alt tags for images
- Breadcrumb navigation (on some pages)

## Accessibility Features

- Keyboard navigation support
- Focus states on interactive elements
- Semantic HTML structure
- Color contrast compliance
- Responsive text sizing
- ARIA labels where needed

---

**Total Pages**: 15+ (including all category and recipe pages)
**Navigation Depth**: Maximum 3 clicks to any page
**Mobile Optimized**: All pages fully responsive
