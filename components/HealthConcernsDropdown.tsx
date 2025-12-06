// components/HealthConcernsDropdown.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getHealthConcernsForSpecies } from '@/lib/data/health-concerns';
import { X } from 'lucide-react';

interface HealthConcernsDropdownProps {
  species: string;
  breed?: string;
  selectedConcerns: string[];
  onConcernsChange: (concerns: string[]) => void;
  maxSelections?: number;
  className?: string;
}

export default function HealthConcernsDropdown({
  species,
  breed,
  selectedConcerns,
  onConcernsChange,
  maxSelections = 5,
  className = ''
}: HealthConcernsDropdownProps) {
  const [availableConcerns, setAvailableConcerns] = useState<string[]>([]);
  const prevSpeciesRef = useRef<string>('');
  const prevBreedRef = useRef<string>('');

  // Load concerns when species or breed changes
  useEffect(() => {
    if (species && species.trim()) {
      const concerns = getHealthConcernsForSpecies(species, breed);
      setAvailableConcerns(concerns);
      
      // Clear concerns if species or breed actually changed (not on initial mount)
      // This prevents clearing concerns when editing an existing pet
      const speciesChanged = prevSpeciesRef.current && prevSpeciesRef.current !== species;
      const breedChanged = prevBreedRef.current && prevBreedRef.current !== (breed || '');
      
      if (speciesChanged || breedChanged) {
        onConcernsChange([]);
      }
      
      prevSpeciesRef.current = species;
      prevBreedRef.current = breed || '';
    } else {
      setAvailableConcerns([]);
      prevSpeciesRef.current = '';
      prevBreedRef.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [species, breed]); // Depend on both species and breed

  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      onConcernsChange(selectedConcerns.filter(c => c !== concern));
    } else {
      // Enforce max selections
      if (selectedConcerns.length >= maxSelections) {
        return; // Don't add if at max
      }
      onConcernsChange([...selectedConcerns, concern]);
    }
  };

  if (!species || !species.trim()) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500">Select a pet species first to see health concerns</p>
      </div>
    );
  }
  
  if (availableConcerns.length === 0) {
    return (
      <div className={`p-4 bg-yellow-50 rounded-lg border border-yellow-200 ${className}`}>
        <p className="text-yellow-700 text-sm">
          No health concerns found for "{species}". Please check the species selection.
        </p>
      </div>
    );
  }

  const fieldsetId = `health-concerns-${species || 'none'}`;
  
  const removeConcern = (concern: string) => {
    onConcernsChange(selectedConcerns.filter(c => c !== concern));
  };
  
  return (
    <fieldset className={`space-y-3 border-0 p-0 m-0 ${className}`} id={fieldsetId}>
      <legend className="mb-1 w-full">
        <h3 className="text-xs font-medium text-gray-700">Health Concerns</h3>
      </legend>

      {/* Side by side layout: Selected concerns on left, checkboxes on right */}
      <div className="grid grid-cols-[300px_1fr] gap-4">
        {/* Selected concerns - Static list with remove buttons */}
        <div className="space-y-2">
          {selectedConcerns.length > 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Selected ({selectedConcerns.length})
                </span>
              </div>
              <ul className="space-y-2">
                {selectedConcerns.map(concern => (
                  <li
                    key={concern}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-2 py-1.5 hover:border-gray-300 transition-colors"
                  >
                    <span className="text-xs text-gray-900 font-medium truncate flex-1">{concern}</span>
                    <button
                      type="button"
                      onClick={() => removeConcern(concern)}
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${concern}`}
                      title={`Remove ${concern}`}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">No health concerns selected</p>
            </div>
          )}
        </div>

        {/* Concerns checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
        {availableConcerns.map(concern => {
          const isSelected = selectedConcerns.includes(concern);
          const inputId = `health-concern-${concern.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

          return (
            <label
              key={concern}
              htmlFor={inputId}
              className={`
                flex items-center p-1.5 border rounded cursor-pointer text-xs
                transition-colors duration-150
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <input
                id={inputId}
                name={`health-concern-${species}`}
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleConcern(concern)}
                className="mr-1.5 h-3 w-3 text-blue-600 rounded"
                aria-label={`Select ${concern} health concern`}
              />
              <span className={`${isSelected ? 'font-medium' : ''} text-xs leading-tight`}>
                {concern}
              </span>
            </label>
          );
        })}
        </div>
      </div>

      {/* Optional: Select all/none */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onConcernsChange(availableConcerns)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Select All
        </button>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          onClick={() => onConcernsChange([])}
          className="text-xs text-gray-600 hover:text-gray-800"
        >
          Clear All
        </button>
      </div>
    </fieldset>
  );
}
