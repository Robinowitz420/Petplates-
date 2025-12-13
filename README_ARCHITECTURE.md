# 🏗️ Pet Plates Architecture Documentation

## Overview
Pet Plates is a Next.js-based web application for personalized pet meal planning, built with React, TypeScript, Firebase, and Clerk authentication.

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 18, Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand (village store), React hooks
- **Type Safety**: TypeScript 5

### Backend & Services
- **Authentication**: Clerk
- **Database**: Firebase Firestore
- **Storage**: localStorage (offline fallback)
- **API**: Next.js API routes

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Components, Pages, UI)                │
├─────────────────────────────────────────┤
│         Application Layer               │
│  (Hooks, State Management)              │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│  (Utils, Services, Validators)          │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│  (Firestore Service, Storage Utils)     │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│  (Firebase, Clerk, External APIs)       │
└─────────────────────────────────────────┘
```

## Directory Structure

```
pet_plates_meal_platform/
├── app/                          # Next.js app router pages
│   ├── api/                      # API routes
│   ├── profile/                  # User profile & pets
│   │   └── pet/[id]/            # Pet-specific pages
│   │       ├── custom-meals/    # Custom meal management
│   │       ├── meal-plan/       # Weekly meal planning
│   │       ├── recipe-builder/  # Custom meal builder
│   │       └── saved-recipes/   # Saved recipe list
│   └── recipe/[id]/             # Recipe detail pages
├── components/                   # Reusable React components
│   ├── ui/                      # Base UI components
│   ├── ErrorBoundary.tsx        # Error handling
│   └── LoadingSpinner.tsx       # Loading states
├── hooks/                        # Custom React hooks
│   └── useAsyncOperation.ts     # Async operation handler
├── lib/                          # Business logic
│   ├── data/                    # Static data & schemas
│   ├── services/                # External service integrations
│   │   └── firestoreService.ts  # Firestore CRUD operations
│   ├── state/                   # State management
│   ├── utils/                   # Utility functions
│   │   ├── auth.ts              # Authentication helpers
│   │   ├── errorHandler.ts      # Error handling
│   │   ├── firebaseConfig.ts    # Firebase initialization
│   │   ├── petStorage.ts        # Pet data operations
│   │   └── customMealStorage.ts # Meal data operations
│   └── validation/              # Data validation
│       └── petSchema.ts         # Zod schemas
└── public/                       # Static assets
```

## Data Flow

### 1. Authentication Flow
```
User Login → Clerk Auth → userId → Firebase Auth → Firestore Access
```

### 2. Pet Data Flow
```
Component → useAsyncOperation hook → petStorage util → 
firestoreService → Firestore → Response → Update UI
```

### 3. Offline Fallback
```
Network Error → Fallback to localStorage → Read cached data → 
Warn user → Sync on reconnection
```

## Key Features

### 1. Pet Management
- Create, read, update, delete (CRUD) operations
- Multi-name support per pet
- Health concerns tracking
- Breed-specific recommendations

### 2. Meal Planning
- Custom meal builder
- Recipe compatibility scoring
- Weekly meal plan generation
- Ingredient shopping integration

### 3. Data Persistence
- Primary: Firebase Firestore (cloud)
- Fallback: localStorage (offline)
- Auto-migration from localStorage to Firestore

## Security

### Authentication
- Clerk-based user authentication
- Protected routes via middleware
- User-scoped data access

### Firestore Rules
```javascript
// Users can only access their own data
match /artifacts/{appId}/users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

### Data Validation
- Zod schemas for runtime validation
- TypeScript for compile-time safety
- Input sanitization on forms

## Performance Optimizations

### 1. Code Splitting
- Next.js automatic code splitting
- Dynamic imports for heavy components

### 2. Caching
- localStorage for offline access
- Firestore caching enabled
- React memoization (useMemo, useCallback)

### 3. Asset Optimization
- next/image for optimized images
- Lazy loading for off-screen content

## Error Handling

### Levels
1. **Component Level**: Error boundaries
2. **Operation Level**: Try-catch with useAsyncOperation
3. **Global Level**: ErrorBoundary wrapper

### User Feedback
- Toast notifications for operations
- Loading spinners during async operations
- Clear error messages with recovery options

## Testing Strategy

### Unit Tests
- Utility functions
- Validation schemas
- Business logic

### Integration Tests
- API routes
- Database operations
- Authentication flow

### E2E Tests (Planned)
- User workflows
- Critical paths

## Deployment

### Vercel (Current)
- Automatic deployments from main branch
- Preview deployments for PRs
- Environment variables via dashboard

### Firebase
- Firestore database
- Authentication (optional)
- Hosting (alternative to Vercel)

## Environment Variables

Required for production:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
CLERK_SECRET_KEY=xxx
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
# ... see .env.local.example
```

## Known Limitations & Future Improvements

### Current Limitations
1. No real-time collaboration
2. Limited offline support
3. No server-side caching layer
4. Manual image uploads only

### Planned Improvements
1. Real-time meal plan sharing
2. Service worker for full offline mode
3. Redis caching layer
4. Image CDN integration
5. Advanced analytics dashboard

## Scalability Considerations

### Current Scale
- **Users**: Designed for 10k concurrent
- **Requests**: ~100/sec sustained
- **Database**: Firestore (scales automatically)

### Bottlenecks
1. Client-side computation for recipe scoring
2. No CDN for user-generated content
3. Synchronous API calls

### Scale-Up Strategy
1. Move heavy computation to serverless functions
2. Implement Cloudflare CDN
3. Add Redis caching
4. Enable Firestore indexes
5. Implement rate limiting

## Contributing

See CONTRIBUTING.md for development setup and guidelines.

## License

Proprietary - All rights reserved

