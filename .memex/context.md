# PetPlates Project Rules

## Project Overview
**Name**: PetPlates - Personalized Pet Meal Prep Platform
**Type**: Next.js 14 web application for custom pet meal planning
**Categories**: Dogs, Cats, Birds, Reptiles, Pocket Pets
**Current Status**: Development phase, running on localhost:3000

## Technology Stack
- **Framework**: Next.js 14 with App Router (TypeScript)
- **Styling**: Tailwind CSS (utility-first)
- **Icons**: Lucide React
- **Data Storage**: TypeScript files (no database yet - future: consider Supabase/Firebase)
- **Authentication**: Planning Google Sign-In (not yet implemented)
- **Deployment Target**: Vercel (recommended)
- **Development OS**: Windows 10, PowerShell

## Design System

### Visual Style
- **Aesthetic**: Vibrant, colorful, cute surrealism
- **NOT**: Flat design, muted colors, Marc Bell intricate style
- **Mood**: Playful, energetic, joyful, slightly whimsical
- **Image Style**: 3D cartoon illustration with depth, bright saturated colors, cute surreal elements

### Color Palette
- **Primary Backgrounds**: Warm orange gradients (from-orange-500 to-orange-700)
- **Changed From**: Green theme (primary-600/800) - user preferred warmer tones
- **Accent Colors**: Hot pink, electric blue, lime green, sunny yellow, vivid purple
- **Text**: White on colored backgrounds, gray-900 on light backgrounds

### Typography & Spacing
- **Font**: Inter (from Next.js defaults)
- **Headings**: Bold, large (text-4xl to text-6xl)
- **Body**: text-base to text-xl depending on context
- **Spacing**: Generous padding and gaps for breathing room

## Data Architecture

### Recipe Structure (155 Total)
- **Dogs**: 40 recipes (10 puppy, 15 adult, 5 weight mgmt, 5 senior/joint, 5 digestive)
- **Cats**: 40 recipes (10 kitten, 15 adult, 5 weight mgmt, 5 senior/kidney, 5 digestive/hairball)
- **Birds**: 25 recipes (10 seed-based, 10 pellet/fresh, 5 specialty)
- **Reptiles**: 25 recipes (10 herbivore, 10 omnivore, 5 carnivore)
- **Pocket Pets**: 25 recipes (10 rabbit/guinea pig, 10 hamster/gerbil, 5 chinchilla/ferret)

### Recipe Requirements
- Must include: id, name, category, breeds, ageGroups, healthConcerns, description, ingredients, instructions, nutritionalInfo, tags, imageUrl
- All recipes must meet AAFCO and WSAVA nutritional guidelines
- Ingredients need Amazon links for purchasing
- Nutritional info includes: protein, fat, fiber, calcium, phosphorus, vitamins, calories

### Age Groups (IMPORTANT)
- **Display as**: "Baby" (NOT "Puppy/Kitten/etc")
- IDs: 'baby', 'young', 'adult', 'senior'
- Universal terminology across all pet categories

### Health Concerns (Need More Recipes For)
- weight-management
- allergies
- joint-health
- digestive
- kidney (cats mainly)
- dental
- none (general health)

## File Organization

### Key Files
- `/lib/data/recipes-complete.ts` - ALL 155 recipes (active)
- `/lib/data/recipes.ts` - Old file (backup)
- `/lib/data/pets.ts` - Breeds, age groups, health concerns
- `/lib/data/nutritional-guidelines.ts` - AAFCO/WSAVA standards
- `/lib/types.ts` - TypeScript interfaces

### Import Pattern
All pages import from `@/lib/data/recipes-complete` (not recipes.ts)

## Image Strategy

### Current State
- Using Unsplash placeholder images
- Many recipes missing proper images
- Need reptile-specific placeholder images

### Future Implementation
- 173 total custom images needed:
  - 155 recipe thumbnails
  - 5 category cards
  - 5 category hero headers  
  - 8 misc UI images
- Will generate using DALL-E 3 or Midjourney
- Style: Vibrant 3D cartoon, cute surreal, consistent across all images
- File naming: `{category}-recipe-{number}.jpg` format

### Image Prompt Template (When Ready)
```
[Subject - changes per image]

Style: Vibrant 3D cartoon illustration with depth, extremely bright saturated colors (hot pink, electric blue, lime green, sunny yellow), cute surreal elements with sparkles and stars, soft shadows and glossy textures, magical dreamy atmosphere, dimensional cartoon aesthetic similar to Pixar animation, gradient background, joyful energetic mood, high color saturation.
```

## Development Workflow

### Making Changes
1. Edit files in project
2. User refreshes browser (F5 or Ctrl+R)
3. Next.js hot-reload usually auto-updates
4. Hard refresh (Ctrl+Shift+R) if needed

### Running the Server
- Command: `npm run dev` or `.\start.ps1`
- URL: http://localhost:3000
- Stop: Ctrl+C in terminal
- Restart if changes don't appear

### Common Issues
- If recipes don't show: Check imports point to `recipes-complete.ts`
- If port 3000 in use: Change port or stop other apps
- If Node.js errors: Check terminal for red error messages
- If images don't load: Check internet connection (Unsplash CDN)

## Content Guidelines

### Recipe Naming
- Format: "{Protein} & {Ingredient} {Type}"
- Examples: "Chicken & Brown Rice Bowl", "Senior Salmon Omega Boost"
- Be specific about health benefits in name

