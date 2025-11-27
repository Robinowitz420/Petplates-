'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Check, Upload, Camera } from 'lucide-react';
import { healthConcernOptions as fullHealthConcernOptions } from '@/lib/utils/petRatingSystem';

// --- Type Definitions ---
interface Pet {
  id: string;
  names: string[];
  type: string;
  breed: string;
  weight: string;
  age: string;
  healthConcerns: string[];
  mealPlan: string[]; // Critical for meal engine - initialized as []
  dislikes?: string[];
  image?: string; // Base64 encoded image data
}

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';
type HealthConcern = 'none' | 'kidney-disease' | 'heart-disease' | 'diabetes' | 'pancreatitis' | 'obesity' | 'digestive-issues' | 'allergies' | 'dental-issues' | 'joint-health' | 'skin-conditions' | 'hip-dysplasia';

interface FormData {
  names: string[];
  type: PetCategory | '';
  breed: string;
  weight: string;
  age: AgeGroup | '';
  healthConcerns: HealthConcern[];
  dislikes: string[];
  image?: string; // Base64 encoded image data
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

// Use the comprehensive health concern options from the rating system, plus "none"
const healthConcernOptions = [
  { value: 'none', label: 'None' },
  ...fullHealthConcernOptions.map(option => ({
    value: option.value,
    label: option.label
  }))
];

const initialFormData: FormData = {
  names: [],
  type: '',
  breed: '',
  weight: '',
  age: '',
  healthConcerns: [],
  dislikes: [],
  image: undefined,
};

// --- Pet Type Icons ---
const petTypeIcons: Record<PetCategory, string> = {
  dogs: '🐕',
  cats: '🐈',
  birds: '🦜',
  reptiles: '🦎',
  'pocket-pets': '🐰',
};

// --- Main Component ---
export default function AddPetModal({ isOpen, onClose, onSubmit, editingPet }: AddPetModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);

