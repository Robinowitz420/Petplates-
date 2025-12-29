'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMascotFaceForPetType } from '@/lib/utils/emojiMapping';
import { getBreedNamesForSpecies } from '@/lib/data/speciesBreeds';
import { getHealthConcernsForSpecies } from '@/lib/data/health-concerns';
import type { Pet } from '@/lib/types';

// --- Type Definitions ---
type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type HealthConcern = string; // Now dynamic based on species
type HealthConcernWithNone = 'none' | HealthConcern;
type ActivityLevel = 'high' | 'medium' | 'low';

interface FormData {
  name: string;
  type: PetCategory | '';
  breed: string;
  weight?: string;
  activityLevel: ActivityLevel | undefined;
  healthConcerns: HealthConcernWithNone[];
  allergies: string[];
  customAllergies: string;
}

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pet: Pet) => void;
  editingPet?: Pet | null;
}

// --- Static Data ---
// Health concerns will be dynamically generated based on species

const initialFormData: FormData = {
  name: '',
  type: '',
  breed: '',
  weight: '',
  activityLevel: undefined as ActivityLevel | undefined,
  healthConcerns: [],
  allergies: [],
  customAllergies: '',
};

// --- Species-Specific Allergen Options ---
function getAllergenOptionsForSpecies(species: PetCategory | ''): Array<{ value: string; label: string }> {
  if (!species) return [];

  const allergens: Record<PetCategory, Array<{ value: string; label: string }>> = {
    'dogs': [
      { value: 'chicken', label: 'Chicken' },
      { value: 'beef', label: 'Beef' },
      { value: 'pork', label: 'Pork' },
      { value: 'fish', label: 'Fish' },
      { value: 'lamb', label: 'Lamb' },
      { value: 'turkey', label: 'Turkey' },
      { value: 'duck', label: 'Duck' },
      { value: 'rabbit', label: 'Rabbit' },
      { value: 'venison', label: 'Venison' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'egg', label: 'Eggs' },
      { value: 'wheat', label: 'Wheat' },
      { value: 'corn', label: 'Corn' },
      { value: 'soy', label: 'Soy' },
      { value: 'rice', label: 'Rice' },
      { value: 'peanut', label: 'Peanuts' },
    ],
    'cats': [
      { value: 'chicken', label: 'Chicken' },
      { value: 'beef', label: 'Beef' },
      { value: 'pork', label: 'Pork' },
      { value: 'fish', label: 'Fish' },
      { value: 'lamb', label: 'Lamb' },
      { value: 'turkey', label: 'Turkey' },
      { value: 'duck', label: 'Duck' },
      { value: 'rabbit', label: 'Rabbit' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'egg', label: 'Eggs' },
      { value: 'wheat', label: 'Wheat' },
      { value: 'corn', label: 'Corn' },
      { value: 'soy', label: 'Soy' },
    ],
    'birds': [
      { value: 'peanut', label: 'Peanuts' },
      { value: 'sunflower-seeds', label: 'Sunflower Seeds' },
      { value: 'millet', label: 'Millet' },
      { value: 'corn', label: 'Corn' },
      { value: 'wheat', label: 'Wheat' },
      { value: 'soy', label: 'Soy' },
      { value: 'egg', label: 'Eggs' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'avocado', label: 'Avocado' },
    ],
    'reptiles': [
      { value: 'crickets', label: 'Crickets' },
      { value: 'mealworms', label: 'Mealworms' },
      { value: 'waxworms', label: 'Waxworms' },
      { value: 'superworms', label: 'Superworms' },
      { value: 'dubia-roaches', label: 'Dubia Roaches' },
      { value: 'spinach', label: 'Spinach' },
      { value: 'kale', label: 'Kale' },
      { value: 'collard-greens', label: 'Collard Greens' },
      { value: 'dandelion-greens', label: 'Dandelion Greens' },
    ],
    'pocket-pets': [
      { value: 'alfalfa', label: 'Alfalfa' },
      { value: 'timothy-hay', label: 'Timothy Hay' },
      { value: 'wheat', label: 'Wheat' },
      { value: 'corn', label: 'Corn' },
      { value: 'soy', label: 'Soy' },
      { value: 'peanuts', label: 'Peanuts' },
      { value: 'sunflower-seeds', label: 'Sunflower Seeds' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'chocolate', label: 'Chocolate' },
    ],
  };

  return allergens[species] || [];
}

