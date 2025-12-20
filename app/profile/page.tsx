'use client';

import React, { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { getPrimaryName } from '@/lib/utils/petUtils';
import type { Pet } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import HealthConcernsDropdown from '@/components/HealthConcernsDropdown';
import { useVillageStore } from '@/lib/state/villageStore';
import { getMascotFaceForPetType, getProfilePictureForPetType } from '@/lib/utils/emojiMapping';
import AddPetModal from '@/components/CreatePetModal';
import { getCustomMeals } from '@/lib/utils/customMealStorage';
import { getPets, savePet, deletePet } from '@/lib/utils/petStorage'; // Import from storage util
import type { CustomMeal } from '@/lib/types';
import { getVettedProduct, VETTED_PRODUCTS } from '@/lib/data/vetted-products';
import Image from 'next/image';
import EmojiIcon from '@/components/EmojiIcon';
import { ensureCartUrlSellerId } from '@/lib/utils/affiliateLinks';
import ConfirmModal from '@/components/ConfirmModal';
import { nutritionalGuidelines } from '@/lib/data/nutritional-guidelines';
import { calculateEnhancedCompatibility, calculateRecipeNutrition, type Pet as EnhancedPet } from '@/lib/utils/enhancedCompatibilityScoring';
import type { Recipe } from '@/lib/types';
import { checkAllBadges } from '@/lib/utils/badgeChecker';
import PetBadges from '@/components/PetBadges';
import BadgeToggle from '@/components/BadgeToggle';
import Tooltip from '@/components/Tooltip';

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
  const [badgeRefreshKey, setBadgeRefreshKey] = useState(0);
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
  // Recipe name lookup - uses formatted name since recipes are now generated dynamically
  const getRecipeName = useCallback((id: string) => {
    if (!id) return 'Unnamed Meal';
    return formatRecipeName(id);
  }, []);
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

  // Load pets function - reusable
  const loadPets = useCallback(async () => {
    const loadedPets = await getPets(userId);
    // Normalize names: convert name field to names array if needed
    const normalizedPets = loadedPets.map((p: Pet) => ({
      ...p,
      names: p.names && Array.isArray(p.names) && p.names.length > 0
        ? p.names.filter((n: string) => n && n.trim() !== '')
        : (p.name && typeof p.name === 'string' && p.name.trim() !== ''
            ? [p.name.trim()]
            : ['Unnamed Pet']),
    }));
    setPets(normalizedPets);
  }, [userId]);

  // Load custom meals when active pet changes - deferred until pet is actually selected
  const loadCustomMeals = useCallback(async () => {
    if (activePetId && userId) {
      const meals = await getCustomMeals(userId, activePetId);
      // Use startTransition for non-critical state updates to avoid blocking UI
      startTransition(() => {
        setCustomMeals(meals);
      });
      // Note: loadPets() is called by the petsUpdated event handler, so we don't need to call it here
      // This avoids race conditions and redundant calls
    } else {
      startTransition(() => {
        setCustomMeals([]);
      });
    }
  }, [activePetId, userId]);

  // Load saved active pet ID from localStorage on mount (before pets load)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_user_id', userId);
      
      // Load saved active pet ID - this will be validated once pets are loaded
      const savedActivePetId = localStorage.getItem(`active_pet_id_${userId}`);
      if (savedActivePetId) {
        setActivePetId(savedActivePetId);
      }
    }
  }, [userId]);

  // Load pets and expose user id for other pages (recipe detail, etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_user_id', userId);
    }
    
    // Initial load - only critical data (pets list)
    loadPets();

    // Initialize village store with userId
    setUserId(userId);
  }, [userId, setUserId, loadPets]);

  // Refresh pets when page becomes visible (user returns to tab)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh pets
        loadPets();
      }
    };

    const handleFocus = () => {
      // Window regained focus, refresh pets
      loadPets();
    };

    const handleStorageChange = (e: StorageEvent) => {
      // Refresh if pets storage was modified (cross-tab/window)
      if (e.key === `pets_${userId}`) {
        loadPets();
      }
    };

    const handlePetsUpdated = (e: CustomEvent) => {
      // Refresh if pets were updated (same-tab)
      if (e.detail?.userId === userId) {
        loadPets();
        // If the updated pet is the active pet, also refresh custom meals
        // Use the current activePetId from closure, don't include loadCustomMeals in deps
        if (e.detail?.petId === activePetId && activePetId) {
          // Call getCustomMeals directly - use startTransition for non-critical updates
          getCustomMeals(userId, activePetId).then(meals => {
            startTransition(() => {
              setCustomMeals(meals);
            });
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('petsUpdated', handlePetsUpdated as EventListener);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('petsUpdated', handlePetsUpdated as EventListener);
    };
  }, [userId, loadPets, activePetId]);

  useEffect(() => {
    if (pets.length === 0) {
      setActivePetId(null);
      setActiveTab('bio');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`active_pet_id_${userId}`);
      }
      return;
    }
    
    // Check if current activePetId still exists in pets list
    const stillExists = pets.some((p) => p.id === activePetId);
    if (activePetId && !stillExists) {
      // Current selection no longer exists, clear it
      setActivePetId(null);
      setActiveTab('bio');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`active_pet_id_${userId}`);
      }
    }
    
    // If no pet is selected and we have pets, check localStorage first
    if (!activePetId && pets.length > 0) {
      if (typeof window !== 'undefined') {
        const savedActivePetId = localStorage.getItem(`active_pet_id_${userId}`);
        const savedPetExists = savedActivePetId && pets.some((p) => p.id === savedActivePetId);
        if (savedPetExists) {
          // Restore saved selection
          setActivePetId(savedActivePetId);
        } else {
          // Only auto-select first pet if no valid saved selection exists
          // Don't save this auto-selection to localStorage (only user selections are saved)
          setActivePetId(pets[0].id);
        }
      } else {
        setActivePetId(pets[0].id);
      }
    }
  }, [pets, activePetId, userId]);

  // Defer custom meals loading - only load when a pet is actually selected and viewed
  // Don't load on initial mount if no pet is active (saves initial load time)
  useEffect(() => {
    // Only load if we have an active pet ID (pet is selected)
    if (activePetId) {
      loadCustomMeals();
    } else {
      // Clear custom meals if no pet is selected
      setCustomMeals([]);
    }
  }, [activePetId, loadCustomMeals]);

  // Listen for custom meal updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCustomMealsUpdated = (e: CustomEvent) => {
      // Refresh if custom meals were updated for the active pet
      if (e.detail?.userId === userId && e.detail?.petId === activePetId && activePetId) {
        // Call getCustomMeals directly to avoid dependency on loadCustomMeals callback
        // Use startTransition for non-critical updates
        getCustomMeals(userId, activePetId).then(meals => {
          startTransition(() => {
            setCustomMeals(meals);
          });
        });
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      // Refresh if custom meals storage was modified (cross-tab/window)
      if (activePetId && e.key === `custom_meals_${userId}_${activePetId}`) {
        // Call getCustomMeals directly to avoid dependency on loadCustomMeals callback
        // Use startTransition for non-critical updates
        getCustomMeals(userId, activePetId).then(meals => {
          startTransition(() => {
            setCustomMeals(meals);
          });
        });
      }
    };

    window.addEventListener('customMealsUpdated', handleCustomMealsUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('customMealsUpdated', handleCustomMealsUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId, activePetId]);

  // Build weekly plan for Plan tab (merge saved recipes + custom meals)
  const allMealsForPlan = useMemo(() => {
    if (!activePet) return [];
    const saved = Array.isArray(activePet.savedRecipes)
      ? activePet.savedRecipes.filter(Boolean) as any[]
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
      // First, try to get names from names array
      let cleanedNames = Array.isArray(newPet.names)
        ? newPet.names.filter((n: string) => n && n.trim() !== '')
        : [];
      
      // If no names array, check for singular name field (from CreatePetModal)
      if (cleanedNames.length === 0 && newPet.name && typeof newPet.name === 'string' && newPet.name.trim() !== '') {
        cleanedNames = [newPet.name.trim()];
      }
      
      // If still no names after cleaning, set a default
      if (cleanedNames.length === 0) {
        cleanedNames.push('Unnamed Pet');
      }
      
      const petWithSavedRecipes = { 
        ...newPet,
        names: cleanedNames, // Use cleaned names
        // Remove singular name field if it exists (we're using names array now)
        name: undefined,
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

        // Save each pet async
        updatedPets.forEach(pet => {
          savePet(userId, pet).catch(err => console.error('Failed to save pet:', err));
        });
        
        return updatedPets;
      });
    },
    [userId]
  );

  const handleEditPet = useCallback((pet: Pet) => {
    setEditingPet(pet);
    setIsModalOpen(true);
  }, []);

  // Memoize modal handlers to prevent re-renders
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmitPet = useCallback((pet: Pet) => {
    handleAddPet(pet);
    setEditingPet(null);
  }, [handleAddPet]);

  const handleDeletePet = useCallback((petId: string) => {
    const pet = pets.find(p => p.id === petId);
    const petName = pet ? getPrimaryName(pet.names || []) : 'this pet';
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Pet',
      message: `Are you sure you want to delete ${petName}? This action cannot be undone.`,
      onConfirm: async () => {
        await deletePet(userId, petId);
        
        setPets(prevPets => {
          const updatedPets = prevPets.filter(p => p.id !== petId);
          if (activePetId === petId) {
            setActivePetId(null);
            setActiveTab('bio');
          }
          return updatedPets;
        });
      },
    });
  }, [userId, activePetId, pets]);

  const handleRemoveSavedMeal = useCallback(async (recipeId: string) => {
    if (!activePetId) return;
    
    // If it's a custom meal, also delete it from custom meals storage
    if (recipeId.startsWith('custom_')) {
      const { deleteCustomMeal } = await import('@/lib/utils/customMealStorage');
      await deleteCustomMeal(userId, activePetId, recipeId);
      // Update local custom meals state
      setCustomMeals(prev => prev.filter(m => m.id !== recipeId));
    }
    
    const petToUpdate = pets.find(p => p.id === activePetId);
    if (petToUpdate) {
      const updatedPet = {
        ...petToUpdate,
        savedRecipes: (petToUpdate.savedRecipes || []).filter(id => id !== recipeId)
      };
      
      await savePet(userId, updatedPet);
      
      setPets(prevPets => prevPets.map(p => 
        p.id === activePetId ? updatedPet : p
      ));
      
      // Check badges after recipe is removed
      if (activePet) {
        const uniqueMealIds = new Set<string>();
        planWeekly.forEach(day => {
          day.meals.forEach(meal => {
            if (meal && meal.id) uniqueMealIds.add(meal.id);
          });
        });
        const mealPlanCount = uniqueMealIds.size;
        const savedRecipesCount = updatedPet.savedRecipes?.length || 0;
        const weeklyPlanCompleted = false;
        
        checkAllBadges(userId, activePet.id, {
          action: 'recipe_removed',
          mealPlanCount,
          savedRecipesCount,
          weeklyPlanCompleted,
        }).catch(err => {
          console.error('Failed to check badges:', err);
        });
      }
    }
  }, [userId, activePetId, pets, planWeekly, activePet]);

  // Component to buy all ingredients from meal plan
  const BuyAllMealPlanIngredientsButton = ({ weeklyPlan, petId }: { weeklyPlan: { day: string; meals: (string | null)[] }[]; petId: string }) => {
    const [isOpening, setIsOpening] = useState(false);
    const [openedCount, setOpenedCount] = useState(0);

    const handleBuyAll = async () => {
      alert('Meal plans are now generated dynamically. Please navigate to individual meals to purchase ingredients.');
    };

    const totalIngredients = 0;

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
                        // Persist selection to localStorage
                        if (typeof window !== 'undefined') {
                          localStorage.setItem(`active_pet_id_${userId}`, pet.id);
                        }
                      }}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-200 ease-out ${
                        activePetId === pet.id
                          ? 'bg-green-900/20 text-white'
                          : 'bg-surface-highlight/60 text-foreground hover:bg-surface-highlight hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg'
                      }`}
                      style={{
                        border: activePetId === pet.id ? '3px solid #f97316' : '3px solid rgba(249, 115, 22, 0.5)'
                      }}
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
                        <div className="flex-1 min-w-0">
                          <div className="relative float-left mr-4 mb-2" style={{ shapeOutside: 'circle(50%)', width: '168px', height: '168px' }}>
                            <svg className="absolute -top-8 left-0 pointer-events-none" width="168" height="40" style={{ overflow: 'visible' }}>
                              <defs>
                                <path id={`textPath-${activePet.id}`} d="M 10,35 Q 84,15 158,35" fill="none" />
                              </defs>
                              <text className="text-xs" fill="#9ca3af" fontSize="12">
                                <textPath href={`#textPath-${activePet.id}`} startOffset="50%">
                                  <tspan textAnchor="middle">Click to upload photo</tspan>
                                </textPath>
                              </text>
                            </svg>
                            <label className="w-42 h-42 rounded-full overflow-hidden border border-white/10 bg-surface-highlight flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity group" style={{ width: '168px', height: '168px' }}>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const imageDataUrl = reader.result as string;
                                      const updatedPet = { ...activePet, image: imageDataUrl };
                                      savePet(userId, updatedPet);
                                      setPets(prevPets => prevPets.map(p => p.id === activePet.id ? updatedPet : p));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              {activePet.image ? (
                                <img
                                  src={activePet.image}
                                  alt={getPrimaryName(activePet.names || []) || 'Pet'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image
                                  src={getProfilePictureForPetType(activePet.type as PetCategory)}
                                  alt={`${getPrimaryName(activePet.names || []) || 'Pet'} mascot`}
                                  width={168}
                                  height={168}
                                  className="object-cover"
                                  unoptimized
                                  style={activePet.type === 'cats' || activePet.type === 'cat' ? { transform: 'scale(1.5)', transformOrigin: 'center', objectPosition: 'center' } : undefined}
                                />
                              )}
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          {/* Pet name and Edit/Delete buttons row */}
                          <div className="flex items-center justify-between gap-3 w-[600px]">
                            <h2 className="text-3xl font-bold">
                              {getPrimaryName(activePet.names || []) || 'Unnamed Pet'}
                            </h2>
                            {activeTab === 'bio' && (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleEditPet(activePet)}
                                  className="btn btn-success btn-sm"
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
                          {/* Badges Section - moved to far right, maintaining current height */}
                          <div className="p-4 border border-surface-highlight rounded-lg bg-surface-highlight/30 min-h-[140px] w-[600px]">
                            <div className="flex items-center justify-between mb-3">
                              <Tooltip 
                                content={`Available Badges:\n\n1. Perfect Match\n   Awarded when you hit a 100% compatibility score.\n\n2. Feast Architect\n   Unlocked by building a layered or multi‑step meal plan.\n\n3. Week Whisker (Progressive)\n   Bronze: Complete 1 weekly plan\n   Silver: Complete 10 weekly plans\n   Gold: Complete 50 weekly plans\n\n4. Purchase Champion (Progressive)\n   Bronze: 1 purchase\n   Silver: 10 purchases\n   Gold: 20 purchases\n   Platinum: 30 purchases\n   Diamond: 40 purchases\n   Sultan: 50+ purchases`}
                                wide={true}
                              >
                                <div className="text-sm font-semibold text-gray-400 cursor-help hover:text-gray-300 transition-colors">Badges</div>
                              </Tooltip>
                            </div>
                            <PetBadges key={badgeRefreshKey} petId={activePet.id} userId={userId} />
                            <BadgeToggle 
                              petId={activePet.id} 
                              userId={userId} 
                              onBadgeChange={() => setBadgeRefreshKey((prev: number) => prev + 1)}
                            />
                          </div>
                        </div>
                      </div>

                    <div className="mt-4">
                      <div className="flex gap-0 border-b-2 border-surface-highlight">
                        {['bio', 'saved', 'plan'].map((tab) => {
                          const label = tab === 'bio' ? 'Bio' : tab === 'saved' ? 'Saved Meals' : 'Meal Plan';
                          const isActive = activeTab === tab;
                          return (
                            <button
                              key={tab}
                              onClick={() => {
                                setActiveTab(tab as any);
                                // Refresh pets when switching to saved tab to ensure latest data
                                if (tab === 'saved') {
                                  loadPets();
                                }
                              }}
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
                          <div className="flex gap-6">
                            {/* Bio Column */}
                            <div className="flex-1 min-w-0">
                              <div className="grid grid-cols-1 gap-y-1 text-sm text-gray-300">
                                {activePet.breed && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    <span><strong className="text-gray-200">Breed:</strong> {activePet.breed}</span>
                                  </div>
                                )}
                                {activePet.age && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    <span><strong className="text-gray-200">Age:</strong> {activePet.age}</span>
                                  </div>
                                )}
                                {(activePet.weight || activePet.weightKg) && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    <span><strong className="text-gray-200">Weight:</strong> {activePet.weightKg ? `${activePet.weightKg}kg` : activePet.weight}</span>
                                  </div>
                                )}
                                {(activePet.dietaryRestrictions || []).length > 0 && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    <span><strong className="text-gray-200">Dietary Restrictions:</strong> {(activePet.dietaryRestrictions || []).join(', ')}</span>
                                  </div>
                                )}
                                {(activePet.dislikes || []).length > 0 && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    <span><strong className="text-gray-200">Dislikes:</strong> {(activePet.dislikes || []).join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Health Concerns Column - Always rendered for consistent layout */}
                            <div className="flex-shrink-0 min-w-[180px]">
                              <h3 className="text-sm font-semibold text-gray-300 mb-2">Health Concerns</h3>
                              <div className="flex flex-col gap-1.5">
                                {(activePet.healthConcerns || []).length > 0 ? (
                                  (activePet.healthConcerns || []).map((concern) => (
                                    <div
                                      key={concern}
                                      className="px-2 py-1 bg-orange-900/40 text-orange-200 border border-orange-700/50 text-xs rounded"
                                    >
                                      {concern.replace(/-/g, ' ')}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-2 py-1 text-gray-500 text-xs italic">
                                    None
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Allergies Column - Always rendered for consistent layout */}
                            <div className="flex-shrink-0 min-w-[180px]">
                              <h3 className="text-sm font-semibold text-gray-300 mb-2">Allergies</h3>
                              <div className="flex flex-col gap-1.5">
                                {(activePet.allergies || []).length > 0 ? (
                                  (activePet.allergies || []).map((allergy) => (
                                    <div
                                      key={allergy}
                                      className="px-2 py-1 bg-orange-900/40 text-orange-200 border border-orange-700/50 text-xs rounded"
                                    >
                                      {allergy.replace(/-/g, ' ')}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-2 py-1 text-gray-500 text-xs italic">
                                    None
                                  </div>
                                )}
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
                                    No saved meals yet. Use "Find Meals" to add some.
                                  </div>
                                );
                              }

                              return (
                                <div className="max-h-[480px] overflow-y-auto pr-2 space-y-2">
                                  {combinedIds.map((rid) => {
                                    const isCustomMeal = rid.startsWith('custom_');
                                    const customMeal = isCustomMeal ? customMeals.find((m) => m.id === rid) : null;
                                    const mealName = isCustomMeal ? customMeal?.name || 'Custom Meal' : getRecipeName(rid);
                                    const mealData = isCustomMeal ? customMeal : null;

                                    // Calculate compatibility score
                                    let compatibilityScore: number | null = null;
                                    if (activePet && mealData) {
                                      try {
                                        const enhancedPet: EnhancedPet = {
                                          id: activePet.id,
                                          name: getPrimaryName(activePet.names || []) || 'Pet',
                                          type: activePet.type === 'dogs' ? 'dog' : activePet.type === 'cats' ? 'cat' : activePet.type === 'birds' ? 'bird' : activePet.type === 'reptiles' ? 'reptile' : 'pocket-pet',
                                          breed: activePet.breed || '',
                                          age: activePet.age === 'baby' ? 0.5 : activePet.age === 'young' ? 2 : activePet.age === 'adult' ? 5 : 10,
                                          weight: activePet.weightKg || 10,
                                          activityLevel: 'moderate',
                                          healthConcerns: activePet.healthConcerns || [],
                                          dietaryRestrictions: activePet.allergies || [],
                                          allergies: activePet.allergies || [],
                                        };
                                        const result = calculateEnhancedCompatibility(mealData as Recipe, enhancedPet);
                                        compatibilityScore = result.overallScore;
                                      } catch (error) {
                                        console.error('Error calculating compatibility:', error);
                                        compatibilityScore = null;
                                      }
                                    }

                                    return (
                                      <div key={rid} className="p-2 rounded border border-white/5 grid grid-cols-[1fr_auto_auto] items-center gap-4">
                                        <div className="min-w-0">
                                          <button
                                            onClick={() => {
                                              window.location.href = `/recipe/${rid}?petId=${activePet.id}`;
                                            }}
                                            className="text-primary-300 hover:text-primary-100 text-sm font-semibold break-words text-left px-3 py-2 rounded transition-colors bg-surface border border-orange-500/50 hover:border-orange-500 hover:bg-surface-highlight/50"
                                          >
                                            {mealName}
                                          </button>
                                        </div>
                                        <div className="flex items-center justify-center min-w-[60px]">
                                          {compatibilityScore !== null && (
                                            <div className={`text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center border-2 ${
                                              compatibilityScore >= 80 
                                                ? 'text-green-400 border-green-400' 
                                                : compatibilityScore >= 60 
                                                ? 'text-yellow-400 border-yellow-400' 
                                                : 'text-red-400 border-red-400'
                                            }`}>
                                              {compatibilityScore}%
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {mealData && (mealData as any).ingredients && (
                                            <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const cartItems = ((mealData as any).ingredients || [])
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
                                                  const cartUrl = ensureCartUrlSellerId(`https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`);
                                                  window.open(cartUrl, '_blank');
                                                } else {
                                                  alert('No ingredient links available for this recipe.');
                                                }
                                              }}
                                              className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded font-semibold transition-all shadow-md hover:shadow-lg bg-gradient-to-r from-[#FF9900] to-[#F08804] hover:from-[#F08804] hover:to-[#E07704] text-black flex-shrink-0"
                                              title="Buy ingredients"
                                            >
                                              <ShoppingCart size={14} />
                                              Buy
                                            </button>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setConfirmModal({
                                                isOpen: true,
                                                title: 'Remove Meal',
                                                message: `Remove "${mealName}" from saved meals?`,
                                                onConfirm: () => {
                                                  handleRemoveSavedMeal(rid);
                                                },
                                              });
                                            }}
                                            className="btn btn-success btn-sm"
                                            title="Remove meal"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
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
                                {/* Weekly Nutritional Coverage Summary */}
                                {(() => {
                                  if (!activePet) return null;
                                  
                                  // Calculate weekly nutrition totals
                                  const calculateMealNutrition = (meal: any): { protein: number; fat: number; fiber: number; calcium: number; phosphorus: number; calories: number } => {
                                    // Use calculateRecipeNutrition directly to get actual nutrition values
                                    try {
                                      const nutrition = calculateRecipeNutrition(meal as Recipe);
                                      return {
                                        protein: nutrition.protein || 0,
                                        fat: nutrition.fat || 0,
                                        fiber: nutrition.fiber || 0,
                                        calcium: nutrition.calcium || 0,
                                        phosphorus: nutrition.phosphorus || 0,
                                        calories: nutrition.calories || 0,
                                      };
                                    } catch {
                                      return { protein: 0, fat: 0, fiber: 0, calcium: 0, phosphorus: 0, calories: 0 };
                                    }
                                  };
                                  
                                  const weeklyTotals = planWeekly.reduce((acc, day) => {
                                    day.meals.forEach(meal => {
                                      const nutrition = calculateMealNutrition(meal);
                                      acc.protein += nutrition.protein;
                                      acc.fat += nutrition.fat;
                                      acc.fiber += nutrition.fiber;
                                      acc.calcium += nutrition.calcium;
                                      acc.phosphorus += nutrition.phosphorus;
                                      acc.calories += nutrition.calories;
                                    });
                                    return acc;
                                  }, { protein: 0, fat: 0, fiber: 0, calcium: 0, phosphorus: 0, calories: 0 });
                                  
                                  // Average per day (divide by 7)
                                  const dailyAvg = {
                                    protein: weeklyTotals.protein / 7,
                                    fat: weeklyTotals.fat / 7,
                                    fiber: weeklyTotals.fiber / 7,
                                    calcium: weeklyTotals.calcium / 7,
                                    phosphorus: weeklyTotals.phosphorus / 7,
                                    calories: weeklyTotals.calories / 7,
                                  };
                                  
                                  // Get pet requirements
                                  const petType = activePet.type as keyof typeof nutritionalGuidelines;
                                  const ageGroup = activePet.age === 'baby' ? 'puppy' : activePet.age === 'senior' ? 'senior' : 'adult';
                                  const requirements = nutritionalGuidelines[petType]?.[ageGroup] || nutritionalGuidelines[petType]?.adult;
                                  
                                  if (!requirements) return null;
                                  
                                  // Calculate coverage scores (0-100)
                                  const calculateCoverage = (value: number, min: number, max: number): number => {
                                    if (value < min) return (value / min) * 50; // Below min: 0-50
                                    if (value > max) return 100 - Math.min((value - max) / max * 50, 50); // Above max: 50-100
                                    return 50 + ((value - min) / (max - min)) * 50; // In range: 50-100
                                  };
                                  
                                  const proteinScore = calculateCoverage(dailyAvg.protein, requirements.protein.min, requirements.protein.max);
                                  const fatScore = calculateCoverage(dailyAvg.fat, requirements.fat.min, requirements.fat.max);
                                  const fiberScore = requirements.fiber ? calculateCoverage(dailyAvg.fiber, requirements.fiber.min, requirements.fiber.max) : 100;
                                  const calciumScore = requirements.calcium ? calculateCoverage(dailyAvg.calcium, requirements.calcium.min, requirements.calcium.max) : 100;
                                  const phosphorusScore = requirements.phosphorus ? calculateCoverage(dailyAvg.phosphorus, requirements.phosphorus.min, requirements.phosphorus.max) : 100;
                                  
                                  const overallScore = Math.round((proteinScore + fatScore + fiberScore + calciumScore + phosphorusScore) / 5);
                                  
                                  return (
                                    <div className="mb-4 p-3 bg-surface-highlight rounded-lg border border-surface-highlight flex items-center gap-3">
                                      <h3 className="text-base font-semibold text-foreground">Compatibility score for the week:</h3>
                                      <div className={`text-xl font-bold ${overallScore >= 80 ? 'text-green-400' : overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {overallScore}%
                                      </div>
                                    </div>
                                  );
                                })()}
                                <div className="max-h-[480px] overflow-y-auto pr-2 space-y-3">
                                  {planWeekly.map((dayPlan, index) => {
                                    // Calculate day score for this day's meals
                                    const calculateDayScore = (meals: any[]): number => {
                                      if (!activePet || meals.length === 0) return 0;
                                      
                                      const calculateMealNutrition = (meal: any): { protein: number; fat: number; fiber: number; calcium: number; phosphorus: number } => {
                                        // Use calculateRecipeNutrition directly to get actual nutrition values
                                        try {
                                          const nutrition = calculateRecipeNutrition(meal as Recipe);
                                          return {
                                            protein: nutrition.protein || 0,
                                            fat: nutrition.fat || 0,
                                            fiber: nutrition.fiber || 0,
                                            calcium: nutrition.calcium || 0,
                                            phosphorus: nutrition.phosphorus || 0,
                                          };
                                        } catch {
                                          return { protein: 0, fat: 0, fiber: 0, calcium: 0, phosphorus: 0 };
                                        }
                                      };
                                      
                                      const dayTotals = meals.reduce((acc, meal) => {
                                        const nutrition = calculateMealNutrition(meal);
                                        acc.protein += nutrition.protein;
                                        acc.fat += nutrition.fat;
                                        acc.fiber += nutrition.fiber;
                                        acc.calcium += nutrition.calcium;
                                        acc.phosphorus += nutrition.phosphorus;
                                        return acc;
                                      }, { protein: 0, fat: 0, fiber: 0, calcium: 0, phosphorus: 0 });
                                      
                                      // Average per meal (divide by number of meals)
                                      const mealAvg = {
                                        protein: dayTotals.protein / meals.length,
                                        fat: dayTotals.fat / meals.length,
                                        fiber: dayTotals.fiber / meals.length,
                                        calcium: dayTotals.calcium / meals.length,
                                        phosphorus: dayTotals.phosphorus / meals.length,
                                      };
                                      
                                      const petType = activePet.type as keyof typeof nutritionalGuidelines;
                                      const ageGroup = activePet.age === 'baby' ? 'puppy' : activePet.age === 'senior' ? 'senior' : 'adult';
                                      const requirements = nutritionalGuidelines[petType]?.[ageGroup] || nutritionalGuidelines[petType]?.adult;
                                      
                                      if (!requirements) return 0;
                                      
                                      const calculateCoverage = (value: number, min: number, max: number): number => {
                                        if (value < min) return (value / min) * 50;
                                        if (value > max) return 100 - Math.min((value - max) / max * 50, 50);
                                        return 50 + ((value - min) / (max - min)) * 50;
                                      };
                                      
                                      const proteinScore = calculateCoverage(mealAvg.protein, requirements.protein.min, requirements.protein.max);
                                      const fatScore = calculateCoverage(mealAvg.fat, requirements.fat.min, requirements.fat.max);
                                      const fiberScore = requirements.fiber ? calculateCoverage(mealAvg.fiber, requirements.fiber.min, requirements.fiber.max) : 100;
                                      const calciumScore = requirements.calcium ? calculateCoverage(mealAvg.calcium, requirements.calcium.min, requirements.calcium.max) : 100;
                                      const phosphorusScore = requirements.phosphorus ? calculateCoverage(mealAvg.phosphorus, requirements.phosphorus.min, requirements.phosphorus.max) : 100;
                                      
                                      return Math.round((proteinScore + fatScore + fiberScore + calciumScore + phosphorusScore) / 5);
                                    };
                                    
                                    const dayScore = calculateDayScore(dayPlan.meals);
                                    
                                    return (
                                      <div key={dayPlan.day} className="rounded-lg border border-surface-highlight px-3 py-2">
                                        <div className="text-white font-semibold mb-2 flex items-center gap-2">
                                          {dayPlan.day}
                                          <div className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border ${
                                            dayScore >= 80 
                                              ? 'text-green-400 border-green-400' 
                                              : dayScore >= 60 
                                              ? 'text-yellow-400 border-yellow-400' 
                                              : 'text-red-400 border-red-400'
                                          }`}>
                                            {dayScore}%
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          {dayPlan.meals.map((meal, mealIndex) => (
                                            <div key={meal.id + mealIndex} className="p-2 rounded border border-white/5 grid grid-cols-[1fr_auto] items-center gap-4">
                                              <button
                                                onClick={() => {
                                                  window.location.href = `/recipe/${meal.id}?petId=${activePet.id}`;
                                                }}
                                                className="text-primary-300 hover:text-primary-100 text-sm font-semibold break-words text-left px-3 py-2 rounded transition-colors bg-surface border border-orange-500/50 hover:border-orange-500 hover:bg-surface-highlight/50"
                                              >
                                                {meal.name}
                                              </button>
                                              <div className="flex items-center gap-2 flex-shrink-0">
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
                                                  const cartUrl = ensureCartUrlSellerId(`https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`);
                                                  window.open(cartUrl, '_blank');
                                                } else {
                                                  alert('No ingredient links available for this recipe.');
                                                }
                                              }}
                                              className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded font-semibold transition-all shadow-md hover:shadow-lg bg-gradient-to-r from-[#FF9900] to-[#F08804] hover:from-[#F08804] hover:to-[#E07704] text-black flex-shrink-0"
                                              title="Buy ingredients"
                                            >
                                              <ShoppingCart size={14} />
                                              Buy
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                setSwapTarget({ dayIdx: index, mealIdx: mealIndex });
                                              }}
                                              className="btn btn-success btn-sm"
                                              title="Edit this slot"
                                            >
                                              Edit
                                            </button>
                                            </div>
                                          </div>
                                        ))}
                                        </div>
                                      </div>
                                    );
                                  })}
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
                              <div className="pt-2 flex gap-2 items-center">
                                <BuyAllMealPlanIngredientsButton weeklyPlan={planWeekly as any} petId={activePet?.id || ''} />
                                <button
                                  onClick={async () => {
                                    if (!activePet) return;
                                    
                                    // Mark plan as completed
                                    const updatedPet = {
                                      ...activePet,
                                      completedMealPlans: (activePet.completedMealPlans || 0) + 1,
                                    };
                                    await savePet(userId, updatedPet);
                                    setPets(prevPets => prevPets.map(p => p.id === activePet.id ? updatedPet : p));
                                    
                                    // Check badges
                                    const uniqueMealIds = new Set<string>();
                                    planWeekly.forEach(day => {
                                      day.meals.forEach(meal => {
                                        if (meal && meal.id) uniqueMealIds.add(meal.id);
                                      });
                                    });
                                    
                                    await checkAllBadges(userId, activePet.id, {
                                      action: 'meal_plan_completed',
                                      mealPlanCount: uniqueMealIds.size,
                                      savedRecipesCount: activePet.savedRecipes?.length || 0,
                                      weeklyPlanCompleted: true,
                                      completionCount: updatedPet.completedMealPlans || 1,
                                    });
                                  }}
                                  className="btn btn-success btn-sm"
                                  title="Mark this weekly plan as completed (saved and locked)"
                                >
                                  ✓ Lock Plan
                                </button>
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
          onClose={handleCloseModal}
          onSubmit={handleSubmitPet}
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
          isDeleteModal={true}
        />
      </div>
    </div>
  );
}
