'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CustomMealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;
  const mealId = params.mealId as string;

  useEffect(() => {
    // Redirect to recipe detail page with petId query parameter
    if (mealId && petId) {
      router.replace(`/recipe/${mealId}?petId=${petId}`);
    }
  }, [mealId, petId, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-gray-400">Redirecting...</p>
    </div>
  );
}
