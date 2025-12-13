# Manual Testing Checklist - Affiliate System

Manual testing checklist to verify all purchase flows work correctly.

## Pre-Testing Setup

- [ ] Clear browser cache
- [ ] Open browser DevTools (Network tab)
- [ ] Enable "Preserve log" in Network tab
- [ ] Verify you're testing on correct environment

## Test 1: Individual Product Links

### Test 1.1: Recipe Detail Page - Ingredient Links

1. Navigate to any recipe detail page
2. Find ingredient with "Buy" button
3. **Verify**: Link includes `tag=robinfrench-20`
   - Check: Hover over link, inspect `href` attribute
   - Check: In Network tab, verify URL has seller ID
4. Click "Buy" button
5. **Verify**: Amazon page opens
6. **Verify**: URL in address bar includes `tag=robinfrench-20`
7. **Verify**: Page loads correctly (not 404)

**Expected**: All links have seller ID, Amazon pages load correctly

### Test 1.2: Shopping List Component

1. Navigate to recipe with shopping list
2. Find individual "Buy" buttons for ingredients
3. **Verify**: Each link has seller ID
4. Click multiple "Buy" buttons
5. **Verify**: Each opens Amazon page with seller ID

**Expected**: All individual links work correctly

## Test 2: Cart URLs

### Test 2.1: Recipe Detail - Buy All Button

1. Navigate to recipe detail page
2. Find "Buy All" or cart button (if available)
3. **Verify**: Cart URL includes `AssociateTag=robinfrench-20`
4. Click button
5. **Verify**: Amazon cart opens
6. **Verify**: Items appear in cart
7. **Verify**: Cart URL includes seller ID

**Expected**: Cart opens with all items, seller ID present

### Test 2.2: Meal Plan Page - Buy Button

1. Navigate to pet meal plan page
2. Find "Buy" button for a meal
3. **Verify**: Cart URL includes `AssociateTag=robinfrench-20`
4. Click button
5. **Verify**: Amazon cart opens with multiple items
6. **Verify**: All items from meal appear in cart

**Expected**: Cart opens with correct items, seller ID present

### Test 2.3: Profile Page - Weekly Meal Plan Buy

1. Navigate to profile page
2. View weekly meal plan
3. Find "Buy" button for a day's meals
4. **Verify**: Cart URL includes seller ID
5. Click button
6. **Verify**: Cart opens with ingredients from all meals

**Expected**: Cart works for weekly meal plans

## Test 3: One-Click Checkout Modal

### Test 3.1: Recipe Checkout

1. Navigate to recipe detail page
2. Click "One-Click Checkout" or similar button
3. **Verify**: Modal opens with ingredient list
4. **Verify**: All links have seller ID (if shown)
5. Click "Add All to Cart" or similar
6. **Verify**: Items added to Amazon cart
7. **Verify**: Cart URL includes seller ID

**Expected**: Modal works, items added correctly

### Test 3.2: Multiple Items

1. Open checkout modal with multiple ingredients
2. **Verify**: All items listed
3. Complete checkout flow
4. **Verify**: All items in cart
5. **Verify**: Seller ID present in cart URL

**Expected**: Multiple items handled correctly

## Test 4: Multi-Pet Shopping

### Test 4.1: Multi-Pet Modal

1. Navigate to profile page
2. Open multi-pet shopping modal
3. Select multiple pets
4. **Verify**: Combined ingredient list shown
5. Click "Buy All" button
6. **Verify**: Multiple tabs open (or cart opens)
7. **Verify**: Each link has seller ID

**Expected**: Multi-pet shopping works correctly

## Test 5: Custom Meals

### Test 5.1: Custom Meal Shopping List

1. Create or view a custom meal
2. View shopping list for custom meal
3. **Verify**: All ingredient links have seller ID
4. Click "Buy" buttons
5. **Verify**: Links work correctly

**Expected**: Custom meals generate correct links

## Test 6: Edge Cases

### Test 6.1: Missing Vetted Product

1. Find ingredient without vetted product (if any)
2. **Verify**: No link shown (graceful handling)
3. **Verify**: No errors in console

**Expected**: Missing products handled gracefully

### Test 6.2: Empty Shopping List

1. Create scenario with no purchasable ingredients
2. **Verify**: Shopping list doesn't appear or shows "No items"
3. **Verify**: No errors

**Expected**: Empty states handled correctly

### Test 6.3: Browser Compatibility

Test in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Expected**: Works in all browsers

## Test 7: Network Verification

### Test 7.1: Network Tab Verification

1. Open DevTools Network tab
2. Click purchase links
3. **Verify**: Requests show seller ID in URL
4. **Verify**: No failed requests
5. **Verify**: Amazon pages load (200 status)

**Expected**: All network requests include seller ID

## Test 8: Purchase Tracking

### Test 8.1: Purchase Tracking Integration

1. Click purchase links
2. **Verify**: Purchases tracked (check localStorage or network requests)
3. **Verify**: Tracking includes correct item info

**Expected**: Purchase tracking works correctly

## Verification Checklist

After testing, verify:

- [ ] All product links include `tag=robinfrench-20`
- [ ] All cart URLs include `AssociateTag=robinfrench-20`
- [ ] No broken links (404 errors)
- [ ] No console errors
- [ ] All purchase flows work end-to-end
- [ ] Multi-pet shopping works
- [ ] Custom meals work
- [ ] Edge cases handled gracefully

## Issues Found

Document any issues found:

1. **Issue**: [Description]
   - **Location**: [Where it occurred]
   - **Steps to Reproduce**: [How to reproduce]
   - **Expected**: [What should happen]
   - **Actual**: [What actually happened]

## Test Results Summary

- Date: ___________
- Tester: ___________
- Environment: ___________
- Browsers Tested: ___________
- Pass/Fail: ___________
- Notes: ___________

## Additional Notes

- Test with different pets (dogs, cats, etc.)
- Test with different recipe types
- Test mobile responsiveness
- Verify affiliate attribution (check Amazon Associates dashboard after purchases)

