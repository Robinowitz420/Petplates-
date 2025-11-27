// Utility functions for image mapping and emoji groups
import { imageManifest, healthConcernStyles, petCategoryStyles, type ImageGroup } from '@/lib/data/imageManifest';

export type ImageVariant = keyof ImageGroup['variants'];

/**
 * Get the image group key for a given emoji
 */
export function getEmojiGroup(emoji: string): string | null {
  for (const [groupKey, group] of Object.entries(imageManifest)) {
    if (group.emojis.includes(emoji)) {
      return groupKey;
    }
  }
  return null;
}

/**
 * Get the image path for a specific emoji and variant
 */
export function getEmojiImagePath(emoji: string, variant: ImageVariant): string | null {
  const groupKey = getEmojiGroup(emoji);
  if (!groupKey) return null;

  const group = imageManifest[groupKey];
  const variantFile = group.variants[variant as keyof typeof group.variants];

  // Assuming images are in /assets/images/animals/{group}/
  return `/assets/images/animals/${groupKey}/${variantFile}`;
}

/**
 * Get the master icon path for an emoji group
 */
export function getMasterIconPath(groupKey: string): string | null {
  const group = imageManifest[groupKey];
  return group ? group.masterIcon : null;
}

/**
 * Get the master hero path for an emoji group
 */
export function getMasterHeroPath(groupKey: string): string | null {
  const group = imageManifest[groupKey];
  return group ? group.masterHero : null;
}

/**
 * Get health concern style information
 */
export function getHealthConcernStyle(concern: string) {
  return healthConcernStyles[concern] || null;
}

/**
 * Get pet category style information
 */
export function getPetCategoryStyle(category: string) {
  return petCategoryStyles[category] || null;
}

/**
 * Get all emojis in a group
 */
export function getGroupEmojis(groupKey: string): string[] {
  const group = imageManifest[groupKey];
  return group ? group.emojis : [];
}

/**
 * Get all available groups
 */
export function getAllGroups(): string[] {
  return Object.keys(imageManifest);
}

/**
 * Check if an emoji is supported
 */
export function isEmojiSupported(emoji: string): boolean {
  return getEmojiGroup(emoji) !== null;
}