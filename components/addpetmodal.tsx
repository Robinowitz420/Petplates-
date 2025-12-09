'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Image from 'next/image';
import { getMascotFaceForPetType } from '@/lib/utils/emojiMapping';

// --- Type Definitions ---
interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  weight?: string;
  activityLevel?: 'high' | 'medium' | 'low';
  savedRecipes?: string[];
  names?: string[];
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  dislikes?: string[];
  mealPlan: string[]; // Critical for meal engine - initialized as []
}

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';
type HealthConcern = 'none' | 'weight-management' | 'allergies' | 'joint-health' | 'digestive' | 'kidney' | 'dental';
type ActivityLevel = 'high' | 'medium' | 'low';

interface FormData {
  name: string;
  type: PetCategory | '';
  breed: string;
  weight?: string;
  activityLevel: ActivityLevel;
  healthConcerns: HealthConcern[];
}

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pet: Pet) => void; // Renaming onAddPet to onSubmit for clarity
  editingPet?: Pet | null; // Added for completeness, to support future edit functionality
}

// --- Data Definitions (Provided by User) ---

const breedsByType: Record<PetCategory, string[]> = {
  dogs: [
    'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 
    'Rottweiler', 'Yorkshire Terrier', 'German Shorthaired Pointer', 'Dachshund', 'Pembroke Welsh Corgi', 
    'Australian Shepherd', 'Boxer', 'Great Dane', 'Siberian Husky', 'Doberman Pinscher', 
    'Cavalier King Charles Spaniel', 'Miniature Schnauzer', 'Shih Tzu', 'Boston Terrier', 
    'Bernese Mountain Dog', 'Pomeranian', 'Havanese', 'Shetland Sheepdog', 'Brittany', 
    'English Springer Spaniel', 'Mastiff', 'Cocker Spaniel', 'Border Collie', 'Chihuahua', 'Mixed Breed'
  ].sort(),
  cats: [
    'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'Bengal', 'British Shorthair', 'Abyssinian', 
    'Scottish Fold', 'Sphynx', 'American Shorthair', 'Russian Blue', 'Birman', 'Oriental', 
    'Norwegian Forest Cat', 'Devon Rex', 'Burmese', 'Tonkinese', 'Exotic Shorthair', 
    'Turkish Angora', 'Himalayan', 'Domestic Shorthair', 'Domestic Longhair', 'Mixed Breed'
  ].sort(),
  birds: [
    'Budgie', 'Cockatiel', 'Canary', 'Finch', 'Lovebird', 'Parrot', 'Cockatoo', 'Conure', 'African Grey', 'Macaw'
  ].sort(),
  reptiles: [
    'Bearded Dragon', 'Leopard Gecko', 'Ball Python', 'Corn Snake', 'Red-Eared Slider', 'Iguana', 'Crested Gecko'
  ].sort(),
  'pocket-pets': [
    'Hamster', 'Guinea Pig', 'Rabbit', 'Gerbil', 'Chinchilla', 'Rat', 'Mouse', 'Ferret'
  ].sort()
};

const ageGroups = [
  { value: 'baby', label: 'Baby/Puppy/Kitten (0-1 year)' },
  { value: 'young', label: 'Young (1-3 years)' },
  { value: 'adult', label: 'Adult (3-7 years)' },
  { value: 'senior', label: 'Senior (7+ years)' }
];

const healthConcernOptions = [
  { value: 'none', label: 'None' },
  { value: 'weight-management', label: 'Weight Management' },
  { value: 'allergies', label: 'Allergies' },
  { value: 'joint-health', label: 'Joint Health' },
  { value: 'digestive', label: 'Digestive Issues' },
  { value: 'kidney', label: 'Kidney Support' },
  { value: 'dental', label: 'Dental Health' }
];

const initialFormData: FormData = {
  name: '',
  type: '',
  breed: '',
  weight: '',
  activityLevel: 'medium',
  healthConcerns: [],
};

