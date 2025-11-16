'use client';

import Link from 'next/link';
import { Dog, Cat, Bird, Fish, Rabbit } from 'lucide-react';

const categories = [
  {
    id: 'dogs',
    name: 'Dogs',
    icon: Dog,
    description: 'Balanced meals for all dog breeds',
    color: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
  },
  {
    id: 'cats',
    name: 'Cats',
    icon: Cat,
    description: 'High-protein meals for felines',
    color: 'bg-purple-500',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
  },
  {
    id: 'birds',
    name: 'Birds',
    icon: Bird,
    description: 'Nutritious seed and grain mixes',
    color: 'bg-yellow-500',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800',
  },
  {
    id: 'reptiles',
    name: 'Reptiles',
    icon: Fish,
    description: 'Species-specific reptile nutrition',
    color: 'bg-green-500',
    image: 'https://images.unsplash.com/photo-1612834949224-f0de290e12fc?w=800',
  },
  {
    id: 'pocket-pets',
    name: 'Pocket Pets',
    icon: Rabbit,
    description: 'Fresh meals for small companions',
    color: 'bg-pink-500',
    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 to-orange-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              Fresh, Personalized Meals
              <br />
              <span className="text-orange-100">For Every Pet</span>
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
              Custom meal prep tailored to your pet's breed, age, and health needs.
              Based on AAFCO and WSAVA nutritional guidelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/recipes"
                className="px-8 py-4 bg-white text-orange-700 font-semibold rounded-lg hover:bg-orange-50 transition-colors text-lg"
              >
                Get Started - Browse Recipes
              </Link>
              <Link
                href="/profile"
                className="px-8 py-4 bg-orange-800 text-white font-semibold rounded-lg hover:bg-orange-900 transition-colors text-lg border-2 border-white"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Pet Category
            </h2>
            <p className="text-xl text-gray-600">
              Customized nutrition for every type of companion
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="aspect-square relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <category.icon size={48} className="mb-3" />
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm text-center opacity-90">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Fresh, personalized meals in four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Choose Category',
                description: 'Select your pet type: dog, cat, bird, reptile, or pocket pet',
              },
              {
                step: '2',
                title: 'Select Details',
                description: 'Pick breed, age group, and any health concerns',
              },
              {
                step: '3',
                title: 'Browse Recipes',
                description: 'View personalized meal recommendations with full nutritional info',
              },
              {
                step: '4',
                title: 'Save & Prepare',
                description: 'Save recipes to your profile and follow simple cooking instructions',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-500 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Ready to Transform Your Pet's Meals?
          </h2>
          <p className="text-xl text-orange-100">
            Join thousands of pet parents providing fresh, nutritious meals their pets love
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recipes"
              className="inline-block px-8 py-4 bg-white text-orange-700 font-semibold rounded-lg hover:bg-orange-50 transition-colors text-lg"
            >
              Browse Recipes
            </Link>
            <Link
              href="/profile"
              className="inline-block px-8 py-4 bg-orange-800 text-white font-semibold rounded-lg hover:bg-orange-900 transition-colors text-lg border-2 border-white"
            >
              Create Profile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}