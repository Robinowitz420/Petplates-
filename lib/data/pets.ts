import { Breed, AgeGroup, HealthConcern } from '../types';
import { getBreedsForSpecies } from './speciesBreeds';

// Re-export from centralized source for backward compatibility
export const dogBreeds: Breed[] = getBreedsForSpecies('dogs');
export const catBreeds: Breed[] = getBreedsForSpecies('cats');
export const birdTypes: Breed[] = getBreedsForSpecies('birds');
export const reptileTypes: Breed[] = getBreedsForSpecies('reptiles');
export const pocketPetTypes: Breed[] = getBreedsForSpecies('pocket-pets');

export const ageGroups: AgeGroup[] = [
  { value: 'baby', label: 'Baby' },
  { value: 'young', label: 'Young' },
  { value: 'adult', label: 'Adult' },
  { value: 'senior', label: 'Senior' },
];

export const healthConcerns: HealthConcern[] = [
  {
    id: 'weight-management',
    name: 'Weight Management',
    description: 'For overweight pets needing controlled calorie intake',
    dietaryAdjustments: ['Lower fat', 'Higher fiber', 'Controlled portions'],
  },
  {
    id: 'allergies',
    name: 'Food Allergies',
    description: 'For pets with food sensitivities',
    dietaryAdjustments: ['Limited ingredient', 'Novel protein sources', 'Grain-free options'],
  },
  {
    id: 'joint-health',
    name: 'Joint Health',
    description: 'For pets with arthritis or joint issues',
    dietaryAdjustments: ['Glucosamine', 'Omega-3 fatty acids', 'Anti-inflammatory ingredients'],
  },
  {
    id: 'digestive',
    name: 'Digestive Issues',
    description: 'For pets with sensitive stomachs',
    dietaryAdjustments: ['Probiotics', 'Easily digestible proteins', 'Low fat'],
  },
  {
    id: 'kidney',
    name: 'Kidney Support',
    description: 'For pets with kidney concerns',
    dietaryAdjustments: ['Lower protein', 'Lower phosphorus', 'Increased moisture'],
  },
  {
    id: 'dental',
    name: 'Dental Health',
    description: 'For pets needing dental support',
    dietaryAdjustments: ['Crunchy textures', 'Dental-friendly ingredients', 'Natural teeth cleaners'],
  },
  {
    id: 'none',
    name: 'No Special Concerns',
    description: 'General health maintenance',
    dietaryAdjustments: ['Balanced nutrition', 'Age-appropriate'],
  },
];

export const breeds = {
  dogs: dogBreeds,
  cats: catBreeds,
  birds: birdTypes,
  reptiles: reptileTypes,
  'pocket-pets': pocketPetTypes,
};

// Re-export centralized functions for convenience
export { getBreedsForSpecies, getBreedNamesForSpecies, getAllSpecies } from './speciesBreeds';
