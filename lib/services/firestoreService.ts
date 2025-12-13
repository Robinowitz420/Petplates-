import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { getFirebaseServices, getAppId } from '@/lib/utils/firebaseConfig';
import { Pet, CustomMeal } from '@/lib/types';
import { DatabaseError, ValidationError } from '@/lib/utils/errorHandler';
import { validatePet, validateCustomMeal } from '@/lib/validation/petSchema';

// Helper to get collection ref
const getCollection = (userId: string, collectionName: string) => {
  const services = getFirebaseServices();
  if (!services || !services.db) {
    throw new DatabaseError('Firebase not initialized');
  }
  const appId = getAppId();
  return collection(services.db, `artifacts/${appId}/users/${userId}/${collectionName}`);
};

// --- Pet Operations ---

export async function getPets(userId: string): Promise<Pet[]> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  try {
    const petsRef = getCollection(userId, 'pets');
    const snapshot = await getDocs(petsRef);
    
    const pets = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Pet[];
    
    // Validate each pet
    return pets.map(pet => {
      try {
        return validatePet(pet);
      } catch (e) {
        console.warn('Invalid pet data, skipping:', e);
        return null;
      }
    }).filter(Boolean) as Pet[];
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to fetch pets', error as Error);
  }
}

export async function savePet(userId: string, pet: Pet): Promise<void> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  try {
    // Validate pet data
    const validatedPet = validatePet(pet);
    
    const petsRef = getCollection(userId, 'pets');
    const petDoc = doc(petsRef, validatedPet.id);
    
    // Convert undefined to null (Firestore doesn't accept undefined)
    const safePet = JSON.parse(JSON.stringify(validatedPet));
    
    await setDoc(petDoc, {
      ...safePet,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to save pet', error as Error);
  }
}

export async function deletePet(userId: string, petId: string): Promise<void> {
  const { db } = getFirebaseServices() || {};
  if (!db) return;

  try {
    const petsRef = getCollection(userId, 'pets');
    await deleteDoc(doc(petsRef, petId));
  } catch (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
}

// --- Custom Meal Operations ---

export async function getCustomMeals(userId: string, petId: string): Promise<CustomMeal[]> {
  if (!userId || !petId) {
    throw new ValidationError('User ID and Pet ID are required');
  }

  try {
    const mealsRef = getCollection(userId, 'custom_meals');
    const q = query(mealsRef, where('petId', '==', petId));
    const snapshot = await getDocs(q);
    
    const meals = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as CustomMeal[];
    
    // Validate each meal
    return meals.map(meal => {
      try {
        return validateCustomMeal(meal);
      } catch (e) {
        console.warn('Invalid meal data, skipping:', e);
        return null;
      }
    }).filter(Boolean) as CustomMeal[];
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to fetch custom meals', error as Error);
  }
}

export async function saveCustomMeal(userId: string, meal: CustomMeal): Promise<void> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  try {
    // Validate meal data
    const validatedMeal = validateCustomMeal(meal);
    
    const mealsRef = getCollection(userId, 'custom_meals');
    const mealDoc = doc(mealsRef, validatedMeal.id);
    
    // Convert undefined to null
    const safeMeal = JSON.parse(JSON.stringify(validatedMeal));

    await setDoc(mealDoc, {
      ...safeMeal,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to save custom meal', error as Error);
  }
}

export async function deleteCustomMeal(userId: string, mealId: string): Promise<void> {
  const { db } = getFirebaseServices() || {};
  if (!db) return;

  try {
    const mealsRef = getCollection(userId, 'custom_meals');
    await deleteDoc(doc(mealsRef, mealId));
  } catch (error) {
    console.error('Error deleting custom meal:', error);
    throw error;
  }
}
