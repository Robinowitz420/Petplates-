import type { PetCategory } from '../types';

export interface ConditionTemplate {
  id: string;
  name: string;
  category: PetCategory;
  concerns: string[]; // normalized keys (e.g., 'kidney-disease')
  preferred: string[]; // ingredient name keywords to favor
  avoid: string[];     // ingredient name keywords to penalize
}

export const CONDITION_TEMPLATES: ConditionTemplate[] = [
  {
    id: 'kidney-friendly',
    name: 'Kidney-Friendly Bowl',
    category: 'dogs',
    concerns: ['kidney-disease'],
    preferred: ['white fish', 'eggs', 'white rice', 'green beans', 'cauliflower', 'blueberries'],
    avoid: ['liver', 'organ', 'sardines', 'cheese', 'yogurt', 'high-phosphorus'],
  },
  {
    id: 'weight-loss',
    name: 'Lean & Green Bowl',
    category: 'dogs',
    concerns: ['weight-management', 'obesity'],
    preferred: ['turkey breast', 'chicken breast', 'white fish', 'green beans', 'zucchini', 'broccoli', 'pumpkin'],
    avoid: ['high-fat', 'cheese', 'oils'],
  },
  {
    id: 'joint-health',
    name: 'Anti-Inflammatory Bowl',
    category: 'dogs',
    concerns: ['joint-health', 'arthritis'],
    preferred: ['salmon', 'sardines', 'mackerel', 'turmeric', 'sweet potato', 'spinach', 'kale', 'pumpkin'],
    avoid: ['high-fat', 'processed'],
  },
  {
    id: 'low-glycemic',
    name: 'Low-Glycemic Bowl',
    category: 'dogs',
    concerns: ['diabetes'],
    preferred: ['green beans', 'broccoli', 'cauliflower', 'spinach', 'chicken breast', 'turkey', 'white fish', 'eggs', 'pumpkin'],
    avoid: ['corn', 'white potato', 'sugar'],
  },
  {
    id: 'low-fat-pancreatitis',
    name: 'Low-Fat Recovery Bowl',
    category: 'dogs',
    concerns: ['pancreatitis'],
    preferred: ['white fish', 'turkey breast', 'chicken breast', 'rice', 'sweet potato', 'pumpkin', 'green beans'],
    avoid: ['beef', 'pork', 'lamb', 'duck', 'oils', 'cheese', 'high-fat'],
  },
];
