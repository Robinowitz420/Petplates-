# Spec Provenance

**Project**: PetPlates - User Profile System with Google Authentication  
**Request Date**: 2025-11-14  
**Requested By**: User  
**Context**: Continuing implementation of user profile system for PetPlates meal prep platform

**User Requirements Gathered**:
- One Gmail account = One user profile
- User can add multiple pets under their profile
- Each pet has: name, category (dog/cat/bird/reptile/pocket-pet), breed, age group, health concerns
- User can save recipes to specific pets
- User can view saved recipes per pet
- User can create meal plans from saved recipes for each pet
- User can view meal plans per pet
- Must support the existing vibrant, colorful, cute surrealism design aesthetic

---

# Spec Header

## Name
**PetPlates User Profile & Authentication System**

## Smallest Acceptable Scope
User can:
1. Sign in with Google (Better Auth)
2. Create/edit/delete pet profiles (name, category, breed, age, health concerns)
3. Browse recipes and save them to specific pets
4. View all saved recipes for each pet
5. Create meal plans from saved recipes (name the plan, select recipes, assign to a pet)
6. View all meal plans for each pet
7. Sign out

**Non-goals for v1**:
- Recipe ratings/reviews (keep hardcoded)
- Shopping cart integration
- Portion calculator
- Print functionality
- Recipe sharing
- Email functionality
- Ingredient substitutions
- Dietary restriction tracking beyond health concerns
- Multi-user collaboration (one Gmail = one account)

---

# Paths to Supplementary Guidelines

**Tech Stack**:
- https://raw.githubusercontent.com/memextech/templates/refs/heads/main/stack/nextjs_fullstack.md

**Design Aesthetic** (No exact match, but reference existing project rules):
- Current design: Vibrant, colorful, cute surrealism
- Warm orange gradients (from-orange-500 to-orange-700)
- Accent colors: Hot pink, electric blue, lime green, sunny yellow, vivid purple
- 3D cartoon illustration aesthetic
- Continue existing PetPlates design system

---

# Decision Snapshot

## Tech Stack Changes
**From**: TypeScript files (no database) + planned "Supabase/Firebase"  
**To**: Better Auth + Turso (libSQL) + Drizzle ORM

**Why**:
- Better Auth is lighter and more flexible than NextAuth/Clerk
- Turso provides SQLite-compatible cloud database (keeps dev/prod parity)
- Drizzle ORM is type-safe and works seamlessly with Next.js
- Follows established Next.js fullstack guidelines
- All work on existing localhost:3000 setup

## Hosting Consideration
**Current Plan**: Vercel  
**Guideline Recommendation**: Netlify (zero-config Next.js via OpenNext adapter)

**Decision**: Implement database/auth stack that works with both (Turso + Better Auth are platform-agnostic). Can deploy to Vercel initially and migrate to Netlify later if needed without code changes.

## Data Model
```
User (Better Auth managed)
├── id (auto)
├── email (Google)
├── name (Google)
├── image (Google avatar)
└── createdAt

Pet
├── id (uuid)
├── userId (foreign key)
├── name
├── category (dog/cat/bird/reptile/pocket-pet)
├── breed
├── ageGroup (baby/young/adult/senior)
├── healthConcerns (array: weight-management, allergies, joint-health, etc.)
├── createdAt
└── updatedAt

SavedRecipe
├── id (uuid)
├── petId (foreign key)
├── recipeId (references existing recipe data)
├── notes (optional, for user's custom notes)
└── savedAt

MealPlan
├── id (uuid)
├── petId (foreign key)
├── name (user-defined: "Week 1", "Winter Menu", etc.)
├── createdAt
└── updatedAt

MealPlanRecipe (junction table)
├── id (uuid)
├── mealPlanId (foreign key)
├── recipeId (references existing recipe data)
├── dayOfWeek (optional: Monday-Sunday or null)
├── mealType (optional: breakfast/lunch/dinner or null)
└── order (for custom sorting)
```

