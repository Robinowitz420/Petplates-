// Utility functions for pet management
import type { Pet } from '../types';
export type { Pet } from '../types';

/**
 * Get a random name from the pet's names array
 * Falls back to the first name if array is empty
 */
export function getRandomName(names: string[]): string {
  if (!names || names.length === 0) {
    return 'Unnamed Pet';
  }
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

/**
 * Get the primary name (first in the array)
 */
export function getPrimaryName(names: string[]): string {
  if (!names || names.length === 0) {
    return 'Unnamed Pet';
  }
  return names[0];
}

/**
 * Format names for display (e.g., "Buddy, Max, Charlie")
 */
export function formatNames(names: string[]): string {
  if (!names || names.length === 0) {
    return 'Unnamed Pet';
  }
  if (names.length === 1) {
    return names[0];
  }
  return names.join(', ');
}