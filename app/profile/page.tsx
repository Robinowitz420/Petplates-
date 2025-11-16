'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ChefHat, Plus, Trash2 } from 'lucide-react';
import AddPetModal from '@/components/AddPetModal';

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

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);

  // Load pets from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const storedPets = localStorage.getItem(`pets_${user.id}`);
      if (storedPets) {
        setPets(JSON.parse(storedPets));
      }
    }
  }, [user?.id]);

  // Save pets to localStorage whenever they change
  useEffect(() => {
    if (user?.id && pets.length > 0) {
      localStorage.setItem(`pets_${user.id}`, JSON.stringify(pets));
    }
  }, [pets, user?.id]);

  const handleAddPet = (petData: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...petData,
      id: `pet_${Date.now()}`,
    };
    setPets([...pets, newPet]);
  };

  const handleDeletePet = (petId: string) => {
    setPets(pets.filter((p) => p.id !== petId));
    if (user?.id) {
      const updatedPets = pets.filter((p) => p.id !== petId);
      localStorage.setItem(`pets_${user.id}`, JSON.stringify(updatedPets));
    }
  };

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

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'Pet Parent'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your pets and their personalized meal plans
              </p>
            </div>
            <ChefHat className="h-16 w-16 text-primary-600" />
          </div>
        </div>

        {/* My Pets Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Pet
            </button>
          </div>

          {pets.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                <ChefHat className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No pets yet</h3>
              <p className="text-gray-600 mb-6">
                Add your first pet to get personalized recipe recommendations!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Your First Pet
              </button>
            </div>
          ) : (
            /* Pets Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div key={pet.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{getPetEmoji(pet.type)}</div>
                    <button
                      onClick={() => handleDeletePet(pet.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pet.name}</h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Breed:</span> {pet.breed}
                  </p>
                  <p className="text-gray-600 mb-3">
                    <span className="font-semibold">Age:</span> {pet.age}
                  </p>
                  {pet.healthConcerns.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Health Concerns:</p>
                      <div className="flex flex-wrap gap-2">
                        {pet.healthConcerns.map((concern) => (
                          <span
                            key={concern}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                          >
                            {concern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <Link
                    href={`/profile/pet/${pet.id}`}
                    className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            href="/recipes"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Recipes</h3>
            <p className="text-gray-600">Explore 175+ AAFCO-compliant recipes</p>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-md opacity-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Recipes</h3>
            <p className="text-gray-600">View your saved recipes (coming soon)</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md opacity-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Meal Plans</h3>
            <p className="text-gray-600">Create custom meal plans (coming soon)</p>
          </div>
        </div>
      </div>

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPet}
      />
    </div>
  );
}