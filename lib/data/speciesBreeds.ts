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
    ],
  },
  {
    species: 'birds',
    breeds: [
      { id: 'chicken', name: 'Chicken (Rhode Island Red, Plymouth Rock, Leghorn, Orpington, Silkie, Bantam, Backyard Mixed)', category: 'birds' },
      { id: 'duck', name: 'Duck (Pekin, Mallard, Khaki Campbell, Runner, Muscovy)', category: 'birds' },
      { id: 'goose', name: 'Goose (Toulouse, Embden, Chinese)', category: 'birds' },
      { id: 'turkey', name: 'Turkey', category: 'birds' },
      { id: 'quail', name: 'Quail (Coturnix, Bobwhite)', category: 'birds' },
      { id: 'guinea-fowl', name: 'Guinea Fowl', category: 'birds' },
      { id: 'parakeet', name: 'Parakeet/Budgerigar', category: 'birds' },
      { id: 'cockatiel', name: 'Cockatiel', category: 'birds' },
      { id: 'lovebird', name: 'Lovebird (Peach-Faced, Fischer\'s)', category: 'birds' },
      { id: 'parrotlet', name: 'Parrotlet (Pacific, Green-Rumped)', category: 'birds' },
      { id: 'lineolated-parakeet', name: 'Lineolated Parakeet', category: 'birds' },
      { id: 'bourkes-parakeet', name: 'Bourke\'s Parakeet', category: 'birds' },
      { id: 'conure', name: 'Conure (Green-Cheeked, Sun, Jenday, Blue-Crowned)', category: 'birds' },
      { id: 'quaker-parakeet', name: 'Quaker Parakeet (Monk Parakeet)', category: 'birds' },
      { id: 'caique', name: 'Caique (Black-Headed, White-Bellied)', category: 'birds' },
      { id: 'senegal-parrot', name: 'Senegal Parrot', category: 'birds' },
      { id: 'meyers-parrot', name: 'Meyer\'s Parrot', category: 'birds' },
      { id: 'pionus', name: 'Pionus (Blue-Headed, White-Capped)', category: 'birds' },
      { id: 'ringneck-parakeet', name: 'Ringneck Parakeet (Indian, African)', category: 'birds' },
      { id: 'lorikeet', name: 'Lorikeet (Rainbow)', category: 'birds' },
      { id: 'african-grey', name: 'African Grey (Congo, Timneh)', category: 'birds' },
      { id: 'amazon-parrot', name: 'Amazon Parrot (Yellow-Naped, Blue-Fronted, Double Yellow-Headed)', category: 'birds' },
      { id: 'macaw', name: 'Macaw (Blue and Gold, Scarlet, Green-Winged, Military, Hyacinth)', category: 'birds' },
      { id: 'cockatoo', name: 'Cockatoo (Umbrella, Moluccan, Goffin\'s, Galah/Rose-Breasted, Citron-Crested)', category: 'birds' },
      { id: 'eclectus-parrot', name: 'Eclectus Parrot', category: 'birds' },
      { id: 'canary', name: 'Canary (American Singer, Gloster, Yorkshire)', category: 'birds' },
      { id: 'zebra-finch', name: 'Zebra Finch', category: 'birds' },
      { id: 'society-finch', name: 'Society Finch (Bengalese)', category: 'birds' },
      { id: 'gouldian-finch', name: 'Gouldian Finch', category: 'birds' },
      { id: 'owl-finch', name: 'Owl Finch', category: 'birds' },
      { id: 'star-finch', name: 'Star Finch', category: 'birds' },
      { id: 'cordon-bleu-finch', name: 'Cordon Bleu Finch', category: 'birds' },
      { id: 'dove', name: 'Dove (Diamond, Ring-Necked)', category: 'birds' },
      { id: 'pigeon', name: 'Pigeon (Racing Homer, Fantail, Roller)', category: 'birds' },
      { id: 'mynah-bird', name: 'Mynah Bird (Hill Mynah)', category: 'birds' },
      { id: 'toucan', name: 'Toucan', category: 'birds' },
      { id: 'starling', name: 'Starling (European)', category: 'birds' },
    ],
  },
  {
    species: 'reptiles',
    breeds: [
      { id: 'bearded-dragon', name: 'Bearded Dragon', category: 'reptiles' },
      { id: 'leopard-gecko', name: 'Leopard Gecko', category: 'reptiles' },
      { id: 'crested-gecko', name: 'Crested Gecko', category: 'reptiles' },
      { id: 'blue-tongued-skink', name: 'Blue-Tongued Skink', category: 'reptiles' },
      { id: 'iguana', name: 'Iguana (Green Iguana)', category: 'reptiles' },
      { id: 'chameleon', name: 'Chameleon (Veiled, Panther)', category: 'reptiles' },
      { id: 'uromastyx', name: 'Uromastyx', category: 'reptiles' },
      { id: 'african-fat-tailed-gecko', name: 'African Fat-Tailed Gecko', category: 'reptiles' },
      { id: 'gargoyle-gecko', name: 'Gargoyle Gecko', category: 'reptiles' },
      { id: 'monitor-lizard', name: 'Monitor Lizard (Savannah, Ackie)', category: 'reptiles' },
      { id: 'tegus', name: 'Tegus (Argentine Black and White)', category: 'reptiles' },
      { id: 'anole', name: 'Anole (Green, Brown)', category: 'reptiles' },
      { id: 'chinese-water-dragon', name: 'Chinese Water Dragon', category: 'reptiles' },
      { id: 'basilisk', name: 'Basilisk', category: 'reptiles' },
      { id: 'collared-lizard', name: 'Collared Lizard', category: 'reptiles' },
      { id: 'day-gecko', name: 'Day Gecko', category: 'reptiles' },
      { id: 'ball-python', name: 'Ball Python', category: 'reptiles' },
      { id: 'corn-snake', name: 'Corn Snake', category: 'reptiles' },
      { id: 'king-snake', name: 'King Snake (California, Mexican Black)', category: 'reptiles' },
      { id: 'milk-snake', name: 'Milk Snake', category: 'reptiles' },
      { id: 'garter-snake', name: 'Garter Snake', category: 'reptiles' },
      { id: 'hognose-snake', name: 'Hognose Snake (Western, Eastern)', category: 'reptiles' },
      { id: 'boa-constrictor', name: 'Boa Constrictor', category: 'reptiles' },
      { id: 'blood-python', name: 'Blood Python', category: 'reptiles' },
      { id: 'rosy-boa', name: 'Rosy Boa', category: 'reptiles' },
      { id: 'rat-snake', name: 'Rat Snake', category: 'reptiles' },
      { id: 'gopher-snake', name: 'Gopher Snake', category: 'reptiles' },
      { id: 'red-eared-slider', name: 'Red-Eared Slider', category: 'reptiles' },
      { id: 'box-turtle', name: 'Box Turtle (Eastern, Ornate)', category: 'reptiles' },
      { id: 'russian-tortoise', name: 'Russian Tortoise', category: 'reptiles' },
      { id: 'sulcata-tortoise', name: 'Sulcata Tortoise', category: 'reptiles' },
      { id: 'hermanns-tortoise', name: 'Hermann\'s Tortoise', category: 'reptiles' },
      { id: 'painted-turtle', name: 'Painted Turtle', category: 'reptiles' },
      { id: 'musk-turtle', name: 'Musk Turtle (Common, Razorback)', category: 'reptiles' },
      { id: 'map-turtle', name: 'Map Turtle', category: 'reptiles' },
      { id: 'leopard-tortoise', name: 'Leopard Tortoise', category: 'reptiles' },
      { id: 'greek-tortoise', name: 'Greek Tortoise', category: 'reptiles' },
      { id: 'mud-turtle', name: 'Mud Turtle', category: 'reptiles' },
      { id: 'softshell-turtle', name: 'Softshell Turtle', category: 'reptiles' },
      { id: 'wood-turtle', name: 'Wood Turtle', category: 'reptiles' },
    ],
  },
  {
    species: 'pocket-pets',
    breeds: [
      { id: 'syrian-hamster', name: 'Syrian Hamster (Golden Hamster)', category: 'pocket-pets' },
      { id: 'dwarf-hamster', name: 'Dwarf Hamster (Roborovski, Campbell\'s, Winter White)', category: 'pocket-pets' },
      { id: 'guinea-pig', name: 'Guinea Pig (American, Abyssinian, Peruvian)', category: 'pocket-pets' },
      { id: 'rat', name: 'Rat (Fancy Rat)', category: 'pocket-pets' },
      { id: 'mouse', name: 'Mouse (Fancy Mouse)', category: 'pocket-pets' },
      { id: 'gerbil', name: 'Gerbil (Mongolian Gerbil)', category: 'pocket-pets' },
      { id: 'chinchilla', name: 'Chinchilla', category: 'pocket-pets' },
      { id: 'degu', name: 'Degu', category: 'pocket-pets' },
      { id: 'african-dormouse', name: 'African Dormouse', category: 'pocket-pets' },
      { id: 'rabbit', name: 'Rabbit (Holland Lop, Netherland Dwarf, Lionhead, Mini Rex, Flemish Giant, Dutch, English Angora, Mixed Breed)', category: 'pocket-pets' },
      { id: 'ferret', name: 'Ferret', category: 'pocket-pets' },
      { id: 'hedgehog', name: 'Hedgehog (African Pygmy)', category: 'pocket-pets' },
      { id: 'sugar-glider', name: 'Sugar Glider', category: 'pocket-pets' },
      { id: 'prairie-dog', name: 'Prairie Dog', category: 'pocket-pets' },
      { id: 'flying-squirrel', name: 'Flying Squirrel (Southern)', category: 'pocket-pets' },
      { id: 'chipmunk', name: 'Chipmunk', category: 'pocket-pets' },
      { id: 'duprasi', name: 'Duprasi (Fat-Tailed Gerbil)', category: 'pocket-pets' },
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