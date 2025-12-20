// Title-based retail validation (Phase 1 - no PA-API yet)
// Validates product titles against ingredient specs

import { IngredientRetailSpec, ValidationResult, ValidationIssue, ProductMetadata } from '../types/retailValidation';

export class RetailValidator {
  /**
   * Validate a product title against an ingredient spec
   * This is Phase 1: simple title parsing without PA-API
   */
  validateProductTitle(
    productTitle: string,
    spec: IngredientRetailSpec,
    asin: string
  ): ValidationResult {
    const issues: ValidationIssue[] = [];
    const titleLower = spec.validationRules.caseSensitive ? productTitle : productTitle.toLowerCase();
    
    // Check required tokens
    const missingRequired = spec.requiredTokens.filter(token => {
      const searchToken = spec.validationRules.caseSensitive ? token : token.toLowerCase();
      return !titleLower.includes(searchToken);
    });
    
    if (missingRequired.length > 0) {
      if (spec.validationRules.titleMatch === 'strict') {
        issues.push({
          type: 'missing-required',
          severity: 'critical',
          message: `Missing required tokens: ${missingRequired.join(', ')}`,
          details: { missing: missingRequired },
        });
      } else {
        // Flexible: allow if most tokens present
        const matchRate = (spec.requiredTokens.length - missingRequired.length) / spec.requiredTokens.length;
        if (matchRate < 0.6) {
          issues.push({
            type: 'missing-required',
            severity: 'warning',
            message: `Only ${Math.round(matchRate * 100)}% of required tokens present`,
            details: { missing: missingRequired, matchRate },
          });
        }
      }
    }
    
    // Check forbidden tokens
    const foundForbidden = spec.forbiddenTokens.filter(token => {
      const searchToken = spec.validationRules.caseSensitive ? token : token.toLowerCase();
      return titleLower.includes(searchToken);
    });
    
    if (foundForbidden.length > 0) {
      issues.push({
        type: 'has-forbidden',
        severity: 'critical',
        message: `Contains forbidden tokens: ${foundForbidden.join(', ')}`,
        details: { forbidden: foundForbidden },
      });
    }
    
    // Check acceptable forms (if specified)
    if (spec.acceptableForms && spec.acceptableForms.length > 0) {
      const hasAcceptableForm = spec.acceptableForms.some(form => {
        const searchForm = spec.validationRules.caseSensitive ? form : form.toLowerCase();
        return titleLower.includes(searchForm);
      });
      
      if (!hasAcceptableForm) {
        issues.push({
          type: 'form-mismatch',
          severity: 'warning',
          message: `No acceptable form found. Expected one of: ${spec.acceptableForms.join(', ')}`,
          details: { acceptableForms: spec.acceptableForms },
        });
      }
    }
    
    // Determine status and confidence
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const warningIssues = issues.filter(i => i.severity === 'warning');
    
    let status: ValidationResult['status'];
    let confidence: ValidationResult['confidence'];
    
    if (criticalIssues.length > 0) {
      status = 'invalid';
      confidence = 'low';
    } else if (warningIssues.length > 0) {
      status = 'ambiguous';
      confidence = 'medium';
    } else {
      status = 'valid';
      confidence = 'high';
    }
    
    // Create basic metadata from what we have
    const metadata: ProductMetadata = {
      asin,
      title: productTitle,
      availability: 'unknown',
      lastFetched: new Date(),
    };
    
    return {
      status,
      confidence,
      issues,
      metadata,
    };
  }
  
  /**
   * Batch validate multiple products
   */
  validateBatch(
    products: Array<{ ingredient: string; productTitle: string; asin: string; spec: IngredientRetailSpec }>
  ): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();
    
    for (const product of products) {
      const result = this.validateProductTitle(product.productTitle, product.spec, product.asin);
      results.set(product.ingredient, result);
    }
    
    return results;
  }
  
  /**
   * Extract package size from title (basic heuristic)
   * This will be improved with PA-API in Phase 2
   */
  extractPackageSize(title: string): { amount: number; unit: string; raw: string } | null {
    // Common patterns: "2 lb", "16 oz", "1 kg", "500g", "12 count"
    const patterns = [
      /(\d+\.?\d*)\s*(lb|lbs|pound|pounds)/i,
      /(\d+\.?\d*)\s*(oz|ounce|ounces)/i,
      /(\d+\.?\d*)\s*(kg|kilogram|kilograms)/i,
      /(\d+\.?\d*)\s*(g|gram|grams)/i,
      /(\d+)\s*(count|ct|pack|pieces)/i,
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return {
          amount: parseFloat(match[1]),
          unit: match[2].toLowerCase(),
          raw: match[0],
        };
      }
    }
    
    return null;
  }
}
