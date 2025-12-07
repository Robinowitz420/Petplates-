import { describe, expect, test } from 'vitest';
import { INGREDIENT_COMPOSITIONS, ConfidenceLevel } from '../data/ingredientCompositions';

const ALLOWED_CONFIDENCE: ConfidenceLevel[] = ['high', 'medium', 'low'];

describe('ingredient compositions metadata', () => {
  test('every ingredient declares confidence values with allowed levels', () => {
    Object.entries(INGREDIENT_COMPOSITIONS).forEach(([name, composition]) => {
      expect(composition.confidenceBySpecies).toBeDefined();
      const confidence = composition.confidenceBySpecies!;

      expect(confidence.dog).toBeDefined();
      expect(confidence.cat).toBeDefined();
      expect(confidence.bird).toBeDefined();
      expect(confidence.reptile).toBeDefined();
      expect(confidence['pocket-pet']).toBeDefined();

      Object.values(confidence).forEach((value) => {
        expect(ALLOWED_CONFIDENCE).toContain(value as ConfidenceLevel);
      });
    });
  });

  test('pocket-pet metadata exists for compatibility, maxima, and notes', () => {
    Object.entries(INGREDIENT_COMPOSITIONS).forEach(([name, composition]) => {
      const pocketCompat = composition.speciesCompatibility?.['pocket-pet'];
      expect(pocketCompat).toBeDefined();

      const pocketMax = composition.maxInclusionPercentBySpecies?.['pocket-pet'];
      expect(pocketMax).not.toBeUndefined();

      const pocketNote = composition.notesBySpecies?.['pocket-pet'];
      expect(pocketNote).toBeDefined();

      if (pocketCompat === 'avoid') {
        expect(pocketMax).toBe(0);
      }
    });
  });
});
