# PetPlates - Personalized Pet Meal Prep Platform

A comprehensive web platform for personalized pet meal preparation across Dogs, Cats, Birds, Reptiles, and Pocket Pets. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **Homepage**: Introduction to personalized pet meal prep concept with benefits
- **Category Pages**: Browse by pet type (Dogs, Cats, Birds, Reptiles, Pocket Pets)
- **Advanced Filtering**: Select by Breed → Age → Health Concern
- **Recipe Library**: Comprehensive recipes with complete nutritional information
- **Meal Plans**: One-time meals and weekly subscription options
- **Nutritional Guidelines**: Based on AAFCO and WSAVA standards

### Recipe Features
- Detailed ingredient lists with nutritional breakdown
- Step-by-step cooking instructions
- Complete nutritional information per serving
- Visual progress bars for macronutrients
- "Buy Ingredients" buttons linking to Amazon
- Recipe ratings and reviews
- Tags for easy filtering (high-protein, grain-free, etc.)

### Pet Categories Supported
- **Dogs**: Breed-specific nutrition for all sizes
- **Cats**: High-protein meals with essential taurine
- **Birds**: Species-appropriate seed mixes and fresh foods
- **Reptiles**: Calcium-rich diets for healthy bones
- **Pocket Pets**: High-fiber meals for rabbits, guinea pigs, etc.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd pet_plates_meal_platform
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
pet_plates_meal_platform/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── category/            # Category pages
│   │   └── [category]/
│   │       └── page.tsx     # Dynamic category page
│   ├── recipe/              # Recipe pages
│   │   └── [id]/
│   │       └── page.tsx     # Individual recipe page
│   ├── recipes/             # All recipes page
│   │   └── page.tsx
│   ├── meal-plans/          # Meal plans page
│   │   └── page.tsx
│   ├── about/               # About page
│   │   └── page.tsx
│   └── subscribe/           # Subscribe page
│       └── page.tsx
├── components/              # Reusable components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   └── RecipeCard.tsx
├── lib/                     # Utilities and data
│   ├── types.ts            # TypeScript types
│   └── data/               # Data files
│       ├── nutritional-guidelines.ts
│       ├── pets.ts
│       └── recipes.ts
├── public/                  # Static files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Data Structure

### Nutritional Guidelines
All nutritional data is based on AAFCO (Association of American Feed Control Officials) and WSAVA (World Small Animal Veterinary Association) guidelines.

Each pet category has age-specific requirements:
- **Protein** (% dry matter)
- **Fat** (% dry matter)
- **Fiber** (% dry matter)
- **Calcium** (% dry matter)
- **Phosphorus** (% dry matter)
- **Essential Vitamins**
- **Caloric Requirements** (kcal per kg body weight)

### Recipe Structure
Each recipe includes:
- Category and breed compatibility
- Age group suitability
- Health concern targeting
- Complete ingredient list with nutrition data
- Step-by-step instructions
- Full nutritional breakdown
- Amazon purchase links

## Customization

### Adding New Recipes
Edit `lib/data/recipes.ts` to add new recipes following the Recipe interface structure.

### Adding Pet Breeds
Edit `lib/data/pets.ts` to add new breeds, age groups, or health concerns.

### Modifying Nutritional Guidelines
Edit `lib/data/nutritional-guidelines.ts` to update nutritional requirements based on the latest research.

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Railway

## Future Enhancements

- [ ] User accounts and saved meal plans
- [ ] Shopping cart functionality
- [ ] Integration with grocery delivery services
- [ ] Mobile app version
- [ ] Recipe reviews and ratings system
- [ ] Custom recipe builder
- [ ] Nutritional calculator based on pet weight
- [ ] Veterinarian consultation booking
- [ ] Community recipe sharing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Nutritional data based on AAFCO and WSAVA guidelines
- Icons by Lucide
- Images from Unsplash

## Support

For questions or support, please contact us through the website or open an issue on GitHub.

---

Built with ❤️ for pets everywhere 🐾
