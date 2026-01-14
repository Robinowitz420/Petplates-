import { describe, it, expect } from 'vitest';

import { applyScoreTieBreakJitter } from '@/lib/hooks/useChunkedRecipeScoring';

describe('applyScoreTieBreakJitter', () => {
  it('applies a stable ±1–2 jitter to the 3rd+ item when 3+ scores are identical', () => {
    const seed = 'petHash-abc';

    const items = [
      { recipeId: 'a', score: 90 },
      { recipeId: 'b', score: 90 },
      { recipeId: 'c', score: 90 },
      { recipeId: 'd', score: 90 },
      { recipeId: 'e', score: 88 },
    ];

    const out1 = applyScoreTieBreakJitter(items, seed);
    const out2 = applyScoreTieBreakJitter(items, seed);

    // deterministic for same seed
    expect(out1).toEqual(out2);

    // first two remain unchanged
    expect(out1[0].score).toBe(90);
    expect(out1[1].score).toBe(90);

    // 3rd+ adjusted by ±1–2 (not 0)
    for (const idx of [2, 3]) {
      const delta = out1[idx].score - 90;
      expect([-2, -1, 1, 2]).toContain(delta);
    }

    // different base-score group unaffected
    expect(out1[4].score).toBe(88);
  });

  it('does nothing when there are only 1-2 items with the same score', () => {
    const items = [
      { recipeId: 'a', score: 90 },
      { recipeId: 'b', score: 90 },
      { recipeId: 'c', score: 89 },
    ];

    const out = applyScoreTieBreakJitter(items, 'seed');
    expect(out).toEqual(items);
  });
});