// --- Button Components (Defined Outside) ---
const PetTypeButton = memo(({ petType, isSelected, onClick, mascotSrc, label }: { 
  petType: PetCategory; 
  isSelected: boolean; 
  onClick: () => void;
  mascotSrc: string;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors duration-150 ${
      isSelected 
        ? 'bg-primary-900/30 shadow-md' 
        : 'bg-surface-lighter hover:bg-surface-highlight'
    }`}
    style={{ 
      contain: 'layout style paint',
      border: isSelected ? '3px solid #f97316' : '3px solid rgba(249, 115, 22, 0.5)'
    }}
  >
    <div className="w-12 h-12 rounded-full overflow-hidden mb-2 flex-shrink-0">
      <img
        src={mascotSrc}
        alt={`${petType} mascot`}
        width={48}
        height={48}
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
    <span className={`text-xs font-medium ${isSelected ? 'text-primary-400' : 'text-gray-400'}`}>
      {label}
    </span>
  </button>
));
PetTypeButton.displayName = 'PetTypeButton';

const BreedButton = memo(({ breed, isSelected, onClick }: { 
  breed: string; 
  isSelected: boolean; 
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 rounded-xl text-sm text-left transition-colors duration-150 ${
      isSelected
        ? 'bg-primary-900/30 text-primary-200 shadow-md'
        : 'bg-surface-lighter text-gray-300 hover:bg-surface-highlight'
    }`}
    style={{ 
      contain: 'layout style paint',
      border: isSelected ? '3px solid #f97316' : '3px solid rgba(249, 115, 22, 0.5)'
    }}
  >
    {breed}
  </button>
));
BreedButton.displayName = 'BreedButton';

const ActivityButton = memo(({ level, label, isSelected, onClick }: { 
  level: ActivityLevel;
  label: string;
  isSelected: boolean; 
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 rounded-xl transition-colors duration-150 ${
      isSelected
        ? 'bg-primary-900/30 text-primary-200 shadow-md'
        : 'bg-surface-lighter text-gray-300 hover:bg-surface-highlight'
    }`}
    style={{ 
      contain: 'layout style paint',
      border: isSelected ? '3px solid #f97316' : '3px solid rgba(249, 115, 22, 0.5)'
    }}
  >
    {label}
  </button>
));
ActivityButton.displayName = 'ActivityButton';

const HealthConcernButton = memo(({ option, isSelected, isDisabled, onClick }: { 
  option: { value: string; label: string };
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDisabled) {
        onClick();
      }
    }}
    disabled={isDisabled}
    className={`flex items-center justify-between p-4 rounded-xl text-left transition-colors duration-150 ${
      isDisabled ? 'bg-surface text-gray-600 cursor-not-allowed opacity-50' : 'cursor-pointer'
    } ${
      isSelected 
        ? 'bg-primary-900/30 text-primary-200 shadow-md' 
        : 'bg-surface-lighter text-gray-300 hover:bg-surface-highlight'
    }`}
    style={{ 
      contain: 'layout style paint',
      border: isDisabled ? '3px solid rgba(249, 115, 22, 0.2)' : isSelected ? '3px solid #f97316' : '3px solid rgba(249, 115, 22, 0.5)',
      pointerEvents: isDisabled ? 'none' : 'auto'
    }}
  >
    <span className="font-medium text-sm">{option.label}</span>
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
      isSelected ? 'bg-primary-600 border-primary-600' : 'bg-surface border-gray-500'
    }`}>
      {isSelected && <Check className="w-3 h-3 text-white" />}
    </div>
  </button>
));
HealthConcernButton.displayName = 'HealthConcernButton';