  // Effect to reset form when modal opens/closes or for editing
  useEffect(() => {
    if (isOpen) {
      setError(null);
      // For editing:
      if (editingPet) {
        setFormData({
          names: editingPet.names || [],
          type: editingPet.type as PetCategory,
          breed: editingPet.breed,
          weight: editingPet.weight || '',
          age: editingPet.age as AgeGroup,
          healthConcerns: editingPet.healthConcerns as HealthConcern[],
          dislikes: editingPet.dislikes || [],
          image: editingPet.image,
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, editingPet]);

  const availableBreeds = useMemo(() => {
    if (!formData.type) return [];
    return breedsByType[formData.type as PetCategory];
  }, [formData.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePetTypeSelect = (type: PetCategory) => {
    setFormData(prev => ({
      ...prev,
      type,
      breed: '' // Reset breed when type changes
    }));
  };

  const handleHealthConcernToggle = (concern: HealthConcern) => {
    if (concern === 'none') {
      setFormData(prev => ({ ...prev, healthConcerns: prev.healthConcerns.includes('none') ? [] : ['none'] }));
    } else {
      setFormData(prev => {
        const currentConcerns = prev.healthConcerns.filter(c => c !== 'none');
        let newConcerns: HealthConcern[];
        if (currentConcerns.includes(concern)) {
          newConcerns = currentConcerns.filter(c => c !== concern);
        } else {
          newConcerns = [...currentConcerns, concern];
        }
        if (newConcerns.length === 0) {
          newConcerns = ['none'];
        }
        return { ...prev, healthConcerns: newConcerns };
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFormData(prev => ({ ...prev, image: base64 }));
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
  };

  const handleDelete = () => {
    if (editingPet && typeof window !== 'undefined') {
      const userId = 'clerk_simulated_user_id_123'; // Same as profile page
      const currentPets = JSON.parse(localStorage.getItem(`pets_${userId}`) || '[]');
      const updatedPets = currentPets.filter((p: any) => p.id !== editingPet.id);
      localStorage.setItem(`pets_${userId}`, JSON.stringify(updatedPets));
      window.location.reload(); // Refresh to update UI
    }
  };



  const handleSubmit = () => {
    setError(null);

    // Validation: Check required fields
    if (!formData.names.length || !formData.names[0].trim()) {
      setError('At least one pet name is required');
      return;
    }
    if (!formData.type) {
      setError('Pet type is required');
      return;
    }
    if (!formData.breed) {
      setError('Breed is required');
      return;
    }
    if (!formData.weight.trim()) {
      setError('Weight is required');
      return;
    }
    if (!formData.age) {
      setError('Age group is required');
      return;
    }

    // Prepare the final Pet object
    const newPet: Pet = {
      ...formData,
      id: editingPet?.id || crypto.randomUUID(), // Use existing ID if editing, otherwise new UUID
      type: formData.type as string,
      age: formData.age as string,
      // Initialize the mealPlan array as required for the meal engine
      mealPlan: editingPet?.mealPlan || [],
    };

    onSubmit(newPet);
    onClose();
  };

  // --- Compact Single Page Form ---
    const CompactForm = () => (
      <div className="space-y-3">
        {/* Pet Names */}
        <input
          name="names"
          type="text"
          value={formData.names.join(', ')}
          onChange={(e) => {
            const value = e.target.value;
            const names = value.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({ ...prev, names }));
          }}
          onKeyDown={(e) => {
            // Prevent form submission on Enter
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          placeholder="Pet's Names (comma separated, e.g., Buddy, Max, Charlie)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition duration-150 text-sm"
          required
          autoComplete="off"
          autoFocus
        />

        {/* Pet Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Pet Photo (Optional)</label>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {formData.image ? (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Pet preview"
                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="btn btn-danger btn-icon-sm absolute -top-2 -right-2"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="pet-image-upload"
              />
              <label
                htmlFor="pet-image-upload"
                className="btn btn-secondary btn-sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                {formData.image ? 'Change Photo' : 'Upload Photo'}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Max 5MB. JPG, PNG, or GIF formats.
              </p>
            </div>
          </div>
        </div>
  
        {/* Pet Type - Emoji Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(petTypeIcons).map(([type, emoji]) => {
              const isSelected = formData.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePetTypeSelect(type as PetCategory)}
                  className={`p-2 text-center rounded-lg border-2 text-sm ${
                    isSelected
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-lg mb-1">{emoji}</div>
                  <div className="capitalize text-xs">{type.replace('-', ' ')}</div>
                </button>
              );
            })}
          </div>
        </div>
  
        {/* Breed */}
        <select
          name="breed"
          value={formData.breed}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500 transition duration-150 text-sm disabled:bg-gray-50 disabled:text-gray-500"
          disabled={!formData.type}
          required
        >
          <option value="" disabled>
            {formData.type ? 'Breed' : 'Breed'}
          </option>
          {availableBreeds.map(breed => (
            <option key={breed} value={breed}>{breed}</option>
          ))}
        </select>

        {/* Weight */}
        <input
          name="weight"
          type="text"
          value={formData.weight}
          onChange={handleChange}
          placeholder="Weight (e.g., 25 lbs or 11 kg)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition duration-150 text-sm"
          required
        />
  
        {/* Age Group */}
        <select
          name="age"
          value={formData.age}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500 transition duration-150 text-sm"
          required
        >
          <option value="" disabled>Select age group</option>
          {ageGroups.map(group => (
            <option key={group.value} value={group.value}>{group.label}</option>
          ))}
        </select>
  
        {/* Health Concerns */}
         <div className="space-y-2">
           <div className="grid grid-cols-3 gap-2">
             {healthConcernOptions.map(option => {
               const isSelected = formData.healthConcerns.includes(option.value as HealthConcern);
               return (
                 <button
                   key={option.value}
                   type="button"
                   onClick={() => handleHealthConcernToggle(option.value as HealthConcern)}
                   className={`
                     flex items-center justify-between p-2 border rounded-lg text-left text-xs
                     ${isSelected
                       ? 'bg-primary-50 border-primary-600 text-primary-800'
                       : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                     }
                   `}
                 >
                   <span>{option.label}</span>
                   <div className={`w-3 h-3 rounded border flex items-center justify-center ${isSelected ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-400'}`}>
                     {isSelected && <Check className="w-2 h-2 text-white" />}
                   </div>
                 </button>
               );
             })}
           </div>
         </div>

         {/* Dislikes */}
         <input
           name="dislikes"
           type="text"
           value={formData.dislikes.join(', ')}
           onChange={(e) => {
             const value = e.target.value;
             const dislikes = value.split(',').map(s => s.trim()).filter(Boolean);
             setFormData(prev => ({ ...prev, dislikes }));
           }}
           placeholder="Ingredients your pet dislikes (comma separated, e.g., carrots, liver)"
           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
         />
  
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );


  // --- Modal Wrapper JSX ---
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-70 flex items-center justify-center p-2" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-lg shadow-2xl relative transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">

          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900">
              {editingPet ? 'Edit Pet Profile' : 'Create New Pet Profile'}
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <CompactForm />
            <div className={`flex ${editingPet ? 'justify-between' : 'justify-end'} pt-3 border-t border-gray-100 mt-4`}>
              {editingPet && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-danger btn-md"
                >
                  Delete Pet
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-success btn-md btn-ripple"
              >
                <Check className="w-4 h-4 mr-2" />
                {editingPet ? 'Save Changes' : 'Add Pet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}