'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  ChefHat,
  Plus,
  Edit,
  Star,
  MessageSquare,
  Heart,
  Award,
  TrendingUp,
} from 'lucide-react';
import PetVillageWidget from '@/components/PetVillageWidget';
import { getRandomName, getPrimaryName, formatNames, type Pet } from '@/lib/utils/petUtils';

// =================================================================
// 1. TYPES & LOCAL STORAGE FUNCTIONS
// =================================================================

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';


// Simulated user id (replace with Clerk user.id in real auth)
const SIMULATED_USER_ID = 'clerk_simulated_user_id_123';

const getPetsFromLocalStorage = (userId: string): Pet[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.map((p: any) => ({
            ...p,
            names: p.names || (p.name ? [p.name] : []),
            savedRecipes: p.savedRecipes || [],
            healthConcerns: p.healthConcerns || [],
            weight: p.weight || '',
          }))
        : [];
    } catch (e) {
      console.error('Failed to parse pet data from local storage', e);
      return [];
    }
  }
  return [];
};

const savePetsToLocalStorage = (userId: string, pets: Pet[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`pets_${userId}`, JSON.stringify(pets));
  }
};

// =================================================================
// 2. DATA CONSTANTS
// =================================================================

const PET_BREEDS: Record<PetCategory, string[]> = {
  dogs: [
    'Labrador Retriever',
    'German Shepherd',
    'Poodle',
    'Bulldog',
    'Beagle',
    'Pomeranian',
    'Dachshund',
    'Chihuahua',
    'Great Dane',
    'Other',
  ],
  cats: [
    'Domestic Shorthair',
    'Maine Coon',
    'Ragdoll',
    'Siamese',
    'Persian',
    'Bengal',
    'Sphynx',
    'British Shorthair',
    'Abyssinian',
    'Other',
  ],
  birds: [
    'Parakeet',
    'Cockatiel',
    'African Grey',
    'Macaw',
    'Cockatoo',
    'Finch',
    'Canary',
    'Lovebird',
    'Quaker Parrot',
    'Other',
  ],
  reptiles: [
    'Bearded Dragon',
    'Ball Python',
    'Leopard Gecko',
    'Corn Snake',
    'Red-Eared Slider',
    'Chameleon',
    'Monitor Lizard',
    'Blue-Tongued Skink',
    'Iguana',
    'Other',
  ],
  'pocket-pets': [
    'Rabbit',
    'Guinea Pig',
    'Hamster',
    'Gerbil',
    'Rat',
    'Mouse',
    'Chinchilla',
    'Hedgehog',
    'Ferret',
    'Other',
  ],
};

const PET_HEALTH_CONCERNS: string[] = [
  'Allergy Support',
  'Weight Management',
  'Digestive Health',
  'Joint & Mobility',
  'Skin & Coat',
  'Dental Health',
  'Kidney/Urinary Support',
  'Other',
];

// =================================================================
// 3. ICON UTILITY
// =================================================================

const PET_ICON_MAP: Record<PetCategory, string> = {
  dogs: '🐕',
  cats: '🐈',
  birds: '🦜',
  reptiles: '🦎',
  'pocket-pets': '🐰',
};

const getPetIcon = (type: PetCategory, breed: string = '', size: number = 24, className = '') => {
  let emoji = PET_ICON_MAP[type] || '🐾';
  if (type === 'pocket-pets' && breed) {
    const breedLower = breed.toLowerCase();
    if (breedLower.includes('hamster')) emoji = '🐹';
    else if (breedLower.includes('gerbil')) emoji = '🐹'; // No gerbil emoji, use hamster
    else if (breedLower.includes('guinea pig')) emoji = '🐹';
    else if (breedLower.includes('rat')) emoji = '🐭';
    else if (breedLower.includes('mouse')) emoji = '🐭';
    else if (breedLower.includes('chinchilla')) emoji = '🐹';
    else if (breedLower.includes('hedgehog')) emoji = '🦔';
    else if (breedLower.includes('ferret')) emoji = '🦦'; // Closest
    // Default to rabbit
  }
  return <span className={className} style={{ fontSize: `${size}px` }}>{emoji}</span>;
};


// =================================================================
// 5. MAIN PAGE COMPONENT
// =================================================================

