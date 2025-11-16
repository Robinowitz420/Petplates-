'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

// ... existing imports ...

// Add this component inside your recipe page, after the recipe data is loaded:

function SaveToProfileButton({ recipeId, recipeName }: { recipeId: string; recipeName: string }) {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      const storedPets = localStorage.getItem(`pets_${user.id}`);
      if (storedPets) {
        setPets(JSON.parse(storedPets));
      }
    }
  }, [user?.id]);

  const handleSave = (petId: string) => {
    if (!user?.id) return;

    const savedKey = `saved_recipes_${user.id}_${petId}`;
    const existing = localStorage.getItem(savedKey);
    const savedRecipes = existing ? JSON.parse(existing) : [];

    if (!savedRecipes.find((r: any) => r.id === recipeId)) {
      savedRecipes.push({
        id: recipeId,
        name: recipeName,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(savedKey, JSON.stringify(savedRecipes));
      alert(`Saved to ${pets.find((p) => p.id === petId)?.name}'s profile!`);
    }

    setShowModal(false);
  };

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        <Heart className="h-5 w-5" />
        Sign In to Save
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        <Heart className="h-5 w-5" />
        Save to Pet Profile
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Save to which pet?</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pets.length === 0 ? (
                <p className="text-gray-600">No pets yet. Add a pet from your profile!</p>
              ) : (
                pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => handleSave(pet.id)}
                    className="w-full p-4 border-2 rounded-lg hover:border-primary-600 text-left"
                  >
                    <div className="font-semibold">{pet.name}</div>
                    <div className="text-sm text-gray-600">
                      {pet.breed} • {pet.age}
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}