## Authentication Flow
1. User clicks "Sign In with Google" on homepage
2. Better Auth handles OAuth redirect to Google
3. Google returns with user info (email, name, photo)
4. Better Auth creates/updates user record
5. Session cookie set (httpOnly, secure)
6. User redirected to dashboard/profile page
7. Protected routes check session server-side

## User Journey
1. **First Visit**: Homepage → "Sign In with Google" button in header
2. **After Sign-In**: Redirect to `/dashboard` (or `/profile`)
3. **Dashboard**: "Add Your First Pet" CTA if no pets exist
4. **Add Pet Flow**: Modal/page with form (name, category, breed, age, health concerns)
5. **Browse Recipes**: Existing recipe pages get "Save to Pet" button (dropdown to select which pet)
6. **Saved Recipes View**: `/pets/[petId]/recipes` shows all saved recipes for that pet
7. **Create Meal Plan**: `/pets/[petId]/meal-plans/new` - select from saved recipes, name the plan
8. **View Meal Plans**: `/pets/[petId]/meal-plans` lists all plans for that pet

---

# Architecture at a Glance

## File Structure (New Files)
```
/lib
  /auth
    auth.ts                    # Better Auth config
    auth-client.ts             # Client-side auth methods
  /db
    schema.ts                  # Drizzle schema (User, Pet, SavedRecipe, MealPlan)
    db.ts                      # Database client (Turso connection)
    queries.ts                 # Common database queries
  /types.ts                    # Add new types (Pet, SavedRecipe, MealPlan)

/app
  /api
    /auth/[...all]/route.ts    # Better Auth API routes
    /pets/route.ts             # CRUD for pets
    /saved-recipes/route.ts    # CRUD for saved recipes
    /meal-plans/route.ts       # CRUD for meal plans
  
  /dashboard
    page.tsx                   # Main dashboard after login
  
  /profile
    page.tsx                   # User profile settings
  
  /pets
    /[petId]
      /recipes
        page.tsx               # Saved recipes for this pet
      /meal-plans
        page.tsx               # All meal plans for this pet
        /[planId]
          page.tsx             # Single meal plan view
        /new
          page.tsx             # Create new meal plan

/components
  /auth
    SignInButton.tsx           # Google Sign-In button
    SignOutButton.tsx          # Sign out button
    UserMenu.tsx               # Header dropdown with user info
  
  /pets
    PetCard.tsx                # Display pet info card
    PetForm.tsx                # Add/edit pet form
    PetSelector.tsx            # Dropdown to select pet
  
  /recipes
    SaveRecipeButton.tsx       # Button to save recipe to pet
    SavedRecipeCard.tsx        # Card for saved recipe with notes
  
  /meal-plans
    MealPlanForm.tsx           # Create/edit meal plan
    MealPlanCard.tsx           # Display meal plan summary
    MealPlanCalendar.tsx       # Weekly calendar view (optional)

.env.local
  DATABASE_URL=file:.data/dev.db    # Local SQLite
  TURSO_DATABASE_URL=               # Production (Turso)
  TURSO_AUTH_TOKEN=                 # Production (Turso)
  BETTER_AUTH_SECRET=               # Auth secret
  BETTER_AUTH_URL=http://localhost:3000  # Auth base URL
  GOOGLE_CLIENT_ID=                 # Google OAuth
  GOOGLE_CLIENT_SECRET=             # Google OAuth

drizzle.config.ts                   # Drizzle configuration
package.json                        # Add: better-auth, drizzle-orm, @libsql/client
```

