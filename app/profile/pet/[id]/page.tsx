'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Calendar, Info, ShoppingBag } from 'lucide-react';

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';

interface Pet {
  id: string;
  name: string;
  type: PetCategory;
  breed: string;
  age: AgeGroup;
  healthConcerns: string[];
}

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [pet, setPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState<'meals' | 'nutrition' | 'instructions' | 'ingredients'>('meals');

  useEffect(() => {
    if (user?.id && params.id) {
      const storedPets = localStorage.getItem(`pets_${user.id}`);
      if (storedPets) {
        const pets: Pet[] = JSON.parse(storedPets);
        const foundPet = pets.find((p) => p.id === params.id);
        if (foundPet) {
          setPet(foundPet);
        } else {
          router.push('/profile');
        }
      }
    }
  }, [user?.id, params.id, router]);

  const getPetEmoji = (type: PetCategory) => {
    const emojis = {
      dogs: '🐕',
      cats: '🐈',
      birds: '🦜',
      reptiles: '🦎',
      'pocket-pets': '🐰',
    };
    return emojis[type];
  };

  if (!pet) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const tabs = [
    { id: 'meals', label: 'Past Meals', icon: Heart },
    { id: 'nutrition', label: 'Nutritional Info', icon: Info },
    { id: 'instructions', label: 'Instructions', icon: Calendar },
    { id: 'ingredients', label: 'Ingredients', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Profile
        </Link>

        {/* Pet Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="text-6xl">{getPetEmoji(pet.type)}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{pet.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span>
                  <span className="font-semibold">Breed:</span> {pet.breed}
                </span>
                <span>
                  <span className="font-semibold">Age:</span> {pet.age}
                </span>
                <span>
                  <span className="font-semibold">Type:</span> {pet.type}
                </span>
              </div>
              {pet.healthConcerns.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Health Concerns:</p>
                  <div className="flex flex-wrap gap-2">
                    {pet.healthConcerns.map((concern) => (
                      <span
                        key={concern}
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'meals' && (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved meals yet</h3>
                <p className="text-gray-600 mb-6">
                  Browse recipes and save them to {pet.name}'s profile
                </p>
                <Link
                  href={`/category/${pet.type}`}
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Browse {pet.type} Recipes
                </Link>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Nutritional Requirements for {pet.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Protein</p>
                    <p className="text-gray-600">Based on {pet.type} and {pet.age} life stage</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Fat</p>
                    <p className="text-gray-600">Tailored to activity level</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Fiber</p>
                    <p className="text-gray-600">Digestive health support</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Vitamins & Minerals</p>
                    <p className="text-gray-600">AAFCO/WSAVA compliant</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instructions' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Feeding Instructions for {pet.name}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-2">Meal Frequency</p>
                    <p className="text-blue-800">
                      {pet.age === 'baby'
                        ? '3-4 meals per day'
                        : pet.age === 'young'
                        ? '2-3 meals per day'
                        : '1-2 meals per day'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-900 mb-2">Portion Size</p>
                    <p className="text-green-800">Follow recipe serving sizes based on weight</p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="font-semibold text-orange-900 mb-2">Storage</p>
                    <p className="text-orange-800">
                      Refrigerate prepared meals for up to 3 days, freeze for longer storage
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Ingredients</h3>
                <p className="text-gray-600 mb-6">
                  Here are ingredients commonly used in {pet.type} recipes
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Protein source', 'Vegetables', 'Grains', 'Supplements', 'Healthy fats', 'Water'].map(
                    (ingredient) => (
                      <div key={ingredient} className="p-4 border-2 border-gray-200 rounded-lg text-center">
                        {ingredient}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}