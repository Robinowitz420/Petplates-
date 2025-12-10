import type { HealthConcern } from '../recipe-generator';

// Minimal, high-signal mappings to boost condition-aware selection/scoring.
export const HEALTH_BENEFIT_MAP: Record<string, string[]> = {
  // Joint / anti-inflammatory
  'joint-health': ['salmon', 'sardines', 'mackerel', 'fish oil', 'turmeric', 'sweet potato', 'pumpkin', 'spinach', 'kale'],
  'arthritis': ['salmon', 'sardines', 'fish oil', 'turmeric', 'ginger', 'blueberries', 'sweet potato'],

  // Weight management / low fat
  'weight-management': ['green beans', 'pumpkin', 'zucchini', 'cauliflower', 'broccoli', 'turkey breast', 'chicken breast', 'white fish'],
  'obesity': ['green beans', 'pumpkin', 'carrots', 'celery', 'cucumber', 'turkey', 'chicken', 'white fish'],

  // Digestive
  'digestive-issues': ['pumpkin', 'sweet potato', 'rice', 'bone broth', 'oats', 'bananas'],
  'sensitive-stomach': ['pumpkin', 'sweet potato', 'rice', 'chicken', 'turkey', 'bone broth', 'oats'],

  // Kidney / urinary (lower phosphorus, hydration-friendly)
  'kidney-disease': ['apples', 'blueberries', 'green beans', 'cauliflower', 'white rice', 'eggs', 'white fish'],
  'urinary-health': ['cranberries', 'blueberries', 'pumpkin', 'green beans', 'white fish', 'chicken'],

  // Diabetes / blood sugar (lower glycemic)
  'diabetes': ['green beans', 'broccoli', 'spinach', 'cauliflower', 'chicken breast', 'turkey', 'white fish', 'eggs', 'pumpkin'],

  // Skin / coat
  'skin-coat': ['salmon', 'sardines', 'fish oil', 'flaxseed', 'eggs', 'sweet potato', 'pumpkin', 'spinach'],

  // Pancreatitis (low fat)
  'pancreatitis': ['white fish', 'turkey breast', 'chicken breast', 'rice', 'sweet potato', 'pumpkin', 'green beans'],
};

export const HEALTH_CONTRAINDICATIONS: Record<string, string[]> = {
  'kidney-disease': ['liver', 'organ', 'sardines', 'cheese', 'yogurt', 'high-phosphorus'],
  'pancreatitis': ['beef', 'pork', 'lamb', 'duck', 'oils', 'cheese', 'high-fat'],
  'diabetes': ['corn', 'white potato', 'sugar', 'sweetened'],
};

// Helper to normalize concern keys
export const normalizeConcernKey = (c: string) => c.toLowerCase().replace(/\s+/g, '-');
