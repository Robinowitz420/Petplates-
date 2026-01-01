'use client';

import React, { useState, useEffect, useCallback, useMemo, startTransition, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { getPrimaryName } from '@/lib/utils/petUtils';
import type { Pet } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import HealthConcernsDropdown from '@/components/HealthConcernsDropdown';
import { useVillageStore } from '@/lib/state/villageStore';
import { getMascotFaceForPetType, getProfilePictureForPetType } from '@/lib/utils/emojiMapping';
import AddPetImageButton from '@/components/AddPetImageButton';
import AddPetModal from '@/components/CreatePetModal';
import { getCustomMeals } from '@/lib/utils/customMealStorage';
import { getPets, savePet, deletePet } from '@/lib/utils/petStorage'; // Import from storage util
import type { CustomMeal } from '@/lib/types';
import { getVettedProduct, VETTED_PRODUCTS } from '@/lib/data/vetted-products';
import Image, { type StaticImageData } from 'next/image';
import EmojiIcon from '@/components/EmojiIcon';
import { ensureCartUrlSellerId } from '@/lib/utils/affiliateLinks';
import ConfirmModal from '@/components/ConfirmModal';
import { nutritionalGuidelines } from '@/lib/data/nutritional-guidelines';
import { calculateRecipeNutrition } from '@/lib/utils/recipeNutrition';
import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import type { Recipe } from '@/lib/types';
import { checkAllBadges } from '@/lib/utils/badgeChecker';
import PetBadges from '@/components/PetBadges';
import Tooltip from '@/components/Tooltip';
import { normalizePetCategory, normalizePetType } from '@/lib/utils/petType';
import { formatPercent } from '@/lib/utils/formatPercent';
import { getBreedNamesForSpecies } from '@/lib/data/speciesBreeds';
import BioBanner from '@/public/images/Site Banners/BIO.png';
import SavedMealsBanner from '@/public/images/Site Banners/SavedMeals.png';
import MealPlanBanner from '@/public/images/Site Banners/MealPlan.png';
import BadgesBanner from '@/public/images/Site Banners/Badges.png';
import CompatibilityRadial from '@/components/CompatibilityRadial';

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

// =================================================================
// 2. DATA CONSTANTS
// =================================================================

// Get breeds from centralized source
const PET_BREEDS: Record<PetCategory, string[]> = {
  dogs: [...getBreedNamesForSpecies('dogs'), 'Other'],
  cats: [...getBreedNamesForSpecies('cats'), 'Other'],
  birds: [...getBreedNamesForSpecies('birds'), 'Other'],
  reptiles: [...getBreedNamesForSpecies('reptiles'), 'Other'],
  'pocket-pets': [...getBreedNamesForSpecies('pocket-pets'), 'Other'],
};

const PROFILE_TAB_BANNERS: Record<'bio' | 'saved' | 'plan', { image: StaticImageData; alt: string }> = {
  bio: { image: BioBanner, alt: 'Bio banner' },
  saved: { image: SavedMealsBanner, alt: 'Saved meals banner' },
  plan: { image: MealPlanBanner, alt: 'Meal plan banner' },
};

const BADGE_SUMMARY_TEXT =
  'Badges you can earn:\n' +
  '• Cats Cunning Circles – score a perfect 100% compatibility.\n' +
  '• The Dog’s Divine Toque – finish a weekly meal plan.\n' +
  '• Week Whisker tiers – complete multiple weekly plans (1, 10, 50).\n' +
  '• Purchase Champion tiers – confirm your ingredient purchases (1+ up to 50).\n' +
  '• Turtle’s Lens – explore meal results.\n' +
  '• Bird’s Cap – log in daily.\n' +
  '• Hamster’s Suspenders – set up your pet profile.\n' +
  '• Dog’s Spoon – create or prepare a meal.';

const renderTabBanner = (tab: 'bio' | 'saved' | 'plan') => {
  const banner = PROFILE_TAB_BANNERS[tab];
  if (!banner) return null;
  return (
    <div className="mb-4 flex justify-center">
      <Image
        src={banner.image}
        alt={banner.alt}
        className="h-auto w-full max-w-3xl border-2 border-orange-400 rounded-xl"
        priority={tab === 'bio'}
      />
    </div>
  );
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
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-gray-200 px-6 py-3 z-10">
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
  const { user, isLoaded } = useUser();
  const [userId, setUserId] = useState<string>('');
  const { setUserId: setVillageUserId } = useVillageStore();
  const router = useRouter();

  const [pets, setPets] = useState<ProfilePet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [petsLoaded, setPetsLoaded] = useState(false);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bio' | 'saved' | 'plan'>('bio');
  const [planOffset, setPlanOffset] = useState(0);
  const [planWeekly, setPlanWeekly] = useState<{ day: string; meals: any[] }[]>([]);
  const [swapTarget, setSwapTarget] = useState<{ dayIdx: number; mealIdx: number } | null>(null);
  const [badgeRefreshKey, setBadgeRefreshKey] = useState(0);
  const activePet = useMemo(() => (activePetId ? pets.find((p) => p.id === activePetId) : null), [activePetId, pets]);

  // Cache of generated recipes keyed by id
  const [genRecipesById, setGenRecipesById] = useState<Record<string, Recipe>>({});
  const [failedGenRecipeIds, setFailedGenRecipeIds] = useState<Record<string, boolean>>({});
  // Cost per meal USD, keyed by recipe id (applies to both generated & custom)
  const [costPerMealMap, setCostPerMealMap] = useState<Record<string, number | null>>({});
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
  const compatibilityCacheRef = useRef<Record<string, number>>({});

  useEffect(() => {
    compatibilityCacheRef.current = {};
  }, [activePetId]);

  const getCompatibilityScoreForMeal = useCallback(
    (meal: any): number | null => {
      if (!activePet || !meal || !meal.id) return null;
      const cacheKey = `${activePet.id}-${meal.id}`;
      if (compatibilityCacheRef.current[cacheKey] !== undefined) {
        return compatibilityCacheRef.current[cacheKey];
      }

      try {
        const scoringPet = {
          id: activePet.id,
          name: getPrimaryName(activePet.names || []) || 'Pet',
          type: activePet.type,
          breed: activePet.breed,
          age: activePet.age,
          weight: activePet.weight,
          weightKg: activePet.weightKg,
          healthConcerns: activePet.healthConcerns || [],
          dietaryRestrictions: activePet.dietaryRestrictions || [],
          allergies: activePet.allergies || [],
        } as any;
        const result = scoreWithSpeciesEngine(meal as Recipe, scoringPet);
        const score = typeof result?.overallScore === 'number' ? result.overallScore : null;
        if (score !== null) {
          compatibilityCacheRef.current[cacheKey] = score;
        }
        return score;
      } catch (error) {
        console.error('Error calculating compatibility:', error);
        return null;
      }
    },
    [activePet]
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
    if (!isLoaded) return;
    const uid = user?.id || '';
    setUserId(uid);
    setVillageUserId(uid);
  }, [isLoaded, user?.id, setVillageUserId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load pets function - reusable
  const loadPets = useCallback(async () => {
    if (!userId) return;
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
    setPetsLoaded(true);
  }, [userId]);

  // Load custom meals for the active pet
  const loadCustomMeals = useCallback(async () => {
    if (activePetId && userId) {
      const meals = await getCustomMeals(userId, activePetId);
      startTransition(() => {
        setCustomMeals(meals);
      });
    } else {
      startTransition(() => {
        setCustomMeals([]);
      });
    }
  }, [activePetId, userId]);

  // Load custom meals when active pet changes - deferred until pet is actually selected
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

  // Load saved active pet ID from localStorage on mount (before pets load)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!userId) return;
      localStorage.setItem('last_user_id', userId);
      
      // Load saved active pet ID - this will be validated once pets are loaded
      const primaryKey = `active_pet_id_${userId}`;
      const savedActivePetId = localStorage.getItem(primaryKey);
      const fallbackActivePetId = localStorage.getItem('last_active_pet_id');

      if (savedActivePetId) {
        setActivePetId(savedActivePetId);
      } else if (fallbackActivePetId) {
        setActivePetId(fallbackActivePetId);
        // Backfill to the per-user key so subsequent restores are consistent
        localStorage.setItem(primaryKey, fallbackActivePetId);
      }
    }
  }, [userId]);

  // Load pets and expose user id for other pages (recipe detail, etc.)
  useEffect(() => {
    if (!userId) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_user_id', userId);
    }
    
    // Initial load - only critical data (pets list)
    loadPets();

    // Initialize village store with userId
    setVillageUserId(userId);
  }, [userId, setVillageUserId, loadPets]);

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
    // Important: don't clear persisted selection before we've loaded pets at least once.
    if (!petsLoaded) return;

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
        const primaryKey = `active_pet_id_${userId}`;
        const savedActivePetId = localStorage.getItem(primaryKey);
        const fallbackActivePetId = localStorage.getItem('last_active_pet_id');

        const savedPetExists = savedActivePetId && pets.some((p) => p.id === savedActivePetId);
        const fallbackPetExists = fallbackActivePetId && pets.some((p) => p.id === fallbackActivePetId);

        if (savedPetExists) {
          // Restore saved selection
          setActivePetId(savedActivePetId);
        } else if (fallbackPetExists) {
          setActivePetId(fallbackActivePetId);
          localStorage.setItem(primaryKey, fallbackActivePetId as string);
        } else {
          // Only auto-select first pet if no valid saved selection exists
          // Don't save this auto-selection to localStorage (only user selections are saved)
          setActivePetId(pets[0].id);
        }
      } else {
        setActivePetId(pets[0].id);
      }
    }
  }, [pets, activePetId, userId, petsLoaded]);

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

  // -----------------------------------------------------------------
  // Fetch generated recipe docs when savedRecipes / mealPlan change
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!activePet) return;
    const savedIds = Array.isArray(activePet.savedRecipes) ? activePet.savedRecipes : [];
    const planIds = Array.isArray((activePet as any).mealPlan) ? ((activePet as any).mealPlan as string[]) : [];
    const ids = Array.from(new Set([...savedIds, ...planIds])).filter(Boolean);
    const missing = ids.filter(
      (id) => !genRecipesById[id] && !customMeals.some((m) => m.id === id)
    );
    if (missing.length === 0) return;

    Promise.allSettled(
      missing.map((id) =>
        fetch(`/api/recipes/generated/${encodeURIComponent(id)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => (data?.recipe ? (data.recipe as Recipe) : null))
      )
    ).then((results) => {
      const additions: Record<string, Recipe> = {};
      const failures: Record<string, boolean> = {};
      results.forEach((res, idx) => {
        const id = missing[idx];
        if (res.status === 'fulfilled' && res.value) {
          additions[id] = res.value;
          return;
        }

        // Mark this id as failed (404/500/etc) so UI doesn't stay on "Loading…"
        failures[id] = true;
      });
      if (Object.keys(additions).length > 0) {
        setGenRecipesById((prev) => ({ ...prev, ...additions }));
        setFailedGenRecipeIds((prev) => {
          const next = { ...prev };
          Object.keys(additions).forEach((id) => {
            delete next[id];
          });
          return next;
        });
      }

      if (Object.keys(failures).length > 0) {
        setFailedGenRecipeIds((prev) => ({ ...prev, ...failures }));
      }
    });
  }, [activePet, genRecipesById, customMeals]);

  // -----------------------------------------------------------------
  // Batch price recipes whenever cache/customMeals change
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!activePet) return;
    const ids = Array.isArray(activePet.savedRecipes) ? activePet.savedRecipes : [];
    const recipesForPricing: Recipe[] = [];

    ids.forEach((id) => {
      const m = customMeals.find((cm) => cm.id === id) || null;
      if (m) {
        recipesForPricing.push(convertCustomMealToRecipe(m));
        return;
      }
      if (genRecipesById[id]) recipesForPricing.push(genRecipesById[id]);
    });
    if (recipesForPricing.length === 0) return;

    fetch('/api/pricing/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipes: recipesForPricing }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.results) return;
        const map: Record<string, number | null> = {};
        data.results.forEach((res: any) => {
          map[res.recipeId] = typeof res.costPerMealUsd === 'number' ? res.costPerMealUsd : null;
        });
        setCostPerMealMap((prev) => ({ ...prev, ...map }));
      })
      .catch(() => {});
  }, [activePet, genRecipesById, customMeals]);

  // Build weekly plan for Plan tab (mealPlan only)
  const allMealsForPlan = useMemo(() => {
    if (!activePet) return [];
    const planIds = Array.isArray((activePet as any).mealPlan) ? ((activePet as any).mealPlan as string[]) : [];
    const resolved: any[] = [];
    planIds.filter(Boolean).forEach((id) => {
      const cm = customMeals.find((m) => m.id === id) || null;
      if (cm) {
        resolved.push(convertCustomMealToRecipe(cm));
        return;
      }
      if (genRecipesById[id]) {
        resolved.push(genRecipesById[id]);
      }
    });
    return resolved;
  }, [activePet, customMeals, genRecipesById]);

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

      let newPetIdForNav: string | null = null;

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

        // If this was a brand new pet, auto-select it and navigate to its profile/meal context
        if (!isEditing) {
          newPetIdForNav = petWithSavedRecipes.id;
        }

        return updatedPets;
      });

      // Perform navigation and active pet updates after state update to avoid setState during render
      if (newPetIdForNav) {
        const newPetId = newPetIdForNav;

        checkAllBadges(userId, newPetId, {
          action: 'profile_setup',
        }).catch((err) => {
          console.error('Failed to check badges:', err);
        });

        // Update active pet state
        setActivePetId(newPetId);

        // Persist active pet to localStorage using the same keys as the pet detail page
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`active_pet_id_${userId}`, newPetId);
            localStorage.setItem('last_active_pet_id', newPetId);
          } catch {
            // ignore storage errors
          }
        }
      }
    },
    [userId, router]
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

  useEffect(() => {
    if (!userId || !activePetId) return;
    checkAllBadges(userId, activePetId, {
      action: 'daily_login',
    }).catch((err) => {
      console.error('Failed to check badges:', err);
    });
  }, [userId, activePetId]);

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
        savedRecipes: (petToUpdate.savedRecipes || []).filter(id => id !== recipeId),
        mealPlan: (petToUpdate as any).mealPlan ? ((petToUpdate as any).mealPlan || []).filter((id: string) => id !== recipeId) : (petToUpdate as any).mealPlan,
      };
      
      await savePet(userId, updatedPet);

      // Server-authoritative refresh after write
      await loadPets();
      
      setPets(prevPets => prevPets.map(p => 
        p.id === activePetId ? updatedPet : p
      ));
      
      // Badge system no longer evaluates on removal.
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
      <div className="max-w-screen-2xl mx-auto px-4 space-y-6">
        <header className="grid grid-cols-1 lg:grid-cols-[1fr_460px] 2xl:grid-cols-[1050px_460px] items-center">
          <div className="flex justify-center lg:translate-x-[200px]">
            <Image
              src="/images/Site Banners/MyPets.png"
              alt="My Pets"
              width={520}
              height={120}
              className="h-auto w-[160px] sm:w-[210px] md:w-[260px]"
              priority
              unoptimized
            />
          </div>
          <div className="hidden lg:block" />
        </header>

        {pets.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] 2xl:grid-cols-[1050px_460px] gap-6 items-start">
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

            <div className="hidden lg:flex justify-end sticky top-24">
              <AddPetImageButton
                width={440}
                height={300}
                onClick={() => {
                  setEditingPet(null);
                  setIsModalOpen(true);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] 2xl:grid-cols-[1050px_460px] gap-6 items-start">
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
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-800 bg-surface flex items-center justify-center flex-shrink-0">
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
              <div className="bg-surface border border-surface-highlight rounded-2xl shadow-xl p-5 flex flex-col">
                      <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="relative float-left mr-4 mb-2 flex flex-col items-center" style={{ shapeOutside: 'circle(50%)', width: '168px', height: '260px' }}>
                            <h2
                              className="text-xl font-bold text-center text-gray-100 whitespace-nowrap leading-tight"
                              style={{ margin: 0 }}
                            >
                              {getPrimaryName(activePet.names || []) || 'Unnamed Pet'}
                            </h2>
                            <label className="w-42 h-42 rounded-full overflow-hidden border-2 border-green-800 bg-surface-highlight flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity group translate-y-10" style={{ width: '168px', height: '168px' }}>
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
                                  style={normalizePetCategory(activePet.type, 'profile.page.avatar') === 'cats' ? { transform: 'scale(1.5)', transformOrigin: 'center', objectPosition: 'center' } : undefined}
                                />
                              )}
                            </label>
                            <svg className="absolute left-0 pointer-events-none" width="168" height="40" style={{ overflow: 'visible', top: '255px' }}>
                              <defs>
                                <path id={`textPath-${activePet.id}`} d="M 10,5 Q 84,-15 158,5" fill="none" />
                              </defs>
                              <text className="text-xs" fill="#9ca3af" fontSize="12">
                                <textPath href={`#textPath-${activePet.id}`} startOffset="50%">
                                  <tspan textAnchor="middle">Click to upload photo</tspan>
                                </textPath>
                              </text>
                            </svg>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 mt-9">
                          {/* Badges Section - moved to far right, maintaining current height */}
                          <div className="flex justify-center">
                            <Tooltip content={BADGE_SUMMARY_TEXT} wide>
                              <Image
                                src={BadgesBanner}
                                alt="Badges"
                                className="h-auto w-[220px] cursor-help border-2 border-orange-400 rounded-md"
                                priority
                              />
                            </Tooltip>
                          </div>
                          <div className="p-4 border border-orange-400 rounded-lg bg-surface-highlight/30 min-h-[140px] w-[520px] max-w-full">
                            <PetBadges key={badgeRefreshKey} petId={activePet.id} userId={userId} />
                          </div>
                        </div>
                      </div>

                    <div className="mt-4">
                      <div className="flex gap-0 border-b-2 border-surface-highlight">
                        {(["bio", "saved", "plan"] as const).map((tab) => {
                          const isActive = activeTab === tab;
                          const banner = PROFILE_TAB_BANNERS[tab];
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
                              className={`group relative px-4 py-2 transition-all duration-200 ${
                                isActive
                                  ? 'border-b-3 border-orange-400'
                                  : 'border-b-3 border-transparent'
                              }`}
                              style={{ borderBottomWidth: '3px' }}
                              aria-selected={isActive}
                              role="tab"
                            >
                              <Image
                                src={banner.image}
                                alt={banner.alt}
                                className="h-8 w-auto transition-opacity duration-200 group-hover:opacity-100 border-2 rounded-md"
                                style={{
                                  opacity: isActive ? 1 : 0.65,
                                  borderColor: '#fb923c',
                                }}
                                unoptimized
                              />
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 min-h-[70px]">
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
                                    const customMeal = customMeals.find((m) => m.id === rid) || null;
                                    const isCustomMeal = !!customMeal;
                                    const recipeObj: Recipe | null = isCustomMeal
                                      ? (convertCustomMealToRecipe(customMeal) as Recipe)
                                      : genRecipesById[rid] || null;
                                    if (!recipeObj) {
                                      if (!isCustomMeal && failedGenRecipeIds[rid]) {
                                        return (
                                          <div
                                            key={rid}
                                            className="p-2 rounded border border-white/5 grid grid-cols-[1fr_auto] items-center gap-4"
                                          >
                                            <div className="min-w-0 text-sm text-gray-400 break-words">
                                              Not found
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                              <button
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  setConfirmModal({
                                                    isOpen: true,
                                                    title: 'Remove Meal',
                                                    message: 'Remove this saved meal? It could not be loaded.',
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
                                      }
                                      return (
                                        <div key={rid} className="p-2 rounded border border-white/5">Loading…</div>
                                      );
                                    }
                                    const mealName = recipeObj.name || (isCustomMeal ? 'Custom Meal' : rid);

                                    const compatibilityScore = getCompatibilityScoreForMeal(recipeObj);

                                    return (
                                      <div key={rid} className="p-3 rounded border border-white/5 flex items-center justify-between gap-4 min-h-[90px]">
                                        <div className="min-w-0 flex flex-col gap-1">
                                          <button
                                            onClick={() => {
                                              window.location.href = `/recipe/${rid}?petId=${activePet.id}`;
                                            }}
                                            className="text-primary-300 hover:text-primary-100 text-sm font-semibold break-words text-left px-3 py-2 rounded transition-colors bg-surface border border-orange-500/50 hover:border-orange-500 hover:bg-surface-highlight/50"
                                          >
                                            {mealName}
                                          </button>
                                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-200 border border-orange-400/40 whitespace-nowrap w-fit">
                                            {typeof costPerMealMap[rid] === 'number'
                                              ? `Cost/meal: $${(costPerMealMap[rid] as number).toFixed(2)}`
                                              : 'Cost/meal: —'}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              if (!userId || !activePet) return;

                                              void (async () => {
                                                const petToUpdate = pets.find((p) => p.id === activePet.id) || null;
                                                if (!petToUpdate) return;

                                                const nextMealPlan = Array.isArray((petToUpdate as any).mealPlan)
                                                  ? ([...(petToUpdate as any).mealPlan] as string[])
                                                  : ([] as string[]);
                                                if (!nextMealPlan.includes(rid)) nextMealPlan.push(rid);

                                                const updatedPet = {
                                                  ...petToUpdate,
                                                  mealPlan: nextMealPlan,
                                                };

                                                await savePet(userId, updatedPet as any);
                                                await loadPets();
                                              })();
                                            }}
                                            disabled={!userId || !activePet || (Array.isArray((activePet as any).mealPlan) && ((activePet as any).mealPlan as string[]).includes(rid))}
                                            className="btn btn-success btn-sm"
                                            title="Add to meal plan"
                                          >
                                            {Array.isArray((activePet as any).mealPlan) && ((activePet as any).mealPlan as string[]).includes(rid)
                                              ? 'In Plan'
                                              : 'Add to Plan'}
                                          </button>

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

                                          {Array.isArray((recipeObj as any).ingredients) && (
                                            <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const cartItems = (((recipeObj as any).ingredients || []) as any[])
                                                  .map((ing: any, idx: number) => {
                                                    const genericName = (ing.name || '').toLowerCase().trim();
                                                    const vettedProduct = VETTED_PRODUCTS[genericName];
                                                    const link = vettedProduct ? vettedProduct.purchaseLink : (ing.asinLink || ing.amazonLink);
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
                                                  const cartUrl = ensureCartUrlSellerId(
                                                    `https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`
                                                  );
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

                                          <div className="flex items-center justify-center min-w-[70px]">
                                            {compatibilityScore !== null ? (
                                              <CompatibilityRadial
                                                score={compatibilityScore}
                                                size={48}
                                                strokeWidth={6}
                                                label=""
                                                textClassName="text-base"
                                              />
                                            ) : (
                                              <div className="text-xs text-gray-400">--</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {activeTab === 'plan' && (
                          <div className="space-y-4 text-sm">
                            {planWeekly.length > 0 ? (
                              <>
                                {/* Weekly compatibility average */}
                                {(() => {
                                  if (!activePet) return null;
                                  const allScores = planWeekly
                                    .flatMap((day) => day.meals.map((meal) => getCompatibilityScoreForMeal(meal)))
                                    .filter((score): score is number => typeof score === 'number');
                                  if (allScores.length === 0) return null;
                                  const weekAverage = Math.round(
                                    allScores.reduce((sum, score) => sum + score, 0) / allScores.length
                                  );
                                  return (
                                    <div className="mb-4 p-3 bg-surface-highlight rounded-lg border border-surface-highlight flex items-center justify-between gap-4">
                                      <h3 className="text-base font-semibold text-foreground">
                                        Compatibility score for the week
                                      </h3>
                                      <CompatibilityRadial
                                        score={weekAverage}
                                        size={48}
                                        strokeWidth={6}
                                        label=""
                                        textClassName="text-base"
                                      />
                                    </div>
                                  );
                                })()}
                                <div className="max-h-[480px] overflow-y-auto pr-2 space-y-3">
                                  {planWeekly.map((dayPlan, index) => {
                                    const calculateDayScore = (meals: any[]): number | null => {
                                      const scores = meals
                                        .map((meal) => getCompatibilityScoreForMeal(meal))
                                        .filter((score): score is number => typeof score === 'number');
                                      if (scores.length === 0) return null;
                                      return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
                                    };
                                    
                                    const dayScore = calculateDayScore(dayPlan.meals);
                                    
                                    return (
                                      <div key={dayPlan.day} className="rounded-lg border border-orange-400 px-3 py-2">
                                        <div className="text-white font-semibold mb-2 flex items-center justify-between gap-3">
                                          <span>{dayPlan.day}</span>
                                          {dayScore !== null ? (
                                            <CompatibilityRadial
                                              score={dayScore}
                                              size={48}
                                              strokeWidth={6}
                                              label=""
                                              textClassName="text-base"
                                            />
                                          ) : (
                                            <div className="text-xs text-gray-400">--</div>
                                          )}
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
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      </div>

                      </div>

                      <div className="mt-4 pt-4 border-t border-surface-highlight flex items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/profile/pet/${activePet.id}`}
                            className="group relative inline-flex focus:outline-none focus:ring-4 focus:ring-orange-500/40 rounded-xl"
                            aria-label="Find Meals"
                          >
                            <span className="relative h-12 w-[260px] sm:w-[300px] overflow-hidden rounded-xl">
                              <Image
                                src="/images/Buttons/FindMealsUnclicked.png"
                                alt=""
                                fill
                                sizes="300px"
                                className="object-contain transition-opacity duration-75 group-active:opacity-0"
                                priority
                              />
                              <Image
                                src="/images/Buttons/FindMealsClicked.png"
                                alt=""
                                fill
                                sizes="300px"
                                className="object-contain opacity-0 transition-opacity duration-75 group-active:opacity-100"
                                priority
                              />
                            </span>
                            <span className="sr-only">Find Meals</span>
                          </Link>

                          <Link
                            href={`/profile/pet/${activePet.id}/recipe-builder`}
                            className="group relative inline-flex focus:outline-none focus:ring-4 focus:ring-orange-500/40 rounded-xl"
                            aria-label="Create Meal"
                          >
                            <span className="relative h-12 w-[260px] sm:w-[300px] overflow-hidden rounded-xl">
                              <Image
                                src="/images/Buttons/CreateMealUnclicked.png"
                                alt=""
                                fill
                                sizes="300px"
                                className="object-contain transition-opacity duration-75 group-active:opacity-0"
                                priority
                              />
                              <Image
                                src="/images/Buttons/CreateMealClicked.png"
                                alt=""
                                fill
                                sizes="300px"
                                className="object-contain opacity-0 transition-opacity duration-75 group-active:opacity-100"
                                priority
                              />
                            </span>
                            <span className="sr-only">Create Meal</span>
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
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
                      </div>
              </div>
            ) : (
              <div className="bg-surface border border-surface-highlight rounded-2xl shadow-lg p-6 flex items-center justify-center text-center min-h-[280px]">
                <div>
                  <div className="text-3xl mb-2">🐾</div>
                  <div className="text-gray-400">Select a pet to see details.</div>
                </div>
              </div>
            )}

            </div>

            <div className="hidden lg:flex justify-end sticky top-24">
              <AddPetImageButton
                width={440}
                height={300}
                onClick={() => {
                  setEditingPet(null);
                  setIsModalOpen(true);
                }}
              />
            </div>
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
