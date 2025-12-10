'use client';

import { useState } from 'react';
import { logMealFed, normalizeIngredientNames } from '@/lib/utils/diversityTracker';

interface FeedingLoggerProps {
  petId: string;
  recipeId: string;
  recipeName: string;
  ingredients: (string | { name?: string; id?: string })[];
  onClose: () => void;
  onLogged?: () => void;
}

export default function FeedingLogger({
  petId,
  recipeId,
  recipeName,
  ingredients,
  onClose,
  onLogged,
}: FeedingLoggerProps) {
  const [fedAt, setFedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [portion, setPortion] = useState<'all' | 'most' | 'some' | 'none'>('all');

  const handleSubmit = () => {
    const entryDate = fedAt ? new Date(fedAt) : new Date();
    logMealFed({
      petId,
      recipeId,
      recipeName,
      ingredients: normalizeIngredientNames(ingredients as any),
      fedAt: entryDate,
    });
    onLogged?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-surface rounded-xl shadow-2xl border border-surface-highlight w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Mark as Fed</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">
            ✕
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Meal</label>
            <div className="text-foreground font-medium">{recipeName}</div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1" htmlFor="fedAt">
              Date / Time
            </label>
            <input
              id="fedAt"
              type="datetime-local"
              value={fedAt}
              onChange={(e) => setFedAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-highlight border border-surface-highlight text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Portion eaten</label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'most', 'some', 'none'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPortion(p)}
                  className={`px-3 py-2 rounded-lg border text-xs ${
                    portion === p
                      ? 'bg-primary-600 text-white border-primary-500'
                      : 'bg-surface-highlight text-gray-300 border-surface-highlight hover:border-gray-500'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-surface-highlight text-gray-300 hover:bg-surface-highlight"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}