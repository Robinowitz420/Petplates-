'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pet: {
    name: string;
    type: PetCategory;
    breed: string;
    age: AgeGroup;
    healthConcerns: string[];
  }) => void;
}

export default function AddPetModal({ isOpen, onClose, onSubmit }: AddPetModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<PetCategory>('dogs');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<AgeGroup>('adult');
  const [healthConcerns, setHealthConcerns] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ name, type, breed, age, healthConcerns });
    // Reset form
    setStep(1);
    setName('');
    setType('dogs');
    setBreed('');
    setAge('adult');
    setHealthConcerns([]);
    onClose();
  };

  const categories = [
    { id: 'dogs', label: 'Dogs', emoji: '🐕' },
    { id: 'cats', label: 'Cats', emoji: '🐈' },
    { id: 'birds', label: 'Birds', emoji: '🦜' },
    { id: 'reptiles', label: 'Reptiles', emoji: '🦎' },
    { id: 'pocket-pets', label: 'Pocket Pets', emoji: '🐰' },
  ];

  const ages = [
    { id: 'baby', label: 'Baby' },
    { id: 'young', label: 'Young Adult' },
    { id: 'adult', label: 'Adult' },
    { id: 'senior', label: 'Senior' },
  ];

  const healthOptions = [
    'Allergies',
    'Weight Management',
    'Joint Health',
    'Digestive Issues',
    'Kidney Health',
    'Dental Health',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Add New Pet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 p-6 border-b">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 4 && <div className="w-12 h-1 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Name & Type */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">What's your pet's name and type?</h3>
              
              <input
                type="text"
                placeholder="Pet's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg mb-6"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setType(cat.id as PetCategory)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      type === cat.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{cat.emoji}</div>
                    <div className="font-semibold">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Breed */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">What breed is {name}?</h3>
              <input
                type="text"
                placeholder="Enter breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          )}

          {/* Step 3: Age */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">How old is {name}?</h3>
              <div className="grid grid-cols-2 gap-4">
                {ages.map((ageGroup) => (
                  <button
                    key={ageGroup.id}
                    onClick={() => setAge(ageGroup.id as AgeGroup)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      age === ageGroup.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{ageGroup.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Health Concerns */}
          {step === 4 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Any health concerns? (Optional)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {healthOptions.map((concern) => (
                  <button
                    key={concern}
                    onClick={() => {
                      if (healthConcerns.includes(concern)) {
                        setHealthConcerns(healthConcerns.filter((c) => c !== concern));
                      } else {
                        setHealthConcerns([...healthConcerns, concern]);
                      }
                    }}
                    className={`p-3 border-2 rounded-lg text-sm transition-all ${
                      healthConcerns.includes(concern)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 border rounded-lg disabled:opacity-50"
          >
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !name}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add Pet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}