// --- Main Component ---
export default function AddPetModal({ isOpen, onClose, onSubmit, editingPet }: AddPetModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);

  // Effect to reset form when modal opens/closes or for editing (future use)
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setStep(1);
      // For editing:
      if (editingPet) {
        setFormData({
          name: editingPet.name,
          type: editingPet.type as PetCategory,
          weight: editingPet.weight || '',
          activityLevel: (editingPet.activityLevel as ActivityLevel) || 'medium',
          healthConcerns: (editingPet.healthConcerns as HealthConcern[]) || [],
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, editingPet]);

  const availableBreeds = useMemo(() => {
    if (!formData.type) return [];
    // The cast below is safe because formData.type is checked against PetCategory keys
    return breedsByType[formData.type as PetCategory];
  }, [formData.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHealthConcernToggle = (concern: HealthConcern) => {
    if (concern === 'none') {
      // If 'None' is selected, clear all others and set only 'none'
      setFormData(prev => ({ ...prev, healthConcerns: prev.healthConcerns.includes('none') ? [] : ['none'] }));
    } else {
      // If any other concern is selected/deselected
      setFormData(prev => {
        const currentConcerns = prev.healthConcerns.filter(c => c !== 'none'); // Remove 'none' if present

        let newConcerns;
        if (currentConcerns.includes(concern)) {
          // Deselect
          newConcerns = currentConcerns.filter(c => c !== concern);
        } else {
          // Select
          newConcerns = [...currentConcerns, concern];
        }

        // If no concerns are selected after toggling, default back to 'none' for consistency
        if (newConcerns.length === 0) {
            newConcerns.push('none');
        }

        return { ...prev, healthConcerns: newConcerns };
      });
    }
  };


  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.name || !formData.type) {
        setError('Please add a name and pet type.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!formData.breed) {
        setError('Please pick a breed (or closest match).');
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prepare the final Pet object
    const newPet: Pet = {
      ...formData,
      id: editingPet?.id || crypto.randomUUID(), // Use existing ID if editing, otherwise new UUID
      type: formData.type as string,
      // Defaults for downstream expectations
      age: (editingPet?.age as string) || 'adult',
      breed: formData.breed || (editingPet?.breed as string) || 'Mixed',
      mealPlan: editingPet?.mealPlan || [], 
    };

    onSubmit(newPet);
    onClose();
  };

  // --- Step 1 JSX: Basic Information ---
  const Step1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">1. Basic Info</h3>
      
      {/* Pet Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-300 block">Pet's Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Buster"
          autoFocus
          className="w-full px-4 py-2 border border-surface-highlight bg-surface-lighter text-foreground rounded-xl focus:ring-primary-500 focus:border-primary-500 transition duration-150"
          required
        />
      </div>

      {/* Pet Type */}
      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium text-gray-300 block">Pet Type</label>
        <div className="grid grid-cols-5 gap-3">
          {(['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'] as PetCategory[]).map((petType) => {
            const isSelected = formData.type === petType;
            const typeLabels: Record<PetCategory, string> = {
              'dogs': 'Dogs',
              'cats': 'Cats',
              'birds': 'Birds',
              'reptiles': 'Reptiles',
              'pocket-pets': 'Pocket Pets'
            };
            return (
              <button
                key={petType}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: petType }))}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-primary-500 bg-primary-900/30 shadow-md' 
                    : 'border-surface-highlight bg-surface-lighter hover:border-primary-400/50 hover:bg-surface-highlight'
                  }
                `}
        >
                <div className="w-12 h-12 rounded-full overflow-hidden mb-2 flex-shrink-0">
                  <Image
                    src={getMascotFaceForPetType(petType)}
                    alt={`${petType} mascot`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <span className={`text-xs font-medium ${isSelected ? 'text-primary-400' : 'text-gray-400'}`}>
                  {typeLabels[petType]}
                </span>
              </button>
            );
          })}
        </div>
        {!formData.type && (
          <p className="text-xs text-gray-500 mt-1">Please select a pet type</p>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      
      <div className="flex justify-end pt-4 border-t border-surface-highlight">
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors duration-150 shadow-lg"
        >
          Next: Breed
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );

  // --- Step 2 JSX: Breed Selection ---
  const Step2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">2. Choose Breed</h3>
      <p className="text-sm text-gray-400">Pick the closest match. If unsure, pick “Mixed”.</p>

      <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-1">
        {[...(availableBreeds.length ? availableBreeds : ['Mixed'])].sort().map((breed) => {
          const isSelected = formData.breed === breed;
          return (
            <button
              key={breed}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, breed }))}
              className={`p-3 rounded-xl border-2 text-sm text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary-500 bg-primary-900/30 text-primary-200 shadow-md'
                  : 'border-surface-highlight bg-surface-lighter text-gray-300 hover:border-primary-400/50 hover:bg-surface-highlight'
              }`}
            >
              {breed}
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <div className="flex justify-between pt-6 border-t border-surface-highlight">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center px-4 py-3 border-2 border-surface-highlight text-gray-300 font-medium rounded-xl hover:bg-surface-highlight transition-colors duration-150"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors duration-150 shadow-lg"
        >
          Next: Weight & Activity
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );

  // --- Step 3 JSX: Weight & Activity ---
  const Step3 = () => (
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
          onChange={handleChange}
          placeholder="e.g., 2.3 kg or 5 lbs"
          className="w-full px-4 py-2 border border-surface-highlight bg-surface-lighter text-foreground rounded-xl focus:ring-primary-500 focus:border-primary-500 transition duration-150"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-300">Activity Level</p>
        <div className="grid grid-cols-3 gap-3">
          {(['low', 'medium', 'high'] as ActivityLevel[]).map((level) => {
            const isSelected = formData.activityLevel === level;
            const label = level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'High';
            return (
              <button
                key={level}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, activityLevel: level }))}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-900/30 text-primary-200 shadow-md'
                    : 'border-surface-highlight bg-surface-lighter text-gray-300 hover:border-primary-400/50 hover:bg-surface-highlight'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-surface-highlight">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center px-4 py-3 border-2 border-surface-highlight text-gray-300 font-medium rounded-xl hover:bg-surface-highlight transition-colors duration-150"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(4)}
          className="flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors duration-150 shadow-lg"
        >
          Next: Health Concerns
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );

  // --- Step 4 JSX: Health Concerns ---
  const Step4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">4. Health Concerns</h3>
      <p className="text-sm text-gray-400">Select any concerns your pet currently has. This will tailor their meal plan recommendations.</p>
      
      <div className="grid grid-cols-2 gap-4">
        {healthConcernOptions.map(option => {
          const isSelected = formData.healthConcerns.includes(option.value as HealthConcern);
          const isDisabled = (option.value !== 'none' && formData.healthConcerns.includes('none'));
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleHealthConcernToggle(option.value as HealthConcern)}
              disabled={isDisabled}
              className={`
                flex items-center justify-between p-4 border-2 rounded-xl text-left 
                transition-all duration-200
                ${isDisabled ? 'bg-surface border-surface-highlight text-gray-600 cursor-not-allowed' : ''}
                ${isSelected 
                  ? 'bg-primary-900/30 border-primary-500 text-primary-200 shadow-md' 
                  : 'bg-surface-lighter border-surface-highlight text-gray-300 hover:bg-surface-highlight hover:border-primary-400/50'
                }
              `}
            >
              <span className="font-medium text-sm">{option.label}</span>
              <div className={`w-5 h-5 rounded-full border ${isSelected ? 'bg-primary-600 border-primary-600' : 'bg-surface border-gray-500'} flex items-center justify-center`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <div className="flex justify-between pt-6 border-t border-surface-highlight">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex items-center px-4 py-3 border-2 border-surface-highlight text-gray-300 font-medium rounded-xl hover:bg-surface-highlight transition-colors duration-150"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <button
          type="submit"
          className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors duration-150 shadow-lg"
        >
          <Check className="w-5 h-5 mr-2" />
          {editingPet ? 'Save Changes' : 'Create Pet Profile'}
        </button>
      </div>
    </div>
  );

  // --- Modal Wrapper JSX ---
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl border border-surface-highlight relative transform transition-all duration-300 scale-100 opacity-100" 
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

          <form onSubmit={handleSubmit}>
            {step === 1 ? <Step1 /> : step === 2 ? <Step2 /> : step === 3 ? <Step3 /> : <Step4 />}
          </form>

          {/* Step Indicator */}
          <div className="flex justify-center mt-6">
            <div className={`w-8 h-1 rounded-full mx-1 ${step === 1 ? 'bg-primary-600' : 'bg-gray-600'}`}></div>
            <div className={`w-8 h-1 rounded-full mx-1 ${step === 2 ? 'bg-primary-600' : 'bg-gray-600'}`}></div>
            <div className={`w-8 h-1 rounded-full mx-1 ${step === 3 ? 'bg-primary-600' : 'bg-gray-600'}`}></div>
            <div className={`w-8 h-1 rounded-full mx-1 ${step === 4 ? 'bg-primary-600' : 'bg-gray-600'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}