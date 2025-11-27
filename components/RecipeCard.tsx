'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Users } from 'lucide-react';
import { Recipe } from '@/lib/types';
import { CompatibilityBadge } from './CompatibilityBadge';
import { rateRecipeForPet, type Pet } from '@/lib/utils/petRatingSystem';
import RecipeScoreModal from './RecipeScoreModal';
import Image from './Image';

// Categorized celebrity pet directories by pet type
const celebrityPetsByType = {
  dogs: [
    'Bark_Obama', 'Brad_Pitt_Bull', 'George_Clooney_Dog', 'Pooch_Clooney', 'Corgi_Elizabeth'
  ],
  cats: [
    // No cat images available yet, fallback to pocket-pets
  ],
  birds: [
    // No bird images available yet, fallback to pocket-pets
  ],
  reptiles: [
    // No reptile images available yet, fallback to pocket-pets
  ],
  'pocket-pets': [
    'Admiral_Ackbar_Hamster', 'Anakin_Skywalker_Gerbil', 'Anderson_Pooper_Hamster',
    'Biggs_Darklighter_Chinchilla', 'Boba_Fett_Gerbil', 'Bunny_Shapiro',
    'C-3PO_Rabbit', 'Chewbacca_Ferret', 'Chinchilla_Clinton', 'Chris_Cuomo_Chinchilla',
    'Conan_O\'Bunny', 'Darth_Vader_Gerbil', 'David_Letterferet',
    'Don_Lemon_Guinea', 'Dr._Oz_Hamster', 'Dr._Phil_Ferret', 'Ellen_DeGenerhams',
    'Ferret_Fawcett', 'Gerbil_Streep', 'Greedo_Rabbit',
    'Guinea_Pig_Pitt', 'Hamela_Anderson', 'Hammy_Kimmel', 'Ham_Solo', 'Han_Solo_Chinchilla',
    'Jabba_the_Hutt_Chinchilla', 'Jake_Tapperguinea', 'Jar_Jar_Binks_Hamster',
    'Jay_Leno_Chinchilla', 'Jimmy_Ferret-lon', 'Lando_Calrissian_Ferret',
    'Luke_Skywalker_Hamster', 'Mace_Windu_Rabbit', 'Mon_Mothma_Ferret', 'Obi-Wan_Kenobi_Ferret',
    'Oprah_Winferbun', 'Padmé_Amidala_Chinchilla', 'Poe_Dameron_Rabbit',
    'Princess_Leia_Guinea', 'Qui-Gon_Jinn_Guinea', 'R2-D2_Guinea', 'Rachel_Hay_Maddow',
    'Stephen_Hambert', 'Wedge_Antilles_Gerbil', 'Wicket_the_Ewok_Guinea', 'Wolf_Blitzhamster',
    'Yoda_Hamster'
  ]
};

// Helper function to get celebrity pet image path
function getCelebrityImageSrc(celebrityName: string): string {
  const folderName = celebrityName.replace(/ /g, '_');
  // Prefer the named image, fallback to image_1.png
  return `/images/celebrity-pets/${folderName}/${folderName}.png`;
}

// Helper function to get a random celebrity pet image appropriate for the recipe category
function getRandomCelebrityImageSrc(recipeCategory: string): string {
  // Map recipe category to pet type
  const petTypeMap: Record<string, keyof typeof celebrityPetsByType> = {
    'dogs': 'dogs',
    'cats': 'pocket-pets', // Fallback since no cat images
    'birds': 'pocket-pets', // Fallback since no bird images
    'reptiles': 'pocket-pets', // Fallback since no reptile images
    'pocket-pets': 'pocket-pets'
  };

  const petType = petTypeMap[recipeCategory] || 'pocket-pets';
  const availablePets = celebrityPetsByType[petType];

  if (availablePets.length === 0) {
    // Ultimate fallback to any available pet
    const allPets = Object.values(celebrityPetsByType).flat();
    const randomFolder = allPets[Math.floor(Math.random() * allPets.length)];
    return `/images/celebrity-pets/${randomFolder}/${randomFolder}.png`;
  }

  const randomFolder = availablePets[Math.floor(Math.random() * availablePets.length)];
  // Try the named image first, fallback to image_1.png
  return `/images/celebrity-pets/${randomFolder}/${randomFolder}.png`;
}

interface RecipeCardProps {
  recipe: Recipe;
  pet?: Pet | null;
}

export default function RecipeCard({ recipe, pet }: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate compatibility rating if pet is provided
  const compatibilityRating = pet ? rateRecipeForPet(recipe, pet as Pet) : null;

  return (
    <>
      <Link
        href={`/recipe/${recipe.id}${pet ? `?petId=${pet.id}` : ''}`}
        className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={recipe.images?.card}
            variant="card"
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackSrc={recipe.imageUrl}
            petCategory={recipe.category}
            healthConcern={recipe.healthConcerns?.[0]}
          />
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-semibold">
            {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {recipe.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>

          {/* Celebrity Quote and Image */}
          {recipe.celebrityQuote && recipe.celebrityName && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={getCelebrityImageSrc(recipe.celebrityName)}
                    alt={recipe.celebrityName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    onError={(e) => {
                      // Fallback to image_1.png if the named image fails to load
                      if (recipe.celebrityName) {
                        (e.target as HTMLImageElement).src = `/images/celebrity-pets/${recipe.celebrityName.replace(/ /g, '_')}/image_1.png`;
                        (e.target as HTMLImageElement).onerror = () => {
                          // Final fallback to a random celebrity pet image appropriate for the recipe type
                          (e.target as HTMLImageElement).src = getRandomCelebrityImageSrc(recipe.category);
                          (e.target as HTMLImageElement).onerror = () => {
                            // Ultimate fallback to default image
                            (e.target as HTMLImageElement).src = '/images/dog-core-icon-master.png';
                          };
                        };
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm italic text-gray-700 mb-1">
                    "{recipe.celebrityQuote}"
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    — {recipe.celebrityName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Meta Information */}
          {recipe.meta && (
            <div className="mb-4 space-y-1">
              {recipe.meta.texture && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Texture:</span> {recipe.meta.texture}
                </div>
              )}
              {recipe.meta.estimatedCost && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Cost:</span> {recipe.meta.estimatedCost}
                </div>
              )}
              {recipe.meta.shelfLife && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Storage:</span> {recipe.meta.shelfLife}
                </div>
              )}
              {recipe.meta.season && recipe.meta.season.length > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Season:</span> {recipe.meta.season.join(', ')}
                </div>
              )}
            </div>
          )}
  
          {/* Compatibility Rating Display */}
          {compatibilityRating && (
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <CompatibilityBadge
                  compatibility={compatibilityRating.compatibility}
                  score={compatibilityRating.overallScore}
                />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
        </div>
      </Link>

      {isModalOpen && (
        <RecipeScoreModal
          recipe={recipe}
          pet={pet}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}