## Component Flow
```
Homepage (/)
└── Header
    ├── Logo
    └── UserMenu (if signed in) OR SignInButton (if not)

Dashboard (/dashboard) [Protected]
└── User greeting
└── Pet list
    ├── PetCard (each pet)
    └── "Add New Pet" button

Pet Detail (/pets/[petId]/recipes) [Protected]
└── Pet info header
└── Saved recipes grid
    └── SavedRecipeCard (each recipe)

Recipe Detail (/recipe/[id])
└── Existing recipe view
└── SaveRecipeButton (if signed in)
    └── PetSelector dropdown

Meal Plan View (/pets/[petId]/meal-plans) [Protected]
└── Pet info header
└── Meal plans list
    ├── MealPlanCard (each plan)
    └── "Create New Meal Plan" button

Create Meal Plan (/pets/[petId]/meal-plans/new) [Protected]
└── MealPlanForm
    └── Select from saved recipes
    └── Optional: assign to days/meals
    └── Save button
```

---

# Implementation Plan

## Phase 1: Database & Auth Setup

### 1.1 Install Dependencies
```bash
npm install better-auth drizzle-orm @libsql/client
npm install -D drizzle-kit
```

### 1.2 Create Drizzle Schema (`/lib/db/schema.ts`)
Define tables:
- `user` (Better Auth managed)
- `session` (Better Auth managed)
- `account` (Better Auth managed)
- `verification` (Better Auth managed)
- `pet` (custom)
- `savedRecipe` (custom)
- `mealPlan` (custom)
- `mealPlanRecipe` (custom, junction table)

Use SQLite-compatible types (text, integer, real).

### 1.3 Create Database Client (`/lib/db/db.ts`)
```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:.data/dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

### 1.4 Configure Better Auth (`/lib/auth/auth.ts`)
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db/db';
import * as schema from '@/lib/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

### 1.5 Create Auth Client (`/lib/auth/auth-client.ts`)
```typescript
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
});
```

### 1.6 Create Auth API Route (`/app/api/auth/[...all]/route.ts`)
```typescript
import { auth } from '@/lib/auth/auth';

export const { GET, POST } = auth.handler;
export const runtime = 'nodejs';
```

### 1.7 Setup Drizzle Config (`drizzle.config.ts`)
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:.data/dev.db',
  },
});
```

### 1.8 Initialize Database
```bash
# Create .data directory
mkdir .data

# Push schema to database
npx drizzle-kit push:sqlite

# (Optional) Generate migrations
npx drizzle-kit generate:sqlite
```

### 1.9 Setup Google OAuth
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Add production URI later: `https://yourdomain.com/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

---

## Phase 2: Authentication UI

### 2.1 Create Sign-In Button (`/components/auth/SignInButton.tsx`)
```typescript
'use client';

import { authClient } from '@/lib/auth/auth-client';

