'use client';

import { useState } from 'react';
import { ShoppingCart, ExternalLink, CheckCircle } from 'lucide-react';
import { addPurchase } from '@/lib/utils/purchaseTracking';
import { useVillageStore } from '@/lib/state/villageStore';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  asinLink: string;
}

interface ShoppingListProps {
  ingredients: Ingredient[];
  recipeName?: string;
  userId?: string; // Optional userId for purchase tracking
}

export function ShoppingList({ ingredients, recipeName = 'this recipe', userId }: ShoppingListProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [openedCount, setOpenedCount] = useState(0);
  const { refreshFromLocal } = useVillageStore();

  // Get userId from localStorage if not provided
  const getUserId = () => {
    if (userId) return userId;
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('last_user_id') || '';
  };

  const openAllInTabs = async () => {
    setIsOpening(true);
    setOpenedCount(0);
    const currentUserId = getUserId();
    const validIngredients = ingredients.filter(ing => ing.asinLink);

    // Open first tab immediately (user gesture)
    if (validIngredients.length > 0) {
      window.open(validIngredients[0].asinLink, '_blank');
      setOpenedCount(1);
      // Track purchase
      if (currentUserId) {
        addPurchase(currentUserId, validIngredients[0].id || validIngredients[0].name, false, validIngredients[0].name);
        refreshFromLocal(); // Update village store
      }
    }

    // Open remaining tabs with delays using async/await
    for (let i = 1; i < validIngredients.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay
      const newWindow = window.open(validIngredients[i].asinLink, '_blank');
      setOpenedCount(i + 1);
      
      // Track purchase
      if (currentUserId) {
        addPurchase(currentUserId, validIngredients[i].id || validIngredients[i].name, false, validIngredients[i].name);
        refreshFromLocal(); // Update village store
      }
      
      // If popup was blocked, try again with a longer delay
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Wait longer and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.open(validIngredients[i].asinLink, '_blank');
      }
    }

    // Reset state after all tabs are opened
    setTimeout(() => {
      setIsOpening(false);
      setOpenedCount(0);
    }, 1000);
  };

  // Filter to only ingredients with valid ASIN links
  const validIngredients = ingredients.filter(ing => ing && ing.asinLink);
  const totalItems = validIngredients.length;

  if (totalItems === 0) {
    return null;
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
            {totalItems} ingredient{totalItems !== 1 ? 's' : ''} with purchase links for {recipeName}
          </p>
        </div>
      </div>

      {/* Individual Ingredient List */}
      <div className="space-y-2 mb-6 max-h-96 overflow-y-auto pr-2">
        {validIngredients.map((ingredient, index) => (
          <div
            key={ingredient.id || index}
            className="flex items-center justify-between gap-3 p-3 bg-surface-lighter rounded-lg border border-surface-highlight hover:border-gray-500 transition-all duration-200 relative"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="font-medium text-gray-200 truncate">{ingredient.name}</div>
              <div className="text-sm text-gray-400">{ingredient.amount}</div>
            </div>
            
            <a
              href={ingredient.asinLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                // Track purchase when individual "Buy" button is clicked
                const currentUserId = getUserId();
                if (currentUserId) {
                  addPurchase(currentUserId, ingredient.id || ingredient.name, false, ingredient.name);
                  refreshFromLocal(); // Update village store
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#E07704] text-black rounded-lg transition-all duration-200 text-sm font-semibold whitespace-nowrap flex-shrink-0 relative z-10 hover:shadow-md"
            >
              Buy
              <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>

      {/* Buy All Button */}
      <div className="border-t border-surface-highlight pt-6">
        <button
          onClick={openAllInTabs}
          disabled={isOpening}
          className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
            isOpening
              ? 'bg-gray-600 cursor-wait text-gray-300'
              : 'bg-gradient-to-r from-[#FF9900] to-[#F08804] hover:from-[#F08804] hover:to-[#E07704] text-black shadow-lg hover:shadow-xl'
          }`}
        >
          {isOpening ? (
            <span className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Opening...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <ShoppingCart size={20} />
              🛒 Buy All
            </span>
          )}
        </button>

        {/* Helper Text */}
        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              This will open {totalItems} Amazon tabs so you can quickly add all ingredients to your cart
            </span>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Tip:</strong> If your browser blocks pop-ups, click "Always allow" for this site
            </span>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Pro tip:</strong> Click individual "Buy" buttons if you only need certain ingredients
            </span>
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          As an Amazon Associate, we earn from qualifying purchases. 
          Your price stays the same, and you help support Paw & Plate! 🐾
        </p>
      </div>

      {/* Browser Warning (shows if needed) */}
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

// ============================================
// ALTERNATIVE: Simpler Version (Just the Button)
// ============================================
export function BuyAllButton({ ingredients, userId }: { ingredients: Ingredient[]; userId?: string }) {
  const [isOpening, setIsOpening] = useState(false);
  const [openedCount, setOpenedCount] = useState(0);
  const { refreshFromLocal } = useVillageStore();

  // Get userId from localStorage if not provided
  const getUserId = () => {
    if (userId) return userId;
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('last_user_id') || '';
  };

  const openAll = async () => {
    setIsOpening(true);
    setOpenedCount(0);
    const currentUserId = getUserId();
    
    // Open first tab immediately
    if (ingredients.length > 0) {
      window.open(ingredients[0].asinLink, '_blank');
      setOpenedCount(1);
      if (currentUserId) {
        addPurchase(currentUserId, ingredients[0].id || ingredients[0].name, false, ingredients[0].name);
        refreshFromLocal(); // Update village store
      }
    }
    
    // Open remaining tabs with delays
    for (let i = 1; i < ingredients.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      window.open(ingredients[i].asinLink, '_blank');
      setOpenedCount(i + 1);
      if (currentUserId) {
        addPurchase(currentUserId, ingredients[i].id || ingredients[i].name, false, ingredients[i].name);
        refreshFromLocal(); // Update village store
      }
    }
    
    setTimeout(() => {
      setIsOpening(false);
      setOpenedCount(0);
    }, 1000);
  };

  if (ingredients.length === 0) {
    return null;
  }

  return (
    <button
      onClick={openAll}
      disabled={isOpening}
      className="w-full py-3 px-6 bg-[#FF9900] hover:bg-[#F08804] text-green-300 rounded-lg font-bold disabled:bg-gray-600 transition-colors"
    >
      {isOpening ? (
        <span className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Opening...
        </span>
      ) : (
        `🛒 Buy All`
      )}
    </button>
  );
}