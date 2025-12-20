'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { addPurchase } from '@/lib/utils/purchaseTracking';
import { useVillageStore } from '@/lib/state/villageStore';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';
import { getProductPrice } from '@/lib/data/product-prices';
import { calculateMealsFromShoppingList } from '@/lib/utils/mealCalculator';

// Format price for display
const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
};

interface CheckoutItem {
  id: string;
  name: string;
  asinLink: string;
  amount?: string;
  asin?: string;
}

interface OneClickCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  recipeName?: string;
  userId?: string; // Optional userId for purchase tracking
  // Optional props for meal calculation
  selectedIngredients?: Array<{ key: string; grams: number }>;
  totalGrams?: number;
  recommendedServingGrams?: number;
}

export default function OneClickCheckoutModal({
  isOpen,
  onClose,
  items,
  recipeName = 'Recipe',
  userId,
  selectedIngredients,
  totalGrams,
  recommendedServingGrams
}: OneClickCheckoutModalProps) {
  // Get userId from localStorage if not provided
  const getUserId = () => {
    if (userId) return userId;
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('last_user_id') || '';
  };
  const { refreshFromLocal } = useVillageStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [mode, setMode] = useState<'manual' | 'auto' | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setAddedItems(new Set());
      setIsAdding(false);
      setMode(null);
    }
  }, [isOpen]);

  // Helper to extract ASIN from URL
  const extractASIN = (url: string): string | undefined => {
    // Try /dp/ASIN pattern
    const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    if (dpMatch) return dpMatch[1];
    
    // Try /gp/product/ASIN pattern
    const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/);
    if (gpMatch) return gpMatch[1];
    
    // Try ASIN parameter
    const asinParam = new URL(url).searchParams.get('ASIN');
    if (asinParam) return asinParam;
    
    return undefined;
  };

  // Add item via hidden iframe (most reliable method)
  const addItemViaIframe = async (item: CheckoutItem, index: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const currentUserId = getUserId();
      
      // Track purchase when item is added (pending confirmation)
      if (currentUserId) {
        addPurchase(currentUserId, item.id || item.name, false, item.name);
        refreshFromLocal(); // Update village store
      }
      
      // Extract ASIN from URL if available
      let asin = item.asin;
      if (!asin && item.asinLink) {
        asin = extractASIN(item.asinLink);
      }

      if (asin) {
        // Use Amazon's add-to-cart API
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;top:-10000px;left:-10000px;width:1px;height:1px;opacity:0;pointer-events:none;';
        iframe.src = `https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=1&tag=robinfrench-20`;
        
        iframe.onload = () => {
          setTimeout(() => {
            try {
              document.body.removeChild(iframe);
            } catch (e) {
              // Iframe might already be removed
            }
            resolve(true);
          }, 1500);
        };
        
        iframe.onerror = () => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {}
          resolve(false);
        };
        
        document.body.appendChild(iframe);
      } else {
        // Fallback: open in new tab (ensure seller ID)
        window.open(ensureSellerId(item.asinLink), '_blank');
        resolve(true);
      }
    });
  };

  // Add next item manually
  const addNextItem = async () => {
    if (currentStep >= items.length || isAdding) return;
    
    setIsAdding(true);
    const item = items[currentStep];
    
    const success = await addItemViaIframe(item, currentStep);
    
    if (success) {
      setAddedItems(new Set([...addedItems, currentStep]));
      setCurrentStep(currentStep + 1);
    }
    
    setIsAdding(false);
  };

  // Add all items automatically
  const addAllAutomatically = async () => {
    if (isAdding) return;
    
    setMode('auto');
    setIsAdding(true);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setCurrentStep(i);
      
      await addItemViaIframe(item, i);
      setAddedItems(new Set([...addedItems, i]));
      
      // Wait between items to avoid rate limiting
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setIsAdding(false);
    setCurrentStep(items.length);
  };

  // Open all in new tabs (manual method)
  const openAllInTabs = () => {
    setMode('manual');
    const currentUserId = getUserId();
    items.forEach((item, index) => {
      setTimeout(() => {
        window.open(ensureSellerId(item.asinLink), '_blank');
        // Track purchase when item is opened
        if (currentUserId) {
          addPurchase(currentUserId, item.id || item.name, false, item.name);
        }
        setAddedItems(new Set([...addedItems, index]));
      }, index * 500); // Stagger opens
    });
    if (currentUserId) {
      refreshFromLocal(); // Update village store after all items
    }
    setCurrentStep(items.length);
  };

  if (!isOpen) return null;

  // Safety check for empty items
  if (items.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl shadow-2xl border border-surface-highlight max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">No Items Available</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-400 mb-4">This recipe doesn't have any ingredients with purchase links.</p>
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = getProductPrice(item.name);
      if (typeof price === 'number') return sum + price;
      return sum;
    }, 0);
  }, [items]);

  // Calculate how many meals this shopping list will provide
  const mealsCount = useMemo(() => {
    if (selectedIngredients && totalGrams && recommendedServingGrams) {
      return calculateMealsFromShoppingList(
        items.map(item => ({ id: item.id, name: item.name, amount: item.amount || '' })),
        selectedIngredients,
        totalGrams,
        recommendedServingGrams
      );
    }
    return null;
  }, [items, selectedIngredients, totalGrams, recommendedServingGrams]);

  const progress = (currentStep / items.length) * 100;
  const allAdded = currentStep >= items.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl border border-surface-highlight max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-surface-highlight p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">One-Click Shopping</h2>
            <p className="text-sm text-gray-400 mt-1">Add all ingredients to your Amazon cart</p>
            {mealsCount !== null && mealsCount > 0 && (
              <p className="text-sm text-orange-400 font-semibold mt-1">
                This shopping list will provide approximately <strong>{mealsCount} meal{mealsCount !== 1 ? 's' : ''}</strong>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">
              {currentStep} of {items.length} items
            </span>
            <span className="text-sm font-medium text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-surface-highlight rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="px-6 py-4 space-y-2 max-h-96 overflow-y-auto">
          {items.map((item, index) => {
            const isAdded = addedItems.has(index);
            const isCurrent = index === currentStep && isAdding;
            
            return (
              <div
                key={item.id || index}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  isAdded
                    ? 'bg-green-900/20 border-green-500/50'
                    : isCurrent
                    ? 'bg-blue-900/20 border-blue-500/50'
                    : 'bg-surface-lighter border-surface-highlight'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-200">{item.name}</div>
                  {item.amount && (
                    <div className="text-sm text-gray-400">{item.amount}</div>
                  )}
                </div>
                {/* Price Display */}
                {(() => {
                  const price = getProductPrice(item.name);
                  return price ? (
                    <div className="text-right mr-3">
                      <div className="text-lg font-bold text-orange-400">{formatPrice(price)}</div>
                    </div>
                  ) : null;
                })()}
                <div className="flex items-center gap-3">
                  {isAdded ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <Check size={20} />
                      <span className="text-sm font-medium">Added</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="flex items-center gap-2 text-blue-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-sm font-medium">Adding...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCurrentStep(index);
                        addItemViaIframe(item, index).then(success => {
                          if (success) {
                            setAddedItems(new Set([...addedItems, index]));
                          }
                        });
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                      disabled={isAdding}
                    >
                      Add Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-surface border-t border-surface-highlight p-6 space-y-3">
          {!allAdded && (
            <div className="flex gap-3">
              <button
                onClick={addNextItem}
                disabled={isAdding || currentStep >= items.length}
                className="flex-1 bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdding && mode === null ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add Next Item
                  </>
                )}
              </button>

              <button
                onClick={addAllAutomatically}
                disabled={isAdding}
                className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdding && mode === 'auto' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Adding All...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add All Automatically
                  </>
                )}
              </button>
            </div>
          )}

          {allAdded && (
            <a
              href="https://www.amazon.com/gp/cart/view.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Go to Amazon Cart ({items.length} items)
              {totalPrice > 0 && (
                <span className="ml-2 text-xl font-bold">
                  • {formatPrice(totalPrice)}
                </span>
              )}
            </a>
          )}

          {/* Alternative: Open all in tabs */}
          {!allAdded && (
            <button
              onClick={openAllInTabs}
              className="w-full text-gray-400 hover:text-gray-300 font-medium py-2 text-sm transition-colors"
            >
              Or open all links in new tabs (manual)
            </button>
          )}

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <p className="text-sm text-blue-300 font-medium mb-2">How this works:</p>
            <ol className="text-xs text-blue-200 space-y-1 list-decimal list-inside">
              <li>We add each item to your Amazon cart one by one</li>
              <li>This happens in the background (you may see tabs open/close)</li>
              <li>When complete, click "Go to Amazon Cart" to checkout</li>
            </ol>
          </div>
        </div>
      </div>

    </div>
  );
}