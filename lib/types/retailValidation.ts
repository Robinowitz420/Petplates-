// Retail validation types for ingredient sourcing
// Separates biological truth (ingredient specs) from retail convenience (ASINs)

export interface IngredientRetailSpec {
  // Core identity validation
  requiredTokens: string[];           // Must appear in product title (e.g., ['chicken', 'breast'])
  forbiddenTokens: string[];          // Cannot appear in title (e.g., ['seasoned', 'cooked', 'breaded'])
  
  // Acceptable product forms
  acceptableForms?: string[];         // e.g., ['raw', 'frozen', 'fresh', 'canned in water']
  
  // Size constraints (optional)
  minPackageSize?: {
    amount: number;
    unit: 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'l' | 'count';
  };
  
  // Validation behavior
  validationRules: {
    titleMatch: 'strict' | 'flexible';  // strict = all tokens required, flexible = most tokens
    allowGenericBrand: boolean;         // true = store brands OK, false = name brands only
    caseSensitive: boolean;             // usually false
  };
}

export interface ProductMetadata {
  asin: string;
  title: string;
  brand?: string;
  packageSize?: {
    amount: number;
    unit: string;
    raw: string;  // Original text from title
  };
  price?: {
    amount: number;
    currency: string;
  };
  availability: 'in-stock' | 'out-of-stock' | 'unknown';
  lastFetched: Date;
}

export interface ValidationResult {
  status: 'valid' | 'structurally-valid' | 'ambiguous' | 'invalid' | 'error';
  confidence: 'high' | 'medium' | 'low';
  
  // Separate structural (safety) from semantic (naming) issues
  structuralIssues: ValidationIssue[];  // Forbidden tokens, safety violations
  semanticIssues: ValidationIssue[];    // Missing preferred tokens, naming mismatches
  
  // Explain the decision
  reasoning: {
    requiredTokensMatched: string[];
    equivalentTokensUsed: Array<{ token: string; synonym: string }>;
    forbiddenTokensFound: string[];
    structurallySound: boolean;
  };
  
  metadata?: ProductMetadata;
}

export interface ValidationIssue {
  type: 'missing-required' | 'has-forbidden' | 'size-mismatch' | 'form-mismatch' | 'dead-link' | 'ambiguous-title';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  details?: any;
}

export interface VettedProductEnhanced {
  // Existing fields
  productName: string;
  asinLink: string;
  
  // New validation fields
  retailSpec?: IngredientRetailSpec;
  validationStatus?: 'validated' | 'pending' | 'flagged' | 'failed';
  confidence?: 'high' | 'medium' | 'low';
  lastVerified?: Date;
  validationNotes?: string;
}