export default function MyPetsPage() {
  const userId = SIMULATED_USER_ID;

  const [pets, setPets] = useState<Pet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-3">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your pets...</p>
          </div>
        </div>
      </div>
    );
  }

  // Load pets and expose user id for other pages (recipe detail, etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_user_id', userId);
    }
    setPets(getPetsFromLocalStorage(userId));
  }, [userId]);

  const handleAddPet = useCallback(
    (newPet: any) => {
      const petWithSavedRecipes = { ...newPet, savedRecipes: newPet.savedRecipes || [] };
      setPets((prevPets) => {
        const isEditing = prevPets.some((p) => p.id === petWithSavedRecipes.id);
        let updatedPets: Pet[];

        if (isEditing) {
          updatedPets = prevPets.map((p) =>
            p.id === petWithSavedRecipes.id ? petWithSavedRecipes : p
          );
        } else {
          updatedPets = [...prevPets, petWithSavedRecipes];
        }

        savePetsToLocalStorage(userId, updatedPets);
        return updatedPets;
      });
    },
    [userId]
  );

  const handleEditPet = useCallback((pet: Pet) => {
    setEditingPet(pet);
    setIsModalOpen(true);
  }, []);

  const handleDeletePet = useCallback((petId: string) => {
    setPets(prevPets => {
      const updatedPets = prevPets.filter(p => p.id !== petId);
      savePetsToLocalStorage(userId, updatedPets);
      return updatedPets;
    });
  }, [userId]);

  // Calculate user contributions - TEMPORARILY DISABLED to prevent infinite re-renders
  // const [userContributions, setUserContributions] = useState({
  //   recipesRated: 0,
  //   reviewsWritten: 0,
  //   modificationsShared: 0,
  //   helpfulVotes: 0
  // });
  const userContributions = {
    recipesRated: 0,
    reviewsWritten: 0,
    modificationsShared: 0,
    helpfulVotes: 0
  };

  // Calculate user level and badges
  const userLevel = useMemo(() => {
    const total = userContributions.recipesRated + userContributions.reviewsWritten * 2 + userContributions.modificationsShared * 3;
    if (total >= 50) return { level: 'Expert', color: 'bg-purple-100 text-purple-800', icon: '🏆' };
    if (total >= 25) return { level: 'Contributor', color: 'bg-blue-100 text-blue-800', icon: '⭐' };
    if (total >= 10) return { level: 'Helper', color: 'bg-green-100 text-green-800', icon: '🌟' };
    return { level: 'Newcomer', color: 'bg-gray-100 text-gray-800', icon: '🌱' };
  }, [userContributions]);

  const PetCard: React.FC<{ pet: Pet }> = ({ pet }) => {
    // Defensive checks for pet data
    if (!pet || !pet.id) {
      console.error('Invalid pet data:', pet);
      return null;
    }

    const petName = getRandomName(pet.names || []);
    const petType = pet.type as PetCategory;
    const petBreed = pet.breed || '';

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col transition-all hover:shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-inner border-2 border-primary-200 overflow-hidden">
              {pet.image ? (
                <img
                  src={pet.image}
                  alt={petName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  {getPetIcon(petType, petBreed, 24, 'text-primary-600')}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                {petName}
              </h3>
            </div>
          </div>
          <button
            onClick={() => handleEditPet(pet)}
            className="btn btn-ghost btn-icon-sm"
            title={`Edit ${petName}`}
          >
            <Edit size={16} />
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          {/* Pet Information - Compact Vertical Layout */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center text-sm">
              <span className="inline-flex items-center justify-center w-6 h-6 text-primary-600 rounded-full mr-3 text-xs border-2 border-primary-200">❤️</span>
              <span className="text-gray-700 font-medium">
                {(pet.healthConcerns || []).length > 0
                  ? (pet.healthConcerns || [])[0].replace(/-/g, ' ')
                  : 'No concerns'
                }
              </span>
            </div>

            <div className="flex items-center text-sm">
              <span className="inline-flex items-center justify-center w-6 h-6 text-primary-600 rounded-full mr-3 text-xs border-2 border-primary-200">🎂</span>
              <span className="text-gray-700 font-medium capitalize">{pet.age}</span>
            </div>

            <div className="flex items-center text-sm">
              <span className="inline-flex items-center justify-center w-6 h-6 text-primary-600 rounded-full mr-3 text-xs border-2 border-primary-200">⚖️</span>
              <span className="text-gray-700 font-medium">{pet.weight || 'Not set'}</span>
            </div>

            <div className="flex items-center text-sm">
              <span className="inline-flex items-center justify-center w-6 h-6 text-primary-600 rounded-full mr-3 text-xs border-2 border-primary-200">🐶</span>
              <span className="text-gray-700 font-medium">{pet.breed}</span>
            </div>
          </div>

          {/* Mini Pet Village Widget */}
          <div className="flex-shrink-0">
            <PetVillageWidget
              initialStreak={useMemo(() => {
                const hashCode = (str: string) => {
                  let hash = 0;
                  for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                  }
                  return Math.abs(hash);
                };
                return hashCode(pet.id || 'default') % 25;
              }, [pet.id])}
              className="w-48 h-48 scale-75 origin-top-left"
            />
          </div>
        </div>

      {(pet.healthConcerns || []).length > 1 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {(pet.healthConcerns || []).slice(1, 3).map((concern, index) => (
              <span
                key={index}
                className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium"
              >
                {concern.replace(/-/g, ' ')}
              </span>
            ))}
            {(pet.healthConcerns || []).length > 3 && (
              <span className="text-xs text-gray-500">+{(pet.healthConcerns || []).length - 3}</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-1.5">
          <a
            href={`/profile/pet/${pet.id}`}
            className="btn btn-success btn-sm btn-full"
          >
            Find Meals
          </a>
          <a
            href={`/profile/pet/${pet.id}/saved-recipes`}
            className="btn btn-warning btn-sm btn-full"
          >
            Saved Meals
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-3">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              My Pets
            </h1>
            {pets.length > 0 && (
              <p className="text-gray-600 mt-2">
                Click saved meals to create a meal plan!
              </p>
            )}
          </div>
          {pets.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete all pets? This action cannot be undone.')) {
                    savePetsToLocalStorage(userId, []);
                    setPets([]);
                  }
                }}
                className="btn btn-danger btn-md"
              >
                Delete All Pets
              </button>
              <button
                onClick={() => {
                  setEditingPet(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-primary btn-lg btn-ripple"
              >
                <Plus size={20} className="mr-2" />
                Add New Pet
              </button>
            </div>
          )}
        </header>

        {pets.length === 0 ? (
          <div className="text-center py-20 px-8 bg-white rounded-2xl shadow-xl border-4 border-dashed border-gray-200 min-h-[400px] flex flex-col justify-center">
            <span className="text-4xl">🐾</span>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No Pets Found
            </h2>
            <p className="text-gray-500 mb-6">
              Get started by adding your first pet to create a personalized
              meal plan.
            </p>
            <button
              onClick={() => {
                setEditingPet(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-xl btn-ripple"
            >
              <Plus size={20} className="mr-2" />
              Add Your First Pet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}

        {/* Community Contributions Section */}
        {pets.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Community Contributions</h2>
                <p className="text-gray-600 mt-1">Your impact on the pet nutrition community</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{userLevel.icon}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${userLevel.color}`}>
                  {userLevel.level}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userContributions.recipesRated}</div>
                <div className="text-sm text-gray-600">Recipes Rated</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userContributions.reviewsWritten}</div>
                <div className="text-sm text-gray-600">Reviews Written</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ChefHat className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userContributions.modificationsShared}</div>
                <div className="text-sm text-gray-600">Modifications Shared</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userContributions.helpfulVotes}</div>
                <div className="text-sm text-gray-600">Helpful Votes</div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Badges</h3>
              <div className="flex flex-wrap gap-3">
                {userContributions.recipesRated >= 5 && (
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-2 rounded-full text-sm">
                    <Star className="w-4 h-4" />
                    Recipe Reviewer
                  </div>
                )}
                {userContributions.reviewsWritten >= 3 && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-2 rounded-full text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Detailed Reviewer
                  </div>
                )}
                {userContributions.modificationsShared >= 2 && (
                  <div className="flex items-center gap-2 bg-orange-50 text-orange-800 px-3 py-2 rounded-full text-sm">
                    <ChefHat className="w-4 h-4" />
                    Recipe Innovator
                  </div>
                )}
                {userContributions.helpfulVotes >= 10 && (
                  <div className="flex items-center gap-2 bg-purple-50 text-purple-800 px-3 py-2 rounded-full text-sm">
                    <Award className="w-4 h-4" />
                    Community Helper
                  </div>
                )}
                {(userContributions.recipesRated + userContributions.reviewsWritten + userContributions.modificationsShared) >= 20 && (
                  <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-full text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Active Contributor
                  </div>
                )}
              </div>
            </div>

            {/* Next Level Progress */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Keep Contributing!</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress to next level</span>
                  <span className="text-sm font-medium text-gray-900">
                    {userContributions.recipesRated + userContributions.reviewsWritten * 2 + userContributions.modificationsShared * 3}/50 points
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((userContributions.recipesRated + userContributions.reviewsWritten * 2 + userContributions.modificationsShared * 3) / 50) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Rate recipes, write reviews, and share modifications to level up!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
}