export function SignInButton() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  };

  return (
    <button
      onClick={handleSignIn}
      className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2"
    >
      <GoogleIcon />
      Sign In with Google
    </button>
  );
}
```

### 2.2 Create User Menu (`/components/auth/UserMenu.tsx`)
Display user avatar, name, dropdown with:
- View Profile
- Dashboard
- Sign Out

### 2.3 Update Header
Add conditional rendering:
- If signed in: show UserMenu
- If not: show SignInButton

### 2.4 Create Protected Route Helper
```typescript
// /lib/auth/get-session.ts
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export async function getSession() {
  return await auth.api.getSession({
    headers: headers(),
  });
}
```

---

## Phase 3: Pet Profile Management

### 3.1 Create Pet API Routes (`/app/api/pets/route.ts`)
- GET: Fetch all pets for logged-in user
- POST: Create new pet

`/app/api/pets/[id]/route.ts`:
- GET: Fetch single pet
- PATCH: Update pet
- DELETE: Delete pet

All routes must check session and user ownership.

### 3.2 Create Pet Form Component (`/components/pets/PetForm.tsx`)
Form fields:
- Name (text input)
- Category (dropdown: dog/cat/bird/reptile/pocket-pet)
- Breed (dropdown, filtered by category - use existing data from `/lib/data/pets.ts`)
- Age Group (dropdown: baby/young/adult/senior)
- Health Concerns (multi-select checkboxes)

Submit → POST to `/api/pets` → Redirect to dashboard

### 3.3 Create Pet Card Component (`/components/pets/PetCard.tsx`)
Display:
- Pet name
- Category icon
- Breed
- Age group (display as "Baby" not "Puppy/Kitten")
- Health concerns tags
- Actions: View Recipes, View Meal Plans, Edit, Delete

### 3.4 Create Dashboard Page (`/app/dashboard/page.tsx`)
Protected page that:
1. Checks session (redirect to `/` if not signed in)
2. Fetches user's pets
3. Displays PetCard for each pet
4. Shows "Add Your First Pet" CTA if no pets

---

## Phase 4: Save Recipes Feature

### 4.1 Create Saved Recipes API Routes
`/app/api/saved-recipes/route.ts`:
- GET: Fetch saved recipes for a pet (query param: `petId`)
- POST: Save recipe to pet (body: `petId`, `recipeId`, `notes`)

`/app/api/saved-recipes/[id]/route.ts`:
- DELETE: Remove saved recipe
- PATCH: Update notes

### 4.2 Create Save Recipe Button (`/components/recipes/SaveRecipeButton.tsx`)
On recipe detail page:
1. Check if user is signed in
2. If yes: Show "Save to Pet" button
3. On click: Open dropdown/modal with pet selector
4. User selects pet → POST to `/api/saved-recipes`
5. Show success toast

If recipe already saved to a pet, show "Saved ✓" state.

### 4.3 Create Pet Selector Component (`/components/pets/PetSelector.tsx`)
Dropdown/modal that:
- Fetches user's pets
- Displays each pet as selectable option
- Returns selected petId to parent

### 4.4 Create Saved Recipes Page (`/app/pets/[petId]/recipes/page.tsx`)
Protected page that:
1. Checks session and pet ownership
2. Fetches saved recipes for this pet
3. Joins with recipe data from `/lib/data/recipes-complete.ts`
4. Displays grid of SavedRecipeCard components
5. Each card shows recipe image, name, and user's notes
6. Action buttons: View Recipe, Remove from Saved

---

## Phase 5: Meal Plan Feature

### 5.1 Create Meal Plan API Routes
`/app/api/meal-plans/route.ts`:
- GET: Fetch meal plans for a pet (query param: `petId`)
- POST: Create new meal plan (body: `petId`, `name`, `recipes[]`)

`/app/api/meal-plans/[id]/route.ts`:
- GET: Fetch single meal plan with all recipes
- PATCH: Update meal plan (name, recipes)
- DELETE: Delete meal plan

### 5.2 Create Meal Plan Form (`/components/meal-plans/MealPlanForm.tsx`)
Form that:
1. Text input for meal plan name
2. Fetches saved recipes for this pet
3. Multi-select/checkbox list of saved recipes
4. Optional: Assign recipes to days of week (drag-drop or dropdowns)
5. Optional: Assign meal type (breakfast/lunch/dinner)
6. Submit → POST to `/api/meal-plans`

### 5.3 Create Meal Plan Card (`/components/meal-plans/MealPlanCard.tsx`)
Display:
- Meal plan name
- Number of recipes
- Created date
- Preview thumbnails of first 3 recipes
- Actions: View, Edit, Delete

### 5.4 Create Meal Plans List Page (`/app/pets/[petId]/meal-plans/page.tsx`)
Protected page that:
1. Checks session and pet ownership
2. Fetches all meal plans for this pet
3. Displays grid of MealPlanCard components
4. "Create New Meal Plan" button → navigates to `/pets/[petId]/meal-plans/new`

### 5.5 Create New Meal Plan Page (`/app/pets/[petId]/meal-plans/new/page.tsx`)
Protected page with MealPlanForm component.

### 5.6 Create Meal Plan Detail Page (`/app/pets/[petId]/meal-plans/[planId]/page.tsx`)
Protected page that:
1. Fetches meal plan with all recipes
2. Displays meal plan name, created date
3. Shows full recipe grid (with images, names)
4. Optional: Calendar/table view if days/meals were assigned
5. Action buttons: Edit, Delete, Print (future)

---

## Phase 6: UI/UX Polish

### 6.1 Design Consistency
- Use existing PetPlates color scheme (warm orange gradients, vibrant accents)
- Keep 3D cartoon aesthetic for any new icons/illustrations
- Ensure responsive design (mobile, tablet, desktop)
- Add loading states (skeleton screens)
- Add error states (friendly error messages)

### 6.2 Toasts/Notifications
Install toast library (e.g., `react-hot-toast` or `sonner`):
- "Recipe saved to [Pet Name]!"
- "Meal plan created!"
- "Pet profile updated!"
- Error messages for failures

### 6.3 Empty States
- Dashboard: "Add your first pet to get started!"
- Saved Recipes: "No saved recipes yet. Browse recipes and save your favorites!"
- Meal Plans: "Create your first meal plan to organize recipes!"

### 6.4 Navigation Updates
Update main navigation to include (when signed in):
- Dashboard
- My Pets (dropdown with pet names → quick links to their recipes/meal plans)

### 6.5 Loading Optimization
- Use React Suspense for data fetching
- Add skeleton loaders for cards/lists
- Optimize images (already using Unsplash, but ensure Next.js Image component)

---

## Phase 7: Data Migration & Testing

### 7.1 Local Testing Checklist
- [ ] Sign in with Google works
- [ ] User session persists across page refreshes
- [ ] Create pet profile (all fields save correctly)
- [ ] Edit pet profile
- [ ] Delete pet profile
- [ ] Save recipe to pet (from recipe detail page)
- [ ] View saved recipes for pet
- [ ] Remove recipe from saved
- [ ] Create meal plan from saved recipes
- [ ] View meal plan details
- [ ] Edit meal plan
- [ ] Delete meal plan
- [ ] Sign out works
- [ ] Protected routes redirect if not signed in
- [ ] No user can access another user's pets/data

### 7.2 Edge Cases
- User with no pets sees appropriate CTA
- Pet with no saved recipes shows empty state
- Pet with no meal plans shows empty state
- Recipe already saved to pet shows "Saved ✓" state
- Prevent saving same recipe to same pet twice
- Handle recipe deletion gracefully (if recipe removed from recipes-complete.ts, show placeholder in saved recipes)

### 7.3 Data Integrity
- Foreign key constraints in Drizzle schema
- Cascade deletes (if pet deleted, delete all saved recipes and meal plans for that pet)
- User ownership checks on all API routes

---

# Verification & Demo Script

## Local Development Verification

### 1. Setup
```bash
# Install dependencies
npm install

