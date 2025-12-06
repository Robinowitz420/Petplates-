# Firebase Migration Guide

## Overview

This guide explains how to migrate from localStorage to Firebase Firestore for custom meal storage. The codebase is already set up with abstraction layers that make this migration straightforward.

## Current Architecture

### Storage Abstraction Layers

We have two abstraction layers that make migration easy:

1. **`lib/utils/customMealStorage.ts`** - localStorage implementation (current)
2. **`lib/utils/customMealStorageFirebase.ts`** - Firebase implementation (ready to use)

Both implement the same API:
- `getCustomMeals(userId, petId)` / `getCustomMealsFirebase(userId, petId, onUpdate)`
- `saveCustomMeal(...)` / `saveCustomMealFirebase(...)`
- `deleteCustomMeal(...)` / `deleteCustomMealFirebase(...)`
- `getCustomMeal(...)` / `getCustomMealFirebase(...)`

### Firebase Configuration

Firebase is already installed and partially configured:
- ✅ `firebase` package installed (v12.6.0)
- ✅ Configuration helper: `lib/utils/firebaseConfig.ts`
- ✅ Uses global variables: `__app_id`, `__firebase_config`, `__initial_auth_token`

## Migration Steps

### Step 1: Set Up Firebase Project

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Get your Firebase config (from Project Settings > General)
4. Set up Firestore security rules (see below)

### Step 2: Add Firebase Config to Your App

Add Firebase config to your HTML (in `app/layout.tsx` or via environment variables):

```typescript
// Option 1: Via script tags (for client-side injection)
<script>
  window.__app_id = 'your-app-id';
  window.__firebase_config = JSON.stringify({
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    // ... other config
  });
</script>
```

Or use environment variables (recommended for Next.js):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APP_ID=your-app-id
```

### Step 3: Update Storage Implementation

**Option A: Switch Entirely to Firebase**

Update `lib/utils/customMealStorage.ts` to use Firebase:

```typescript
// Replace localStorage functions with Firebase versions
export { 
  getCustomMealsFirebase as getCustomMeals,
  saveCustomMealFirebase as saveCustomMeal,
  deleteCustomMealFirebase as deleteCustomMeal,
  getCustomMealFirebase as getCustomMeal
} from './customMealStorageFirebase';
```

**Option B: Hybrid Approach (Recommended for Gradual Migration)**

Keep both implementations and switch based on Firebase availability:

```typescript
// lib/utils/customMealStorage.ts
import { getFirebaseServices } from './firebaseConfig';
import * as FirebaseStorage from './customMealStorageFirebase';
import * as LocalStorage from './customMealStorageLocal'; // Rename current file

export function getCustomMeals(userId: string, petId: string): CustomMeal[] {
  const services = getFirebaseServices();
  if (services) {
    // Use Firebase (with fallback)
    return FirebaseStorage.getCustomMeals(userId, petId);
  }
  // Fallback to localStorage
  return LocalStorage.getCustomMeals(userId, petId);
}
```

### Step 4: Update Components to Use Real-Time Listeners

For real-time updates, update components to use `onSnapshot`:

```typescript
// In app/profile/pet/[id]/custom-meals/page.tsx
import { getCustomMealsFirebase } from '@/lib/utils/customMealStorageFirebase';

useEffect(() => {
  if (!pet || !userId) return;
  
  // Set up real-time listener
  const unsubscribe = getCustomMealsFirebase(userId, pet.id, (meals) => {
    setCustomMeals(meals);
    setLoading(false);
  });
  
  return () => unsubscribe(); // Cleanup on unmount
}, [pet, userId]);
```

### Step 5: Firestore Security Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Custom meals: users can only access their own recipes
    match /artifacts/{appId}/users/{userId}/recipes/{recipeId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pets: users can only access their own pets
    match /artifacts/{appId}/users/{userId}/pets/{petId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Data Structure

### Firestore Collection Path

```
/artifacts/{appId}/users/{userId}/recipes/{recipeId}
```

### Document Structure

Matches `CustomMeal` interface:
```typescript
{
  id: string;              // Firestore document ID
  petId: string;
  userId: string;
  name: string;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  ingredients: Array<{ key: string; grams: number }>;
  analysis: {
    score: number;
    nutrients: Record<string, number>;
    // ... full analysis structure
  }
}
```

## Benefits of Firebase Migration

1. **Real-Time Updates** - Changes sync across devices instantly
2. **Cloud Storage** - Data persists across devices
3. **Scalability** - Handles growth without code changes
4. **Backup** - Automatic backups and recovery
5. **Multi-Device** - Users can access from any device

## Testing Migration

1. **Test with Firebase disabled** - Should fallback to localStorage
2. **Test with Firebase enabled** - Should use Firestore
3. **Test real-time updates** - Open same pet in two tabs, save meal in one, see it appear in other
4. **Test offline** - Firebase handles offline gracefully

## Rollback Plan

If issues arise, you can rollback by:
1. Reverting `customMealStorage.ts` to localStorage implementation
2. All components continue working (same API)
3. No data loss (localStorage still has data)

## Next Steps

After Firebase migration:
1. Migrate pet storage (`lib/utils/petStorage.ts`) using same pattern
2. Add data migration script to move localStorage data to Firestore
3. Remove localStorage fallbacks once stable

