'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { getPrimaryName } from '@/lib/utils/petUtils';
import type { Pet } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import HealthConcernsDropdown from '@/components/HealthConcernsDropdown';
import { useVillageStore } from '@/lib/state/villageStore';
import { getMascotFaceForPetType } from '@/lib/utils/emojiMapping';
import AddPetModal from '@/components/CreatePetModal';
import { getCustomMeals } from '@/lib/utils/customMealStorage';
import type { CustomMeal } from '@/lib/types';
import { recipes } from '@/lib/data/recipes-complete';
import { rateRecipeForPet, type Pet as RatingPet } from '@/lib/utils/petRatingSystem';
import { getVettedProduct, VETTED_PRODUCTS } from '@/lib/data/vetted-products';
import Image from 'next/image';
import EmojiIcon from '@/components/EmojiIcon';
import ConfirmModal from '@/components/ConfirmModal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const convertCustomMealToRecipe = (customMeal: CustomMeal): any => {
  return {
    id: customMeal.id,
    name: customMeal.name,
    category: 'custom',
    ageGroup: ['adult'],
    healthConcerns: [],
    description: `Custom meal created on ${customMeal.createdAt ? new Date(customMeal.createdAt).toLocaleDateString() : ''}`,
    ingredients: customMeal.ingredients.map((ing, idx) => ({
      id: `${idx + 1}`,
      name: ing.key.replace(/_/g, ' '),
      amount: `${ing.grams}g`,
    })),
    instructions: [
      'Mix all ingredients according to saved recipe',
      'Serve at recommended portion size',
      `Recommended serving: ${customMeal.analysis.recommendedServingGrams}g`,
    ],
    nutritionalInfo: {
      protein: {
        min: (customMeal.analysis.nutrients.protein_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
        max: (customMeal.analysis.nutrients.protein_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
        unit: '%',
      },
      fat: {
        min: (customMeal.analysis.nutrients.fat_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
        max: (customMeal.analysis.nutrients.fat_g || 0) / (customMeal.analysis.totalRecipeGrams / 100),
        unit: '%',
      },
      calories: {
        min: customMeal.analysis.nutrients.kcal || customMeal.analysis.nutrients.calories_kcal || 0,
        max: customMeal.analysis.nutrients.kcal || customMeal.analysis.nutrients.calories_kcal || 0,
        unit: 'kcal',
      },
    },
    rating: 0,
    reviews: 0,
    tags: ['custom', 'user-created'],
  };
};

const buildEvenPlan = (meals: any[]) => {
  const totalSlots = DAYS.length * 2;
  const rotation: any[] = [];
  if (meals.length === 0) return [];
  while (rotation.length < totalSlots) {
    rotation.push(...meals);
  }
  return rotation.slice(0, totalSlots);
};

// =================================================================
// 1. TYPES & LOCAL STORAGE FUNCTIONS
// =================================================================

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';

type ProfilePet = Pet;

// Simulated user id (replace with Clerk user.id in real auth)
const SIMULATED_USER_ID = 'clerk_simulated_user_id_123';

const getPetsFromLocalStorage = (userId: string): ProfilePet[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.map((p: any) => ({
            ...p,
            // Ensure names is always an array, filter out empty strings
            names: Array.isArray(p.names) 
              ? p.names.filter((n: string) => n && n.trim() !== '')
              : (p.name ? [p.name] : []),
            savedRecipes: p.savedRecipes || [],
            healthConcerns: p.healthConcerns || [],
            weight: p.weight || '',
            allergies: p.allergies || [],
          }))
        : [];
    } catch (e) {
      // Failed to parse pet data - using empty array
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

import { getBreedNamesForSpecies } from '@/lib/data/speciesBreeds';

// Get breeds from centralized source
const PET_BREEDS: Record<PetCategory, string[]> = {
  dogs: [...getBreedNamesForSpecies('dogs'), 'Other'],
  cats: [...getBreedNamesForSpecies('cats'), 'Other'],
  birds: [...getBreedNamesForSpecies('birds'), 'Other'],
  reptiles: [...getBreedNamesForSpecies('reptiles'), 'Other'],
  'pocket-pets': [...getBreedNamesForSpecies('pocket-pets'), 'Other'],
};

// Health concerns are now handled by HealthConcernsDropdown component
// This old array is no longer used - kept for reference only
// const PET_HEALTH_CONCERNS: string[] = [
//   'Allergy Support',
//   'Weight Management',
//   'Digestive Health',
//   'Joint & Mobility',
//   'Skin & Coat',
//   'Dental Health',
//   'Kidney/Urinary Support',
//   'Other',
// ];

// =================================================================
// 3. ICON UTILITY
// =================================================================

const formatRecipeName = (id: string) => {
  if (!id) return 'Unnamed Meal';
  // Replace dashes/underscores with spaces and title-case segments
  return id
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    .trim();
};

type WeeklyPlanEntry = {
  day: string;
  meals: (string | null)[];
};

const PET_ICON_MAP: Record<PetCategory, string> = {
  dogs: '🐕',
  cats: '🐈',
  birds: '🦜',
  reptiles: '🦎',
  'pocket-pets': '🐰',
};

const getPetIcon = (type: PetCategory, breed: string = '', size: number = 24, className = '') => {
  // Ensure type is valid
  if (!type || !PET_ICON_MAP[type]) {
    return <EmojiIcon emoji="🐾" size={size} className={className} />;
  }
  
  let emoji = PET_ICON_MAP[type];
  
  // Handle pocket-pets breed-specific emojis
  if (type === 'pocket-pets' && breed) {
    const breedLower = breed.toLowerCase();
    if (breedLower.includes('hamster')) emoji = '🐹';
    else if (breedLower.includes('gerbil')) emoji = '🐹'; // No gerbil emoji, use hamster
    else if (breedLower.includes('guinea pig') || breedLower.includes('guinea-pig')) emoji = '🐹';
    else if (breedLower.includes('rat')) emoji = '🐭';
    else if (breedLower.includes('mouse')) emoji = '🐭';
    else if (breedLower.includes('chinchilla')) emoji = '🐹';
    else if (breedLower.includes('hedgehog')) emoji = '🦔';
    else if (breedLower.includes('ferret')) emoji = '🦦'; // Closest
    // Default to rabbit (🐰) for pocket-pets
  }
  
  return <EmojiIcon emoji={emoji} size={size} className={className} />;
};

// =================================================================
// 4. PET MODAL COMPONENT
// =================================================================

interface PetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: any) => void;
  editingPet: Pet | null;
}

const PetModal: React.FC<PetModalProps> = ({ isOpen, onClose, onSave, editingPet }) => {
  // Initialize with empty defaults - will be set by useEffect when modal opens
  const [formData, setFormData] = useState<{
    id: string;
    names: string[];
    type: string;
    breed: string;
    age: string;
    weight: string;
    healthConcerns: string[];
    image: string;
  }>({
    id: uuidv4(),
    names: [],
    type: 'dogs',
    breed: '',
    age: 'adult',
    weight: '',
    healthConcerns: [],
    image: '',
  });

  const [newName, setNewName] = useState('');

  // Reset formData when modal opens or editingPet changes to prevent name bleeding between pets
  useEffect(() => {
    // Only update when modal is open
    if (!isOpen) {
      return;
    }
    
    // When modal opens, load the correct data
    if (editingPet) {
      // Load existing names, filter out empty ones
      const existingNames = editingPet.names && Array.isArray(editingPet.names)
        ? editingPet.names.filter(n => n && n.trim() !== '')
        : [];
      
      setFormData({
        id: editingPet.id,
        names: existingNames.length > 0 ? existingNames : [],
        type: editingPet.type || 'dogs',
        breed: editingPet.breed || '',
        age: editingPet.age || 'adult',
        weight: editingPet.weight || '',
        healthConcerns: Array.isArray(editingPet.healthConcerns) ? editingPet.healthConcerns : [],
        image: editingPet.image || '',
      });
      setNewName('');
    } else {
      // Reset to defaults when adding new pet
      setFormData({
        id: uuidv4(),
        names: [],
        type: 'dogs',
        breed: '',
        age: 'adult',
        weight: '',
        healthConcerns: [],
        image: '',
      });
      setNewName('');
    }
  }, [isOpen, editingPet]);

  if (!isOpen) return null;

  const handleAddName = () => {
    if (newName.trim()) {
      setFormData({
        ...formData,
        names: [...formData.names, newName.trim()]
      });
      setNewName('');
    }
  };

  const handleRemoveName = (index: number) => {
    setFormData({
      ...formData,
      names: formData.names.filter((_, i) => i !== index)
    });
  };

  const handleHealthConcernToggle = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      healthConcerns: prev.healthConcerns.includes(concern)
        ? prev.healthConcerns.filter(c => c !== concern)
        : [...prev.healthConcerns, concern]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // IMPORTANT: If user typed a name but didn't click "Add", include it now
    let allNames = [...formData.names];
    if (newName.trim() && !allNames.includes(newName.trim())) {
      allNames.push(newName.trim());
    }
    
    // Filter out empty names before saving
    const cleanedNames = allNames.filter(name => name && name.trim() !== '');
    
    // Ensure at least one name exists
    if (cleanedNames.length === 0) {
      cleanedNames.push('Unnamed Pet');
    }
    
    const cleanedData = {
      ...formData,
      names: cleanedNames,
    };
    
    // Saving pet with names
    
    onSave(cleanedData);
    setNewName(''); // Clear the input
    onClose();
  };

  // Get the first name for display at top
  const firstName = formData.names.length > 0 ? formData.names[0] : null;
  const additionalNames = formData.names.slice(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {editingPet ? 'Edit Pet' : 'Add New Pet'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Primary Pet Name - Top Row */}
          {firstName && (
            <div className="mb-3 pb-3 border-b border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Primary Name
              </label>
              <div className="flex items-center gap-2">
                <div className="bg-green-900/20 text-green-800 px-3 py-1.5 rounded-lg text-base font-semibold shadow-sm flex-1">
                  {firstName}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveName(0)}
                  className="text-gray-400 hover:text-red-600 text-lg px-2"
                  title="Remove primary name"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Main Form - Horizontal Layout */}
          <div className="space-y-3">
            {/* Row 1: Name Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {firstName ? 'Add Another Name' : (
                  <>
                    Pet Name(s) <span className="text-gray-500 font-normal">(required)</span>
                  </>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddName();
                    }
                  }}
                  placeholder={firstName ? "Add another name..." : "Type a name and press Enter"}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-800 focus:border-green-800"
                />
                <button
                  type="button"
                  onClick={handleAddName}
                  disabled={!newName.trim()}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              {firstName && additionalNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {additionalNames.map((name, index) => (
                    name.trim() !== '' && (
                      <div key={index + 1} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveName(index + 1)}
                          className="text-green-800 hover:text-green-900"
                          title="Remove name"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Row 2: Pet Type, Breed, Age, Weight - Horizontal */}
            <div className="grid grid-cols-4 gap-3">
              {/* Pet Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pet Type
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(PET_ICON_MAP).map(([type, emoji]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, type})}
                      className={`flex flex-col items-center p-1 rounded border transition-colors ${formData.type === type ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                      title={type.replace('-', ' ')}
                    >
                      <EmojiIcon emoji={emoji} size={24} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Breed */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <select
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  className="w-full min-w-[220px] px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="">Select breed</option>
                  {PET_BREEDS[formData.type as PetCategory]?.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Age
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {['baby', 'young', 'adult', 'senior'].map(age => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setFormData({...formData, age})}
                      className={`px-2 py-1.5 text-xs rounded border capitalize ${formData.age === age ? 'border-green-800 bg-green-900/10' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="e.g., 10 lbs"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Row 3: Health Concerns - Full Width */}
            <div>
              <HealthConcernsDropdown
                species={formData.type || ''}
                selectedConcerns={formData.healthConcerns || []}
                onConcernsChange={(concerns) => setFormData({...formData, healthConcerns: concerns})}
                className="mt-0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-lg"
            >
              {editingPet ? 'Save Changes' : 'Add Pet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =================================================================
// 5. MAIN PAGE COMPONENT
// =================================================================

export default function MyPetsPage() {
  const userId = SIMULATED_USER_ID;
  const { setUserId } = useVillageStore();

  const [pets, setPets] = useState<ProfilePet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bio' | 'saved' | 'plan'>('bio');
  const [planOffset, setPlanOffset] = useState(0);
const [planWeekly, setPlanWeekly] = useState<{ day: string; meals: any[] }[]>([]);
const [swapTarget, setSwapTarget] = useState<{ dayIdx: number; mealIdx: number } | null>(null);
const activePet = useMemo(() => (activePetId ? pets.find((p) => p.id === activePetId) : null), [activePetId, pets]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const recipeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    recipes.forEach((r) => {
      if (r?.id) {
        map.set(r.id, r.name || r.shortName || formatRecipeName(r.id));
      }
    });
    return map;
  }, []);
  const getRecipeName = useCallback(
    (id: string) => {
      if (!id) return 'Unnamed Meal';
      return recipeNameMap.get(id) || formatRecipeName(id);
    },
    [recipeNameMap]
  );
const buildWeeklyPlan = useCallback(
    (saved: string[], offset: number): WeeklyPlanEntry[] => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      if (!Array.isArray(saved) || saved.length < 2) {
        return days.map((day) => ({ day, meals: [null, null] }));
      }
      const unique = saved.filter(Boolean);
      const len = unique.length;
      return days.map((day, idx) => {
        const base = (idx + offset) % len;
        const first = unique[base] || null;
        let second = unique[(base + 1) % len] || null;
        if (second === first) {
          second = unique[(base + 2) % len] || null;
          if (second === first) second = null;
        }
        return { day, meals: [first, second] };
      });
    },
    []
  );

  const shuffleMealsNoRepeats = (meals: any[], totalSlots: number) => {
    if (meals.length === 0) return [];
    const base = [...meals];
    const rotation: any[] = [];
    const shuffle = (arr: any[]) => {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    let pool = shuffle([...base]);
    while (rotation.length < totalSlots) {
      if (pool.length === 0) {
        pool = shuffle([...base]);
      }
      const next = pool.pop();
      if (rotation.length % 2 === 1 && rotation[rotation.length - 1]?.id === next?.id) {
        pool.unshift(next);
        continue;
      }
      rotation.push(next);
    }
    return rotation;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load pets and expose user id for other pages (recipe detail, etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_user_id', userId);
    }
    setPets(getPetsFromLocalStorage(userId));
    // Initialize village store with userId
    setUserId(userId);
  }, [userId, setUserId]);

  useEffect(() => {
    if (pets.length === 0) {
      setActivePetId(null);
      setActiveTab('bio');
      return;
    }
    const stillExists = pets.some((p) => p.id === activePetId);
    if (activePetId && !stillExists) {
      setActivePetId(null);
      setActiveTab('bio');
    }
  }, [pets, activePetId]);

  // Load custom meals when active pet changes
  useEffect(() => {
    if (activePetId && userId) {
      const meals = getCustomMeals(userId, activePetId);
      setCustomMeals(meals);
    } else {
      setCustomMeals([]);
    }
  }, [activePetId, userId]);

  // Build weekly plan for Plan tab (merge saved recipes + custom meals)
  const allMealsForPlan = useMemo(() => {
    if (!activePet) return [];
    const saved = Array.isArray(activePet.savedRecipes)
      ? activePet.savedRecipes
          .map((rid) => recipes.find((r) => r.id === rid))
          .filter(Boolean) as any[]
      : [];
    const customs = customMeals.map(convertCustomMealToRecipe);
    return [...saved, ...customs];
  }, [activePet, customMeals]);

  useEffect(() => {
    if (allMealsForPlan.length === 0) {
      setPlanWeekly([]);
      return;
    }
    const rotation = buildEvenPlan(allMealsForPlan);
    const nextPlan: { day: string; meals: any[] }[] = [];
    for (let i = 0; i < DAYS.length; i += 1) {
      const breakfastIndex = i * 2;
      const dinnerIndex = breakfastIndex + 1;
      const breakfast = rotation[breakfastIndex];
      let dinner = rotation[dinnerIndex];
      if (dinner.id === breakfast.id) {
        const swapIndex = rotation.findIndex(
          (entry, idx) => idx > dinnerIndex && entry.id !== breakfast.id
        );
        if (swapIndex !== -1) {
          [rotation[dinnerIndex], rotation[swapIndex]] = [
            rotation[swapIndex],
            rotation[dinnerIndex],
          ];
          dinner = rotation[dinnerIndex];
        } else {
          dinner = allMealsForPlan.find((meal) => meal.id !== breakfast.id) || dinner;
        }
      }
      nextPlan.push({ day: DAYS[i], meals: [breakfast, dinner] });
    }
    setPlanWeekly(nextPlan);
  }, [allMealsForPlan]);

  const handleRandomizePlan = () => {
    if (allMealsForPlan.length === 0) return;
    const totalSlots = DAYS.length * 2;
    const rotation = shuffleMealsNoRepeats(allMealsForPlan, totalSlots);
    const nextPlan: { day: string; meals: any[] }[] = [];
    for (let i = 0; i < DAYS.length; i += 1) {
      const breakfastIndex = i * 2;
      const dinnerIndex = breakfastIndex + 1;
      nextPlan.push({ day: DAYS[i], meals: [rotation[breakfastIndex], rotation[dinnerIndex]] });
    }
    setPlanWeekly(nextPlan);
  };

  const handleAddPet = useCallback(
    (newPet: any) => {
      // Ensure names array is properly formatted and has at least one name
      const cleanedNames = Array.isArray(newPet.names)
        ? newPet.names.filter((n: string) => n && n.trim() !== '')
        : [];
      
      // If no names after cleaning, set a default
      if (cleanedNames.length === 0) {
        cleanedNames.push('Unnamed Pet');
      }
      
      const petWithSavedRecipes = { 
        ...newPet,
        names: cleanedNames, // Use cleaned names
        savedRecipes: newPet.savedRecipes || [] 
      };
      
      // Saving pet with saved recipes
      
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
    const pet = pets.find(p => p.id === petId);
    const petName = pet ? getPrimaryName(pet.names || []) : 'this pet';
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Pet',
      message: `Are you sure you want to delete ${petName}? This action cannot be undone.`,
      onConfirm: () => {
        setPets(prevPets => {
          const updatedPets = prevPets.filter(p => p.id !== petId);
          savePetsToLocalStorage(userId, updatedPets);
          if (activePetId === petId) {
            setActivePetId(null);
            setActiveTab('bio');
          }
          return updatedPets;
        });
      },
    });
  }, [userId, activePetId, pets]);

  const handleRemoveSavedMeal = useCallback((recipeId: string) => {
    if (!activePetId) return;
    
    // If it's a custom meal, also delete it from custom meals storage
    if (recipeId.startsWith('custom_')) {
      const { deleteCustomMeal } = require('@/lib/utils/customMealStorage');
      deleteCustomMeal(userId, activePetId, recipeId);
      // Update local custom meals state
      setCustomMeals(prev => prev.filter(m => m.id !== recipeId));
    }
    
    setPets(prevPets => {
      const updatedPets = prevPets.map(p => {
        if (p.id === activePetId) {
          return {
            ...p,
            savedRecipes: (p.savedRecipes || []).filter(id => id !== recipeId)
          };
        }
        return p;
      });
      savePetsToLocalStorage(userId, updatedPets);
      return updatedPets;
    });
  }, [userId, activePetId]);

  // Component to buy all ingredients from meal plan
  const BuyAllMealPlanIngredientsButton = ({ weeklyPlan, petId }: { weeklyPlan: { day: string; meals: (string | null)[] }[]; petId: string }) => {
    const [isOpening, setIsOpening] = useState(false);
    const [openedCount, setOpenedCount] = useState(0);

    const handleBuyAll = async () => {
      setIsOpening(true);
      setOpenedCount(0);

      // Collect all unique ingredients from all meals in the plan
      const ingredientLinks = new Set<string>();
      
      weeklyPlan.forEach(({ meals }) => {
        meals.forEach(mealId => {
          if (mealId) {
            const recipe = recipes.find(r => r.id === mealId);
            if (recipe && recipe.ingredients) {
              recipe.ingredients.forEach(ing => {
                // Try to get vetted product link first
                const vettedProduct = getVettedProduct(ing.name);
                const link = vettedProduct?.asinLink || vettedProduct?.purchaseLink || (ing as any).asinLink;
                
                if (link) {
                  ingredientLinks.add(link);
                }
              });
            }
          }
        });
      });

      const linksArray = Array.from(ingredientLinks);
      
      if (linksArray.length === 0) {
        alert('No ingredient purchase links available for meals in this plan.');
        setIsOpening(false);
        return;
      }

      // Open first tab immediately (user gesture)
      if (linksArray.length > 0) {
        window.open(linksArray[0], '_blank');
        setOpenedCount(1);
      }

      // Open remaining tabs with delays
      for (let i = 1; i < linksArray.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newWindow = window.open(linksArray[i], '_blank');
        setOpenedCount(i + 1);
        
        // If popup was blocked, try again with a longer delay
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          window.open(linksArray[i], '_blank');
        }
      }

      // Reset state after all tabs are opened
      setTimeout(() => {
        setIsOpening(false);
        setOpenedCount(0);
      }, 1000);
    };

    const totalIngredients = useMemo(() => {
      const links = new Set<string>();
      weeklyPlan.forEach(({ meals }) => {
        meals.forEach(mealId => {
          if (mealId) {
            const recipe = recipes.find(r => r.id === mealId);
            if (recipe && recipe.ingredients) {
              recipe.ingredients.forEach(ing => {
                const vettedProduct = getVettedProduct(ing.name);
                const link = vettedProduct?.asinLink || vettedProduct?.purchaseLink || (ing as any).asinLink;
                if (link) links.add(link);
              });
            }
          }
        });
      });
      return links.size;
    }, [weeklyPlan]);

    if (totalIngredients === 0) {
      return null;
    }

    return (
      <button
        onClick={handleBuyAll}
        disabled={isOpening}
        className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-all ${
          isOpening
            ? 'bg-gray-600 cursor-wait text-gray-300'
            : 'bg-gradient-to-r from-[#FF9900] to-[#F08804] hover:from-[#F08804] hover:to-[#E07704] text-black shadow-lg hover:shadow-xl'
        } flex items-center justify-center gap-2`}
      >
        {isOpening ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Opening...
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            Buy All
          </>
        )}
      </button>
    );
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading your pets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-6">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold">My Pets</h1>
            {pets.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Choose a pet to view details, saved meals, and meal plans.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingPet(null);
                setIsModalOpen(true);
              }}
              className="btn btn-success btn-sm btn-ripple"
            >
              <Plus size={16} className="mr-1" />
              Add Pet
            </button>
          </div>
        </header>

        {pets.length === 0 ? (
          <div className="text-center py-14 px-6 bg-surface rounded-2xl border border-surface-highlight shadow-lg">
            <div className="text-4xl mb-3">🐾</div>
            <h2 className="text-2xl font-bold mb-2">No Pets Yet</h2>
            <p className="text-gray-400 mb-6">
              Add your first pet to start building personalized meals and plans.
            </p>
            <button
              onClick={() => {
                setEditingPet(null);
                setIsModalOpen(true);
              }}
              className="btn btn-success btn-md btn-ripple"
            >
              <Plus size={18} className="mr-2" />
              Add Your First Pet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 lg:gap-6 items-start">
            <div className="bg-surface border border-surface-highlight rounded-2xl shadow-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pets</h3>
                  <span className="text-xs text-gray-400">{pets.length} total</span>
                </div>
                <div className="space-y-2">
                  {pets.map((pet) => {
                    if (!pet?.id) return null;
                    const name = getPrimaryName(pet.names || []) || 'Unnamed Pet';
                  return (
                    <button
                      key={pet.id}
                      onClick={() => {
                        setActivePetId(pet.id);
                        setActiveTab('bio');
                      }}
                      className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                        activePetId === pet.id
                          ? 'border-green-800 bg-green-900/20 text-white'
                          : 'border-surface-highlight bg-surface-highlight/60 text-foreground hover:border-green-800 hover:bg-surface-highlight'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-surface flex items-center justify-center flex-shrink-0">
                        <Image
                          src={getMascotFaceForPetType(pet.type as PetCategory)}
                          alt={`${name} mascot`}
                          width={40}
                          height={40}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{name}</div>
                        <div className="text-xs text-gray-400 capitalize truncate">
                          {pet.type}
                          {pet.age ? ` • ${pet.age}` : ''}
                        </div>
                      </div>
                    </button>
                  );
                  })}
                </div>
            </div>

            {activePet ? (
              <div className="bg-surface border border-surface-highlight rounded-2xl shadow-xl p-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-surface-highlight flex items-center justify-center">
                            <Image
                              src={getMascotFaceForPetType(activePet.type as PetCategory)}
                          alt={`${getPrimaryName(activePet.names || []) || 'Pet'} mascot`}
                              width={56}
                              height={56}
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">
                              {getPrimaryName(activePet.names || []) || 'Unnamed Pet'}
                            </h2>
                            <div className="text-sm text-gray-400 capitalize">
                              {activePet.type} {activePet.age ? `• ${activePet.age}` : '• age n/a'}
                              {activePet.weight ? ` • ${activePet.weight}` : ''}
                              {activePet.breed ? ` • ${activePet.breed}` : ''}
                            </div>
                            {Array.isArray(activePet.healthConcerns) &&
                              activePet.healthConcerns.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {activePet.healthConcerns.slice(0, 4).map((c) => (
                                    <span
                                      key={c}
                                      className="px-2 py-0.5 text-xs rounded-full bg-orange-900/40 text-orange-200 border border-orange-700/50"
                                    >
                                      {c.replace(/-/g, ' ')}
                                    </span>
                                  ))}
                                  {activePet.healthConcerns.length > 4 && (
                                    <span className="text-xs text-gray-500">
                                      +{activePet.healthConcerns.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            {Array.isArray(activePet.allergies) &&
                              activePet.allergies.length > 0 && (
                                <div className="mt-2 text-xs text-amber-200">
                                  Allergies: {activePet.allergies.join(', ')}
                                </div>
                              )}
                          </div>
                        </div>
                        {activeTab === 'bio' && (
                          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleEditPet(activePet)}
              className="btn btn-secondary btn-sm"
            >
              Edit
            </button>
                            <button
                              onClick={() => handleDeletePet(activePet.id)}
                              className="btn btn-darkgreen btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                    <div className="mt-4">
                      <div className="flex gap-0 border-b-2 border-surface-highlight">
                        {['bio', 'saved', 'plan'].map((tab) => {
                          const label = tab === 'bio' ? 'Bio' : tab === 'saved' ? 'Saved Meals' : 'Meal Plan';
                          const isActive = activeTab === tab;
                          return (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab as any)}
                              className={`relative px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                                isActive
                                  ? 'text-orange-400 border-b-3 border-orange-400 bg-transparent'
                                  : 'text-gray-400 hover:text-gray-300 bg-transparent border-b-3 border-transparent'
                              }`}
                              style={isActive ? { borderBottomWidth: '3px' } : { borderBottomWidth: '3px' }}
                              aria-selected={isActive}
                              role="tab"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3">
                        {activeTab === 'bio' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <div className="text-gray-300">Age: <span className="text-white capitalize">{activePet.age || 'Not set'}</span></div>
                              <div className="text-gray-300">Breed: <span className="text-white">{activePet.breed || 'Not set'}</span></div>
                              <div className="text-gray-300">Weight: <span className="text-white">{activePet.weight || 'Not set'}</span></div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-gray-300">
                                Health Concerns:{' '}
                                <span className="text-white">
                                  {Array.isArray(activePet.healthConcerns) && activePet.healthConcerns.length
                                    ? activePet.healthConcerns.join(', ')
                                    : 'None'}
                                </span>
                              </div>
                              <div className="text-gray-300">
                                Allergies:{' '}
                                <span className="text-white">
                                  {Array.isArray(activePet.allergies) && activePet.allergies.length
                                    ? activePet.allergies.join(', ')
                                    : 'None'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'bio' && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <a href={`/profile/pet/${activePet.id}`} className="btn btn-success btn-sm">Find Meals</a>
                            <a href={`/profile/pet/${activePet.id}/recipe-builder`} className="btn btn-success btn-sm">Create Meal</a>
                          </div>
                        )}

                        {activeTab === 'saved' && (
                          <div className="space-y-2">
                            {(() => {
                              const savedIds = Array.isArray(activePet.savedRecipes) ? activePet.savedRecipes : [];
                              const customIds = customMeals.map((m) => m.id);
                              const combinedIds = Array.from(new Set([...savedIds, ...customIds]));

                              if (combinedIds.length === 0) {
                                return (
                                  <div className="text-gray-400 text-sm">
                                    No saved meals yet. Use “Find Meals” to add some.
                                  </div>
                                );
                              }

                              return (
                                <div className="max-h-64 overflow-y-auto pr-1">
                                  <ul className="space-y-1 text-sm">
                                  {combinedIds.map((rid) => {
                                    const isCustomMeal = rid.startsWith('custom_');
                                    const recipe = isCustomMeal ? null : recipes.find((r) => r.id === rid);
                                    const customMeal = isCustomMeal ? customMeals.find((m) => m.id === rid) : null;
                                    const mealName = isCustomMeal ? customMeal?.name || 'Custom Meal' : getRecipeName(rid);
                                    const rating = recipe?.rating ?? 0;
                                    const compat = isCustomMeal ? customMeal?.analysis?.score : undefined;

                                    // Calculate compatibility for regular recipes
                                    let regularCompat: number | undefined;
                                    if (recipe && activePet && !isCustomMeal) {
                                      const petForRating: RatingPet = {
                                        id: activePet.id,
                                        name: activePet.name || activePet.names?.[0] || 'Unknown',
                                        type: activePet.type as any,
                                        age: activePet.age as any,
                                        breed: activePet.breed || '',
                                        weight: activePet.weight ? Number(activePet.weight) : undefined,
                                        activityLevel: (activePet.activityLevel as 'sedentary' | 'moderate' | 'active' | 'very-active') || 'moderate',
                                        dietaryRestrictions: activePet.dietaryRestrictions || [],
                                        healthConcerns: activePet.healthConcerns || [],
                                        allergies: activePet.allergies || [],
                                        savedRecipes: activePet.savedRecipes || [],
                                        names: activePet.names || [],
                                        weightKg: activePet.weight ? Number(activePet.weight) || undefined : undefined,
                                      };
                                      const result = rateRecipeForPet(recipe as any, petForRating);
                                      regularCompat = result?.overallScore;
                                    }

                                    return (
                                      <li key={rid} className="bg-surface-highlight rounded px-2 py-1 flex items-center justify-between gap-2">
                                        <a
                                          href={
                                            isCustomMeal
                                              ? `/profile/pet/${activePet.id}/custom-meals/${rid}`
                                              : `/recipe/${rid}?petId=${activePet.id}`
                                          }
                                          className="text-primary-300 hover:text-primary-100 text-xs underline underline-offset-2 truncate flex-1"
                                        >
                                          {mealName}
                                        </a>
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                          {!isCustomMeal && <span className="text-amber-300 text-xs">★ {rating.toFixed(1)}</span>}
                                          {typeof (regularCompat ?? compat) === 'number' && (
                                            <span className="text-green-300 text-xs">Meal Score: {regularCompat ?? compat}%</span>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setConfirmModal({
                                                isOpen: true,
                                                title: 'Remove Meal',
                                                message: `Remove "${mealName}" from saved meals?`,
                                                onConfirm: () => {
                                                  handleRemoveSavedMeal(rid);
                                                },
                                              });
                                            }}
                                            className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                                            title="Remove meal"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>
                                      </li>
                                    );
                                  })}
                                  </ul>
                                </div>
                              );
                            })()}
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={`/profile/pet/${activePet.id}`}
                                className="btn btn-success btn-sm"
                              >
                                Find Meals
                              </a>
                              <a
                                href={`/profile/pet/${activePet.id}/recipe-builder`}
                                className="btn btn-success btn-sm"
                              >
                                Create Meal
                              </a>
                            </div>
                          </div>
                        )}

                        {activeTab === 'plan' && (
                          <div className="space-y-4 text-sm">
                            {planWeekly.length > 0 ? (
                              <>
                                <div className="max-h-[480px] overflow-y-auto pr-2 space-y-3">
                                  {planWeekly.map((dayPlan, index) => (
                                    <div key={dayPlan.day} className="bg-surface-highlight rounded-lg border border-surface-highlight px-3 py-2">
                                      <div className="text-white font-semibold mb-2">{dayPlan.day}</div>
                                      <div className="space-y-2">
                                        {dayPlan.meals.map((meal, mealIndex) => (
                                          <div key={meal.id + mealIndex} className="p-2 rounded bg-surface-lighter border border-white/5">
                                            <a
                                              href={meal.category === 'custom'
                                                ? `/profile/pet/${activePet.id}/custom-meals/${meal.id}`
                                                : `/recipe/${meal.id}?petId=${activePet.id}`}
                                              className="text-primary-300 hover:text-primary-100 text-sm font-semibold block break-words"
                                            >
                                              {meal.name}
                                            </a>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              <button
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  const cartItems = (meal.ingredients || [])
                                                    .map((ing: any, idx: number) => {
                                                      const genericName = (ing.name || '').toLowerCase().trim();
                                                      const vettedProduct = VETTED_PRODUCTS[genericName];
                                                      const link = vettedProduct ? vettedProduct.purchaseLink : ing.asinLink;
                                                      if (link) {
                                                        const asinMatch = link.match(/\/dp\/([A-Z0-9]{10})/);
                                                        if (asinMatch) {
                                                          return `ASIN.${idx + 1}=${asinMatch[1]}&Quantity.${idx + 1}=1`;
                                                        }
                                                      }
                                                      return null;
                                                    })
                                                    .filter(Boolean);
                                                  if (cartItems.length > 0) {
                                                    const cartUrl = `https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`;
                                                    window.open(cartUrl, '_blank');
                                                  } else {
                                                    alert('No ingredient links available for this recipe.');
                                                  }
                                                }}
                                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-semibold transition-all shadow-md hover:shadow-lg bg-gradient-to-r from-[#FF9900] to-[#F08804] hover:from-[#F08804] hover:to-[#E07704] text-black"
                                                title="Buy ingredients"
                                              >
                                                <ShoppingCart size={12} />
                                                Buy
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  setSwapTarget({ dayIdx: index, mealIdx: mealIndex });
                                                }}
                                                className="inline-flex items-center gap-1 text-xxs px-2 py-1 rounded border border-gray-400 text-gray-200 hover:bg-surface transition-colors"
                                                title="Edit this slot"
                                              >
                                                Edit
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {swapTarget && (
                                  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
                                    <div className="bg-surface rounded-xl border border-surface-highlight shadow-2xl max-w-lg w-full p-5">
                                      <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-foreground">Edit Meal Slot</h3>
                                        <button
                                          onClick={() => setSwapTarget(null)}
                                          className="text-gray-400 hover:text-white"
                                          aria-label="Close swap dialog"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      <p className="text-sm text-gray-300 mb-3">Choose a saved or custom meal to place into this slot.</p>
                                      <div className="max-h-72 overflow-y-auto space-y-2">
                                        {allMealsForPlan.map((meal) => (
                                          <button
                                            key={meal.id}
                                            onClick={() => {
                                              if (!swapTarget) return;
                                              setPlanWeekly(prev => {
                                                const copy = prev.map(d => ({ ...d, meals: [...d.meals] }));
                                                copy[swapTarget.dayIdx].meals[swapTarget.mealIdx] = meal;
                                                return copy;
                                              });
                                              setSwapTarget(null);
                                            }}
                                            className="w-full text-left p-3 rounded-lg border border-surface-highlight hover:border-primary-500 hover:bg-surface-highlight transition-colors"
                                          >
                                            <div className="flex justify-between items-center">
                                              <span className="font-semibold text-foreground truncate">{meal.name}</span>
                                              {meal.category === 'custom' && (
                                                <span className="text-xxs text-green-300 bg-green-900/40 px-2 py-0.5 rounded-full">Custom</span>
                                              )}
                                            </div>
                                          </button>
                                        ))}
                                        {allMealsForPlan.length === 0 && (
                                          <p className="text-sm text-gray-400">No meals available to swap.</p>
                                        )}
                                      </div>
                                      <div className="mt-4 flex justify-end">
                                        <button
                                          onClick={() => setSwapTarget(null)}
                                          className="px-4 py-2 text-sm text-gray-200 border border-surface-highlight rounded-lg hover:bg-surface-highlight"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-gray-400">Add at least one saved or custom meal to generate a weekly plan.</div>
                            )}
                            {planWeekly.length > 0 && (
                              <div className="pt-2">
                                <BuyAllMealPlanIngredientsButton weeklyPlan={planWeekly as any} petId={activePet?.id || ''} />
                              </div>
                            )}
                            {planWeekly.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                <button
                                  onClick={handleRandomizePlan}
                                  className="btn btn-success btn-sm"
                                >
                                  Randomize Week
                                </button>
                                <Link
                                  href={`/pets/${activePet?.id}/nutrition`}
                                  className="btn btn-success btn-sm"
                                >
                                  View Nutrition Dashboard
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
              </div>
            ) : (
              <div className="bg-surface border border-surface-highlight rounded-2xl shadow-lg p-6 flex items-center justify-center text-center min-h-[280px]">
                <div>
                  <div className="text-3xl mb-2">🐾</div>
                  <p className="text-lg font-semibold">Select a pet to view details</p>
                  <p className="text-sm text-gray-400 mt-1">Choose a pet from the list on the left.</p>
                </div>
              </div>
            )}
          </div>
        )}

        <AddPetModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onSubmit={(pet) => {
            handleAddPet(pet);
            setEditingPet(null);
          }}
          editingPet={editingPet}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      </div>
    </div>
  );
}
