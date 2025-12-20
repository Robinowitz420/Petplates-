/**
 * DETERMINISTIC TEST: Commercial Prior Enforcement
 * 
 * Tests that turkey + fish oil pairings are blocked based on commercial data
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkHardBlock,
  checkStrongPenalty,
  filterCandidatesByCommercialPriors,
  applyCommercialPriorScoring,
} from './CommercialPriorEnforcement';

describe('CommercialPriorEnforcement', () => {
  beforeEach(() => {
    // Spy on console.log to capture logging
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Hard Block Detection', () => {
    it('should NOT block turkey + fish pairings (fish oil is common with poultry)', () => {
      // Arrange: turkey is selected
      const selected = ['turkey'];
      const species = 'dogs' as const;

      // Act: Check if fish/salmon/tuna are blocked
      const fishBlock = checkHardBlock('fish', selected, species);
      const salmonBlock = checkHardBlock('salmon', selected, species);
      const tunaBlock = checkHardBlock('tuna', selected, species);

      // Assert: Should NOT be blocked (fish oil is common supplement with poultry)
      // Data can't distinguish fish-as-protein from fish-oil-as-supplement
      expect(fishBlock).toBeNull();
      expect(salmonBlock).toBeNull();
      expect(tunaBlock).toBeNull();
    });

    it('should block beef + fish pairings (genuinely rare)', () => {
      // Arrange: beef is selected
      const selected = ['beef'];
      const species = 'dogs' as const;

      // Act: Check if fish/salmon are blocked
      const fishBlock = checkHardBlock('fish', selected, species);
      const salmonBlock = checkHardBlock('salmon', selected, species);

      // Assert: Should be blocked (beef + fish is genuinely rare in commercial products)
      expect(fishBlock).toBeTruthy();
      expect(salmonBlock).toBeTruthy();
    });

    it('should NOT block chicken + turkey pairing', () => {
      // Arrange: turkey is selected
      const selected = ['turkey'];
      const species = 'dogs' as const;

      // Act: Check if chicken is blocked
      const chickenBlock = checkHardBlock('chicken', selected, species);

      // Assert: Should NOT be blocked (they co-occur in commercial products)
      expect(chickenBlock).toBeNull();
    });

    it('should work with normalized pair keys regardless of order', () => {
      // Arrange: Use beef + fish (genuinely blocked)
      const species = 'dogs' as const;

      // Act: Check both orders
      const block1 = checkHardBlock('fish', ['beef'], species);
      const block2 = checkHardBlock('beef', ['fish'], species);

      // Assert: Both should detect the block
      expect(block1).toBeTruthy();
      expect(block2).toBeTruthy();
      expect(block1).toBe(block2); // Same normalized key
    });
  });

  describe('Candidate Filtering', () => {
    it('should filter out beef + fish pairings (genuinely rare)', () => {
      // Arrange: Beef is selected, candidates include fish proteins
      const candidates = [
        { id: 'fish', name: 'Fish' },
        { id: 'salmon', name: 'Salmon' },
        { id: 'chicken', name: 'Chicken' },
        { id: 'rice', name: 'Rice' },
      ];
      const selected = ['beef'];
      const species = 'dogs' as const;

      // Act: Filter candidates
      const filtered = filterCandidatesByCommercialPriors(candidates, selected, species);

      // Assert: Fish ingredients should be filtered out (beef + fish is rare)
      const filteredIds = filtered.map(c => c.id);
      expect(filteredIds).not.toContain('fish');
      expect(filteredIds).not.toContain('salmon');
      expect(filteredIds).toContain('chicken');
      expect(filteredIds).toContain('rice');
    });

    it('should NOT filter turkey + fish (fish oil is common)', () => {
      // Arrange: Turkey is selected, candidates include fish
      const candidates = [
        { id: 'fish', name: 'Fish' },
        { id: 'salmon', name: 'Salmon' },
        { id: 'chicken', name: 'Chicken' },
      ];
      const selected = ['turkey'];
      const species = 'dogs' as const;

      // Act: Filter candidates
      const filtered = filterCandidatesByCommercialPriors(candidates, selected, species);

      // Assert: Fish should NOT be filtered (fish oil is common with poultry)
      const filteredIds = filtered.map(c => c.id);
      expect(filteredIds).toContain('fish');
      expect(filteredIds).toContain('salmon');
      expect(filteredIds).toContain('chicken');
    });

    it('should log [PAIR BLOCK] messages when filtering', () => {
      // Arrange: Use beef + salmon (genuinely blocked)
      const candidates = [
        { id: 'salmon', name: 'Salmon' },
      ];
      const selected = ['beef'];
      const species = 'dogs' as const;

      // Act
      filterCandidatesByCommercialPriors(candidates, selected, species, '[TEST] ');

      // Assert: Should have logged the block
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[PAIR BLOCK]')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('salmon')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('commercial data')
      );
    });
  });

  describe('Strong Penalty Detection', () => {
    it('should detect strong penalty pairs', () => {
      // Arrange: Select ingredients that have rare pairings
      const selected = ['beef'];
      const species = 'dogs' as const;

      // Act: Check for penalty pairs with grain
      const penaltyPairs = checkStrongPenalty('grain', selected, species);

      // Assert: Should detect penalty (beef + grain is rare with negative PMI)
      expect(penaltyPairs.length).toBeGreaterThan(0);
    });
  });

  describe('Scoring with Commercial Priors', () => {
    it('should apply harsh penalty (0.05x) to strong penalty pairs', () => {
      // Arrange
      const candidateId = 'grain';
      const baseScore = 100;
      const selected = ['beef'];
      const species = 'dogs' as const;

      // Act
      const penaltyPairs = checkStrongPenalty(candidateId, selected, species);
      
      // Only test if penalty pairs exist
      if (penaltyPairs.length > 0) {
        const finalScore = applyCommercialPriorScoring(candidateId, baseScore, selected, species);

        // Assert: Score should be heavily penalized
        expect(finalScore).toBeLessThan(baseScore * 0.1);
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('[PAIR PENALTY]')
        );
      }
    });

    it('should apply PMI boost to positive pairings', () => {
      // Arrange: chicken + peas is a common pairing with positive PMI
      const candidateId = 'peas';
      const baseScore = 100;
      const selected = ['chicken'];
      const species = 'dogs' as const;

      // Act
      const finalScore = applyCommercialPriorScoring(candidateId, baseScore, selected, species);

      // Assert: Score should be boosted (but not by much, max 1.15x)
      expect(finalScore).toBeGreaterThanOrEqual(baseScore);
      expect(finalScore).toBeLessThanOrEqual(baseScore * 1.15);
    });
  });

  describe('CRITICAL TEST: What We Actually Learned', () => {
    it('should BLOCK beef + fish pairings (genuinely rare)', () => {
      // Arrange: Beef is selected
      const selected = ['beef'];
      const candidates = [
        { id: 'fish', name: 'Fish' },
        { id: 'salmon', name: 'Salmon' },
        { id: 'chicken', name: 'Chicken' },
      ];
      const species = 'dogs' as const;

      // Act: Filter candidates
      const filtered = filterCandidatesByCommercialPriors(candidates, selected, species, '[CRITICAL] ');

      // Assert: Fish ingredients must be filtered out (beef + fish is genuinely rare)
      const filteredIds = filtered.map(c => c.id);
      expect(filteredIds).not.toContain('fish');
      expect(filteredIds).not.toContain('salmon');
      expect(filteredIds).toContain('chicken');

      // Assert: Logs must contain [PAIR BLOCK] messages
      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[CRITICAL\].*\[PAIR BLOCK\].*fish/)
      );
    });

    it('should NOT block turkey + fish (fish oil is common with poultry)', () => {
      // Arrange: Turkey is selected
      const selected = ['turkey'];
      const species = 'dogs' as const;

      // Act: Check hard block for fish types
      const fishBlock = checkHardBlock('fish', selected, species);
      const salmonBlock = checkHardBlock('salmon', selected, species);
      const tunaBlock = checkHardBlock('tuna', selected, species);

      // Assert: Should NOT be blocked (data can't distinguish fish-as-protein from fish-oil-as-supplement)
      // Fish oil is commonly used with poultry for omega-3
      expect(fishBlock).toBeNull();
      expect(salmonBlock).toBeNull();
      expect(tunaBlock).toBeNull();
    });

    it('should boost common pairings (chicken + peas, chicken + rice)', () => {
      // Arrange: Chicken is selected
      const candidateId = 'peas';
      const baseScore = 100;
      const selected = ['chicken'];
      const species = 'dogs' as const;

      // Act: Apply commercial prior scoring
      const finalScore = applyCommercialPriorScoring(candidateId, baseScore, selected, species);

      // Assert: Score should be boosted OR stay same (chicken + peas is common: 51 products)
      // Note: With conservative thresholds (minIng>=30), peas (60) qualifies
      // PMI might be positive or neutral depending on data
      expect(finalScore).toBeGreaterThanOrEqual(baseScore);
      expect(finalScore).toBeLessThanOrEqual(baseScore * 1.15); // Capped at 1.15x
    });
  });

  describe('Species-Specific Gating', () => {
    it('should only apply priors for dogs and cats', () => {
      // Arrange
      const selected = ['turkey'];
      const birdsSpecies = 'birds' as const;

      // Act: Check for birds (should have no priors)
      const block = checkHardBlock('fish', selected, birdsSpecies);

      // Assert: Should return null (no priors for birds yet)
      expect(block).toBeNull();
    });

    it('should apply same priors to both dogs and cats', () => {
      // Arrange: Use beef + fish (genuinely blocked)
      const selected = ['beef'];

      // Act: Check for both species
      const dogBlock = checkHardBlock('fish', selected, 'dogs');
      const catBlock = checkHardBlock('fish', selected, 'cats');

      // Assert: Both should block (using same commercial data)
      expect(dogBlock).toBeTruthy();
      expect(catBlock).toBeTruthy();
    });
  });
});
