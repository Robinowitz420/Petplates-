// ASIN clustering algorithm - detects legitimate alias groups
// Reduces duplicate ASIN false positives by grouping related ingredients

import { IngredientAliasGroup, KNOWN_SYNONYM_PAIRS, KNOWN_CONFLICT_PATTERNS } from '../types/aliasGroups';

export class ASINClusterer {
  /**
   * Cluster ingredients that share the same ASIN
   * Returns alias groups for legitimate duplicates
   */
  clusterByASIN(
    products: Map<string, { productName: string; asinLink: string }>
  ): {
    aliasGroups: IngredientAliasGroup[];
    conflicts: Array<{ asin: string; ingredients: string[]; reason: string }>;
    singles: string[];
  } {
    // 1. Group by ASIN
    const asinMap = new Map<string, string[]>();
    
    for (const [ingredientName, product] of products) {
      const asin = this.extractASIN(product.asinLink);
      if (!asin) continue;
      
      if (!asinMap.has(asin)) {
        asinMap.set(asin, []);
      }
      asinMap.get(asin)!.push(ingredientName);
    }
    
    // 2. Process each ASIN group
    const aliasGroups: IngredientAliasGroup[] = [];
    const conflicts: Array<{ asin: string; ingredients: string[]; reason: string }> = [];
    const singles: string[] = [];
    
    for (const [asin, ingredients] of asinMap) {
      if (ingredients.length === 1) {
        singles.push(ingredients[0]);
        continue;
      }
      
      // Check if this is a legitimate alias group or a conflict
      const analysis = this.analyzeIngredientGroup(ingredients);
      
      if (analysis.isLegitimate) {
        aliasGroups.push({
          groupId: this.generateGroupId(ingredients),
          canonicalName: this.selectCanonical(ingredients),
          aliases: ingredients,
          sharedASIN: asin,
          validationStatus: 'valid', // Will be validated
          confidence: 'medium',
          lastVerified: new Date(),
          groupingReason: analysis.reason,
          notes: analysis.explanation,
        });
      } else {
        conflicts.push({
          asin,
          ingredients,
          reason: analysis.explanation,
        });
      }
    }
    
    return { aliasGroups, conflicts, singles };
  }
  
  /**
   * Analyze a group of ingredients to determine if they're legitimate aliases
   */
  private analyzeIngredientGroup(ingredients: string[]): {
    isLegitimate: boolean;
    reason: 'same-base-ingredient' | 'known-synonyms' | 'manual-override';
    explanation: string;
  } {
    // Check 1: Known conflicts (different products incorrectly sharing ASIN)
    for (const [conflictA, conflictB] of KNOWN_CONFLICT_PATTERNS) {
      const hasA = ingredients.some(i => i.toLowerCase().includes(conflictA.toLowerCase()));
      const hasB = ingredients.some(i => i.toLowerCase().includes(conflictB.toLowerCase()));
      
      if (hasA && hasB) {
        return {
          isLegitimate: false,
          reason: 'manual-override',
          explanation: `Conflict detected: ${conflictA} and ${conflictB} are different products`,
        };
      }
    }
    
    // Check 2: Known synonym pairs (check all combinations)
    for (const [synonymA, synonymB] of KNOWN_SYNONYM_PAIRS) {
      const hasA = ingredients.some(i => i.toLowerCase().includes(synonymA.toLowerCase()));
      const hasB = ingredients.some(i => i.toLowerCase().includes(synonymB.toLowerCase()));
      
      if (hasA && hasB) {
        return {
          isLegitimate: true,
          reason: 'known-synonyms',
          explanation: `Known synonyms: "${synonymA}" and "${synonymB}"`,
        };
      }
    }
    
    // Check 2b: Transitive synonym relationships
    // If A→B and B→C are synonyms, then A→C should also be grouped
    const synonymGroups = this.buildSynonymGroups(KNOWN_SYNONYM_PAIRS);
    for (const group of synonymGroups) {
      const matchCount = ingredients.filter(ing => 
        group.some(syn => ing.toLowerCase().includes(syn.toLowerCase()))
      ).length;
      
      if (matchCount >= 2) {
        return {
          isLegitimate: true,
          reason: 'known-synonyms',
          explanation: `Part of synonym group: ${group.slice(0, 3).join(', ')}`,
        };
      }
    }
    
    // Check 3: Same base ingredient with preparation variants
    // e.g., "peas" vs "peas (mashed)" vs "peas (cooked)"
    const baseNames = ingredients.map(i => this.extractBaseName(i));
    const uniqueBaseNames = new Set(baseNames);
    
    if (uniqueBaseNames.size === 1) {
      return {
        isLegitimate: true,
        reason: 'same-base-ingredient',
        explanation: `Same base ingredient with preparation variants: ${Array.from(uniqueBaseNames)[0]}`,
      };
    }
    
    // Check 4: Very similar names (Levenshtein distance)
    if (ingredients.length === 2) {
      const similarity = this.calculateSimilarity(ingredients[0], ingredients[1]);
      if (similarity > 0.8) {
        return {
          isLegitimate: true,
          reason: 'same-base-ingredient',
          explanation: `High name similarity (${Math.round(similarity * 100)}%)`,
        };
      }
    }
    
    // Default: flag for manual review
    return {
      isLegitimate: false,
      reason: 'manual-override',
      explanation: 'Ambiguous grouping - needs manual review',
    };
  }
  
