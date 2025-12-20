import { Breed, PetCategory } from '../types';

export interface SpeciesBreedData {
  species: PetCategory;
  breeds: Breed[];
}

// Initial data with common breeds and requested additions
export const SPECIES_BREEDS_DATA: SpeciesBreedData[] = [
  {
    species: 'dogs',
    breeds: [
      { id: 'golden-retriever', name: 'Golden Retriever', category: 'dogs' },
      { id: 'labrador', name: 'Labrador Retriever', category: 'dogs' },
      { id: 'german-shepherd', name: 'German Shepherd', category: 'dogs' },
      { id: 'bulldog', name: 'Bulldog', category: 'dogs' },
      { id: 'poodle', name: 'Poodle', category: 'dogs' },
      { id: 'beagle', name: 'Beagle', category: 'dogs' },
      { id: 'rottweiler', name: 'Rottweiler', category: 'dogs' },
      { id: 'yorkie', name: 'Yorkshire Terrier', category: 'dogs' },
      { id: 'boxer', name: 'Boxer', category: 'dogs' },
      { id: 'dachshund', name: 'Dachshund', category: 'dogs' },
      { id: 'mixed-dog', name: 'Mixed Breed', category: 'dogs' },
      { id: 'other-dog', name: 'Other', category: 'dogs' },
    ],
  },
  {
    species: 'cats',
    breeds: [
      { id: 'domestic-shorthair', name: 'Domestic Shorthair', category: 'cats' },
      { id: 'persian', name: 'Persian', category: 'cats' },
      { id: 'maine-coon', name: 'Maine Coon', category: 'cats' },
      { id: 'siamese', name: 'Siamese', category: 'cats' },
      { id: 'ragdoll', name: 'Ragdoll', category: 'cats' },
      { id: 'bengal', name: 'Bengal', category: 'cats' },
      { id: 'sphynx', name: 'Sphynx', category: 'cats' },
      { id: 'british-shorthair', name: 'British Shorthair', category: 'cats' },
      { id: 'abyssinian', name: 'Abyssinian', category: 'cats' },
      { id: 'mixed-cat', name: 'Mixed Breed', category: 'cats' },
      { id: 'other-cat', name: 'Other', category: 'cats' },
    ],
  },
  {
    species: 'birds',
    breeds: [
      { id: 'parakeet', name: 'Parakeet (Budgie)', category: 'birds' },
      { id: 'cockatiel', name: 'Cockatiel', category: 'birds' },
      { id: 'canary', name: 'Canary', category: 'birds' },
      { id: 'finch', name: 'Finch', category: 'birds' },
      { id: 'african-grey', name: 'African Grey', category: 'birds' },
      { id: 'macaw', name: 'Macaw', category: 'birds' },
      { id: 'quaker-parakeet', name: 'Quaker Parakeet', category: 'birds' },
      { id: 'cockatoo', name: 'Cockatoo', category: 'birds' },
      { id: 'conure', name: 'Conure', category: 'birds' },
      { id: 'lovebird', name: 'Lovebird', category: 'birds' },
      { id: 'other-bird', name: 'Other', category: 'birds' },
    ],
  },
  {
    species: 'reptiles',
    breeds: [
      { id: 'bearded-dragon', name: 'Bearded Dragon', category: 'reptiles' },
      { id: 'leopard-gecko', name: 'Leopard Gecko', category: 'reptiles' },
      { id: 'turtle', name: 'Turtle (Aquatic)', category: 'reptiles' },
      { id: 'tortoise', name: 'Tortoise', category: 'reptiles' },
      { id: 'crested-gecko', name: 'Crested Gecko', category: 'reptiles' },
      { id: 'iguana', name: 'Iguana', category: 'reptiles' },
      { id: 'chameleon', name: 'Chameleon', category: 'reptiles' },
      { id: 'other-reptile', name: 'Other', category: 'reptiles' },
    ],
  },
  {
    species: 'pocket-pets',
    breeds: [
      { id: 'hamster', name: 'Hamster', category: 'pocket-pets' },
      { id: 'guinea-pig', name: 'Guinea Pig', category: 'pocket-pets' },
      { id: 'rabbit', name: 'Rabbit', category: 'pocket-pets' },
      { id: 'rat', name: 'Rat', category: 'pocket-pets' },
      { id: 'mouse', name: 'Mouse', category: 'pocket-pets' },
      { id: 'gerbil', name: 'Gerbil', category: 'pocket-pets' },
      { id: 'ferret', name: 'Ferret', category: 'pocket-pets' },
      { id: 'chinchilla', name: 'Chinchilla', category: 'pocket-pets' },
      { id: 'sugar-glider', name: 'Sugar Glider', category: 'pocket-pets' },
      { id: 'hedgehog', name: 'Hedgehog', category: 'pocket-pets' },
      { id: 'other-pocket-pet', name: 'Other', category: 'pocket-pets' },
    ],
  },
];

export function getBreedsForSpecies(species: string): Breed[] {
  const data = SPECIES_BREEDS_DATA.find(s => s.species === species);
  return data ? data.breeds : [];
}

export function getBreedNamesForSpecies(species: string): string[] {
  const breeds = getBreedsForSpecies(species);
  return breeds.map(b => b.name);
}

export function getAllSpecies(): string[] {
  return SPECIES_BREEDS_DATA.map(s => s.species);
}

export function addBreed(species: PetCategory, breedName: string): Breed {
  const data = SPECIES_BREEDS_DATA.find(s => s.species === species);
  if (!data) {
    throw new Error(`Species ${species} not found`);
  }

  const id = breedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Check if breed already exists
  const existing = data.breeds.find(b => b.id === id || b.name.toLowerCase() === breedName.toLowerCase());
  if (existing) {
    return existing;
  }

  const newBreed: Breed = {
    id,
    name: breedName,
    category: species
  };

  // Insert before "Other" if it exists, otherwise at the end
  const otherIndex = data.breeds.findIndex(b => b.id.startsWith('other-'));
  if (otherIndex !== -1) {
    data.breeds.splice(otherIndex, 0, newBreed);
  } else {
    data.breeds.push(newBreed);
  }

  return newBreed;
}

export function removeBreed(species: PetCategory, breedId: string): boolean {
  const data = SPECIES_BREEDS_DATA.find(s => s.species === species);
  if (!data) return false;

  const index = data.breeds.findIndex(b => b.id === breedId);
  if (index !== -1) {
    data.breeds.splice(index, 1);
    return true;
  }
  return false;
}