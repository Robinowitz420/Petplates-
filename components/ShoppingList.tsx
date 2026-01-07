'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, CheckCircle, X } from 'lucide-react';
import { addPurchase } from '@/lib/utils/purchaseTracking';
import { useVillageStore } from '@/lib/state/villageStore';
import { getButtonCopy, trackButtonClick, type ButtonCopyVariant } from '@/lib/utils/abTesting';
import { getIngredientDisplayPricing } from '@/lib/data/product-prices';
import { getPackageSize } from '@/lib/data/packageSizes';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { buildAmazonSearchUrl } from '@/lib/utils/purchaseLinks';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  asinLink?: string;
  amazonSearchUrl?: string;
}

interface ShoppingListProps {
  ingredients: Ingredient[];
  recipeName?: string;
  userId?: string;
  selectedIngredients?: Array<{ key: string; grams: number }>;
  totalGrams?: number;
  recommendedServingGrams?: number;
  showHeader?: boolean;
  onRemoveIngredient?: (ingredientId: string) => void;
}

// Helper to get generic ingredient name
function getGenericIngredientName(name: string): string {
  // Remove brand names and product-specific terms
  return name
    .toLowerCase()
    .replace(/freeze[- ]dried/gi, '')
    .replace(/fresh is best/gi, '')
    .replace(/organic/gi, '')
    .replace(/premium/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ShoppingList({ 
  ingredients, 
  userId,
  showHeader = true,
  onRemoveIngredient,
}: ShoppingListProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [openedCount, setOpenedCount] = useState(0);
  const { refreshFromLocal } = useVillageStore();
  
  const [buttonCopy, setButtonCopy] = useState<ButtonCopyVariant | null>(null);
  const [buyAllCopy, setBuyAllCopy] = useState<ButtonCopyVariant | null>(null);
  
  useEffect(() => {
    setButtonCopy(getButtonCopy(false));
    setBuyAllCopy(getButtonCopy(true));
  }, []);

  const getUserId = () => {
    if (userId) return userId;
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('last_user_id') || '';
  };

  const { purchasableItems, unlinkedIngredients } = useMemo(() => {
    const purchasable: Array<{
      id: string;
      genericName: string;
      recipeAmount: string;
      packageQuantity: string;
      price: number;
      pricePerPound: number | null;
      isEstimatedPrice: boolean;
      asin: string | null;
      link: string;
    }> = [];

    const unlinked: Ingredient[] = [];

    for (const ing of ingredients) {
      const normalizedName = getGenericIngredientName(ing.name);
      const pricing = getIngredientDisplayPricing(normalizedName);

      const packageEstimate = getPackageSize(normalizedName);
      const estimatedPrice = Number(packageEstimate?.estimatedCost) || 0;
      const estimatedPounds = (Number(packageEstimate?.typicalSize) || 0) / 453.592;
      const estimatedPricePerPound = estimatedPounds > 0 ? estimatedPrice / estimatedPounds : null;

      const isEstimatedPrice = pricing?.priceSource === 'none' || pricing?.priceSource === 'package' || !(pricing?.packagePrice && pricing.packagePrice > 0);
      const bestPackagePrice = isEstimatedPrice ? estimatedPrice : (pricing.packagePrice as number);
      const bestPricePerPound = isEstimatedPrice ? estimatedPricePerPound : (pricing.pricePerPound || null);
      const bestQuantity = pricing.quantity || '';

      const searchQuery = pricing?.product?.ingredient || ing.name;
      const searchUrl = ing.amazonSearchUrl || ensureSellerId(buildAmazonSearchUrl(searchQuery));

      if (!searchUrl) {
        unlinked.push(ing);
        continue;
      }

      purchasable.push({
        id: ing.id,
        genericName: pricing?.product?.ingredient || ing.name,
        recipeAmount: ing.amount,
        packageQuantity: bestQuantity,
        price: bestPackagePrice,
        pricePerPound: bestPricePerPound,
        isEstimatedPrice,
        asin: pricing?.product?.asin || null,
        link: searchUrl,
      });
    }

    return { purchasableItems: purchasable, unlinkedIngredients: unlinked };
  }, [ingredients]);

  const totalPrice = useMemo(() => {
    return purchasableItems.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }, [purchasableItems]);

  const openAllInTabs = async () => {
    setIsOpening(true);
    setOpenedCount(0);
    const currentUserId = getUserId();

    // Open first tab immediately
    if (purchasableItems.length > 0) {
      window.open(purchasableItems[0].link, '_blank');
      setOpenedCount(1);
      if (currentUserId) {
        addPurchase(currentUserId, purchasableItems[0].id, false, purchasableItems[0].genericName);
        refreshFromLocal();
      }
    }

    // Open remaining tabs with delays
    for (let i = 1; i < purchasableItems.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newWindow = window.open(purchasableItems[i].link, '_blank');
      setOpenedCount(i + 1);
      
      if (currentUserId) {
        addPurchase(currentUserId, purchasableItems[i].id, false, purchasableItems[i].genericName);
        refreshFromLocal();
      }
      
      // Retry if blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.open(purchasableItems[i].link, '_blank');
      }
    }

    setTimeout(() => {
      setIsOpening(false);
      setOpenedCount(0);
    }, 1000);
  };

  if (purchasableItems.length === 0 && unlinkedIngredients.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-surface-highlight p-6">
        <p className="text-gray-400">No ingredients available.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-surface-highlight p-6">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart size={24} />
              Shopping List
            </h3>
          </div>
        </div>
      )}

      {/* Individual Ingredient List */}
      <div className="space-y-2 mb-6 max-h-96 overflow-y-auto pr-2">
        {purchasableItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center justify-between gap-3 p-3 bg-surface-lighter rounded-lg border border-surface-highlight hover:border-gray-500 transition-all duration-200"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="font-medium text-gray-200 capitalize">{item.genericName}</div>
              <div className="text-sm text-gray-400">
                Recipe needs: {item.recipeAmount}
              </div>
            </div>
            
            {/* Price Display */}
            <div className="text-right mr-3">
              <div className="text-lg font-bold text-orange-400">
                ${item.price.toFixed(2)}<span className="text-xs font-semibold text-gray-400"> est.</span>
              </div>
              {typeof item.pricePerPound === 'number' && Number.isFinite(item.pricePerPound) && item.pricePerPound > 0 && (
                <div className="text-xs text-gray-500">${item.pricePerPound.toFixed(2)}/lb</div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-1">
              {typeof onRemoveIngredient === 'function' ? (
                <button
                  type="button"
                  onClick={() => onRemoveIngredient(item.id)}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-700/40 bg-red-900/20 text-red-200 hover:bg-red-900/30 transition-colors duration-200 text-sm font-semibold whitespace-nowrap"
                  aria-label={`Remove ${item.genericName}`}
                >
                  <X size={16} />
                  Remove
                </button>
              ) : null}
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const currentUserId = getUserId();
                  if (currentUserId) {
                    addPurchase(currentUserId, item.id, false, item.genericName);
                    refreshFromLocal();
                  }
                  if (buttonCopy) {
                    trackButtonClick(buttonCopy.id, 'individual', item.genericName);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#E07704] text-black rounded-lg transition-colors duration-200 text-sm font-semibold whitespace-nowrap"
              >
                <ShoppingCart size={16} />
                {buttonCopy?.text || 'Buy'}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Buy All Button */}
      {purchasableItems.length > 0 && (
        <div className="border-t border-surface-highlight pt-6">
          <button
            onClick={() => {
              openAllInTabs();
              if (buyAllCopy) {
                trackButtonClick(buyAllCopy.id, 'buy-all');
              }
            }}
            disabled={isOpening}
            className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-colors ${
              isOpening
                ? 'bg-gray-600 cursor-wait text-gray-300'
                : 'bg-[#FF9900] hover:bg-[#E07704] text-black'
            }`}
          >
            {isOpening ? (
              <span className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Opening {openedCount}/{purchasableItems.length}...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart size={20} />
                Buy All ({purchasableItems.length} items)
                {totalPrice > 0 && (
                  <span className="ml-2 text-xl font-bold">
                    • ${totalPrice.toFixed(2)}
                  </span>
                )}
              </span>
            )}
          </button>
          
          {/* Value Prop */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>✓ Prime eligible</span>
            <span>✓ Free returns</span>
            <span>✓ Supports Paws & Plates</span>
          </div>
          
          {/* Affiliate Disclosure */}
          <div className="mt-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-xs text-gray-300 text-center leading-relaxed">
              <span className="font-semibold text-green-400">💚 You're supporting independent pet nutrition!</span><br/>
              As an Amazon Associate, we earn a small commission at no extra cost to you.
            </p>
          </div>
        </div>
      )}

      {/* Browser Warning */}
      {isOpening && (
        <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>Browser blocking pop-ups?</strong> Look for a blocked pop-up icon in your address bar 
            and click "Always allow pop-ups from this site"
          </p>
        </div>
      )}
    </div>
  );
}