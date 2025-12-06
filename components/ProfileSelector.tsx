'use client';

import { useState, useEffect } from 'react';
import { Plus, User, Dog, Cat, Bird, Fish, Rabbit, X } from 'lucide-react';

const petIcons = {
  dogs: Dog,
  cats: Cat,
  birds: Bird,
  reptiles: Fish,
  'pocket-pets': Rabbit,
};

const petTypes = [
  { id: 'dogs', name: 'Dog', icon: Dog },
  { id: 'cats', name: 'Cat', icon: Cat },
  { id: 'birds', name: 'Bird', icon: Bird },
  { id: 'reptiles', name: 'Reptile', icon: Fish },
  { id: 'pocket-pets', name: 'Pocket Pet', icon: Rabbit },
];

const ageGroups = [
  { id: 'baby', name: 'Baby', description: '0-1 years' },
  { id: 'young', name: 'Young Adult', description: '1-3 years' },
  { id: 'adult', name: 'Adult', description: '3-7 years' },
  { id: 'senior', name: 'Senior', description: '7+ years' },
];

const healthConcernOptions = [
  { id: 'none', name: 'No Special Concerns' },
  { id: 'weight-management', name: 'Weight Management' },
  { id: 'allergies', name: 'Food Allergies' },
  { id: 'joint-health', name: 'Joint Health' },
  { id: 'digestive', name: 'Digestive Issues' },
  { id: 'kidney', name: 'Kidney Support' },
  { id: 'dental', name: 'Dental Health' },
];

const breedsByType = {
  dogs: ['Labrador', 'Golden Retriever', 'German Shepherd', 'Beagle', 'Poodle', 'Bulldog', 'Yorkshire Terrier', 'Chihuahua', 'Husky', 'Rottweiler'],
  cats: ['Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'Bengal', 'British Shorthair', 'Sphynx', 'Scottish Fold'],
  birds: ['Budgie', 'Cockatiel', 'Lovebird', 'Parrot', 'Cockatoo', 'Canary', 'Finch', 'Conure'],
  reptiles: ['Bearded Dragon', 'Leopard Gecko', 'Ball Python', 'Red-Eared Slider', 'Corn Snake', 'Iguana', 'Chameleon'],
  'pocket-pets': ['Guinea Pig', 'Rabbit', 'Hamster', 'Ferret', 'Chinchilla', 'Gerbil', 'Mouse', 'Rat'],
};

export default function ProfileSelector() {
  const [pets, setPets] = useState([
    { id: '1', name: 'Max', type: 'dogs', breed: 'Labrador', age: 'adult', healthConcerns: ['none'] },
    { id: '2', name: 'Whiskers', type: 'cats', breed: 'Persian', age: 'senior', healthConcerns: ['kidney'] },
  ]);
  
  const [selectedPet, setSelectedPet] = useState(pets[0]?.id || '');
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'dogs',
    breed: '',
    age: 'adult',
    healthConcerns: ['none'],
  });

  const handleAddPet = () => {
    const newPet = {
      id: Date.now().toString(),
      ...formData,
    };
    setPets([...pets, newPet]);
    setSelectedPet(newPet.id);
    setShowModal(false);
    setStep(1);
    setFormData({
      name: '',
      type: 'dogs',
      breed: '',
      age: 'adult',
      healthConcerns: ['none'],
    });
  };

  const toggleHealthConcern = (concern: string) => {
    if (concern === 'none') {
      setFormData({ ...formData, healthConcerns: ['none'] });
    } else {
      const filtered = formData.healthConcerns.filter(c => c !== 'none');
      if (filtered.includes(concern)) {
        const updated = filtered.filter(c => c !== concern);
        setFormData({ ...formData, healthConcerns: updated.length ? updated : ['none'] });
      } else {
        setFormData({ ...formData, healthConcerns: [...filtered, concern] });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-md btn-darkgreen"
        >
          <Plus size={20} />
          Add Pet
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No pets added yet</p>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-md btn-darkgreen w-full justify-center"
          >
            Add Your First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => {
            const Icon = petIcons[pet.type as keyof typeof petIcons];
             return (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPet === pet.id
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${selectedPet === pet.id ? 'bg-dark-green' : 'bg-gray-100'}`}>
                    <Icon size={24} className={selectedPet === pet.id ? 'text-orange-400' : 'text-gray-600'} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{pet.breed.replace('-', ' ')}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{pet.age}</p>
                  </div>
                </div>
                {selectedPet === pet.id && (
                  <div className="mt-3 pt-3 border-t">
                    <a
                      href={`/category/${pet.type}`}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      View {pet.name}'s Recipes →
                    </a>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Add Pet Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add Your Pet</h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setStep(1);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Step 1: Pet Type */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      What type of pet do you have?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {petTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, type: type.id, breed: '' });
                              setStep(2);
                            }}
                            className="p-6 rounded-lg border-2 transition-all hover:border-primary-500 border-gray-200 hover:bg-primary-900/10"
                          >
                            <Icon size={32} className="mx-auto mb-2 text-orange-600" />
                            <div className="font-semibold text-gray-900">{type.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Name & Breed */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What's your pet's name?
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter pet name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select breed/type
                    </label>
                    <select
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Choose a breed</option>
                      {breedsByType[formData.type as keyof typeof breedsByType].map((breed) => (
                        <option key={breed} value={breed.toLowerCase().replace(' ', '-')}>
                          {breed}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!formData.name || !formData.breed}
                      className="flex-1 btn btn-md btn-darkgreen disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Age */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      How old is {formData.name}?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ageGroups.map((age) => (
                        <button
                          key={age.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, age: age.id });
                            setStep(4);
                          }}
                          className="p-4 rounded-lg border-2 text-left transition-all hover:border-primary-500 border-gray-200 hover:bg-primary-900/10"
                        >
                          <div className="font-bold text-gray-900">{age.name}</div>
                          <div className="text-sm text-gray-600">{age.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                </div>
              )}

              {/* Step 4: Health Concerns */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Any health concerns? (Select all that apply)
                    </label>
                    <div className="space-y-3">
                      {healthConcernOptions.map((concern) => (
                        <label
                          key={concern.id}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.healthConcerns.includes(concern.id)
                              ? 'border-primary-500 bg-primary-900/10'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.healthConcerns.includes(concern.id)}
                            onChange={() => toggleHealthConcern(concern.id)}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <span className="font-medium text-gray-900">{concern.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleAddPet}
                      className="flex-1 btn btn-md btn-darkgreen font-semibold"
                    >
                      Add {formData.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}