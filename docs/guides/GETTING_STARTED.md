# Getting Started with PetPlates

Welcome to PetPlates! This guide will help you get the website up and running.

## Quick Start

### Step 1: Install Node.js (if not already installed)

1. Download Node.js LTS from: https://nodejs.org/
2. Run the installer
3. Verify installation by opening a terminal and running:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including Next.js, React, TypeScript, and Tailwind CSS.

### Step 3: Start the Development Server

You have two options:

**Option A: Use the startup script (Recommended)**
```bash
# On Windows PowerShell:
.\start.ps1

# On Mac/Linux or Git Bash:
./start.sh
```

**Option B: Use npm directly**
```bash
npm run dev
```

### Step 4: Open the Website

Once the server starts, open your browser and navigate to:
```
http://localhost:3000
```

## What You'll See

The website includes:

1. **Homepage** - Overview of PetPlates with benefits and trending recipes
2. **Category Pages** - Filter by pet type (Dogs, Cats, Birds, Reptiles, Pocket Pets)
3. **Recipe Browser** - Search and filter all recipes
4. **Individual Recipe Pages** - Detailed recipes with ingredients, instructions, and nutrition
5. **Meal Plans** - One-time meals and weekly subscription options
6. **About Page** - Information about the platform and nutritional standards

## Key Features to Explore

### 1. Category Filtering
- Go to any pet category (e.g., Dogs)
- Select a breed from the dropdown
- Choose an age group
- Pick health concerns
- See filtered recipe recommendations

### 2. Recipe Details
- Click any recipe card
- View complete ingredient list
- See step-by-step instructions
- Check nutritional breakdown
- Click "Buy on Amazon" to purchase ingredients

### 3. Meal Plans
- Navigate to Meal Plans
- Select your pet category
- Choose between one-time meal or weekly plan
- See sample weekly menu

## Customizing the Website

### Adding New Recipes

Edit `lib/data/recipes.ts`:

```typescript
{
  id: 'unique-recipe-id',
  name: 'Recipe Name',
  category: 'dogs', // or cats, birds, reptiles, pocket-pets
  breed: ['breed-id'],
  ageGroup: ['adult', 'senior'],
  healthConcerns: ['none'],
  description: 'Recipe description',
  ingredients: [
    // Add ingredients with nutrition data
  ],
  instructions: [
    'Step 1...',
    'Step 2...',
  ],
  // ... more fields
}
```

### Adding New Pet Breeds

Edit `lib/data/pets.ts`:

```typescript
export const dogBreeds: Breed[] = [
  { id: 'new-breed', name: 'New Breed Name', category: 'dogs' },
  // ... existing breeds
];
```

### Updating Nutritional Guidelines

Edit `lib/data/nutritional-guidelines.ts` to modify nutritional requirements based on latest AAFCO/WSAVA standards.

### Changing Colors/Styling

The primary color scheme is defined in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    50: '#f0fdf4',
    // ... other shades
    900: '#14532d',
  },
}
```

## Building for Production

To create a production-ready build:

```bash
npm run build
npm start
```

The optimized build will be in the `.next` folder.

## Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Sign up at https://vercel.com
3. Import your repository
4. Deploy automatically

### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`

### Other Platforms
Works with any platform supporting Next.js 14+

## Troubleshooting

### "Module not found" errors
Run: `npm install` to ensure all dependencies are installed

### Port 3000 already in use
Either:
- Stop other applications using port 3000
- Or edit `package.json` to use a different port:
  ```json
  "dev": "next dev -p 3001"
  ```

### Images not loading
Check your internet connection - recipe images are loaded from Unsplash

### TypeScript errors
Run: `npm run build` to see detailed error messages

## Next Steps

1. Explore the existing recipes and categories
2. Add your own recipes following the data structure
3. Customize the design to match your brand
4. Add user authentication (Firebase, Auth0, etc.)
5. Integrate with payment systems for subscriptions
6. Connect to a real database (MongoDB, PostgreSQL, etc.)
7. Add shopping cart functionality
8. Integrate with grocery delivery APIs

## Need Help?

- Check the main README.md for detailed project structure
- Review the code comments in each component
- Consult Next.js documentation: https://nextjs.org/docs
- Tailwind CSS docs: https://tailwindcss.com/docs

---

Happy cooking for your pets! 🐾
