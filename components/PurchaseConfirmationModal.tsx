'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShoppingCart, Sparkles } from 'lucide-react';
import { confirmPurchaseWithDetails } from '@/lib/utils/purchaseTracking';
import { getNextVillageLevel } from '@/lib/data/villageLevels';
import { useVillageStore, useVillageProgress } from '@/lib/state/villageStore';
import { confirmPetPurchase, getPetPurchaseCount } from '@/lib/utils/petPurchaseTracking';
import { checkAllBadges } from '@/lib/utils/badgeChecker';

export interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientId: string;
  ingredientName: string;
  userId?: string;
  amazonOrderId?: string;
  petId?: string; // Optional pet ID for per-pet purchase tracking
}

/**
 * Modal that appears after clicking "Buy" buttons
 * Allows user to confirm purchase manually (fallback)
 * Shows progress toward next village level
 */
export default function PurchaseConfirmationModal({
  isOpen,
  onClose,
  ingredientId,
  ingredientName,
  userId,
  amazonOrderId,
  petId
}: PurchaseConfirmationModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const { refreshFromLocal, setUserId } = useVillageStore();
  const { count, level, progress, nextLevelThreshold, ingredientsRemaining } = useVillageProgress();

  // Get userId from localStorage if not provided
  const getUserId = () => {
    if (userId) return userId;
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('last_user_id') || '';
  };

  useEffect(() => {
    if (isOpen) {
      const currentUserId = getUserId();
      if (currentUserId) {
        setUserId(currentUserId);
        setConfirmed(false);
      }
    }
  }, [isOpen, userId, setUserId]);

  const handleConfirm = async () => {
    const currentUserId = getUserId();
    if (currentUserId) {
      // Confirm global purchase (for village)
      const result = confirmPurchaseWithDetails(currentUserId, ingredientId, ingredientName, amazonOrderId);
      if (result.success) {
        refreshFromLocal(); // Update village store
        
        // Also track per-pet purchase if petId is provided
        if (petId) {
          await confirmPetPurchase(
            currentUserId,
            petId,
            ingredientId,
            ingredientName,
            undefined, // recipeId - not available here
            amazonOrderId
          );
          
          // Check badges for per-pet purchase
          const purchaseCount = getPetPurchaseCount(currentUserId, petId);
          await checkAllBadges(currentUserId, petId, {
            action: 'purchase_confirmed',
            purchaseCount,
          });
        }
        
        setConfirmed(true);
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const nextLevel = level ? getNextVillageLevel(level.id) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Confirm Purchase</h2>
            <p className="text-sm text-gray-600 mt-1">Did you purchase this ingredient?</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Ingredient Info */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <ShoppingCart size={32} className="text-amber-600" />
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{ingredientName}</h3>
                <p className="text-sm text-gray-600">Confirm when you've completed your purchase</p>
              </div>
            </div>
          </div>

          {/* Current Stats */}
          {level && (
            <div className="space-y-4">
              {/* Current Level */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Current Village</span>
                  <span className="text-lg font-bold text-gray-900">{level.name}</span>
                </div>
                <div className="text-xs text-gray-600">
                  Level {level.id} • {count} ingredients purchased
                </div>
              </div>

              {/* Progress to Next Level */}
              {nextLevel && ingredientsRemaining > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={20} className="text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Progress to {nextLevel.name}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-[width] duration-500 ease-out will-change-[width]"
                      style={{ width: `${(progress / 10) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    {ingredientsRemaining} more ingredient{ingredientsRemaining !== 1 ? 's' : ''} to unlock!
                  </div>
                </div>
              )}

              {/* Max Level Reached */}
              {!nextLevel && (
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-900">
                      🎉 Maximum level reached! Your village is complete!
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirmation Message */}
          {confirmed && (
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle size={24} className="text-green-600" />
                <span className="font-semibold text-green-900">
                  Purchase confirmed! Your village is growing! 🎉
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-6 space-y-3 rounded-b-2xl">
          {!confirmed ? (
            <>
              <button
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  Yes, I Purchased This
                </div>
              </button>
              <button
                onClick={handleSkip}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Skip for Now
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          )}

          {/* Helper Text */}
          <p className="text-xs text-gray-500 text-center">
            Confirming purchases helps track your village progress. You can always confirm later!
          </p>
        </div>
      </div>
    </div>
  );
}

