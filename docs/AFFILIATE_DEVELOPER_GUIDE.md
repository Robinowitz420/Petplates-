# Affiliate System Developer Guide

How-to guide for working with the affiliate link system.

## Table of Contents

1. [Adding New Vetted Products](#adding-new-vetted-products)
2. [Using Affiliate Link Utilities](#using-affiliate-link-utilities)
3. [Component Integration](#component-integration)
4. [Best Practices](#best-practices)
5. [Testing Guidelines](#testing-guidelines)
6. [Common Pitfalls](#common-pitfalls)
7. [Troubleshooting](#troubleshooting)

## Adding New Vetted Products

### Step 1: Find the Product

1. Search Amazon for the specific branded product
2. Get the ASIN (10-character code from product URL)
3. Verify it's the correct product (check brand, size, etc.)

### Step 2: Get the Direct Link

Use the format:
```
https://www.amazon.com/dp/ASIN?tag=robinfrench-20
```

Replace `ASIN` with the actual 10-character ASIN.

### Step 3: Add to vetted-products.ts

```typescript
// lib/data/vetted-products.ts
export const VETTED_PRODUCTS: Record<string, VettedProduct> = {
  // ... existing entries ...
  
  'ingredient-name': {
    productName: 'Brand Name Product Name',
    asinLink: 'https://www.amazon.com/dp/B0123456789?tag=robinfrench-20',
    vetNote: 'Why this product was chosen (quality, brand, etc.)',
    category: 'Meat', // or 'Supplement', 'Carb', 'Vegetable', etc.
    commissionRate: 0.03 // Amazon commission rate
  },
};
```

### Step 4: Verify

Run validation:
```bash
npm run validate:links
```

Run tests:
```bash
npm test -- lib/data/__tests__/vetted-products.test.ts
```

### Important Notes

- Always use `/dp/ASIN` format (not `/gp/product/ASIN` or search URLs)
- Always include `?tag=robinfrench-20` in the link
- Use specific branded products (not generic searches)
- Provide clear vetNote explaining why this product was chosen

## Using Affiliate Link Utilities

### Basic Usage

```typescript
import { ensureSellerId, ensureCartUrlSellerId } from '@/lib/utils/affiliateLinks';

// For product links
const safeLink = ensureSellerId(ingredient.asinLink);

// For cart URLs
const safeCartUrl = ensureCartUrlSellerId(cartUrl);
```

### In Components

```typescript
// JSX
<a href={ensureSellerId(ingredient.asinLink)} target="_blank">
  Buy Now
</a>

// Event handlers
const handleClick = () => {
  window.open(ensureSellerId(item.asinLink), '_blank');
};

// Cart URLs
const handleBuyAll = () => {
  const cartUrl = ensureCartUrlSellerId(
    `https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`
  );
  window.open(cartUrl, '_blank');
};
```

### When to Use Which Function

**`ensureSellerId()`** - Use for:
- Individual product links
- Links in `<a>` tags
- Links opened with `window.open()`
- Any standard Amazon product URL

**`ensureCartUrlSellerId()`** - Use for:
- Amazon cart URLs (`/gp/aws/cart/add.html`)
- Bulk purchase links
- Multi-item cart operations

## Component Integration

### Pattern 1: Direct Link

```typescript
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

function IngredientLink({ ingredient }: { ingredient: Ingredient }) {
  return (
    <a 
      href={ensureSellerId(ingredient.asinLink)} 
      target="_blank"
      rel="noopener noreferrer"
    >
      Buy {ingredient.name}
    </a>
  );
}
```

### Pattern 2: Button with Click Handler

```typescript
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

function BuyButton({ item }: { item: Item }) {
  const handleClick = () => {
    window.open(ensureSellerId(item.asinLink), '_blank');
    // Track purchase
    trackPurchase(item.id);
  };
  
  return <button onClick={handleClick}>Buy</button>;
}
```

### Pattern 3: Cart URL Generation

```typescript
import { ensureCartUrlSellerId } from '@/lib/utils/affiliateLinks';
import { extractASIN } from '@/lib/utils/affiliateLinks';

function BuyAllButton({ ingredients }: { ingredients: Ingredient[] }) {
  const handleBuyAll = () => {
    const cartItems = ingredients
      .map((ing, idx) => {
        const asin = extractASIN(ing.asinLink);
        if (asin) {
          return `ASIN.${idx + 1}=${asin}&Quantity.${idx + 1}=1`;
        }
        return null;
      })
      .filter(Boolean);
    
    if (cartItems.length > 0) {
      const cartUrl = ensureCartUrlSellerId(
        `https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`
      );
      window.open(cartUrl, '_blank');
    }
  };
  
  return <button onClick={handleBuyAll}>Buy All</button>;
}
```

### Pattern 4: Using Vetted Products

```typescript
import { getVettedProduct } from '@/lib/data/vetted-products';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

function IngredientCard({ ingredientName }: { ingredientName: string }) {
  const vettedProduct = getVettedProduct(ingredientName);
  
  if (!vettedProduct) {
    return <div>Product not available</div>;
  }
  
  return (
    <a href={ensureSellerId(vettedProduct.asinLink)} target="_blank">
      Buy {vettedProduct.productName}
    </a>
  );
}
```

## Best Practices

### ✅ DO

1. **Always use utility functions**
   ```typescript
   // ✅ Good
   <a href={ensureSellerId(link)}>Buy</a>
   
   // ❌ Bad
   <a href={link}>Buy</a>
   ```

2. **Use correct function for URL type**
   ```typescript
   // ✅ Good - Product link
   ensureSellerId(productLink)
   
   // ✅ Good - Cart URL
   ensureCartUrlSellerId(cartUrl)
   ```

3. **Handle missing links gracefully**
   ```typescript
   // ✅ Good
   {ingredient.asinLink && (
     <a href={ensureSellerId(ingredient.asinLink)}>Buy</a>
   )}
   ```

4. **Use vetted products when available**
   ```typescript
   // ✅ Good
   const product = getVettedProduct(ingredientName);
   if (product) {
     // Use product.asinLink
   }
   ```

5. **Test your changes**
   ```bash
   npm run validate:links
   npm test
   ```

### ❌ DON'T

1. **Don't hardcode links without seller ID**
   ```typescript
   // ❌ Bad
   const link = 'https://amazon.com/dp/B0123456789';
   
   // ✅ Good
   const link = ensureSellerId('https://amazon.com/dp/B0123456789');
   ```

2. **Don't use generic search URLs**
   ```typescript
   // ❌ Bad
   const link = 'https://amazon.com/s?k=chicken+breast';
   
   // ✅ Good
   const product = getVettedProduct('chicken breast');
   const link = ensureSellerId(product?.asinLink);
   ```

3. **Don't skip utility functions**
   ```typescript
   // ❌ Bad - Even if link has seller ID, use utility for consistency
   <a href={product.asinLink}>Buy</a>
   
   // ✅ Good
   <a href={ensureSellerId(product.asinLink)}>Buy</a>
   ```

4. **Don't mix product and cart URL functions**
   ```typescript
   // ❌ Bad
   ensureSellerId(cartUrl) // Wrong for cart URLs
   
   // ✅ Good
   ensureCartUrlSellerId(cartUrl)
   ```

## Testing Guidelines

### Unit Tests

Test utility functions:
```typescript
// lib/utils/__tests__/affiliateLinks.test.ts
import { ensureSellerId } from '../affiliateLinks';

describe('ensureSellerId', () => {
  it('adds seller ID to URL', () => {
    expect(ensureSellerId('https://amazon.com/dp/B0123456789'))
      .toContain('tag=robinfrench-20');
  });
});
```

### Component Tests

Test component behavior:
```typescript
// components/__tests__/ShoppingList.test.tsx
import { render, screen } from '@testing-library/react';
import { ShoppingList } from '../ShoppingList';

it('adds seller ID to links', () => {
  const ingredients = [{
    id: '1',
    name: 'Chicken',
    asinLink: 'https://amazon.com/dp/B0123456789'
  }];
  
  render(<ShoppingList ingredients={ingredients} />);
  
  const link = screen.getByRole('link');
  expect(link.getAttribute('href')).toContain('tag=robinfrench-20');
});
```

### Integration Tests

Test full flow:
```typescript
// __tests__/integration/purchase-flow.test.ts
import { getVettedProduct } from '@/lib/data/vetted-products';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

it('vetted product has seller ID in link', () => {
  const product = getVettedProduct('ground chicken');
  expect(product).toBeDefined();
  expect(product?.asinLink).toContain('tag=robinfrench-20');
  
  // Verify utility adds it if missing (shouldn't be needed)
  const safeLink = ensureSellerId(product?.asinLink);
  expect(safeLink).toContain('tag=robinfrench-20');
});
```

## Common Pitfalls

### Pitfall 1: Forgetting Utility Function

**Problem**: Using link directly without ensuring seller ID
```typescript
// ❌ Problem
<a href={ingredient.asinLink}>Buy</a>
```

**Solution**: Always use utility function
```typescript
// ✅ Solution
<a href={ensureSellerId(ingredient.asinLink)}>Buy</a>
```

### Pitfall 2: Using Wrong Function for Cart URLs

**Problem**: Using `ensureSellerId()` for cart URLs
```typescript
// ❌ Problem
const cartUrl = ensureSellerId(`https://amazon.com/gp/aws/cart/add.html?...`);
```

**Solution**: Use `ensureCartUrlSellerId()` for cart URLs
```typescript
// ✅ Solution
const cartUrl = ensureCartUrlSellerId(`https://amazon.com/gp/aws/cart/add.html?...`);
```

### Pitfall 3: Generic Search URLs

**Problem**: Using search URLs instead of specific products
```typescript
// ❌ Problem
const link = `https://amazon.com/s?k=${ingredientName}&tag=robinfrench-20`;
```

**Solution**: Use vetted products
```typescript
// ✅ Solution
const product = getVettedProduct(ingredientName);
const link = ensureSellerId(product?.asinLink);
```

### Pitfall 4: Not Handling Missing Products

**Problem**: Assuming product always exists
```typescript
// ❌ Problem
<a href={ensureSellerId(getVettedProduct(name).asinLink)}>Buy</a>
// Crashes if product doesn't exist
```

**Solution**: Check for existence
```typescript
// ✅ Solution
const product = getVettedProduct(name);
{product && (
  <a href={ensureSellerId(product.asinLink)}>Buy</a>
)}
```

## Troubleshooting

### Issue: Links don't have seller ID

**Symptoms**: Links open to Amazon but no affiliate attribution

**Solution**:
1. Check if you're using `ensureSellerId()` or `ensureCartUrlSellerId()`
2. Run `npm run validate:links` to find missing seller IDs
3. Check vetted products data for missing seller IDs

### Issue: Cart URLs not working

**Symptoms**: Cart opens but items don't appear

**Solution**:
1. Verify ASIN format is correct (10 characters)
2. Check cart URL uses `AssociateTag=robinfrench-20` (not `tag=`)
3. Ensure ASINs are extracted correctly

### Issue: Tests failing

**Symptoms**: Test suite shows failures

**Solution**:
1. Run specific test: `npm test -- test-file-name`
2. Check test output for specific failures
3. Verify utility functions are imported correctly
4. Check if test data matches actual data format

### Issue: Validation script failing

**Symptoms**: `npm run validate:links` exits with error

**Solution**:
1. Check audit report for specific issues
2. Fix missing seller IDs in vetted products
3. Fix component code using links without utilities
4. Run validation again

## Additional Resources

- [API Reference](./AFFILIATE_API_REFERENCE.md) - Complete function documentation
- [Architecture Overview](./AFFILIATE_SYSTEM.md) - System design
- [Monitoring Guide](./AFFILIATE_MONITORING.md) - Maintenance procedures

## Getting Help

1. Check documentation first
2. Run validation scripts
3. Review existing component implementations
4. Check test files for examples

