# Affiliate Links API Reference

Complete reference for the affiliate link utility functions in `lib/utils/affiliateLinks.ts`.

## Overview

The affiliate links utilities ensure all Amazon purchase links include the seller ID (`robinfrench-20`) and handle both product links and cart URLs correctly.

## Constants

### `SELLER_ID`
- **Value**: `'robinfrench-20'`
- **Description**: The Amazon Associates seller ID used for affiliate links
- **Note**: This is a private constant, not exported

## Functions

### `ensureSellerId(url: string | undefined | null): string`

Ensures an Amazon product link has the seller ID affiliate tag. If the link already has a tag, it replaces it with ours. If the link doesn't have a tag, it adds ours.

**Parameters:**
- `url` (string | undefined | null): The Amazon product URL to ensure has seller ID

**Returns:**
- `string`: The URL with seller ID guaranteed (empty string if input is falsy)

**Example:**
```typescript
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

// Adds seller ID
const link1 = ensureSellerId('https://www.amazon.com/dp/B0123456789');
// Returns: 'https://www.amazon.com/dp/B0123456789?tag=robinfrench-20'

// Replaces existing tag
const link2 = ensureSellerId('https://www.amazon.com/dp/B0123456789?tag=other-20');
// Returns: 'https://www.amazon.com/dp/B0123456789?tag=robinfrench-20'

// Handles existing query parameters
const link3 = ensureSellerId('https://www.amazon.com/dp/B0123456789?ref=sr_1_1');
// Returns: 'https://www.amazon.com/dp/B0123456789?ref=sr_1_1&tag=robinfrench-20'
```

**Supported URL Formats:**
- `/dp/ASIN` (most common)
- `/gp/product/ASIN`
- `/product/ASIN`

**Edge Cases:**
- Returns empty string for null/undefined/empty input
- Handles malformed URLs gracefully (falls back to string manipulation)
- Works with URLs that have existing query parameters

---

### `ensureCartUrlSellerId(cartUrl: string | undefined | null): string`

Ensures an Amazon cart URL has the seller ID affiliate tag. Cart URLs use `AssociateTag` parameter instead of `tag` parameter.

**Parameters:**
- `cartUrl` (string | undefined | null): The Amazon cart URL

**Returns:**
- `string`: The cart URL with AssociateTag parameter added (empty string if input is falsy)

**Example:**
```typescript
import { ensureCartUrlSellerId } from '@/lib/utils/affiliateLinks';

// Adds AssociateTag
const cart1 = ensureCartUrlSellerId(
  'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B0123456789&Quantity.1=1'
);
// Returns: 'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B0123456789&Quantity.1=1&AssociateTag=robinfrench-20'

// Replaces existing AssociateTag
const cart2 = ensureCartUrlSellerId(
  'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B0123456789&AssociateTag=other-20'
);
// Returns: 'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B0123456789&AssociateTag=robinfrench-20'

// Converts tag to AssociateTag
const cart3 = ensureCartUrlSellerId(
  'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B0123456789&tag=other-20'
);
// Returns: 'https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B0123456789&AssociateTag=robinfrench-20'
```

**Supported Cart URL Formats:**
- `/gp/aws/cart/add.html`
- `/gp/cart/view.html`

**Edge Cases:**
- Returns empty string for null/undefined/empty input
- Automatically converts `tag=` parameter to `AssociateTag=`

---

### `extractASIN(url: string | undefined | null): string | null`

Extracts the ASIN (Amazon Standard Identification Number) from an Amazon URL.

**Parameters:**
- `url` (string | undefined | null): The Amazon URL containing an ASIN

**Returns:**
- `string | null`: The 10-character ASIN code, or null if not found

**Example:**
```typescript
import { extractASIN } from '@/lib/utils/affiliateLinks';

// Extract from /dp/ URL
const asin1 = extractASIN('https://www.amazon.com/dp/B0123456789?tag=robinfrench-20');
// Returns: 'B0123456789'

// Extract from /gp/product/ URL
const asin2 = extractASIN('https://www.amazon.com/gp/product/B0123456789');
// Returns: 'B0123456789'

// Extract from /product/ URL
const asin3 = extractASIN('https://www.amazon.com/product/B0123456789');
// Returns: 'B0123456789'

// Extract from ASIN parameter
const asin4 = extractASIN('https://www.amazon.com/gp/aws/cart/add.html?ASIN=B0123456789');
// Returns: 'B0123456789'

// Returns null for invalid URLs
const asin5 = extractASIN('https://www.amazon.com/s?k=chicken');
// Returns: null
```

**Supported URL Formats:**
- `/dp/ASIN`
- `/gp/product/ASIN`
- `/product/ASIN`
- `?ASIN=...` query parameter

**Validation:**
- ASINs must be exactly 10 alphanumeric characters
- Returns null for invalid formats

---

### `hasSellerId(url: string | undefined | null): boolean`

Checks if a URL has our seller ID. Works with both product links (tag=) and cart links (AssociateTag=).

