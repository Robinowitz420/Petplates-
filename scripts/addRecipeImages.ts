// Script to add image data to recipes based on category
import { recipes } from '../lib/data/recipes-complete';
import { getEmojiImagePath, type ImageVariant } from '../lib/utils/imageMapping';
import fs from 'fs';
import path from 'path';

// Map category to emoji for image lookup
const categoryToEmoji: Record<string, string> = {
  'dogs': '🐕',
  'cats': '🐈',
  'birds': '🦜',
  'reptiles': '🦎',
  'pocket-pets': '🐰'
};

// Image size mappings
const sizeMappings: Record<ImageVariant, { width: number; height: number }> = {
  'icon_64': { width: 64, height: 64 },
  'icon_128': { width: 128, height: 128 },
  'thumb_150': { width: 150, height: 150 },
  'thumb_300x200': { width: 300, height: 200 },
  'recipe_600x384': { width: 600, height: 384 },
  'recipe_300x192': { width: 300, height: 192 },
  'banner_800x400': { width: 800, height: 400 },
  'hero_1200x600': { width: 1200, height: 600 },
  'hero_800x400': { width: 800, height: 400 }
};

function addImagesToRecipes() {
  const updatedRecipes = recipes.map(recipe => {
    const emoji = categoryToEmoji[recipe.category];
    if (!emoji) return recipe;

    const images: any = {};

    // Add card image (recipe_300x192)
    const cardPath = getEmojiImagePath(emoji, 'recipe_300x192');
    if (cardPath) {
      images.card = {
        url: cardPath,
        width: sizeMappings.recipe_300x192.width,
        height: sizeMappings.recipe_300x192.height,
        alt: `${recipe.name} - ${recipe.category} recipe`
      };
    }

    // Add thumbnail
    const thumbPath = getEmojiImagePath(emoji, 'thumb_300x200');
    if (thumbPath) {
      images.thumbnail = {
        url: thumbPath,
        width: sizeMappings.thumb_300x200.width,
        height: sizeMappings.thumb_300x200.height,
        alt: `${recipe.name} thumbnail`
      };
    }

    // Add hero
    const heroPath = getEmojiImagePath(emoji, 'hero_1200x600');
    if (heroPath) {
      images.hero = {
        url: heroPath,
        width: sizeMappings.hero_1200x600.width,
        height: sizeMappings.hero_1200x600.height,
        alt: `${recipe.name} hero image`
      };
    }

    // Add icon
    const iconPath = getEmojiImagePath(emoji, 'icon_128');
    if (iconPath) {
      images.icon = {
        url: iconPath,
        width: sizeMappings.icon_128.width,
        height: sizeMappings.icon_128.height,
        alt: `${recipe.category} icon`
      };
    }

    if (Object.keys(images).length > 0) {
      return { ...recipe, images };
    }

    return recipe;
  });

  // Write back to file
  const filePath = path.join(__dirname, '../lib/data/recipes-complete.ts');
  const content = `// lib/data/recipes-complete.ts
// Auto-generated comprehensive recipe database
// Generated on: ${new Date().toISOString()}
// Total recipes: ${updatedRecipes.length}

import type { Recipe } from '../types';

export const recipes: Recipe[] = ${JSON.stringify(updatedRecipes, null, 2)};
`;

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${updatedRecipes.length} recipes with image data`);
}

addImagesToRecipes();