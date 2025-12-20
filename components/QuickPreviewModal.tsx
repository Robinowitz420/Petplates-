'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getButtonCopy, trackButtonClick, type ButtonCopyVariant } from '@/lib/utils/abTesting';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { getProductByIngredient } from '@/lib/data/product-prices';

// Format price for display
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

interface QuickPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PET_TYPES: { id: PetCategory; emoji: string; label: string }[] = [
  { id: 'dogs', emoji: '🐕', label: 'Dogs' },
  { id: 'cats', emoji: '🐈', label: 'Cats' },
  { id: 'birds', emoji: '🦜', label: 'Birds' },
  { id: 'reptiles', emoji: '🦎', label: 'Reptiles' },
  { id: 'pocket-pets', emoji: '🐰', label: 'Small Pets' },
];

export default function QuickPreviewModal({ isOpen, onClose }: QuickPreviewModalProps) {
  const [selectedType, setSelectedType] = useState<PetCategory>('dogs');
  const [hoveredRecipe, setHoveredRecipe] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // A/B Testing: Get assigned button copy
  const [buttonCopy, setButtonCopy] = useState<ButtonCopyVariant | null>(null);
  
  useEffect(() => {
    setButtonCopy(getButtonCopy(false));
  }, []);

  // Fetch recipes when pet type changes
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/recipes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            species: selectedType,
            count: 3, // Only need 3 for preview
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setRecipes(data.recipes || []);
        } else {
          setRecipes([]);
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecipes();
  }, [selectedType, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0f2c0f] border-2 border-orange-500/50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#043136] to-[#0f2c0f] px-6 py-5 border-b-2 border-orange-500/30 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-orange-400" size={28} />
              See Perfect Meals for Your Pet
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              No signup required • Instant results
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Pet Type Selector */}
          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-3 text-center">
              👇 Pick your pet type to see example meals
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {PET_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedType === type.id
                      ? 'bg-orange-500 text-white shadow-lg scale-105 border-2 border-orange-400'
                      : 'bg-surface-highlight text-gray-300 hover:bg-surface hover:text-white border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipe Grid or Loading */}
          {isLoading ? (
            <div className="text-center py-12">
              <Sparkles className="text-orange-400 mx-auto mb-4 animate-spin" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">
                Generating Perfect Meals...
              </h3>
              <p className="text-gray-300">
                Creating personalized recipes for your {selectedType.replace('-', ' ')}
              </p>
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recipes.map(recipe => {
                // Get ingredients with purchase links
                const ingredientsWithLinks = recipe.ingredients?.filter((ing: any) => 
                  ing.asinLink || ing.amazonLink
                ) || [];
                
                // Calculate total price using our high-quality product-prices system
                const recipeTotalPrice = ingredientsWithLinks.reduce((sum: number, ing: any) => {
                  const product = getProductByIngredient(ing.name);
                  if (product?.price?.amount) {
                    return sum + product.price.amount;
                  }
                  return sum;
                }, 0);
                
                return (
                  <div
                    key={recipe.id}
                    onMouseEnter={() => setHoveredRecipe(recipe.id)}
                    onMouseLeave={() => setHoveredRecipe(null)}
                    className="bg-surface rounded-xl border-2 border-surface-highlight hover:border-orange-500 transition-all shadow-lg hover:shadow-2xl overflow-hidden"
                  >
                    {/* Recipe Image */}
                    {recipe.imageUrl && (
                      <div className="relative w-full h-40 bg-surface-highlight">
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {recipe.name}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                        {recipe.description}
                      </p>

                      {/* Ingredients Preview */}
                      <div className="mb-4 pb-3 border-b border-surface-highlight">
                        <p className="text-xs text-gray-500 mb-2">Key Ingredients:</p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredients?.slice(0, 4).map((ing: any, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-green-900/40 text-green-300 px-2 py-1 rounded"
                            >
                              {ing.name}
                            </span>
                          ))}
                          {recipe.ingredients && recipe.ingredients.length > 4 && (
                            <span className="text-xs text-gray-500">
                              +{recipe.ingredients.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="space-y-2">
                        {/* Shop Ingredients Button */}
                        {ingredientsWithLinks.length > 0 && (
                          <button
                            onClick={() => {
                              // Open first ingredient link
                              const firstIng = ingredientsWithLinks[0];
                              const link = firstIng.asinLink || firstIng.amazonLink;
                              if (link) {
                                window.open(ensureSellerId(link), '_blank');
                                // Track affiliate click
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('last_affiliate_click', JSON.stringify({
                                    recipeId: recipe.id,
                                    timestamp: Date.now(),
                                    source: 'quick-preview-modal'
                                  }));
                                }
                                // A/B Test tracking
                                if (buttonCopy) {
                                  trackButtonClick(buttonCopy.id, 'preview', recipe.name);
                                }
                              }
                            }}
                            className="w-full py-3 px-4 rounded-lg font-bold text-base bg-gradient-to-r from-[#FF9900] to-[#F08804] hover:from-[#F08804] hover:to-[#E07704] text-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 border-2 border-orange-400"
                          >
                            <ShoppingCart size={18} />
                            {buttonCopy?.text || 'Shop Ingredients'} ({ingredientsWithLinks.length} items)
                            {recipeTotalPrice > 0 && (
                              <span className="ml-2 text-sm font-normal opacity-90">
                                • {formatPrice(recipeTotalPrice)}
                              </span>
                            )}
                          </button>
                        )}

                        {/* View Full Recipe */}
                        <Link
                          href={`/recipe/${recipe.id}`}
                          className="w-full py-2 px-4 rounded-lg font-semibold text-sm bg-surface-highlight hover:bg-surface text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 border border-surface-highlight"
                        >
                          View Recipe
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="text-orange-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">
                Personalized Meals Await!
              </h3>
              <p className="text-gray-300 mb-6">
                Create a free account to generate cost-optimized meal plans tailored to your {selectedType.replace('-', ' ')}'s specific needs, age, and health concerns.
              </p>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-8 pt-6 border-t-2 border-orange-500/30">
            <div className="bg-gradient-to-r from-orange-500/20 to-green-900/20 rounded-xl p-6 text-center border border-orange-500/30">
              <h3 className="text-2xl font-bold text-white mb-2">
                Want Personalized Recommendations?
              </h3>
              <p className="text-gray-300 mb-4">
                Create a profile for your {selectedType.replace('-', ' ')} and get meals tailored to their specific needs, age, and health concerns.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all border-3 border-orange-500"
              >
                Create Free Account
                <ArrowRight size={20} />
              </Link>
              <p className="text-xs text-gray-500 mt-3">
                Free forever • No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

