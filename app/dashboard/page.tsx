'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Settings, Plus, Utensils, Heart, ArrowRight } from 'lucide-react';

import { getPets } from '@/lib/utils/petStorage';
import AlphabetText from '@/components/AlphabetText';

// --- Data Structures (Based on your other files) ---
interface SavedRecipe {
    id: string; // This MUST be the actual recipe ID (e.g., dog-immune-01)
    name: string;
    dateAdded: string;
}

interface Pet {
    petId: string; // The Firestore document ID for the pet (e.g., pet_176...)
    name: string;
    type: string;
    breed: string;
    age: string;
    healthConcerns: string[];
    savedRecipes: SavedRecipe[]; // Array of recipes saved to this pet
    names?: string[];
    weight?: string | number;
    weightKg?: number;
    dietaryRestrictions?: string[];
    allergies?: string[];
    dislikes?: string[];
}

// --- Pet Dashboard Component ---
export default function DashboardPage() {
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!clerkPublishableKey) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-primary-600">
                Dashboard requires Clerk to be configured.
            </div>
        );
    }

    return <DashboardPageInner />;
}

function DashboardPageInner() {
    const { user, isLoaded: isClerkLoaded } = useUser();
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isClerkLoaded) return;
        const uid = user?.id;
        if (!uid) {
            setPets([]);
            setIsLoading(false);
            return;
        }

        (async () => {
            try {
                const loaded = await getPets(uid);
                const mapped: Pet[] = loaded.map((p: any) => ({
                    petId: p.id,
                    name: (p.names?.[0] || p.name || 'Unnamed Pet') as string,
                    type: (p.type || 'Unknown') as string,
                    breed: (p.breed || 'Mixed') as string,
                    age: (p.age || 'Adult') as string,
                    healthConcerns: Array.isArray(p.healthConcerns) ? p.healthConcerns : [],
                    savedRecipes: Array.isArray(p.savedRecipes)
                        ? (p.savedRecipes as string[]).map((id) => ({ id, name: id, dateAdded: '' }))
                        : [],
                }));
                setPets(mapped);
            } catch (e) {
                console.error('Error loading pets:', e);
                setPets([]);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [isClerkLoaded, user?.id]);

    if (!isClerkLoaded || isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-primary-600">Loading Dashboard...</div>;
    }

    // --- JSX Render ---
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <header className="flex justify-between items-center mb-10 border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900">Your Paws & Plates Dashboard</h1>
                    <button 
                        // Assuming you have an AddPetModal component (not included here)
                        className="flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Pet
                    </button>
                </header>

                <div className="space-y-10">
                    {pets.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-semibold mb-3 text-gray-700">No Pets Found</h2>
                            <p className="text-gray-500 mb-6">Start by adding your first furry (or scaled!) friend.</p>
                            <button 
                                // Placeholder for opening modal
                                className="px-6 py-2 bg-secondary-600 text-white font-medium rounded-lg hover:bg-secondary-700 transition-colors"
                            >
                                Add a Pet Now
                            </button>
                        </div>
                    ) : (
                        // --- Pet List ---
                        pets.map((pet) => (
                            <div key={pet.petId} className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                                <div className="p-6 bg-primary-50 border-b border-primary-100 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-primary-800">
                                        <AlphabetText text={pet.name} size={28} />
                                    </h2>
                                    <div className="text-sm text-primary-600 font-medium">
                                        {pet.breed} • {pet.age}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="flex items-center text-sm font-medium text-gray-700 bg-green-100 px-3 py-1 rounded-full">
                                            <Heart className="w-4 h-4 mr-1 text-green-600" />
                                            Health: {pet.healthConcerns.join(', ') || 'General'}
                                        </span>
                                        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                            Pet ID: {pet.petId}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <Utensils className="w-5 h-5 mr-2 text-secondary-500" />
                                        Saved Recipes ({pet.savedRecipes.length})
                                    </h3>

                                    {pet.savedRecipes.length === 0 ? (
                                        <p className="text-gray-500 italic">No recipes saved yet. Time to go shopping!</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pet.savedRecipes.map((recipe) => (
                                                <div key={recipe.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{recipe.name}</span>
                                                        <span className="text-xs text-gray-500">Added: {new Date(recipe.dateAdded).toLocaleDateString()}</span>
                                                    </div>
                                                    
                                                    <Link
                                                        // === CRITICAL FIX APPLIED HERE ===
                                                        // The link MUST use the recipe.id, NOT the pet.petId.
                                                        href={`/profile/pet/${pet.petId}`}
                                                        className="flex items-center text-sm font-semibold text-secondary-600 hover:text-secondary-800 transition-colors"
                                                    >
                                                        View recommended Meals
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <p className="text-center text-sm text-gray-400 mt-10">
                    User ID: {user?.id}
                </p>

            </div>
        </div>
    );
}