# Affiliate System Architecture

Complete architecture overview of the affiliate/purchase link system.

## Overview

The affiliate system ensures all Amazon purchase links include the seller ID (`robinfrench-20`) and point to specific vetted products. The system operates at multiple levels:

1. **Data Layer**: Vetted products with pre-configured affiliate links
2. **Utility Layer**: Functions to ensure seller IDs are always present
3. **Component Layer**: React components that use affiliate links
4. **Validation Layer**: Automated scripts to verify compliance

## Architecture Diagram

\`\`\`mermaid
graph TD
    A[Recipe Data] -->|Ingredients| B[Vetted Products DB]
    B -->|asinLink with seller ID| C[Affiliate Utilities]
    C -->|ensureSellerId| D[Components]
    D -->|User Click| E[Amazon with seller ID]
    
    F[Cart URLs] -->|ensureCartUrlSellerId| C
    G[Runtime Code] -->|Uses utilities| C
    
    H[Audit Scripts] -->|Validates| B
    H -->|Checks| G
    I[Tests] -->|Tests| C
    I -->|Validates| B
\`\`\`

## Data Flow

### 1. Recipe to Purchase Link

```
Recipe (recipes-complete.ts)
  ↓
Ingredient Name
  ↓
getVettedProduct(ingredientName)
  ↓
VettedProduct { asinLink: "https://amazon.com/dp/ASIN?tag=robinfrench-20" }
  ↓
ensureSellerId(asinLink) // Safety check
  ↓
Component renders link
  ↓
User clicks → Amazon with seller ID
```

### 2. Cart URL Generation

```
Multiple Ingredients
  ↓
Extract ASINs from vetted products
  ↓
Build cart URL: /gp/aws/cart/add.html?ASIN.1=...&ASIN.2=...
  ↓
ensureCartUrlSellerId(cartUrl)
  ↓
Cart URL with AssociateTag=robinfrench-20
  ↓
User clicks → Amazon cart with seller ID
```

## Key Components

### 1. Vetted Products (`lib/data/vetted-products.ts`)

**Purpose**: Centralized database of vetted products with affiliate links.

**Structure**:
```typescript
export const VETTED_PRODUCTS: Record<string, VettedProduct> = {
  'ground chicken': {
    productName: 'Fresh Is Best Freeze Dried Chicken Breast',
    asinLink: 'https://www.amazon.com/dp/B0BXZVFN6G?tag=robinfrench-20',
    vetNote: 'High-quality, human-grade chicken...',
    category: 'Meat',
    commissionRate: 0.03
  },
  // ... 289 entries
};
```

**Key Properties**:
- `asinLink`: Direct product link with seller ID
- `productName`: Specific branded product name
- `vetNote`: Why this product was chosen
- `category`: For shopping list grouping

**Validation**:
- All links must include `tag=robinfrench-20`
- All links must use specific ASIN format (`/dp/ASIN`)
- No generic search URLs allowed

### 2. Affiliate Utilities (`lib/utils/affiliateLinks.ts`)

**Purpose**: Runtime functions to ensure seller IDs are always present.

**Key Functions**:
- `ensureSellerId()`: Adds/replaces seller ID in product links
- `ensureCartUrlSellerId()`: Adds seller ID to cart URLs
- `extractASIN()`: Extracts ASIN from URLs
- `hasSellerId()`: Validates seller ID presence

**Why Needed**:
Even though vetted products have seller IDs, the utilities provide:
- Runtime safety (catches any missing IDs)
- URL normalization
- Support for dynamically generated links

### 3. Component Integration

**Components Using Affiliate Links**:
1. `ShoppingList.tsx` - Individual ingredient purchase
2. `OneClickCheckoutModal.tsx` - Bulk purchase modal
3. `MultiPetShoppingModal.tsx` - Multi-pet shopping
4. `QuickPreviewModal.tsx` - Quick recipe preview
5. `MealCompleteView.tsx` - Meal completion view
6. `MealCompositionList.tsx` - Ingredient list
7. `app/recipe/[id]/page.tsx` - Recipe detail page
8. `app/profile/page.tsx` - Profile page shopping
9. `app/profile/pet/[id]/meal-plan/page.tsx` - Meal plan shopping

**Pattern Used**:
```typescript
import { ensureSellerId, ensureCartUrlSellerId } from '@/lib/utils/affiliateLinks';

