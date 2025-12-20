// Tests for Amazon buy link finalization

import { getAmazonBuyLink, getAmazonBuyLinkWithStatus, getFallbackAmazonSearchLink } from '../getAmazonBuyLink';

describe('getAmazonBuyLink', () => {
  test('adds affiliate tag to valid Amazon URL', () => {
    const link = getAmazonBuyLink('https://www.amazon.com/dp/B012345678');
    expect(link).toContain('tag=robinfrench-20');
    expect(link).toContain('B012345678');
  });

  test('preserves existing affiliate tag', () => {
    const link = getAmazonBuyLink('https://www.amazon.com/dp/B012345678?tag=robinfrench-20');
    expect(link).toContain('tag=robinfrench-20');
  });

  test('rejects non-Amazon URLs', () => {
    const link = getAmazonBuyLink('https://example.com/product/123');
    expect(link).toBeNull();
  });

  test('rejects empty/null URLs', () => {
    expect(getAmazonBuyLink('')).toBeNull();
    expect(getAmazonBuyLink(null)).toBeNull();
    expect(getAmazonBuyLink(undefined)).toBeNull();
  });

  test('rejects Amazon search URLs (no ASIN)', () => {
    const link = getAmazonBuyLink('https://www.amazon.com/s?k=chicken+breast');
    expect(link).toBeNull();
  });

  test('handles /gp/product/ format', () => {
    const link = getAmazonBuyLink('https://www.amazon.com/gp/product/B012345678');
    expect(link).toContain('tag=robinfrench-20');
    expect(link).toContain('B012345678');
  });

  test('handles URLs with existing query parameters', () => {
    const link = getAmazonBuyLink('https://www.amazon.com/dp/B012345678?ref=xyz');
    expect(link).toContain('tag=robinfrench-20');
    expect(link).toContain('B012345678');
  });
});

describe('getAmazonBuyLinkWithStatus', () => {
  test('returns ok status for valid link', () => {
    const result = getAmazonBuyLinkWithStatus('https://www.amazon.com/dp/B012345678');
    expect(result.status).toBe('ok');
    expect(result.url).toContain('tag=robinfrench-20');
    expect(result.asin).toBe('B012345678');
  });

  test('returns missing status for null URL', () => {
    const result = getAmazonBuyLinkWithStatus(null);
    expect(result.status).toBe('missing');
    expect(result.url).toBeNull();
  });

  test('returns invalid status for non-Amazon URL', () => {
    const result = getAmazonBuyLinkWithStatus('https://example.com/product/123');
    expect(result.status).toBe('invalid');
    expect(result.url).toBeNull();
  });

  test('returns invalid status for search URL', () => {
    const result = getAmazonBuyLinkWithStatus('https://www.amazon.com/s?k=chicken');
    expect(result.status).toBe('invalid');
    expect(result.url).toBeNull();
  });

  test('returns region-unavailable for non-US regions', () => {
    const result = getAmazonBuyLinkWithStatus('https://www.amazon.com/dp/B012345678', 'UK');
    expect(result.status).toBe('region-unavailable');
    expect(result.asin).toBe('B012345678');
  });
});

describe('getFallbackAmazonSearchLink', () => {
  test('creates search link with affiliate tag', () => {
    const link = getFallbackAmazonSearchLink('chicken breast organic');
    expect(link).toContain('amazon.com/s');
    expect(link).toContain('k=chicken%20breast%20organic');
    expect(link).toContain('tag=robinfrench-20');
  });

  test('handles UK region', () => {
    const link = getFallbackAmazonSearchLink('chicken breast', 'UK');
    expect(link).toContain('amazon.co.uk/s');
    expect(link).toContain('tag=robinfrench-20');
  });

  test('URL encodes special characters', () => {
    const link = getFallbackAmazonSearchLink('Bob\'s Red Mill Oats');
    expect(link).toContain('Bob%27s');
  });
});
