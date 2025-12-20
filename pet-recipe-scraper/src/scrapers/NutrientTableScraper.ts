/**
 * NUTRIENT TABLE SCRAPER
 * Specialized scraper for structured nutrient data tables
 * Focuses on Ca:P ratios, Vitamin C, safety ratings, etc.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedRecipe, RecipeIngredient } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface NutrientData {
  ingredient: string;
  calcium?: number;
  phosphorus?: number;
  caToP?: number; // Ca:P ratio
  vitaminC?: number;
  vitaminA?: number;
  vitaminD?: number;
  fiber?: number;
  protein?: number;
  fat?: number;
  safetyRating?: 'safe' | 'caution' | 'toxic' | 'green' | 'amber' | 'red';
  safetyNotes?: string;
}

export class NutrientTableScraper {
  private userAgent = 'PetPlates-NutrientBot/1.0 (Educational Research)';

  /**
   * Scrape Tortoise Table color-coded safety data
   */
  async scrapeTortoiseTable(url: string): Promise<ScrapedRecipe[]> {
    console.log(`\n🐢 Scraping Tortoise Table: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 20000,
      });

      const $ = cheerio.load(response.data);
      const recipes: ScrapedRecipe[] = [];

      // Tortoise Table uses table rows with color-coded safety
      $('table tr').each((_, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length < 2) return;

        const plantName = $(cells[0]).text().trim();
        const safetyCell = $(cells[1]);
        
        // Extract safety rating from color/class
        let safetyRating: NutrientData['safetyRating'] = 'safe';
        const cellClass = safetyCell.attr('class') || '';
        const cellStyle = safetyCell.attr('style') || '';
        
        if (cellClass.includes('red') || cellStyle.includes('red')) {
          safetyRating = 'toxic';
        } else if (cellClass.includes('amber') || cellClass.includes('yellow')) {
          safetyRating = 'caution';
        } else if (cellClass.includes('green')) {
          safetyRating = 'safe';
        }

        const safetyNotes = safetyCell.text().trim();

        if (plantName && plantName.length > 2) {
          recipes.push({
            id: uuidv4(),
            name: `${plantName} - Safety Data`,
            species: ['reptiles'],
            ingredients: [{
              name: plantName,
              amount: '100',
              unit: 'g',
            }],
            warnings: safetyRating === 'toxic' ? [`TOXIC: ${safetyNotes}`] : 
                      safetyRating === 'caution' ? [`CAUTION: ${safetyNotes}`] : undefined,
            sourceUrl: url,
            sourceName: 'The Tortoise Table',
            sourceTier: 'academic',
            scrapedAt: new Date(),
            tags: ['safety-list', 'tortoise-table', safetyRating],
          });
        }
      });

      console.log(`   Found ${recipes.length} plant safety entries`);
      return recipes;

    } catch (error) {
      console.error(`   ❌ Error scraping Tortoise Table: ${error}`);
      return [];
    }
  }

  /**
   * Scrape Guinea Lynx vegetable chart (Vitamin C, Ca, P)
   */
  async scrapeGuineaLynxChart(url: string): Promise<ScrapedRecipe[]> {
    console.log(`\n🐹 Scraping Guinea Lynx: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 20000,
      });

      const $ = cheerio.load(response.data);
      const recipes: ScrapedRecipe[] = [];

      // Guinea Lynx has detailed nutrient tables
      $('table tr').each((_, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length < 4) return;

        const vegetable = $(cells[0]).text().trim();
        const vitaminC = this.parseNutrientValue($(cells[1]).text());
        const calcium = this.parseNutrientValue($(cells[2]).text());
        const phosphorus = this.parseNutrientValue($(cells[3]).text());

        if (vegetable && vegetable.length > 2) {
          const warnings: string[] = [];
          
          // Calculate Ca:P ratio
          if (calcium && phosphorus) {
            const caToP = calcium / phosphorus;
            if (caToP < 1.0) {
              warnings.push(`Low Ca:P ratio (${caToP.toFixed(2)}:1) - feed with calcium-rich foods`);
            }
          }

          // Check Vitamin C content
          if (vitaminC && vitaminC > 50) {
            warnings.push(`High Vitamin C (${vitaminC}mg/100g) - excellent for guinea pigs`);
          }

          recipes.push({
            id: uuidv4(),
            name: `${vegetable} - Nutrient Data`,
            species: ['pocket-pets'],
            ingredients: [{
              name: vegetable,
              amount: '100',
              unit: 'g',
            }],
            warnings: warnings.length > 0 ? warnings : undefined,
            sourceUrl: url,
            sourceName: 'Guinea Lynx',
            sourceTier: 'academic',
            scrapedAt: new Date(),
            tags: ['nutrient-data', 'guinea-lynx', 'vitamin-c', 'calcium'],
          });
        }
      });

      console.log(`   Found ${recipes.length} vegetable nutrient entries`);
      return recipes;

    } catch (error) {
      console.error(`   ❌ Error scraping Guinea Lynx: ${error}`);
      return [];
    }
  }

  /**
   * Scrape USDA FoodData Central for precise nutrient values
   */
  async scrapeUSDANutrients(foodName: string): Promise<NutrientData | null> {
    console.log(`\n🇺🇸 Searching USDA for: ${foodName}`);
    
    try {
      // USDA API endpoint (requires API key for full access, but search works without)
      const searchUrl = `https://fdc.nal.usda.gov/fdc-app.html#/food-search?query=${encodeURIComponent(foodName)}&type=Foundation`;
      
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 20000,
      });

      const $ = cheerio.load(response.data);
      
      // Extract nutrient data from USDA page
      const nutrientData: NutrientData = {
        ingredient: foodName,
      };

      // Look for nutrient table
      $('table.nutrient-table tr, .nutrition-facts tr').each((_, row) => {
        const $row = $(row);
        const nutrientName = $row.find('td:first-child').text().toLowerCase();
        const value = this.parseNutrientValue($row.find('td:nth-child(2)').text());

        if (nutrientName.includes('calcium')) {
          nutrientData.calcium = value;
        } else if (nutrientName.includes('phosphorus')) {
          nutrientData.phosphorus = value;
        } else if (nutrientName.includes('vitamin c')) {
          nutrientData.vitaminC = value;
        } else if (nutrientName.includes('vitamin a')) {
          nutrientData.vitaminA = value;
        } else if (nutrientName.includes('vitamin d')) {
          nutrientData.vitaminD = value;
        } else if (nutrientName.includes('fiber')) {
          nutrientData.fiber = value;
        } else if (nutrientName.includes('protein')) {
          nutrientData.protein = value;
        } else if (nutrientName.includes('fat')) {
          nutrientData.fat = value;
        }
      });

      // Calculate Ca:P ratio
      if (nutrientData.calcium && nutrientData.phosphorus) {
        nutrientData.caToP = nutrientData.calcium / nutrientData.phosphorus;
      }

      return nutrientData;

    } catch (error) {
      console.error(`   ❌ Error scraping USDA: ${error}`);
      return null;
    }
  }

  /**
   * Scrape ReptiFiles feeding guides with Ca:P ratios
   */
  async scrapeReptiFilesGuide(url: string): Promise<ScrapedRecipe[]> {
    console.log(`\n🦎 Scraping ReptiFiles: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 20000,
      });

      const $ = cheerio.load(response.data);
      const recipes: ScrapedRecipe[] = [];

      // Look for food lists and tables
      $('.food-list li, .diet-section ul li, table tr').each((_, element) => {
        const $el = $(element);
        const text = $el.text().trim();

        // Extract food item and any Ca:P ratio mentioned
        const caToP = this.extractCaPRatio(text);
        const foodName = text.split(/[:\-\(]/)[0].trim();

        if (foodName && foodName.length > 2) {
          const warnings: string[] = [];

          if (caToP) {
            if (caToP < 1.5) {
              warnings.push(`Low Ca:P ratio (${caToP}:1) - dust with calcium supplement`);
            } else if (caToP > 2.0) {
              warnings.push(`High Ca:P ratio (${caToP}:1) - excellent calcium source`);
            }
          }

          // Check for toxic keywords
          if (text.toLowerCase().includes('toxic') || text.toLowerCase().includes('avoid')) {
            warnings.push('Potentially toxic - avoid feeding');
          }

          recipes.push({
            id: uuidv4(),
            name: `${foodName} - Feeding Guide`,
            species: ['reptiles'],
            ingredients: [{
              name: foodName,
              amount: '100',
              unit: 'g',
            }],
            warnings: warnings.length > 0 ? warnings : undefined,
            sourceUrl: url,
            sourceName: 'ReptiFiles',
            sourceTier: 'academic',
            scrapedAt: new Date(),
            tags: ['feeding-guide', 'reptifiles', caToP ? 'ca-p-ratio' : 'nutrient-data'],
          });
        }
      });

      console.log(`   Found ${recipes.length} feeding guide entries`);
      return recipes;

    } catch (error) {
      console.error(`   ❌ Error scraping ReptiFiles: ${error}`);
      return [];
    }
  }

  /**
   * Parse nutrient value from text (handles "50mg", "1.2g", "15%", etc.)
   */
  private parseNutrientValue(text: string): number | undefined {
    const cleaned = text.replace(/[^\d.]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? undefined : value;
  }

  /**
   * Extract Ca:P ratio from text like "Ca:P 2:1" or "calcium to phosphorus ratio of 1.5"
   */
  private extractCaPRatio(text: string): number | undefined {
    // Match patterns like "Ca:P 2:1", "2:1", "1.5:1"
    const ratioPattern = /(?:ca:?p|calcium.*phosphorus).*?(\d+\.?\d*)\s*:\s*1/i;
    const match = text.match(ratioPattern);
    
    if (match) {
      return parseFloat(match[1]);
    }

    // Match decimal ratios like "1.5"
    const decimalPattern = /(?:ca:?p|ratio).*?(\d+\.\d+)/i;
    const decimalMatch = text.match(decimalPattern);
    
    if (decimalMatch) {
      return parseFloat(decimalMatch[1]);
    }

    return undefined;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