  /**
   * Extract base ingredient name by removing preparation notes
   * "peas (mashed)" -> "peas"
   * "brown rice" -> "brown rice"
   */
  private extractBaseName(ingredient: string): string {
    // Remove parenthetical notes
    let base = ingredient.replace(/\s*\([^)]*\)/g, '').trim();
    
    // Remove common preparation prefixes/suffixes
    base = base.replace(/\s+(cooked|raw|fresh|frozen|mashed|ground|minced|chopped)$/i, '');
    
    return base.toLowerCase();
  }
  
  /**
   * Select canonical name from aliases (prefer shortest, most common)
   */
  private selectCanonical(ingredients: string[]): string {
    // Prefer names without parentheses
    const withoutParens = ingredients.filter(i => !i.includes('('));
    if (withoutParens.length > 0) {
      return withoutParens.sort((a, b) => a.length - b.length)[0];
    }
    
    // Otherwise, shortest name
    return ingredients.sort((a, b) => a.length - b.length)[0];
  }
  
  /**
   * Generate a unique group ID from ingredient names
   */
  private generateGroupId(ingredients: string[]): string {
    const base = this.extractBaseName(ingredients[0]);
    const hash = this.simpleHash(ingredients.join('|'));
    return `${base.replace(/\s+/g, '_')}_${hash}`;
  }
  
  /**
   * Extract ASIN from Amazon link
   */
  private extractASIN(link: string): string | null {
    const match = link.match(/\/dp\/([A-Z0-9]{10})/i);
    return match ? match[1] : null;
  }
  
  /**
   * Calculate string similarity (simple Levenshtein-based)
   */
  private calculateSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - distance) / longer.length;
  }
  
  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
  
  /**
   * Simple hash function for group IDs
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 6);
  }
  
  /**
   * Build transitive synonym groups from pairs
   * If A→B and B→C, then [A, B, C] form a group
   */
  private buildSynonymGroups(pairs: Array<[string, string]>): string[][] {
    const groups: string[][] = [];
    const processed = new Set<string>();
    
    for (const [a, b] of pairs) {
      if (processed.has(a) || processed.has(b)) continue;
      
      // Find all connected synonyms
      const group = new Set<string>([a, b]);
      let changed = true;
      
      while (changed) {
        changed = false;
        for (const [pairA, pairB] of pairs) {
          if (group.has(pairA) && !group.has(pairB)) {
            group.add(pairB);
            changed = true;
          }
          if (group.has(pairB) && !group.has(pairA)) {
            group.add(pairA);
            changed = true;
          }
        }
      }
      
      const groupArray = Array.from(group);
      groups.push(groupArray);
      groupArray.forEach(item => processed.add(item));
    }
    
    return groups;
  }
}
