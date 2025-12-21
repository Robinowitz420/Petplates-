'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { addPurchase } from '@/lib/utils/purchaseTracking';
import { useVillageStore } from '@/lib/state/villageStore';
import { getButtonCopy, trackButtonClick, type ButtonCopyVariant } from '@/lib/utils/abTesting';
import { getProductByIngredient } from '@/lib/data/product-prices';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  asinLink?: string;
}

interface ShoppingListProps {
  ingredients: Ingredient[];
  recipeName?: string;
  userId?: string;
  selectedIngredients?: Array<{ key: string; grams: number }>;
  totalGrams?: number;
  recommendedServingGrams?: number;
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

// Helper to find product data
function getProductData(ingredientName: string) {
  const genericName = getGenericIngredientName(ingredientName);
  
  // Try exact match first
  let product = getProductByIngredient(genericName);
  
  // Try partial match if exact fails
  if (!product) {
    product = getProductByIngredient(genericName);
  }
  
  return product;
}

export function ShoppingList({ 
  ingredients, 
  recipeName = 'this recipe', 
  userId
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
      price: number | null;
      asin: string | null;
      link: string;
    }> = [];

    const unlinked: Ingredient[] = [];

    for (const ing of ingredients) {
      const product = getProductByIngredient(ing.name) || getProductData(ing.name);

      if (product) {
        const link = product.asin
          ? ensureSellerId(`https://www.amazon.com/dp/${product.asin}`)
          : ensureSellerId(product.url);

        purchasable.push({
          id: ing.id,
          genericName: product.ingredient,
          recipeAmount: ing.amount,
          packageQuantity: product.quantity || '',
          price: typeof product.price?.amount === 'number' ? product.price.amount : null,
          asin: product.asin || null,
          link,
        });
        continue;
      }

      if (ing.asinLink) {
        purchasable.push({
          id: ing.id,
          genericName: ing.name,
          recipeAmount: ing.amount,
          packageQuantity: '',
          price: null,
          asin: null,
          link: ensureSellerId(ing.asinLink),
        });
        continue;
      }

      unlinked.push(ing);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart size={24} />
            Shopping List
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {purchasableItems.length > 0 ? (
              <>
                {purchasableItems.length} ingredient{purchasableItems.length !== 1 ? 's' : ''} with purchase links
                {unlinkedIngredients.length > 0 && (
                  <>, {unlinkedIngredients.length} without links</>
                )}
              </>
            ) : (
              <>
                {unlinkedIngredients.length} ingredient{unlinkedIngredients.length !== 1 ? 's' : ''} (no purchase links available)
              </>
            )}{' '}
            for {recipeName}
          </p>
        </div>
      </div>

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
              {item.packageQuantity && (
                <div className="text-xs text-gray-500">
                  Package size: {item.packageQuantity}
                </div>
              )}
            </div>
            
            {/* Price Display */}
            <div className="text-right mr-3">
              {item.price !== null ? (
                <div className="text-lg font-bold text-orange-400">
                  ${item.price.toFixed(2)}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">Price unavailable</div>
              )}
            </div>
            
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
        ))}

        {unlinkedIngredients.map((ingredient, index) => (
          <div
            key={`${ingredient.id || 'no-id'}-${ingredient.name || 'unnamed'}-${index}-unlinked`}
            className="flex items-center justify-between gap-3 p-3 bg-surface-lighter rounded-lg border border-surface-highlight/50 opacity-75"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="font-medium text-gray-300 truncate">{ingredient.name}</div>
              <div className="text-sm text-gray-500">{ingredient.amount || 'Amount not specified'}</div>
            </div>
            
            <div className="text-right mr-3">
              <div className="text-sm text-gray-500 italic">No purchase link available</div>
            </div>
            
            <div className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-semibold whitespace-nowrap cursor-not-allowed">
              Unavailable
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