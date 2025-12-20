'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { addPurchase } from '@/lib/utils/purchaseTracking';
import { useVillageStore } from '@/lib/state/villageStore';
import { getButtonCopy, trackButtonClick, type ButtonCopyVariant } from '@/lib/utils/abTesting';
import { getProductByIngredient } from '@/lib/data/product-prices';

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

  // Process ingredients - get product data from SINGLE SOURCE OF TRUTH
  const shoppingItems = useMemo(() => {
    return ingredients
      .map(ing => {
        const product = getProductByIngredient(ing.name);
        
        if (!product) return null;
        
        return {
          id: ing.id,
          genericName: product.ingredient,
          recipeAmount: ing.amount,
          packageQuantity: product.quantity || '',
          price: product.price.amount,
          asin: product.asin,
          link: product.url,
        };
      })
      .filter(Boolean) as Array<{
        id: string;
        genericName: string;
        recipeAmount: string;
        packageQuantity: string;
        price: number;
        asin: string;
        link: string;
      }>;
  }, [ingredients]);

  const totalPrice = useMemo(() => {
    return shoppingItems.reduce((sum, item) => sum + item.price, 0);
  }, [shoppingItems]);

  const openAllInTabs = async () => {
    setIsOpening(true);
    setOpenedCount(0);
    const currentUserId = getUserId();

    // Open first tab immediately
    if (shoppingItems.length > 0) {
      window.open(shoppingItems[0].link, '_blank');
      setOpenedCount(1);
      if (currentUserId) {
        addPurchase(currentUserId, shoppingItems[0].id, false, shoppingItems[0].genericName);
        refreshFromLocal();
      }
    }

    // Open remaining tabs with delays
    for (let i = 1; i < shoppingItems.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newWindow = window.open(shoppingItems[i].link, '_blank');
      setOpenedCount(i + 1);
      
      if (currentUserId) {
        addPurchase(currentUserId, shoppingItems[i].id, false, shoppingItems[i].genericName);
        refreshFromLocal();
      }
      
      // Retry if blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.open(shoppingItems[i].link, '_blank');
      }
    }

    setTimeout(() => {
      setIsOpening(false);
      setOpenedCount(0);
    }, 1000);
  };

  if (shoppingItems.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-surface-highlight p-6">
        <p className="text-gray-400">No products available for purchase at this time.</p>
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
            {shoppingItems.length} ingredient{shoppingItems.length !== 1 ? 's' : ''} for {recipeName}
          </p>
        </div>
      </div>

      {/* Individual Ingredient List */}
      <div className="space-y-2 mb-6 max-h-96 overflow-y-auto pr-2">
        {shoppingItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center justify-between gap-3 p-3 bg-surface-lighter rounded-lg border border-surface-highlight hover:border-gray-500 transition-all duration-200"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="font-medium text-gray-200 capitalize">{item.genericName}</div>
              <div className="text-sm text-gray-400">
                Recipe needs: {item.recipeAmount}
              </div>
              <div className="text-xs text-gray-500">
                Package size: {item.packageQuantity}
              </div>
            </div>
            
            {/* Price Display */}
            <div className="text-right mr-3">
              <div className="text-lg font-bold text-orange-400">
                ${item.price.toFixed(2)}
              </div>
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
      </div>

      {/* Buy All Button */}
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
              Opening {openedCount}/{shoppingItems.length}...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart size={20} />
              Buy All ({shoppingItems.length} items)
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
          <span>✓ Supports Paw & Plate</span>
        </div>

        {/* Helper Text */}
        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              Opens {shoppingItems.length} Amazon tabs so you can quickly add all ingredients to your cart
            </span>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Tip:</strong> If your browser blocks pop-ups, click "Always allow" for this site
            </span>
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="mt-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
          <p className="text-xs text-gray-300 text-center leading-relaxed">
            <span className="font-semibold text-green-400">💚 You're supporting independent pet nutrition!</span><br/>
            As an Amazon Associate, we earn a small commission at no extra cost to you.
          </p>
        </div>
      </div>

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