# Create .data directory
mkdir .data

# Push database schema
npx drizzle-kit push:sqlite

# Start dev server
npm run dev
```

### 2. Test Authentication
1. Navigate to http://localhost:3000
2. Click "Sign In with Google" in header
3. Complete Google OAuth flow
4. Verify redirect to `/dashboard`
5. Verify user name/avatar appears in header
6. Sign out → verify redirect to homepage

### 3. Test Pet Profiles
1. Sign in
2. Click "Add Pet" on dashboard
3. Fill form: Name = "Fluffy", Category = Cat, Breed = Persian, Age = Senior, Health = joint-health
4. Submit → verify redirect to dashboard
5. Verify Fluffy appears in pet list
6. Click "Edit" on Fluffy → change name to "Fluffy McFlufferson" → Save
7. Verify name updated
8. Create second pet: Name = "Rex", Category = Dog, Breed = Labrador, Age = Adult
9. Verify both pets appear on dashboard

### 4. Test Save Recipes
1. Navigate to a recipe detail page (e.g., /recipe/dog-03)
2. Verify "Save to Pet" button appears (only when signed in)
3. Click button → select "Rex" from dropdown
4. Verify success toast: "Recipe saved to Rex!"
5. Click "Save to Pet" again → select "Fluffy"
6. Navigate to `/pets/[rex-id]/recipes`
7. Verify recipe appears in Rex's saved recipes
8. Navigate to `/pets/[fluffy-id]/recipes`
9. Verify recipe appears in Fluffy's saved recipes
10. Save 3-4 more recipes to Rex

### 5. Test Meal Plans
1. Navigate to `/pets/[rex-id]/meal-plans`
2. Click "Create New Meal Plan"
3. Enter name: "Week 1 Menu"
4. Select 5 recipes from saved recipes list
5. (Optional) Assign to days: Monday-Friday
6. Click "Create Meal Plan"
7. Verify redirect to meal plans list
8. Verify "Week 1 Menu" appears with 5 recipes
9. Click meal plan → verify detail page shows all 5 recipes
10. Create second meal plan: "Winter Special" with 3 recipes
11. Verify both meal plans appear in list

### 6. Test Data Isolation
1. Open incognito window
2. Sign in with different Google account
3. Verify empty dashboard (no pets from first account)
4. Create a pet
5. Verify pet only appears for second account
6. Sign out from both accounts

---

## Demo Flow for Stakeholder

**"Welcome to PetPlates with User Profiles!"**

1. **Homepage Tour**: "Here's the updated homepage with Google Sign-In in the header."

2. **Sign In**: *Click "Sign In with Google"* → "Users authenticate with their Gmail account. Quick and secure."

3. **Dashboard**: *After redirect* → "This is the user dashboard. You can manage all your pets from here."

4. **Add First Pet**: *Click "Add Pet"* → Fill form: Fluffy, Cat, Persian, Senior, Joint Health → "Each pet profile captures everything needed for personalized meal planning."

5. **Add Second Pet**: *Add Rex, Dog, Labrador, Adult* → "Users can add as many pets as they have in their household."

6. **Browse Recipes**: *Navigate to Dogs category* → "All 155 recipes are still here with full filtering."

7. **Save Recipe**: *Open a recipe* → Click "Save to Pet" → Select Rex → "Users can save recipes to specific pets for easy access later."

8. **View Saved Recipes**: *Navigate to Rex's saved recipes* → "Here are all the recipes saved for Rex. Users can add notes and remove recipes anytime."

9. **Create Meal Plan**: *Click "Create Meal Plan"* → Name it "Week 1", select 5 recipes → "Users can organize saved recipes into meal plans. Great for meal prep!"

10. **View Meal Plans**: *Navigate to meal plans list* → Click "Week 1" → "Here's the full meal plan with all recipes. Users can edit, delete, or create new plans."

11. **Switch Pets**: *Navigate to Fluffy's dashboard* → "Each pet has their own saved recipes and meal plans. Completely separate."

12. **Sign Out**: *Click sign out* → "Secure sign-out. All data is saved and waiting for next login."

---

# Deploy

## Environment Variables Needed

### Local Development (.env.local)
```
DATABASE_URL=file:.data/dev.db
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
```

### Production (Vercel/Netlify)
```
TURSO_DATABASE_URL=<from Turso CLI: turso db create petplates>
TURSO_AUTH_TOKEN=<from Turso CLI: turso db tokens create petplates>
BETTER_AUTH_SECRET=<same as local or new secret>
BETTER_AUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=<same as local>
GOOGLE_CLIENT_SECRET=<same as local>
```

## Deployment Steps (Vercel)

### 1. Setup Turso Database
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create petplates

# Get database URL
turso db show petplates --url

# Create auth token
turso db tokens create petplates
```

