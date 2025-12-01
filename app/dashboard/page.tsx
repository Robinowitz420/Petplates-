'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Settings, Plus, Utensils, Heart, ArrowRight } from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, query, onSnapshot, where } from 'firebase/firestore';

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
}

// Firestore Globals (MUST be used)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Utility to safely retrieve Firebase services
let app: any;
let db: any;
let auth: any;

if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    // setLogLevel('debug'); // Uncomment for debugging
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

// --- Pet Dashboard Component ---
export default function DashboardPage() {
    const { user, isLoaded: isClerkLoaded } = useUser();
    const [pets, setPets] = useState<Pet[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Firebase Auth and Initialization
    useEffect(() => {
        if (!auth) return;

        const setupAuth = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth failed:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUserId(firebaseUser.uid);
            } else {
                setUserId(crypto.randomUUID()); // Anonymous fallback
            }
            setIsAuthReady(true);
        });

        setupAuth();
        return () => unsubscribe();
    }, []);

    // 2. Real-time Pet Data Fetch (Using onSnapshot)
    useEffect(() => {
        if (!isAuthReady || !userId || !db) return;

        // Reference the 'pets' subcollection under the user's private path
        const petCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/pets`);
        
        // Use onSnapshot to listen for real-time changes
        const unsubscribe = onSnapshot(
            petCollectionRef,
            (snapshot) => {
                const fetchedPets: Pet[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    // Ensure savedRecipes is treated as an array, even if empty/missing
                    const savedRecipes = Array.isArray(data.savedRecipes) ? data.savedRecipes : [];

                    fetchedPets.push({
                        petId: doc.id, // Firestore document ID (e.g., pet_176...)
                        name: data.name || 'Unnamed Pet',
                        type: data.type || 'Unknown',
                        breed: data.breed || 'Mixed',
                        age: data.age || 'Adult',
                        healthConcerns: data.healthConcerns || [],
                        savedRecipes: savedRecipes as SavedRecipe[], 
                    });
                });
                setPets(fetchedPets);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching real-time pet data:", error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [isAuthReady, userId]);


    if (!isClerkLoaded || isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-primary-600">Loading Dashboard...</div>;
    }

    // --- JSX Render ---
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <header className="flex justify-between items-center mb-10 border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900">Your Paw & Plate Dashboard</h1>
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
                                    <h2 className="text-2xl font-bold text-primary-800">{pet.name}</h2>
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
                    User ID: {userId}
                </p>

            </div>
        </div>
    );
}