### Descriptions
- Concise (1-2 sentences)
- Mention key benefits
- Include target audience (age/health concern)
- Example: "High-protein formula for growing puppies with optimal calcium ratios"

### Tags
- Use lowercase with hyphens
- Include: category type (puppy/adult/senior), key feature, dietary type
- Examples: ['puppy', 'high-protein', 'growth'], ['senior', 'omega-3', 'joint-support']

### Nutritional Compliance
- ALWAYS reference AAFCO standards in descriptions
- Include "Meets AAFCO standards" or similar language
- Nutritional ranges must align with `/lib/data/nutritional-guidelines.ts`

## Filtering System

### How It Works
- Category → Breed → Age → Health Concern (progressive filtering)
- Each filter narrows results
- Recipes can match multiple filters (multi-tagging)

### Recipe Tagging Strategy
- Tag broadly to appear in multiple filter combinations
- Example: Adult recipe can also tag 'young' for young adults
- Weight management recipes should also tag 'adult' and 'senior'

### Current Issue
- Not enough recipes for specific health concerns
- Need 5-10 recipes per health concern per category
- Priority: weight-management, joint-health, digestive, allergies

## Features Planned (Not Yet Implemented)

### User Profiles
- Google Sign-In authentication
- Save favorite recipes
- Track pet profiles (name, breed, age, health concerns)
- Meal plan history
- Shopping lists

### Profile Management
- Multiple pets per account
- Switch between pet profiles
- Customized recipe recommendations
- Dietary restrictions per pet

### Future Enhancements
- Recipe ratings and reviews (currently hardcoded)
- Shopping cart integration
- Meal plan calendar
- Portion calculator based on pet weight
- Print recipe functionality
- Recipe sharing via social media
- Email meal plans
- Ingredient substitution suggestions

## API Integration (Future)

### Planned Integrations
- Amazon Affiliate API (ingredient purchasing)
- Google OAuth (authentication)
- Stripe (subscription payments - optional)
- SendGrid/Mailchimp (email marketing)
- Image CDN (Cloudinary or similar for custom images)

### Data Migration Path
- Current: TypeScript files
- Next: Supabase or Firebase Firestore
- Migration will require:
  - Database schema design
  - Data seeding script
  - Update API calls in components
  - Keep types.ts interfaces

## User Preferences & Patterns

### User's Working Style
- Prefers complete implementations (all 155 recipes, not partial)
- Wants custom imagery throughout (cohesive design)
- Values vibrant, energetic aesthetics over minimalism
- Working on Windows with PowerShell
- Tests changes by refreshing localhost:3000

### Communication Pattern
- Direct requests for changes
- I make changes → user refreshes to see
- Iterative design refinement
- Values comprehensive documentation

### Decision Points Made
- ✅ Warm orange over green theme
- ✅ "Baby" instead of "Puppy/Kitten/etc"
- ✅ Vibrant cute surrealism over flat/Marc Bell styles
- ✅ All 155 recipes implemented at once
- ✅ DALL-E/Midjourney for custom images (future)
- ✅ Google Sign-In for auth (planning)

## Testing Checklist

### Before Deploying
- [ ] All 155 recipes load
- [ ] Filtering works for each category
- [ ] Search functionality works
- [ ] All images load (or have fallbacks)
- [ ] Age groups display as "Baby" not "Puppy/Kitten"
- [ ] Responsive on mobile, tablet, desktop
- [ ] No console errors
- [ ] All links work
- [ ] AAFCO compliance mentioned
- [ ] Health concern recipes adequate (5+ per category)

### Filter Testing
- [ ] Each breed shows appropriate recipes
- [ ] Each age group shows appropriate recipes
- [ ] Each health concern shows 5+ recipes
- [ ] Multiple filters work together
- [ ] "No results" shows helpful message

## Next Immediate Steps

1. Add more health concern recipes (especially weight-management, allergies, joint-health)
2. Fix all placeholder images (ensure reptile images work)
3. Implement Google Sign-In
4. Add profile creation/management UI
5. Create profile switcher on homepage
6. Generate all 173 custom images (user will do in DALL-E)
7. Replace placeholder images with custom ones

## Notes & Gotchas

- **Windows PowerShell**: Use `.\start.ps1` not `./start.sh`
- **Image URLs**: Unsplash sometimes changes, use consistent fallbacks
- **Recipe IDs**: Must be unique across all 155 recipes
- **Import Paths**: Always use `@/` alias, not relative paths
- **Tailwind Classes**: Don't use arbitrary values if Tailwind utility exists
- **TypeScript**: Strict mode enabled, must type everything
- **Age Group Display**: ALWAYS show "Baby" in UI, even if data says 'baby'
- **Multi-tagging**: Tag recipes with ALL applicable filters for better coverage

## Documentation Files

- `README.md` - Main project documentation
- `GETTING_STARTED.md` - Setup instructions
- `SETUP_CHECKLIST.md` - Step-by-step setup
- `PROJECT_SUMMARY.md` - Feature overview
- `SITEMAP.md` - Site structure
- `QUICK_REFERENCE.md` - Quick commands
- `RECIPE_LIST.md` - All 155 recipe names
- `INSTRUCTIONS.md` - File renaming instructions

All documentation should stay updated as project evolves.