### 2. Push Schema to Turso
```bash
# Set environment variables
export TURSO_DATABASE_URL=<your-turso-url>
export TURSO_AUTH_TOKEN=<your-turso-token>

# Push schema
npx drizzle-kit push:sqlite
```

### 3. Update Google OAuth
1. Go to Google Cloud Console
2. Add production redirect URI: `https://yourdomain.vercel.app/api/auth/callback/google`
3. Save

### 4. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - TURSO_DATABASE_URL
# - TURSO_AUTH_TOKEN
# - BETTER_AUTH_SECRET
# - BETTER_AUTH_URL (set to your production domain)
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET

# Redeploy to pick up env vars
vercel --prod
```

### 5. Test Production
1. Visit production URL
2. Sign in with Google
3. Create pet, save recipes, create meal plan
4. Verify all features work
5. Sign out and sign back in → verify data persists

---

## Deployment Steps (Netlify - Recommended)

### 1. Setup Turso (same as above)

### 2. Create netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[dev]
  framework = "#custom"
  command = "npm run dev"
  targetPort = 3000
  port = 8888
```

### 3. Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Set environment variables
netlify env:set TURSO_DATABASE_URL <your-turso-url>
netlify env:set TURSO_AUTH_TOKEN <your-turso-token>
netlify env:set BETTER_AUTH_SECRET <your-secret>
netlify env:set BETTER_AUTH_URL <your-netlify-url>
netlify env:set GOOGLE_CLIENT_ID <your-client-id>
netlify env:set GOOGLE_CLIENT_SECRET <your-client-secret>