const AllergyButton = memo(({ allergen, isSelected, onClick }: { 
  allergen: { value: string; label: string };
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-between p-3 rounded-xl text-left transition-colors duration-150 ${
      isSelected 
        ? 'bg-primary-900/30 text-primary-200 shadow-md' 
        : 'bg-surface-lighter text-gray-300 hover:bg-surface-highlight'
    }`}
    style={{ 
      contain: 'layout style paint',
      border: isSelected ? '3px solid #f97316' : '3px solid rgba(249, 115, 22, 0.5)'
    }}
  >
    <span className="font-medium text-sm">{allergen.label}</span>
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
      isSelected ? 'bg-primary-600 border-primary-600' : 'bg-surface border-gray-500'
    }`}>
      {isSelected && <Check className="w-3 h-3 text-white" />}
    </div>
  </button>
));
AllergyButton.displayName = 'AllergyButton';

// --- Step Components (Defined Outside with Props) ---
const Step1 = memo(({ 
  formData, 
  error,
  typeLabels,
  mascotPaths,
  petTypeHandlers,
  onNameChange,
  onPrevious,
  onNext
}: {
  formData: FormData;
  error: string | null;
  typeLabels: Record<PetCategory, string>;
  mascotPaths: Record<PetCategory, string>;
  petTypeHandlers: Record<PetCategory, () => void>;
  onNameChange: (value: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-foreground">1. Basic Info</h3>
    
    <div className="space-y-2">
      <label htmlFor="name" className="text-sm font-medium text-gray-300 block">Pet's Name</label>
      <input
        id="name"
        name="name"
        type="text"
        value={formData.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="e.g., Buster"
        autoFocus
        className="w-full px-4 py-2 border border-surface-highlight bg-surface-lighter text-foreground rounded-xl focus:ring-primary-500 focus:border-primary-500 transition duration-150"
        required
      />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300 block">Pet Type</label>
      <div className="grid grid-cols-5 gap-3">
        {(['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'] as PetCategory[]).map((petType) => (
          <PetTypeButton
            key={petType}
            petType={petType}
            isSelected={formData.type === petType}
            onClick={petTypeHandlers[petType]}
            mascotSrc={mascotPaths[petType]}
            label={typeLabels[petType]}
          />
        ))}
      </div>
      {!formData.type && (
        <p className="text-xs text-gray-500 mt-1">Please select a pet type</p>
      )}
    </div>

    {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

    {(onPrevious || onNext) && (
      <div className="flex justify-between pt-6 border-t border-surface-highlight">
        {onPrevious && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPrevious();
            }}
            className="flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors duration-150"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors duration-150 ml-auto"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    )}
  </div>
));
Step1.displayName = 'Step1';

const Step2 = memo(({ 
  formData,
  error,
  sortedBreeds,
  onBreedSelect,
  onPrevious,
  onNext
}: {
  formData: FormData;
  error: string | null;
  sortedBreeds: string[];
  onBreedSelect: (breed: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-foreground">2. Choose Breed</h3>
    <p className="text-sm text-gray-400">Pick the closest match. If unsure, pick "Mixed".</p>

    <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-1">
      {sortedBreeds.map((breed) => (
        <BreedButton
          key={breed}
          breed={breed}
          isSelected={formData.breed === breed}
          onClick={() => onBreedSelect(breed)}
        />
      ))}
    </div>

    {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

    {(onPrevious || onNext) && (
      <div className="flex justify-between pt-6 border-t border-surface-highlight">
        {onPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors duration-150"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors duration-150 ml-auto"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    )}
  </div>
));
Step2.displayName = 'Step2';

const Step3 = memo(({ 
  formData,
  onWeightChange,
  onActivitySelect,
  onPrevious,
  onNext
}: {
  formData: FormData;
  onWeightChange: (value: string) => void;
  onActivitySelect: (level: ActivityLevel) => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-foreground">3. Weight & Activity</h3>
    <p className="text-sm text-gray-400">These are informational only and not yet used for calculations.</p>

    <div className="space-y-2">
      <label htmlFor="weight" className="text-sm font-medium text-gray-300 block">Weight (any format)</label>
      <input
        id="weight"
        name="weight"
        type="text"
        value={formData.weight || ''}
        onChange={(e) => onWeightChange(e.target.value)}
        placeholder="e.g., 2.3 kg or 5 lbs"
        className="w-full px-4 py-2 border border-surface-highlight bg-surface-lighter text-foreground rounded-xl focus:ring-primary-500 focus:border-primary-500 transition duration-150"
      />
    </div>

    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-300">Activity Level</p>
      <div className="grid grid-cols-3 gap-3">
        {(['low', 'medium', 'high'] as ActivityLevel[]).map((level) => (
          <ActivityButton
            key={level}
            level={level}
            label={level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'High'}
            isSelected={formData.activityLevel === level}
            onClick={() => onActivitySelect(level)}
          />
        ))}
      </div>
    </div>

    {(onPrevious || onNext) && (
      <div className="flex justify-between pt-6 border-t border-surface-highlight">
        {onPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors duration-150"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors duration-150 ml-auto"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    )}
  </div>
));
Step3.displayName = 'Step3';

const Step4 = memo(({ 
  formData,
  error,
  healthConcernOptions,
  onHealthConcernToggle,
  onSubmit,
  editingPet,
  onPrevious,
  onNext
}: {
  formData: FormData;
  error: string | null;
  healthConcernOptions: Array<{ value: string; label: string }>;
  onHealthConcernToggle: (concern: HealthConcernWithNone) => void;
  onSubmit: () => void;
  editingPet?: Pet | null;
  onPrevious?: () => void;
  onNext?: () => void;
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-foreground">4. Health Concerns</h3>
    <p className="text-sm text-gray-400">Select any concerns your pet currently has. This will tailor their meal plan recommendations.</p>
    
    <div className="grid grid-cols-2 gap-4" style={{ pointerEvents: 'auto' }}>
      {healthConcernOptions.map(option => {
        const isSelected = formData.healthConcerns.includes(option.value as HealthConcernWithNone);
        const isDisabled = option.value !== 'none' && formData.healthConcerns.includes('none');
        
        return (
          <HealthConcernButton
            key={option.value}
            option={option}
            isSelected={isSelected}
            isDisabled={isDisabled}
            onClick={() => onHealthConcernToggle(option.value as HealthConcernWithNone)}
          />
        );
      })}
    </div>

    {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

    {(onPrevious || onNext) && (
      <div className="flex justify-between pt-6 border-t border-surface-highlight">
        {onPrevious && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPrevious();
            }}
            className="flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors duration-150"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors duration-150 ml-auto"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    )}
  </div>
));
Step4.displayName = 'Step4';

const Step5 = memo(({ 
  formData,
  error,
  allergenOptions,
  onAllergyToggle,
  onCustomAllergiesChange,
  onSubmit,
  editingPet,
  onPrevious
}: {
  formData: FormData;
  error: string | null;
  allergenOptions: Array<{ value: string; label: string }>;
  onAllergyToggle: (allergen: string) => void;
  onCustomAllergiesChange: (value: string) => void;
  onSubmit: () => void;
  editingPet?: Pet | null;
  onPrevious?: () => void;
}) => {
  // Get custom allergies (those not in the predefined list)
  const predefinedAllergyValues = allergenOptions.map(o => o.value);
  const customAllergies = formData.allergies.filter(a => !predefinedAllergyValues.includes(a));
  const selectedPredefined = formData.allergies.filter(a => predefinedAllergyValues.includes(a));
  
  return (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-foreground">5. Allergies</h3>
    <p className="text-sm text-gray-400">Select any foods your pet is allergic to. Recipes containing these ingredients will be excluded from recommendations.</p>
    
    <div className="grid grid-cols-2 gap-3">
      {allergenOptions.map(allergen => {
        const isSelected = formData.allergies.includes(allergen.value);
        
        return (
          <AllergyButton
            key={allergen.value}
            allergen={allergen}
            isSelected={isSelected}
            onClick={() => onAllergyToggle(allergen.value)}
          />
        );
      })}
    </div>

    <div className="space-y-2">
      <label htmlFor="customAllergies" className="text-sm font-medium text-gray-300 block">Other:</label>
      <input
        id="customAllergies"
        name="customAllergies"
        type="text"
        value={formData.customAllergies}
        onChange={(e) => onCustomAllergiesChange(e.target.value)}
        placeholder="e.g., venison, rabbit, duck (comma-separated)"
        className="w-full px-4 py-2 border border-surface-highlight bg-surface-lighter text-foreground rounded-xl focus:ring-primary-500 focus:border-primary-500 transition duration-150"
      />
      <p className="text-xs text-gray-500">Enter any additional allergies not listed above, separated by commas</p>
    </div>

    {(selectedPredefined.length > 0 || customAllergies.length > 0) && (
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
        <p className="text-sm text-yellow-200">
          <strong>Selected:</strong> {
            [
              ...selectedPredefined.map(a => allergenOptions.find(o => o.value === a)?.label).filter(Boolean),
              ...customAllergies
            ].join(', ')
          }
        </p>
      </div>
    )}

    {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

    <div className="flex justify-between pt-6 border-t border-surface-highlight">
      {onPrevious && (
        <button
          type="button"
          onClick={onPrevious}
          className="flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors duration-150"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
      )}
      <div className={onPrevious ? '' : 'ml-auto'}>
        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors duration-150 shadow-lg"
        >
          <Check className="w-5 h-5 mr-2" />
          {editingPet ? 'Save Changes' : 'Create Pet Profile'}
        </button>
      </div>
    </div>
  </div>
  );
});
Step5.displayName = 'Step5';

// --- Main Component ---
const AddPetModal = memo(function AddPetModal({ isOpen, onClose, onSubmit, editingPet }: AddPetModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);

  // Memoize static data - created once, never recreated
  const typeLabels = useMemo(() => ({
    'dogs': 'Dogs',
    'cats': 'Cats',
    'birds': 'Birds',
    'reptiles': 'Reptiles',
    'pocket-pets': 'Pocket Pets'
  }), []);

  const mascotPaths = useMemo(() => {
    const paths: Record<PetCategory, string> = {} as Record<PetCategory, string>;
    (['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'] as PetCategory[]).forEach((petType) => {
      paths[petType] = getMascotFaceForPetType(petType);
    });
    return paths;
  }, []);

  // Memoize sorted breeds - only recalculate when pet type changes
  const sortedBreeds = useMemo(() => {
    if (!formData.type) return ['Mixed'];
    const breeds = getBreedNamesForSpecies(formData.type);
    return breeds.length ? [...breeds].sort() : ['Mixed'];
  }, [formData.type]);

  // Generate species-specific health concerns dynamically
  const healthConcernOptions = useMemo(() => {
    const options = [{ value: 'none', label: 'None' }];
    
    if (!formData.type) {
      return options;
    }

    // Get species-specific concerns (with breed if available)
    const concerns = getHealthConcernsForSpecies(formData.type, formData.breed || undefined);
    
    // Convert to the format needed by the component
    const concernOptions = concerns.map(concern => ({
      value: concern.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: concern
    }));

    return [...options, ...concernOptions];
  }, [formData.type, formData.breed]);

  // Generate species-specific allergen options dynamically
  const allergenOptions = useMemo(() => {
    return getAllergenOptionsForSpecies(formData.type);
  }, [formData.type]);

  // Stable handlers - useCallback to prevent recreation
  const petTypeHandlers = useMemo(() => {
    const handlers: Record<PetCategory, () => void> = {} as Record<PetCategory, () => void>;
    (['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'] as PetCategory[]).forEach((petType) => {
      handlers[petType] = () => {
        setFormData(prev => ({ 
          ...prev, 
          type: petType, 
          breed: '', 
          healthConcerns: [], // Don't default to 'none'
          allergies: [] // Clear allergies when species changes (they're species-specific)
        }));
      };
    });
    return handlers;
  }, []);

  const handleNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
  }, []);

  const handleBreedSelect = useCallback((breed: string) => {
    setFormData(prev => ({ ...prev, breed }));
  }, []);

  const handleWeightChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, weight: value }));
  }, []);

  const handleActivitySelect = useCallback((level: ActivityLevel) => {
    setFormData(prev => ({ ...prev, activityLevel: level }));
  }, []);

  const handleHealthConcernToggle = useCallback((concern: HealthConcernWithNone) => {
    console.log('Health concern toggle clicked:', concern); // Debug log
    if (concern === 'none') {
      setFormData(prev => ({ 
        ...prev, 
        healthConcerns: prev.healthConcerns.includes('none') ? [] : ['none'] 
      }));
    } else {
      setFormData(prev => {
        const currentConcerns = prev.healthConcerns.filter(c => c !== 'none') as HealthConcern[];
        let newConcerns: HealthConcernWithNone[];
        
        if (currentConcerns.includes(concern as HealthConcern)) {
          newConcerns = currentConcerns.filter(c => c !== concern) as HealthConcernWithNone[];
        } else {
          newConcerns = [...currentConcerns, concern as HealthConcern] as HealthConcernWithNone[];
        }
        
        // Don't auto-add 'none' if list is empty - let user choose
        return { ...prev, healthConcerns: newConcerns };
      });
    }
  }, []);

  const handleAllergyToggle = useCallback((allergen: string) => {
    setFormData(prev => {
      const currentAllergies = prev.allergies || [];
      if (currentAllergies.includes(allergen)) {
        return { ...prev, allergies: currentAllergies.filter(a => a !== allergen) };
      } else {
        return { ...prev, allergies: [...currentAllergies, allergen] };
      }
    });
  }, []);

  const handleCustomAllergiesChange = useCallback((value: string) => {
    setFormData(prev => {
      // Get predefined allergy values (use current species-specific options)
      const currentAllergenOptions = getAllergenOptionsForSpecies(prev.type);
      const predefinedValues = currentAllergenOptions.map(o => o.value);
      // Remove any existing custom allergies (those not in predefined list)
      const existingPredefined = prev.allergies.filter(a => predefinedValues.includes(a));
      // Parse new custom allergies from the input (comma-separated, trim whitespace)
      const newCustomAllergies = value
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      // Combine predefined and custom allergies
      return { 
        ...prev, 
        customAllergies: value,
        allergies: [...existingPredefined, ...newCustomAllergies]
      };
    });
  }, []);

  const handlePrevious = useCallback(() => {
    setError(null);
    setStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setError(null);
    setStep((prev) => {
      if (prev === 1) {
        if (!formData.name.trim() || !formData.type) {
          setError('Please enter a name and select a pet type to continue.');
          return prev;
        }
        return 2;
      }
      if (prev === 2) {
        if (!formData.breed) {
          setError('Please choose a breed to continue.');
          return prev;
        }
        return 3;
      }
      if (prev === 3) {
        return 4;
      }
      return prev;
    });
  }, [formData.name, formData.type, formData.breed]);

  const handleSubmitInternal = useCallback(() => {
    setError(null);

    // Map activityLevel from local type to shared Pet type
    const mapActivityLevel = (level: ActivityLevel): 'sedentary' | 'moderate' | 'active' | 'very-active' | undefined => {
      if (level === 'high') return 'very-active';
      if (level === 'medium') return 'moderate';
      if (level === 'low') return 'sedentary';
      return undefined;
    };

    // Convert name to names array for consistency
    const namesArray = formData.name.trim() 
      ? [formData.name.trim()] 
      : (editingPet?.names && Array.isArray(editingPet.names) && editingPet.names.length > 0
          ? editingPet.names 
          : ['Unnamed Pet']);

    const newPet: Pet = {
      ...formData,
      id: editingPet?.id || crypto.randomUUID(),
      type: formData.type as string,
      name: formData.name.trim() || undefined,
      names: namesArray,
      age: (editingPet?.age as string) || 'adult',
      breed: formData.breed || (editingPet?.breed as string) || 'Mixed',
      mealPlan: editingPet?.mealPlan || [],
      activityLevel: formData.activityLevel ? mapActivityLevel(formData.activityLevel) : undefined,
      healthConcerns: formData.healthConcerns.filter(c => c !== 'none') as string[],
      allergies: formData.allergies || [],
      savedRecipes: editingPet?.savedRecipes || [],
    };

    onSubmit(newPet);
    onClose();
  }, [formData, editingPet, onSubmit, onClose]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setStep(1);
      if (editingPet) {
      setFormData({
        name: editingPet.name || editingPet.names?.[0] || '',
        type: editingPet.type as PetCategory,
        breed: editingPet.breed || '',
        weight: editingPet.weight || '',
        activityLevel: (editingPet.activityLevel ? (editingPet.activityLevel as ActivityLevel) : undefined),
        healthConcerns: (editingPet.healthConcerns?.length ? (editingPet.healthConcerns as HealthConcernWithNone[]) : []) || [],
        allergies: editingPet.allergies || [],
        customAllergies: (() => {
          // Separate custom allergies (not in predefined list) from predefined ones
          const currentAllergenOptions = getAllergenOptionsForSpecies(editingPet.type as PetCategory);
          const predefinedValues = currentAllergenOptions.map(o => o.value);
          const custom = (editingPet.allergies || []).filter(a => !predefinedValues.includes(a));
          return custom.join(', ');
        })(),
      });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, editingPet]);

  // Combined auto-advance logic - single effect instead of multiple
  useEffect(() => {
    if (!isOpen) return;
    return;
  }, [step, formData.name, formData.type, formData.breed, formData.activityLevel, formData.healthConcerns, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 44, 15, 0.85)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="rounded-2xl w-full max-w-lg shadow-xl border relative" 
        style={{ backgroundColor: '#1a3d2e', borderColor: '#2d5a47', borderWidth: '2px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 border-b border-surface-highlight pb-4">
            <h2 className="text-2xl font-bold text-foreground">
              {editingPet ? 'Edit Pet Profile' : 'Create New Pet Profile'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-surface-highlight hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div>
            {step === 1 && (
              <Step1
                formData={formData}
                error={error}
                typeLabels={typeLabels}
                mascotPaths={mascotPaths}
                petTypeHandlers={petTypeHandlers}
                onNameChange={handleNameChange}
                onPrevious={step > 1 ? handlePrevious : undefined}
                onNext={handleNext}
              />
            )}
            {step === 2 && (
              <Step2
                formData={formData}
                error={error}
                sortedBreeds={sortedBreeds}
                onBreedSelect={handleBreedSelect}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}
            {step === 3 && (
              <Step3
                formData={formData}
                onWeightChange={handleWeightChange}
                onActivitySelect={handleActivitySelect}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}
            {step === 4 && (
              <Step4
                formData={formData}
                error={error}
                healthConcernOptions={healthConcernOptions}
                onHealthConcernToggle={handleHealthConcernToggle}
                onSubmit={handleSubmitInternal}
                editingPet={editingPet}
                onPrevious={handlePrevious}
                onNext={() => setStep(5)}
              />
            )}
            {step === 5 && (
              <Step5
                formData={formData}
                error={error}
                allergenOptions={allergenOptions}
                onAllergyToggle={handleAllergyToggle}
                onCustomAllergiesChange={handleCustomAllergiesChange}
                onSubmit={handleSubmitInternal}
                editingPet={editingPet}
                onPrevious={handlePrevious}
              />
            )}
          </div>

          <div className="flex justify-center mt-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`w-8 h-1 rounded-full mx-1 transition-colors ${
                  step === s ? 'bg-primary-600' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

AddPetModal.displayName = 'AddPetModal';

export default AddPetModal;