**Parameters:**
- `url` (string | undefined | null): The URL to check

**Returns:**
- `boolean`: True if the URL has our seller ID

**Example:**
```typescript
import { hasSellerId } from '@/lib/utils/affiliateLinks';

// Check product link
const hasId1 = hasSellerId('https://www.amazon.com/dp/B0123456789?tag=robinfrench-20');
// Returns: true

// Check cart link
const hasId2 = hasSellerId('https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=robinfrench-20');
// Returns: true

// Check link without seller ID
const hasId3 = hasSellerId('https://www.amazon.com/dp/B0123456789');
// Returns: false

// Check link with different seller ID
const hasId4 = hasSellerId('https://www.amazon.com/dp/B0123456789?tag=other-20');
// Returns: false
```

---

### `isValidAmazonUrl(url: string | undefined | null): boolean`

Validates that a URL is a valid Amazon URL.

**Parameters:**
- `url` (string | undefined | null): The URL to validate

**Returns:**
- `boolean`: True if the URL is a valid Amazon URL

**Example:**
```typescript
import { isValidAmazonUrl } from '@/lib/utils/affiliateLinks';

// Valid Amazon URLs
isValidAmazonUrl('https://www.amazon.com/dp/B0123456789'); // true
isValidAmazonUrl('https://amzn.to/abc123'); // true
isValidAmazonUrl('http://amazon.com/product'); // true

// Invalid URLs
isValidAmazonUrl('https://www.google.com'); // false
isValidAmazonUrl('not-a-url'); // false
isValidAmazonUrl(null); // false
```

---

### `isCartUrl(url: string | undefined | null): boolean`

Validates that a URL is an Amazon cart URL.

**Parameters:**
- `url` (string | undefined | null): The URL to validate

**Returns:**
- `boolean`: True if the URL is an Amazon cart URL

**Example:**
```typescript
import { isCartUrl } from '@/lib/utils/affiliateLinks';

// Cart URLs
isCartUrl('https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=B0123456789'); // true
isCartUrl('https://www.amazon.com/gp/cart/view.html'); // true

// Product URLs
isCartUrl('https://www.amazon.com/dp/B0123456789'); // false
isCartUrl(null); // false
```

---

### `addSellerIdIfMissing(url: string | undefined | null): string`

Adds seller ID to a link only if it doesn't already have one. If a link already has a tag, it ensures it's ours.

**Parameters:**
- `url` (string | undefined | null): The URL to potentially add seller ID to

**Returns:**
- `string`: The URL with seller ID if it was missing

**Example:**
```typescript
import { addSellerIdIfMissing } from '@/lib/utils/affiliateLinks';

// Adds if missing
const url1 = addSellerIdIfMissing('https://www.amazon.com/dp/B0123456789');
// Returns: 'https://www.amazon.com/dp/B0123456789?tag=robinfrench-20'

// Keeps existing (if it's ours)
const url2 = addSellerIdIfMissing('https://www.amazon.com/dp/B0123456789?tag=robinfrench-20');
// Returns: URL with our seller ID (may normalize)

// Replaces other seller IDs
const url3 = addSellerIdIfMissing('https://www.amazon.com/dp/B0123456789?tag=other-20');
// Returns: URL with our seller ID replacing other
```

**Difference from `ensureSellerId`:**
- `addSellerIdIfMissing`: Only adds if missing (but still replaces wrong IDs)
- `ensureSellerId`: Always ensures our seller ID is present (more explicit)

---

## Usage Patterns

### In Components

```typescript
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

// In a component
<a href={ensureSellerId(ingredient.asinLink)} target="_blank">
  Buy Now
</a>

// Opening in new window
window.open(ensureSellerId(item.asinLink), '_blank');
```

### Cart URLs

```typescript
import { ensureCartUrlSellerId } from '@/lib/utils/affiliateLinks';

const cartUrl = ensureCartUrlSellerId(
  `https://www.amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`
);
window.open(cartUrl, '_blank');
```

### Validation

```typescript
import { hasSellerId, isValidAmazonUrl } from '@/lib/utils/affiliateLinks';

if (isValidAmazonUrl(url) && !hasSellerId(url)) {
  // Add seller ID or log warning
  console.warn('URL missing seller ID:', url);
}
```

## Error Handling

All functions handle edge cases gracefully:
- Null/undefined inputs return empty string or false (as appropriate)
- Malformed URLs are handled with fallback string manipulation
- Invalid ASIN formats return null from `extractASIN`

## Testing

Comprehensive tests are available in `lib/utils/__tests__/affiliateLinks.test.ts`.

Run tests with:
```bash
npm test -- lib/utils/__tests__/affiliateLinks.test.ts
```

## See Also

- [Affiliate System Architecture](./AFFILIATE_SYSTEM.md)
- [Developer Guide](./AFFILIATE_DEVELOPER_GUIDE.md)
- [Monitoring Guide](./AFFILIATE_MONITORING.md)

