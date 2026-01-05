'use client';

import React, { useState, useMemo } from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';
import { Pet } from '@/lib/types';
import { addPurchase } from '@/lib/utils/purchaseTracking';
import { useVillageStore } from '@/lib/state/villageStore';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { getIngredientDisplayPricing } from '@/lib/data/product-prices';
import { recipes } from '@/lib/data/recipes-complete';
import { buildAmazonSearchUrl } from '@/lib/utils/purchaseLinks';
import AlphabetText from '@/components/AlphabetText';

// Format price for display
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

interface MultiPetShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  userId: string;
}

export default function MultiPetShoppingModal({
  isOpen,
  onClose,
  pets,
  userId
}: MultiPetShoppingModalProps) {
  const [selectedPets, setSelectedPets] = useState<Set<string>>(new Set(pets.map(p => p.id)));
  const [isOpening, setIsOpening] = useState(false);
  const { refreshFromLocal } = useVillageStore();

  const togglePet = (petId: string) => {
    const newSelected = new Set(selectedPets);
    if (newSelected.has(petId)) {
      newSelected.delete(petId);
    } else {
      newSelected.add(petId);
    }
    setSelectedPets(newSelected);
  };

  // Aggregate all ingredients from all selected pets' saved meals
  const allIngredients = useMemo(() => {
    const ingredientMap = new Map<string, {
      name: string;
      asinLink: string;
      primaryLink: string;
      count: number;
      petNames: string[];
    }>();

    pets.forEach(pet => {
      if (!selectedPets.has(pet.id)) return;
      
      const petName = pet.names?.[0] || 'Pet';
      const savedRecipes = pet.savedRecipes || [];
      
      savedRecipes.forEach(recipeId => {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;
        
        recipe.ingredients?.forEach(ing => {
          const link = (ing as any).asinLink || ing.amazonLink;
          const primaryLink = ensureSellerId(buildAmazonSearchUrl(ing.name));
          if (!primaryLink) return;

          const key = `${ing.name}`;
          const existing = ingredientMap.get(key);
          
          if (existing) {
            existing.count++;
            if (!existing.petNames.includes(petName)) {
              existing.petNames.push(petName);
            }
          } else {
            ingredientMap.set(key, {
              name: ing.name,
              asinLink: link || '',
              primaryLink,
              count: 1,
              petNames: [petName]
            });
          }
        });
      });
    });

    return Array.from(ingredientMap.values());
  }, [pets, selectedPets]);

  const totalItems = allIngredients.length;
  const selectedPetCount = selectedPets.size;

  // Calculate total price
  const totalPrice = useMemo(() => {
    return allIngredients.reduce((sum, ing) => {
      const pricing = getIngredientDisplayPricing(ing.name);
      if (pricing?.packagePrice && pricing.packagePrice > 0) return sum + pricing.packagePrice;

      return sum;
    }, 0);
  }, [allIngredients]);

  const handleBuyAll = async () => {
    setIsOpening(true);

    // Open first tab
    if (allIngredients.length > 0) {
      window.open(allIngredients[0].primaryLink, '_blank');
      if (userId) {
        addPurchase(userId, allIngredients[0].name, false, allIngredients[0].name);
      }
    }

    // Open remaining tabs
    for (let i = 1; i < allIngredients.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      window.open(allIngredients[i].primaryLink, '_blank');
      if (userId) {
        addPurchase(userId, allIngredients[i].name, false, allIngredients[i].name);
      }
    }

    refreshFromLocal();

    setTimeout(() => {
      setIsOpening(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border-2 border-orange-500/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#043136] to-[#0f2c0f] px-6 py-5 border-b-2 border-orange-500/30 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="text-orange-400" size={28} />
              Shop for All Your Pets
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              Bundle ingredients and save time
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Pet Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Select pets to shop for:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pets.map(pet => {
                const petName = pet.names?.[0] || 'Pet';
                const isSelected = selectedPets.has(pet.id);
                
                return (
                  <button
                    key={pet.id}
                    onClick={() => togglePet(pet.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-orange-500/20 border-orange-500 text-white'
                        : 'bg-surface-highlight border-surface-highlight text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-orange-500 border-orange-400' : 'bg-transparent border-gray-500'
                      }`}>
                        {isSelected && <Check size={16} className="text-white" />}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">
                          <AlphabetText text={petName} size={18} />
                        </div>
                        <div className="text-xs capitalize">{pet.type}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {selectedPetCount > 0 && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-5 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-400">{selectedPetCount}</div>
                  <div className="text-xs text-gray-400 mt-1">Pets Selected</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">{totalItems}</div>
                  <div className="text-xs text-gray-400 mt-1">Ingredients</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">
                    {Math.max(...allIngredients.map(i => i.count))}x
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Max Uses</div>
                </div>
              </div>
            </div>
          )}

          {/* Ingredient Preview */}
          {totalItems > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Combined Shopping List:
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {allIngredients.slice(0, 10).map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-surface-highlight rounded-lg text-sm"
                  >
                    <span className="text-gray-300">{ing.name}</span>
                    <span className="text-orange-400 font-semibold">
                      Used in {ing.count} meal{ing.count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
                {totalItems > 10 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    + {totalItems - 10} more ingredients
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Big CTA Button */}
          <button
            onClick={handleBuyAll}
            disabled={isOpening || selectedPetCount === 0}
            className={`w-full py-6 px-8 rounded-xl font-black text-2xl transition-all transform ${
              isOpening || selectedPetCount === 0
                ? 'bg-gray-600 cursor-not-allowed text-gray-400 scale-95'
                : 'bg-gradient-to-r from-[#FF9900] via-[#F08804] to-[#FF9900] hover:from-[#E07704] hover:via-[#D07604] hover:to-[#E07704] text-black shadow-2xl hover:shadow-orange-500/50 hover:scale-105 border-4 border-orange-300 animate-pulse'
            }`}
          >
            {isOpening ? (
              <span className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-7 w-7 border-b-4 border-white"></div>
                OPENING TABS...
              </span>
            ) : (
              <span className="flex flex-col items-center justify-center gap-1">
                <span className="flex items-center gap-3">
                  <ShoppingCart size={32} />
                  BUY ALL FOR {selectedPetCount} PET{selectedPetCount > 1 ? 'S' : ''}!
                </span>
                {totalPrice > 0 && (
                  <span className="text-2xl font-bold">
                    Total: {formatPrice(totalPrice)}
                  </span>
                )}
              </span>
            )}
          </button>

          {selectedPetCount === 0 && (
            <p className="text-center text-gray-500 text-sm mt-3">
              Select at least one pet to continue
            </p>
          )}
        </div>

        {/* Trust Footer */}
        <div className="bg-surface-lighter px-6 py-4 border-t border-surface-highlight">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            <span className="font-semibold text-green-400">🌟 Smart Shopping:</span> We've combined all ingredients across your pets' meal plans, 
            so you buy each item once. Your price stays the same, and you support free pet nutrition resources!
          </p>
        </div>
      </div>
    </div>
  );
}