# Deploy
netlify deploy --prod
```

---

## Post-Deployment Checklist
- [ ] Google OAuth redirect URI updated for production domain
- [ ] All environment variables set in hosting platform
- [ ] Database schema pushed to Turso
- [ ] Sign-in works on production
- [ ] Pet CRUD operations work
- [ ] Save recipes works
- [ ] Meal plans work
- [ ] Sign-out works
- [ ] Sessions persist across page refreshes
- [ ] Mobile responsive design verified

---

## Rollback Plan
If production issues occur:
1. Keep local development database (`.data/dev.db`) as backup
2. Turso supports point-in-time recovery
3. Can revert Vercel/Netlify deployment to previous version
4. Google OAuth changes are non-destructive (old URIs still work)

---

## Future Enhancements (Post-v1)
- Recipe ratings/reviews (user-generated)
- Shopping cart integration (Amazon Affiliate API)
- Portion calculator based on pet weight
- Print meal plan functionality
- Share meal plans via email/social
- Ingredient substitution suggestions
- Export meal plans to PDF
- Weekly meal plan reminders (email notifications)
- Recipe search within saved recipes
- Meal plan templates ("7-Day Rotation", "Senior Dog Special")
- Multi-user households (share pets between accounts)
- Pet photo uploads (custom pet avatars)
- Recipe notes/modifications per pet
- Dietary restriction tracking beyond health concerns
- Integration with smart kitchen devices (future-future)

---

## Notes
- **Better Auth over NextAuth**: Better Auth is lighter, more flexible, and has better TypeScript support. Less boilerplate for social providers.
- **Turso over Supabase**: Turso provides SQLite compatibility (same DB locally and in prod), better for Next.js App Router, lower latency with edge deployment.
- **Drizzle over Prisma**: Lighter, closer to SQL, better TypeScript inference, no generation step in dev.
- **PaaS-first**: Turso is fully managed (no server ops), Vercel/Netlify handle scaling automatically.
- **Existing Design System**: All new UI must match vibrant, colorful, cute surrealism aesthetic. Use existing Tailwind classes (warm orange gradients, accent colors).
- **Age Group Display**: Remember to display "Baby" in UI, even though data uses 'baby'/'puppy'/'kitten' IDs.
- **Recipe Data**: Keep existing 155 recipes in TypeScript files (`recipes-complete.ts`). No migration needed—database only stores user data (pets, saved recipes, meal plans). Recipe IDs reference existing data.
- **Windows PowerShell**: User is on Windows 10, commands should work in PowerShell (npm, npx work fine).
