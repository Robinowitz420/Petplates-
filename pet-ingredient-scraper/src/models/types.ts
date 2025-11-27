export interface Ingredient {
  name: string;
  type: 'protein' | 'vegetable' | 'grain' | 'supplement' | 'other';
  description?: string;
  benefits?: string[];
  concerns?: string[];
  safeFor: {
    dogs: boolean;
    cats: boolean;
    birds?: boolean;
    reptiles?: boolean;
    'pocket-pets'?: boolean;
  };
  sources: ProductSource[];
  communitySentiment: {
    score: number; // 1-5
    totalReviews: number;
    sources: string[];
  };
  nutritionalInfo?: {
    protein?: number; // percentage
    fat?: number;     // percentage
    fiber?: number;   // percentage
    calories?: number; // per 100g
  };
  lastUpdated: Date;
}

export interface ProductSource {
  name: string;
  url: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  isAffiliate: boolean;
  affiliateLink?: string;
  lastChecked: Date;
  imageUrl?: string;
  source?: 'amazon' | 'chewy' | 'reddit' | 'other';
  description?: string;
  features?: string[];
  details?: Record<string, string>;
}

export interface Review {
  source: 'amazon' | 'chewy' | 'reddit' | 'other';
  author?: string;
  rating: number; // 1-5
  date: Date;
  title?: string;
  content: string;
  verifiedPurchase?: boolean;
  helpfulVotes?: number;
  url?: string;
  petType?: string;
  petBreed?: string;
  petAge?: string;
}

export interface ScraperOptions {
  headless?: boolean;
  maxPages?: number;
  delay?: number; // ms between requests
  timeout?: number; // ms before timeout
  userAgent?: string;
}
