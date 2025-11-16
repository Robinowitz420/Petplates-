import { Breed, AgeGroup, HealthConcern } from '../types';

export const dogBreeds: Breed[] = [
  { id: 'labrador', name: 'Labrador Retriever', category: 'dogs' },
  { id: 'german-shepherd', name: 'German Shepherd', category: 'dogs' },
  { id: 'golden-retriever', name: 'Golden Retriever', category: 'dogs' },
  { id: 'bulldog', name: 'Bulldog', category: 'dogs' },
  { id: 'beagle', name: 'Beagle', category: 'dogs' },
  { id: 'poodle', name: 'Poodle', category: 'dogs' },
  { id: 'rottweiler', name: 'Rottweiler', category: 'dogs' },
  { id: 'yorkshire', name: 'Yorkshire Terrier', category: 'dogs' },
  { id: 'chihuahua', name: 'Chihuahua', category: 'dogs' },
  { id: 'husky', name: 'Siberian Husky', category: 'dogs' },
];

export const catBreeds: Breed[] = [
  { id: 'persian', name: 'Persian', category: 'cats' },
  { id: 'maine-coon', name: 'Maine Coon', category: 'cats' },
  { id: 'siamese', name: 'Siamese', category: 'cats' },
  { id: 'ragdoll', name: 'Ragdoll', category: 'cats' },
  { id: 'bengal', name: 'Bengal', category: 'cats' },
  { id: 'british-shorthair', name: 'British Shorthair', category: 'cats' },
  { id: 'abyssinian', name: 'Abyssinian', category: 'cats' },
  { id: 'sphynx', name: 'Sphynx', category: 'cats' },
  { id: 'scottish-fold', name: 'Scottish Fold', category: 'cats' },
  { id: 'domestic-shorthair', name: 'Domestic Shorthair', category: 'cats' },
];

export const birdTypes: Breed[] = [
  { id: 'budgie', name: 'Budgerigar (Parakeet)', category: 'birds' },
  { id: 'cockatiel', name: 'Cockatiel', category: 'birds' },
  { id: 'lovebird', name: 'Lovebird', category: 'birds' },
  { id: 'parrot', name: 'Parrot', category: 'birds' },
  { id: 'cockatoo', name: 'Cockatoo', category: 'birds' },
  { id: 'canary', name: 'Canary', category: 'birds' },
  { id: 'finch', name: 'Finch', category: 'birds' },
  { id: 'conure', name: 'Conure', category: 'birds' },
];

export const reptileTypes: Breed[] = [
  { id: 'bearded-dragon', name: 'Bearded Dragon', category: 'reptiles' },
  { id: 'leopard-gecko', name: 'Leopard Gecko', category: 'reptiles' },
  { id: 'ball-python', name: 'Ball Python', category: 'reptiles' },
  { id: 'red-eared-slider', name: 'Red-Eared Slider Turtle', category: 'reptiles' },
  { id: 'corn-snake', name: 'Corn Snake', category: 'reptiles' },
  { id: 'iguana', name: 'Green Iguana', category: 'reptiles' },
  { id: 'chameleon', name: 'Chameleon', category: 'reptiles' },
];

export const pocketPetTypes: Breed[] = [
  { id: 'hamster', name: 'Hamster', category: 'pocket-pets' },
  { id: 'guinea-pig', name: 'Guinea Pig', category: 'pocket-pets' },
  { id: 'rabbit', name: 'Rabbit', category: 'pocket-pets' },
  { id: 'ferret', name: 'Ferret', category: 'pocket-pets' },
  { id: 'chinchilla', name: 'Chinchilla', category: 'pocket-pets' },
  { id: 'gerbil', name: 'Gerbil', category: 'pocket-pets' },
  { id: 'mouse', name: 'Mouse', category: 'pocket-pets' },
  { id: 'rat', name: 'Rat', category: 'pocket-pets' },
];

export const ageGroups: AgeGroup[] = [
  { id: 'baby', name: 'Baby', description: '0-1 years' },
  { id: 'young', name: 'Young Adult', description: '1-3 years' },
  { id: 'adult', name: 'Adult', description: '3-7 years' },
  { id: 'senior', name: 'Senior', description: '7+ years' },
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
