/**
 * REDDIT RECIPE SCRAPER
 * Scrapes pet nutrition posts and recipes from Reddit subreddits
 * Uses Reddit JSON API (no auth required for public posts)
 */

import axios from 'axios';
import { ScrapedRecipe, RecipeIngredient } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  created_utc: number;
  author: string;
  score: number;
  num_comments: number;
  permalink: string;
}

interface SubredditConfig {
  name: string;
  species: string[];
  searchTerms: string[];
}

export class RedditRecipeScraper {
  private subreddits: SubredditConfig[];
  private userAgent = 'PetRecipeBot/1.0 (Educational Research)';
  private rateLimit = 2000; // Reddit rate limit

  constructor(subreddits: SubredditConfig[]) {
    this.subreddits = subreddits;
  }

  async scrape(): Promise<ScrapedRecipe[]> {
    const allRecipes: ScrapedRecipe[] = [];

    for (const subreddit of this.subreddits) {
      console.log(`\n🔍 Scraping r/${subreddit.name}`);
      
      try {
        const posts = await this.fetchSubredditPosts(subreddit);
        console.log(`   Found ${posts.length} relevant posts`);

        for (const post of posts) {
          const recipe = this.extractRecipeFromPost(post, subreddit);
          if (recipe) {
            allRecipes.push(recipe);
            console.log(`   ✓ Extracted: ${recipe.name}`);
          }
          await this.delay(500); // Be polite
        }

      } catch (error) {
        console.error(`   ❌ Error scraping r/${subreddit.name}: ${error}`);
      }

      await this.delay(this.rateLimit);
    }

    return allRecipes;
  }

  private async fetchSubredditPosts(subreddit: SubredditConfig): Promise<RedditPost[]> {
    const posts: RedditPost[] = [];

    // Search for recipe-related posts
    for (const term of subreddit.searchTerms) {
      try {
        const searchUrl = `https://www.reddit.com/r/${subreddit.name}/search.json?q=${encodeURIComponent(term)}&restrict_sr=1&sort=top&t=year&limit=50`;
        
        const response = await axios.get(searchUrl, {
          headers: { 'User-Agent': this.userAgent },
          timeout: 20000,
        });

        const children = response.data?.data?.children || [];
        for (const child of children) {
          const post = child.data;
          if (this.isRecipePost(post)) {
            posts.push(post);
          }
        }

        await this.delay(1000);
      } catch (error) {
        console.error(`   Failed to search "${term}": ${error}`);
      }
    }

    // Also get top posts from the subreddit
    try {
      const topUrl = `https://www.reddit.com/r/${subreddit.name}/top.json?t=year&limit=100`;
      const response = await axios.get(topUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 20000,
      });

      const children = response.data?.data?.children || [];
      for (const child of children) {
        const post = child.data;
        if (this.isRecipePost(post)) {
          posts.push(post);
        }
      }
    } catch (error) {
      console.error(`   Failed to get top posts: ${error}`);
    }

    // Remove duplicates
    const unique = new Map<string, RedditPost>();
    for (const post of posts) {
      unique.set(post.permalink, post);
    }