// Product links
<a href={ensureSellerId(ingredient.asinLink)}>Buy</a>
window.open(ensureSellerId(item.asinLink), '_blank');

// Cart URLs
const cartUrl = ensureCartUrlSellerId(`https://amazon.com/gp/aws/cart/add.html?...`);
window.open(cartUrl, '_blank');
```

### 4. Validation Layer

**Scripts**:
1. `scripts/validate-affiliate-links.ts` - Quick validation (CI/CD)
2. `scripts/audit-all-purchase-links.ts` - Comprehensive audit
3. `scripts/check-link-health.ts` - Optional health checking

**Tests**:
1. `lib/utils/__tests__/affiliateLinks.test.ts` - Utility tests
2. `lib/data/__tests__/vetted-products.test.ts` - Data validation

## Seller ID Propagation

### Product Links
- Use `tag=robinfrench-20` parameter
- Format: `https://amazon.com/dp/ASIN?tag=robinfrench-20`

### Cart Links
- Use `AssociateTag=robinfrench-20` parameter
- Format: `https://amazon.com/gp/aws/cart/add.html?...&AssociateTag=robinfrench-20`

**Why Different?**
- Amazon uses `tag=` for product links
- Amazon uses `AssociateTag=` for cart/API URLs
- Both achieve the same result (affiliate attribution)

## Error Handling Strategy

### Runtime Errors
- Functions return empty string for invalid inputs
- Malformed URLs handled with fallback string manipulation
- No exceptions thrown (fail gracefully)

### Validation Errors
- Audit scripts exit with error code if issues found
- CI/CD can fail builds on validation failures
- Reports generated for manual review

### Missing Seller IDs
- Runtime utilities add seller ID automatically
- Audit scripts detect and report missing IDs
- Tests verify all links have seller IDs

## URL Format Differences

### Product URLs
```
https://www.amazon.com/dp/B0123456789?tag=robinfrench-20
https://www.amazon.com/gp/product/B0123456789?tag=robinfrench-20
```

### Cart URLs
```
https://www.amazon.com/gp/aws/cart/add.html?
  ASIN.1=B0123456789&
  Quantity.1=1&
  ASIN.2=B0987654321&
  Quantity.2=1&
  AssociateTag=robinfrench-20
```

### Generic Search URLs (NOT ALLOWED)
```
❌ https://www.amazon.com/s?k=chicken+breast&tag=robinfrench-20
```

## Integration Points

### Recipe System
- Recipes reference ingredient names (generic)
- `applyModifiers()` maps to vetted products
- Vetted products provide specific branded links

### Shopping System
- Multiple components generate shopping lists
- All use vetted products for consistency
- Cart URLs generated for bulk purchases

### Purchase Tracking
- Links tracked when clicked
- Seller ID ensures proper attribution
- Analytics can verify affiliate conversions

## Security Considerations

- Seller ID is public (affiliate links are public)
- No sensitive data in URLs
- URLs validated before use
- No user input directly in URLs (always from vetted products)

## Performance

- Utilities are lightweight (string manipulation)
- No network calls in utilities
- Vetted products loaded once at startup
- No performance impact on page load

## Future Enhancements

1. **Health Checking**: Optional HTTP validation of ASINs
2. **Analytics**: Track which links get clicked
3. **A/B Testing**: Test different product recommendations
4. **Multi-vendor**: Support for Chewy, Petco, etc.

## See Also

- [API Reference](./AFFILIATE_API_REFERENCE.md) - Complete function documentation
- [Developer Guide](./AFFILIATE_DEVELOPER_GUIDE.md) - How to use the system
- [Monitoring Guide](./AFFILIATE_MONITORING.md) - Maintenance procedures

