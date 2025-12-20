// Enhanced retail validator with 4-state validation and token equivalence
// Separates structural (safety) from semantic (naming) concerns

import { IngredientRetailSpec, ValidationResult, ValidationIssue } from '../types/retailValidation';
import { tokenMatches, extractIngredientFamily } from './tokenEquivalence';

export class EnhancedRetailValidator {
  /**
   * Validate product title with 4-state logic and token equivalence
   * 
   * States:
   * - VALID: All required tokens matched exactly, no forbidden tokens
   * - STRUCTURALLY_VALID: Safe product, but uses equivalent tokens or flexible matching
   * - AMBIGUOUS: Too many missing tokens, needs human review
   * - INVALID: Contains forbidden tokens or critical failures
   */
  validateProductTitle(
    productTitle: string,
    spec: IngredientRetailSpec,
    asin: string,
    ingredientName?: string
  ): ValidationResult {
    const structuralIssues: ValidationIssue[] = [];
    const semanticIssues: ValidationIssue[] = [];
    
    const reasoning = {
      requiredTokensMatched: [] as string[],
      equivalentTokensUsed: [] as Array<{ token: string; synonym: string }>,
      forbiddenTokensFound: [] as string[],
      structurallySound: true,
    };
    
    const titleLower = spec.validationRules.caseSensitive ? productTitle : productTitle.toLowerCase();
    const ingredientFamily = ingredientName ? extractIngredientFamily(ingredientName) : undefined;
    
    // STEP 1: Check forbidden tokens (HARD FAIL - structural issue)
    for (const forbiddenToken of spec.forbiddenTokens) {
      const searchToken = spec.validationRules.caseSensitive ? forbiddenToken : forbiddenToken.toLowerCase();
      if (titleLower.includes(searchToken)) {
        reasoning.forbiddenTokensFound.push(forbiddenToken);
        reasoning.structurallySound = false;
        
        structuralIssues.push({
          type: 'has-forbidden',
          severity: 'critical',
          message: `Contains forbidden token: "${forbiddenToken}"`,
          details: { token: forbiddenToken },
        });
      }
    }
    
    // If forbidden tokens found, immediately return INVALID
    if (reasoning.forbiddenTokensFound.length > 0) {
      return {
        status: 'invalid',
        confidence: 'low',
        structuralIssues,
        semanticIssues,
        reasoning,
      };
    }
    
    // STEP 2: Check required tokens with equivalence (semantic issue if missing)
    const missingTokens: string[] = [];
    
    for (const requiredToken of spec.requiredTokens) {
      const match = tokenMatches(requiredToken, titleLower, ingredientFamily);
      
      if (match.matched) {
        if (match.via === 'direct') {
          reasoning.requiredTokensMatched.push(requiredToken);
        } else if (match.via === 'equivalent' && match.synonym) {
          reasoning.equivalentTokensUsed.push({
            token: requiredToken,
            synonym: match.synonym,
          });
        }
      } else {
        missingTokens.push(requiredToken);
      }
    }
    
    // STEP 3: Check acceptable forms (if specified)
    let formMatched = true;
    if (spec.acceptableForms && spec.acceptableForms.length > 0) {
      formMatched = spec.acceptableForms.some(form => {
        const searchForm = spec.validationRules.caseSensitive ? form : form.toLowerCase();
        return titleLower.includes(searchForm);
      });
      
      if (!formMatched) {
        semanticIssues.push({
          type: 'form-mismatch',
          severity: 'warning',
          message: `No acceptable form found. Expected one of: ${spec.acceptableForms.join(', ')}`,
          details: { acceptableForms: spec.acceptableForms },
        });
      }
    }
    
    // STEP 4: Determine status based on token matching
    const totalRequired = spec.requiredTokens.length;
    const directMatches = reasoning.requiredTokensMatched.length;
    const equivalentMatches = reasoning.equivalentTokensUsed.length;
    const totalMatches = directMatches + equivalentMatches;
    const matchRate = totalMatches / totalRequired;
    
    // Add semantic issues for missing tokens
    if (missingTokens.length > 0) {
      const severity = matchRate < 0.5 ? 'critical' : 'warning';
      semanticIssues.push({
        type: 'missing-required',
        severity,
        message: `Missing ${missingTokens.length} required token(s): ${missingTokens.join(', ')}`,
        details: { missing: missingTokens, matchRate },
      });
    }
    
    // DECISION LOGIC
    let status: ValidationResult['status'];
    let confidence: ValidationResult['confidence'];
    
    if (totalMatches === totalRequired && directMatches === totalRequired && formMatched) {
      // Perfect match: all tokens direct, form correct
      status = 'valid';
      confidence = 'high';
    } else if (totalMatches === totalRequired) {
      // All tokens matched via equivalence or flexible matching
      status = 'structurally-valid';
      confidence = equivalentMatches > 0 ? 'medium' : 'high';
    } else if (matchRate >= 0.6 && spec.validationRules.titleMatch === 'flexible') {
      // Flexible mode: 60%+ tokens matched
      status = 'structurally-valid';
      confidence = 'medium';
    } else if (matchRate >= 0.5) {
      // Borderline: needs human review
      status = 'ambiguous';
      confidence = 'low';
    } else {
      // Too many missing tokens
      status = 'ambiguous';
      confidence = 'low';
    }
    
    return {
      status,
      confidence,
      structuralIssues,
      semanticIssues,
      reasoning,
    };
  }
  
  /**
   * Batch validate multiple products
   */
  validateBatch(
    products: Array<{
      ingredient: string;
      productTitle: string;
      asin: string;
      spec: IngredientRetailSpec;
    }>
  ): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();
    
    for (const product of products) {
      const result = this.validateProductTitle(
        product.productTitle,
        product.spec,
        product.asin,
        product.ingredient
      );
      results.set(product.ingredient, result);
    }
    
    return results;
  }
}
