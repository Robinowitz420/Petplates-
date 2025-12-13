# Affiliate System Monitoring Guide

Maintenance and monitoring procedures for the affiliate link system.

## Overview

Regular monitoring ensures all affiliate links remain valid and properly configured. This guide covers:

- Running audit scripts
- Interpreting reports
- Fixing common issues
- Monitoring schedule recommendations

## Available Scripts

### Quick Validation

**Script**: `scripts/validate-affiliate-links.ts`

**Purpose**: Quick check for validation errors (CI/CD)

**Usage**:
```bash
npm run validate:links
```

**Output**: Pass/fail with error messages

**When to use**: 
- Before commits
- In CI/CD pipeline
- Quick sanity checks

### Comprehensive Audit

**Script**: `scripts/audit-all-purchase-links.ts`

**Purpose**: Full audit of all links and code

**Usage**:
```bash
npm run audit:links
```

**Output**: Detailed report in `AFFILIATE_LINKS_AUDIT_REPORT.md`

**When to use**:
- Weekly/monthly checks
- Before releases
- After major changes

### Health Check

**Script**: `scripts/check-link-health.ts`

**Purpose**: Optional HTTP validation of ASINs

**Usage**:
```bash
npx tsx scripts/check-link-health.ts
```

**Output**: Report in `LINK_HEALTH_REPORT.md`

**When to use**:
- Monthly checks
- When products seem unavailable
- After Amazon product updates

## Interpreting Reports

### Validation Report

**Success**:
```
✅ All affiliate links are valid!
```

**Failure**:
```
❌ VALIDATION FAILED

Issues found:
1. ingredient-name (line 123): Missing seller ID
```

**Action**: Fix reported issues, re-run validation

### Audit Report

Located in `AFFILIATE_LINKS_AUDIT_REPORT.md`

**Sections**:
- Summary: Total issues, errors, warnings
- Issues by Type: Vetted products vs runtime code
- All Issues: Detailed list with locations

**Example**:
```markdown
## Summary
- Total issues found: 2
- Errors: 2
- Warnings: 0

## Issues by Type

### Vetted Products
- **ERROR**: Missing seller ID: ground turkey
  - Location: lib/data/vetted-products.ts:37
  - Fix: Add ?tag=robinfrench-20 to asinLink
```

**Action**: Review each issue, fix, re-run audit

### Health Report

Located in `LINK_HEALTH_REPORT.md`

**Statuses**:
- `valid`: Link is accessible
- `broken`: Link returns 404 (product discontinued)
- `error`: Network/validation error
- `unknown`: Format check only (HTTP checking disabled)

**Action**: Review broken links, replace discontinued products

## Fixing Common Issues

### Issue: Missing Seller ID

**Location**: Vetted products or runtime code

**Fix**:
1. **Vetted Products**: Add `?tag=robinfrench-20` to asinLink
   ```typescript
   // Before
   asinLink: 'https://www.amazon.com/dp/B0123456789'
   
   // After
   asinLink: 'https://www.amazon.com/dp/B0123456789?tag=robinfrench-20'
   ```

2. **Runtime Code**: Wrap with utility function
   ```typescript
   // Before
   <a href={ingredient.asinLink}>Buy</a>
   
   // After
   <a href={ensureSellerId(ingredient.asinLink)}>Buy</a>
   ```

### Issue: Generic Search URL

**Problem**: Using search URL instead of specific product

**Fix**: Replace with vetted product
```typescript
// Before
const link = `https://amazon.com/s?k=${ingredientName}&tag=robinfrench-20`;

// After
const product = getVettedProduct(ingredientName);
const link = ensureSellerId(product?.asinLink);
```

### Issue: Invalid ASIN Format

**Problem**: ASIN not in correct format (must be 10 characters)

**Fix**: Verify ASIN and URL format
```typescript
// Verify ASIN
const asin = extractASIN(link);
if (!asin || asin.length !== 10) {
  // Fix the link
}
```

### Issue: Cart URL Missing Seller ID

**Problem**: Cart URL doesn't include AssociateTag

**Fix**: Use `ensureCartUrlSellerId()`
```typescript
// Before
const cartUrl = `https://amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`;

// After
const cartUrl = ensureCartUrlSellerId(
  `https://amazon.com/gp/aws/cart/add.html?${cartItems.join('&')}`
);
```

### Issue: Broken/Discontinued Product

**Problem**: Product no longer available (404 from Amazon)

**Fix**:
1. Find replacement product
2. Update vetted product entry
3. Verify new link works
4. Run validation

## Monitoring Schedule

### Daily (Automated)
- CI/CD runs `validate:links` on every commit
- Prevents broken code from being merged

### Weekly
- Run `npm run audit:links`
- Review audit report
- Fix any issues found

### Monthly
- Run `npm run check-link-health` (if HTTP checking enabled)
- Review health report
- Replace discontinued products

### Before Releases
- Full audit (`audit:links`)
- Health check (if enabled)
- Manual spot-check of key purchase flows

## Alert Thresholds

### Critical (Fail Build)
- Missing seller IDs in vetted products
- Runtime code not using utility functions
- Generic search URLs

### Warning (Review Required)
- Health check failures (broken products)
- Test failures
- Audit report warnings

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Validate Affiliate Links

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run validate:links
      - run: npm run audit:links
```

### Pre-commit Hook

```bash
#!/bin/sh
npm run validate:links
if [ $? -ne 0 ]; then
  echo "Affiliate link validation failed!"
  exit 1
fi
```

## Maintenance Checklist

### Weekly
- [ ] Run `npm run audit:links`
- [ ] Review audit report
- [ ] Fix any errors
- [ ] Commit fixes

### Monthly
- [ ] Review health report (if enabled)
- [ ] Check for discontinued products
- [ ] Update vetted products as needed
- [ ] Run full test suite

### Before Release
- [ ] Full audit
- [ ] Health check
- [ ] Manual testing of purchase flows
- [ ] Verify all tests pass

## Troubleshooting

### Scripts Failing

**Problem**: Scripts exit with errors

**Solutions**:
1. Check Node.js version (requires Node 18+)
2. Verify dependencies installed: `npm install`
3. Check file paths (scripts assume specific structure)
4. Review error messages for specific issues

### False Positives

**Problem**: Script reports errors that aren't real

**Solutions**:
1. Review script logic
2. Check if edge cases are handled
3. Update scripts if needed
4. Report issues for improvement

### Performance Issues

**Problem**: Scripts run slowly

**Solutions**:
1. Health check can be slow (HTTP requests)
2. Disable HTTP checking if not needed
3. Run scripts less frequently
4. Optimize script logic if needed

## Best Practices

1. **Automate**: Run validation in CI/CD
2. **Monitor Regularly**: Weekly audits catch issues early
3. **Fix Promptly**: Address errors immediately
4. **Document Changes**: Note why products were changed
5. **Test Fixes**: Verify fixes with validation scripts

## Additional Resources

- [Developer Guide](./AFFILIATE_DEVELOPER_GUIDE.md) - How to make changes
- [API Reference](./AFFILIATE_API_REFERENCE.md) - Function documentation
- [Architecture](./AFFILIATE_SYSTEM.md) - System design

