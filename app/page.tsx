'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Calendar, ShoppingCart, ArrowRight } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs'; 
import { recipes } from '@/lib/data/recipes-complete';
import { PetCategory } from '@/lib/types';

const getPetData = (userId: string) => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

const whyCards = [
  {
    id: 'standards',
    title: 'AAFCO Approved',
    subtitle: 'All meals meet or exceed AAFCO + WSAVA nutritional standards',
    hover:
      'AAFCO: Association of American Feed Control Officials. WSAVA: World Small Animal Veterinary Association. We build every meal to those benchmarks so your pet stays balanced.',
    icon: Check,
  },
  {
    id: 'ordering',
    title: 'Easy Ordering',
    subtitle: 'Get every ingredient delivered or buy them with one click online',
    hover:
      'Source ingredients from Major Pet Retailers like Amazon, Chewy, Petco, Walmart, Ollie, The Farmer’s Dog, Butternut Box, HolistaPet, plus affiliate networks like Skimlinks, Rakuten, CJ, and ShareASale.',
    icon: ShoppingCart,
  },
  {
    id: 'plans',
    title: 'Why Meal Prep?',
    subtitle: 'Fresh prep beats whatever comes in a bag—every single time.',
    hover:
      'Meal prepping keeps pets healthier with fresh ingredients tailored to their needs. ThePetPantry knows species, age, size, and health concerns, then auto-adjusts portions and links trusted products you can buy today.',
    icon: Calendar,
  },
];

const WhyUsSection = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    {whyCards.map((card) => {
      const Icon = card.icon;
      return (
        <div
          key={card.id}
          className="relative group text-center bg-white rounded-xl shadow p-8 overflow-hidden"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon size={32} className="text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
          <p className="text-gray-600">{card.subtitle}</p>
          <div className="absolute inset-0 bg-white/95 px-4 py-6 text-sm text-gray-700 flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
            <p className="leading-relaxed"><strong>{card.hover}</strong></p>
          </div>
        </div>
      );
    })}
  </div>
);

export default function HomePage() { 
  const { user, isLoaded } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<PetCategory>('dogs');
  
  if (isLoaded && user?.id) {
    const pets = getPetData(user.id);
    const hasPets = pets.length > 0;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-br from-orange-500 to-orange-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight">
              Welcome Back, {user.firstName || 'Pet Owner'}!
            </h1>
            <p className="mt-4 text-xl opacity-90 max-w-2xl mx-auto">
              Fresh, vet-approved, and personalized nutrition for your beloved pets.
            </p>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <Link
                href="/profile"
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full shadow-2xl text-orange-700 bg-white hover:bg-orange-50 transition"
              >
                {hasPets ? 'View Your Pets' : "Start Your Pet's Plan"} <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <section className="py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Why ThePetPantry?</h2>
            <WhyUsSection />
          </section>
        </main>

        <footer className="py-6 text-center text-sm text-gray-500 border-t">
          <SignOutButton>
            <button className="text-orange-600 hover:text-orange-800 font-medium">
              Log Out
            </button>
          </SignOutButton>
        </footer>
      </div>
    );
  }

  const categoryRecipes = recipes.filter(r => r.category === selectedCategory).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center py-16">
          <h1 className="text-6xl font-extrabold text-orange-700 tracking-tight">
            Personalized Meals. Happy Pets.
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Get vet-approved, custom-portioned meals designed specifically for your pet's breed, age, and health needs.
          </p>
          <div className="mt-8">
            <Link
              href="/sign-in"
              className="inline-flex items-center px-8 py-4 border border-transparent text-xl font-medium rounded-full shadow-2xl text-white bg-orange-600 hover:bg-orange-700 transition"
            >
              Start Your Pet's Plan
            </Link>
          </div>
        </header>

        <section className="py-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Find Your Pet's Perfect Meal Match
          </h2>
          <div className="flex justify-center space-x-4 mb-8 flex-wrap gap-2">
            {['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as PetCategory)}
                className={`px-4 py-2 rounded-full font-semibold capitalize transition ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {category.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryRecipes.map((recipe) => (
              <Link 
                key={recipe.id} 
                href={`/recipe/${recipe.id}`} 
                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
              >
                <div className="h-48 bg-gray-200">
                  <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover"/>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{recipe.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">⭐ {recipe.rating.toFixed(1)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-12 border-t border-gray-200">
          <WhyUsSection />
        </section>
      </main>
    </div>
  );
}