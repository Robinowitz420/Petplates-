'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      '**AAFCO** (Association of American Feed Control Officials) and **WSAVA** (World Small Animal Veterinary Association) set the gold standard for pet nutrition. We build every meal to those benchmarks with guidance from pet health specialists so your pet stays balanced.',
    icon: Check,
  },
  {
    id: 'ordering',
    title: 'Easy Ordering',
    subtitle: 'Get every ingredient delivered or buy them with one click on Amazon',
    hover:
      'Source ingredients from **Major Pet Retailers** like **Amazon**, Chewy, Petco, Walmart, Ollie, The Farmer\'s Dog, Butternut Box, HolistaPet, plus affiliate networks like Skimlinks, Rakuten, CJ, and ShareASale.',
    icon: ShoppingCart,
  },
  {
    id: 'plans',
    title: 'Why Meal Prep?',
    subtitle: 'Fresh prep beats whatever comes in a bag—every single time.',
    hover:
      'Meal prepping keeps pets healthier with fresh ingredients tailored to their needs. Paw & Plate knows species, age, size, and health concerns, then auto-adjusts portions and links trusted products you can buy today.',
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
          className="relative group text-center bg-surface rounded-xl shadow-lg border border-surface-highlight p-8 overflow-hidden hover:shadow-2xl transition-all duration-300"
        >
          <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Icon size={32} className="text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{card.title}</h3>
          <p className="text-gray-400">{card.subtitle}</p>
          <div className="absolute inset-0 bg-surface/95 px-4 py-6 text-sm text-gray-200 flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 backdrop-blur-sm">
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
  
  // Get userId for purchase tracking
  const userId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('last_user_id') || '' : '');
  
  if (isLoaded && user?.id) {
    const pets = getPetData(user.id);
    const hasPets = pets.length > 0;
    
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="relative w-full bg-surface/30 border-b border-surface-highlight py-8">
          <div className="max-w-4xl mx-auto relative w-full aspect-[16/9] h-[250px] md:h-[300px]">
            <Image
              src="/images/emojis/Mascots/HeroPics/HeroBanner-v3.png"
              alt="Paw & Plate Mascots"
              fill
              className="object-contain"
              priority
            />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Welcome Back, {user.firstName || 'Pet Owner'}!
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
              Fresh, vet-approved, and personalized nutrition for your beloved pets.
            </p>
            <Link
              href="/profile"
              className="btn btn-lg btn-darkgreen"
            >
              {hasPets ? 'View Your Pets' : "Start Your Pet's Plan"} <ArrowRight size={20} className="ml-2" />
            </Link>
          </section>
          
          <section className="py-12">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Why Paw & Plate?</h2>
            <WhyUsSection />
          </section>
        </main>

        <footer className="py-6 text-center text-sm text-gray-500 border-t border-surface-highlight">
          <SignOutButton>
            <button className="text-orange-400 hover:text-orange-300 font-medium">
              Log Out
            </button>
          </SignOutButton>
        </footer>
      </div>
    );
  }

  const categoryRecipes = recipes.filter(r => r.category === selectedCategory).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative w-full bg-surface/30 border-b border-surface-highlight py-8">
        <div className="max-w-4xl mx-auto relative w-full aspect-[16/9] h-[250px] md:h-[300px]">
          <Image
            src="/images/emojis/Mascots/HeroPics/HeroBanner-v3.png"
            alt="Paw & Plate - Meal prep made easy, for ALL your pets!"
            fill
            className="object-contain"
            priority
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-orange-500 tracking-tight mb-4 drop-shadow-sm">
            Paw & Plate
          </h1>
          <p className="mt-2 text-2xl md:text-3xl text-orange-400 font-medium mb-2">
            Meal prep made easy, for ALL your pets!
          </p>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Get vet-approved, custom-portioned meals designed specifically for your pet's breed, age, and health needs.
          </p>
          <Link
            href="/sign-in"
            className="btn btn-lg btn-darkgreen"
          >
            Start Your Pet's Plan
          </Link>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Find Your Pet's Perfect Meal Match
          </h2>
          <div className="flex justify-center space-x-4 mb-8 flex-wrap gap-2">
            {['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as PetCategory)}
                className={`px-4 py-2 rounded-full font-semibold capitalize transition ${
                  selectedCategory === category
                    ? 'bg-dark-green text-orange-400 shadow-md'
                    : 'bg-surface-highlight text-gray-300 hover:bg-surface-lighter border border-white/10'
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
                className="block bg-surface rounded-xl shadow-lg border border-surface-highlight hover:shadow-2xl hover:border-orange-500/50 transition overflow-hidden group"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white truncate group-hover:text-orange-400 transition-colors">{recipe.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">⭐ {(recipe.rating || 0).toFixed(1)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-12 border-t border-surface-highlight">
          <WhyUsSection />
        </section>
      </main>
    </div>
  );
}