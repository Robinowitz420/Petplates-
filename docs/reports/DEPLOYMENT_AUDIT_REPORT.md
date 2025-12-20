# Deployment Audit Report
**Date**: 2025-01-XX
**Status**: ⚠️ **BLOCKERS FOUND** - Fix before deployment

## ✅ Build Status
**PASS** - Build completes successfully with no errors
- Recipe validation passes (170 recipes, 0 toxic ingredients)
- TypeScript compilation successful
- All pages generate correctly

## 🔴 Critical Issues (Must Fix)

### 1. TypeScript Error in Scripts
**File**: `scripts/vet-all-recipes.ts:64`
**Issue**: Using `amazonLink` instead of `asinLink` (property doesn't exist)
```typescript
amazonLink: vetted.amazonLink, // ❌ Should be asinLink
```
**Fix**: Change to `asinLink: vetted.asinLink`

### 2. Debug Telemetry Code in Production
**File**: `app/recipe/[id]/page.tsx`
**Issue**: 4 fetch calls to localhost debug endpoint (lines 563, 1009, 1089, 1100)
```typescript
fetch('http://127.0.0.1:7242/ingest/...') // ❌ Remove before deploy
```
**Fix**: Remove all debug telemetry fetch calls

### 3. Dead Code - CookMode Component
**File**: `app/recipe/[id]/page.tsx:41-238`
**Issue**: Entire CookMode component (197 lines) is unused since "Start Prepping" button was removed
**Fix**: Remove CookMode component, setIsCookMode state, and related imports

### 4. Unused Imports
**File**: `app/recipe/[id]/page.tsx`
**Unused**:
- `RatingBreakdown` (line 26) - imported but never used
- `ChevronsRight` (line 12) - imported but never used  
- `ClipboardList` (line 13) - imported but never used
- `Info` (line 14) - imported but never used
**Fix**: Remove unused imports

## ⚠️ Warnings (Should Fix)

### 5. Next.js Config Deprecation
**Issue**: `eslint` config in `next.config.js` is deprecated
**Fix**: Remove eslint config from next.config.js (Next.js handles this automatically)

### 6. Middleware Deprecation Warning
**Issue**: Middleware file convention is deprecated, should use "proxy"
**Fix**: Review if middleware is needed, consider migration to proxy pattern

### 7. Console.log Statements
**Found in**: 42 files across app/, components/, and lib/
**Recommendation**: Review and remove or convert to logger utility

Key files with console.log:
- `app/recipe/[id]/page.tsx` - Multiple
- `app/profile/pet/[id]/page.tsx` - Multiple
- `lib/utils/mealEstimation.ts`
- `lib/data/vetted-products.ts`
- `lib/applyModifiers.ts`
- `components/MealCompleteView.tsx`

**Action**: Use `lib/utils/logger.ts` instead of console.log for production

## 🗑️ Bloat - Files to Remove/Archive

### Large Backup Files (2.6MB total)
**Location**: `lib/data/`
- `recipes-complete.backup.1764900918887.ts` (545KB)
- `recipes-complete.backup.1764904321022.ts` (547KB)
- `recipes-complete.backup.before-name-migration.ts` (538KB)
- `recipes-complete.backup.ts` (547KB)
- `recipes-complete.meal-images-backup.ts` (539KB)
- `recipes-complete.vetted.ts` (538KB)
- `recipes-complete2.ts` (547KB)

**Recommendation**: Move to archive folder or delete (keep one recent backup)

### Temporary Development Files
- `alignment-tool.html` - Temporary layout tool, can be removed

### Broken/Unused Files
- `app/profile/page.tsx.broken` - Broken file, should be removed

## 📊 Code Quality Issues

### Unused Code Patterns Found
1. **Deprecated functions** with `@deprecated` tags:
   - `lib/utils/purchaseTracking.ts` - `getPurchaseRecords()`, `getVillageLevel()`
   - Still in use or should be removed?

2. **Large utility files** to review:
   - `lib/utils/telemetry.ts` - Check if actually used
   - `lib/utils/abTesting.ts` - Check if actually used
   - `lib/utils/logger.ts` - Should be used instead of console.log

## ✅ What's Good

1. **Build passes** - No compilation errors
2. **Recipe validation** - All 170 recipes valid
3. **Type safety** - TypeScript checking enabled
4. **No critical runtime errors** found in code review

## 📋 Pre-Deployment Checklist

- [ ] Fix TypeScript error in `scripts/vet-all-recipes.ts`
- [ ] Remove debug telemetry fetch calls from `app/recipe/[id]/page.tsx`
- [ ] Remove dead CookMode component code
- [ ] Remove unused imports
- [ ] Review and clean console.log statements
- [ ] Remove or archive backup recipe files
- [ ] Remove temporary files (alignment-tool.html)
- [ ] Fix Next.js config deprecation warnings
- [ ] Test all critical user flows:
  - [ ] Recipe detail page loads
  - [ ] Pet profile creation
  - [ ] Meal plan generation
  - [ ] Shopping list functionality
  - [ ] Cost calculations

## 🚀 Deployment Readiness

**Status**: ❌ **NOT READY**

**Blockers**: 4 critical issues must be fixed
**Warnings**: 7 items should be addressed
**Estimated Fix Time**: 1-2 hours

---

## Recommended Actions

1. **Immediate**: Fix 4 critical issues (30 min)
2. **Before deploy**: Remove console.log statements and clean up (30 min)
3. **Maintenance**: Archive backup files, remove temp files (15 min)

