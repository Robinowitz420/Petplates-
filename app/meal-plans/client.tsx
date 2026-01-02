'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Calendar, ShoppingCart } from 'lucide-react';
import { PetCategory } from '@/lib/types';

export default function MealPlansClientPage() {
  const [selectedCategory, setSelectedCategory] = useState<PetCategory>('dogs');
  const [planType, setPlanType] = useState<'one-time' | 'weekly'>('weekly');

  // Recipes are now generated dynamically
  const categoryRecipes: any[] = [];

  const planOptions = [
    {
      id: 'one-time',
      name: 'One-Time Meal',
      description: 'Single fresh meal for your pet',
      price: 12.99,
      features: [
        'Choose any recipe',
        'Complete ingredient list',
        'Detailed instructions',
        'Nutritional breakdown',
      ],
    },
    {
      id: 'weekly',
      name: 'Weekly Plan',
      description: '14 meals (2 per day for 7 days)',
      price: 89.99,
      savings: 'Save $92',
      features: [
        'Variety of meals',
        'All ingredients included',
        'Portion controlled',
        'Delivery schedule',
        'Flexible menu changes',
        'Cancel anytime',
      ],
    },
  ];
  const whyCards = [
    {
      id: 'standards',
      title: 'AAFCO Approved',
      subtitle: 'All meals meet or exceed AAFCO + WSAVA nutritional standards',
      hover:
        'AAFCO = Association of American Feed Control Officials. WSAVA = World Small Animal Veterinary Association. We follow both so every bowl stays complete and balanced.',
    },
    {
      id: 'ordering',
      title: 'Easy Ordering',
      subtitle: 'Get every ingredient delivered or buy them with one click online',
      hover:
        'Order from Major Pet Retailers, Chewy, Petco, Walmart, plus fresh options like Ollie, The Farmer’s Dog, Butternut Box, HolistaPet, and affiliate networks (Skimlinks, Rakuten, CJ, ShareASale).',
    },
    {
      id: 'mealprep',
      title: 'Why Meal Prep?',
      subtitle: 'Fresh prep beats whatever comes in a bag—every single time.',
      hover:
        'Meal prepping keeps pets healthier with fresh ingredients tailored to their needs—not generic kibble. Paws & Plates knows species, age, size, and health concerns, then auto-adjusts portions and links the exact products you can buy today.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Meal Plans
          </h1>
          <p className="text-xl text-primary-100">
            Choose the perfect meal plan for your pet
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Select Your Pet Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { id: 'dogs' as PetCategory, name: 'Dogs', emoji: '🐕' },
              { id: 'cats' as PetCategory, name: 'Cats', emoji: '🐈' },
              { id: 'birds' as PetCategory, name: 'Birds', emoji: '🦜' },
              { id: 'reptiles' as PetCategory, name: 'Reptiles', emoji: '🦎' },
              { id: 'pocket-pets' as PetCategory, name: 'Pocket Pets', emoji: '🐰' },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                }`}
              >
                <div className="text-4xl mb-2">{category.emoji}</div>
                <div className="font-semibold text-gray-900">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Plan Type Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {planOptions.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
                  planType === plan.id
                    ? 'ring-4 ring-primary-600'
                    : 'hover:shadow-xl'
                }`}
              >
                <div className="p-8">
                  {plan.savings && (
                    <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                      {plan.savings}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-2">
                      {plan.id === 'weekly' ? '/week' : '/meal'}
                    </span>
                  </div>
                  <button
                    onClick={() => setPlanType(plan.id as 'one-time' | 'weekly')}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      planType === plan.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {planType === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
                <div className="bg-gray-50 p-8 border-t">
                  <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Weekly Menu */}
        {planType === 'weekly' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Sample Weekly Menu for {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </h2>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                  <div key={day} className="border rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 text-center">{day}</h3>
                    <div className="space-y-3">
                      {[0, 1].map((mealIndex) => {
                        const recipeIndex = (dayIndex * 2 + mealIndex) % categoryRecipes.length;
                        const recipe = categoryRecipes[recipeIndex];
                        return recipe ? (
                          <div key={mealIndex} className="bg-gray-50 rounded p-2">
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                              {mealIndex === 0 ? 'Breakfast' : 'Dinner'}
                            </div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {recipe.name}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-gray-600 mt-6">
                Menus are customized based on your pet's breed, age, and health needs
              </p>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Complete your pet's profile to receive a personalized meal plan with meals tailored to their needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/category/${selectedCategory}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
            >
              <Calendar size={20} />
              Customize My Plan
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors border-2 border-white"
            >
              My Pets
            </Link>
          </div>
        </div>

        {/* Why Paws & Plates */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyCards.map((card) => {
            const Icon =
              card.id === 'standards' ? Check : card.id === 'ordering' ? ShoppingCart : Calendar;
            return (
              <div
                key={card.id}
                className="relative group text-center bg-white rounded-xl shadow p-8 overflow-hidden"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon size={32} className="text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600">{card.subtitle}</p>
                <div className="absolute inset-0 bg-white/95 px-4 py-6 text-sm text-gray-700 flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                  <p className="leading-relaxed">{card.hover}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