    return Array.from(unique.values());
  }

  private isRecipePost(post: any): boolean {
    const title = (post.title || '').toLowerCase();
    const text = (post.selftext || '').toLowerCase();
    const combined = title + ' ' + text;

    // Must have recipe-related keywords
    const recipeKeywords = [
      'recipe', 'homemade', 'diet', 'meal', 'food', 'feeding',
      'ingredients', 'preparation', 'cook', 'mix', 'batch',
      'nutrition', 'supplement', 'treat', 'raw', 'kibble'
    ];

    const hasRecipeKeyword = recipeKeywords.some(kw => combined.includes(kw));
    
    // Must have actual content (not just a link)
    const hasContent = post.selftext && post.selftext.length > 100;

    // Filter out common non-recipe posts
    const isQuestion = title.includes('?') && !title.toLowerCase().includes('recipe');
    const isHelp = title.toLowerCase().includes('help') && !combined.includes('recipe');

    return hasRecipeKeyword && hasContent && !isQuestion && !isHelp;
  }

  private extractRecipeFromPost(post: RedditPost, subreddit: SubredditConfig): ScrapedRecipe | null {
    const text = post.selftext;
    if (!text || text.length < 50) return null;

    // Extract ingredients
    const ingredients = this.extractIngredients(text);
    if (ingredients.length < 2) return null;

    // Extract instructions
    const instructions = this.extractInstructions(text);

    // Extract warnings
    const warnings = this.extractWarnings(text);

    return {
      id: uuidv4(),
      name: post.title,
      species: subreddit.species as any[],
      ingredients,
      instructions: instructions.length > 0 ? instructions : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      sourceUrl: `https://reddit.com${post.permalink}`,
      sourceName: `Reddit r/${subreddit.name}`,
      sourceTier: 'community',
      scrapedAt: new Date(),
      tags: ['reddit', 'community', subreddit.name],
    };
  }

  private extractIngredients(text: string): RecipeIngredient[] {
    const ingredients: RecipeIngredient[] = [];
    const lines = text.split('\n');

    let inIngredientsSection = false;
    const ingredientHeaders = /^(ingredients?|what you need|supplies?|items?):?$/i;
    const listPattern = /^[\s\-\*•\d\.]+(.+)$/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if we're entering ingredients section
      if (ingredientHeaders.test(line)) {
        inIngredientsSection = true;
        continue;
      }

      // Check if we're leaving ingredients section
      if (inIngredientsSection && /^(instructions?|directions?|steps?|method|preparation):?$/i.test(line)) {
        inIngredientsSection = false;
        continue;
      }

      // Extract ingredient from list
      if (inIngredientsSection || (!inIngredientsSection && ingredients.length === 0)) {
        const match = line.match(listPattern);
        if (match) {
          const ingredientText = match[1].trim();
          if (ingredientText.length > 2 && ingredientText.length < 200) {
            const parsed = this.parseIngredientAmount(ingredientText);
            ingredients.push({
              name: parsed.name,
              amount: parsed.amount,
              unit: parsed.unit,
            });
          }
        }
      }

      // Stop if we have enough ingredients
      if (ingredients.length >= 30) break;
    }

    return ingredients;
  }

  private extractInstructions(text: string): string[] {
    const instructions: string[] = [];
    const lines = text.split('\n');

    let inInstructionsSection = false;
    const instructionHeaders = /^(instructions?|directions?|steps?|method|preparation|how to):?$/i;
    const listPattern = /^[\s\-\*•\d\.]+(.+)$/;

    for (const line of lines) {
      const trimmed = line.trim();

      if (instructionHeaders.test(trimmed)) {
        inInstructionsSection = true;
        continue;
      }

      if (inInstructionsSection) {
        const match = trimmed.match(listPattern);
        if (match) {
          const instruction = match[1].trim();
          if (instruction.length > 10) {
            instructions.push(instruction);
          }
        } else if (trimmed.length > 20 && !trimmed.match(/^[A-Z\s]+:?$/)) {
          // Plain paragraph instruction
          instructions.push(trimmed);
        }
      }

      if (instructions.length >= 20) break;
    }

    return instructions;
  }

  private extractWarnings(text: string): string[] {
    const warnings: string[] = [];
    const warningKeywords = [
      'warning', 'caution', 'danger', 'toxic', 'avoid', 'never',
      'do not', 'harmful', 'poison', 'unsafe', 'consult vet'
    ];

    const lines = text.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (warningKeywords.some(kw => lower.includes(kw))) {
        const trimmed = line.trim();
        if (trimmed.length > 10 && trimmed.length < 300) {
          warnings.push(trimmed);
        }
      }
    }

    return warnings.slice(0, 5);
  }

  private parseIngredientAmount(text: string): {
    name: string;
    amount?: string;
    unit?: string;
  } {
    // Remove common prefixes
    text = text.replace(/^(fresh|raw|cooked|organic|frozen|dried)\s+/i, '');

    const amountPattern = /^([\d\/\.\s]+)\s*([a-z]+)?\s+(.+)$/i;
    const match = text.match(amountPattern);

    if (match) {
      return {
        amount: match[1].trim(),
        unit: match[2]?.trim(),
        name: match[3].trim(),
      };
    }

    return { name: text.trim() };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
