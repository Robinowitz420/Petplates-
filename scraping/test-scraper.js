const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

class SimpleScraper {
  constructor() {
    this.userAgent = 'EducationalResearchBot/1.0 (research@petnutrition.edu) - Academic Research Project';
  }

  async testSingleSource() {
    // Test with premium veterinary source
    const testUrl = 'https://vetnutrition.tufts.edu/';

    console.log(`🧪 Testing enhanced HTTP scrape of: ${testUrl}`);

    try {
      const response = await axios.get(testUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Enhanced extraction using main scraper logic
      const extractText = (selector) => {
        const elements = $(selector);
        const results = elements.map((i, el) => $(el).text().trim()).get().filter(text => text.length > 0);
        // If no content found with specific selectors, try broader extraction
        if (results.length === 0 && selector.includes('.content')) {
          // Fallback: extract all paragraph text
          const paragraphs = $('p').map((i, el) => $(el).text().trim()).get().filter(text => text.length > 10);
          if (paragraphs.length > 0) {
            results.push(...paragraphs.slice(0, 10)); // Limit to first 10 paragraphs
          }
        }
        return results;
      };

      const extractLists = () => {
        try {
          const lists = $('ul, ol');
          const result = [];
          lists.each((i, list) => {
            const items = $(list).find('li');
            const itemTexts = [];
            items.each((j, item) => {
              const text = $(item).text().trim();
              if (text.length > 0) {
                itemTexts.push(text);
              }
            });
            if (itemTexts.length > 0) {
              result.push(itemTexts);
            }
          });
          return result;
        } catch (error) {
          console.error('Error extracting lists:', error);
          return [];
        }
      };

      // Extract data using main scraper selectors
      const selectors = {
        content: '.content, article, .main-content, .entry-content',
        headings: 'h1, h2, h3, h4, h5',
        lists: 'ul, ol',
        tables: 'table'
      };

      const data = {
        title: $('title').text().trim(),
        headings: extractText(selectors.headings),
        content: extractText(selectors.content),
        lists: extractLists(),
        tables: [], // Simplified for test
        url: response.config.url,
        timestamp: new Date().toISOString(),
        method: 'http-test'
      };

      // Process data like main scraper
      const processed = this.processScrapedData({ data, source: { category: 'dogs-cats' } });

      const result = {
        url: testUrl,
        rawData: {
          title: data.title,
          headingsCount: data.headings.length,
          contentCount: data.content.length,
          listsCount: data.lists.length
        },
        processedData: processed,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Enhanced test scrape successful!');
      console.log(`📄 Found ${data.headings.length} headings, ${data.content.length} content blocks, ${data.lists.length} lists`);
      console.log(`🥦 Extracted ${processed.ingredients.length} ingredients, ${processed.healthRecommendations.length} health recommendations`);

      // Debug: show sample content
      console.log('\n🔍 Sample extracted content:');
      if (data.headings.length > 0) console.log('First heading:', data.headings[0]);
      if (data.content.length > 0) console.log('First content block:', data.content[0].substring(0, 200) + '...');
      if (data.lists.length > 0 && data.lists[0].length > 0) console.log('First list item:', data.lists[0][0]);

      // Save test result
      await fs.writeJson('./results/test-scrape.json', result, { spaces: 2 });
      console.log('💾 Test results saved to results/test-scrape.json');

      return result;

    } catch (error) {
      console.error('❌ Test scrape failed:', error.message);
      return { error: error.message };
    }
  }

  processScrapedData(scrapedData) {
    const processed = {
      ingredients: new Set(),
      nutritionalInfo: [],
      healthRecommendations: [],
      preparationMethods: [],
      veterinaryInsights: [],
      researchFindings: [],
      source: scrapedData.source.url,
      type: scrapedData.source.type,
      category: scrapedData.source.category,
      credibility: 10
    };

    const { data } = scrapedData;

    // Enhanced ingredient extraction
    const ingredientPatterns = [
      /\b(?:chicken|turkey|beef|lamb|fish|salmon|tuna|sweet potato|pumpkin|carrot|pea|rice|oat)\b/gi,
      /\b(?:taurine|lysine|glucosamine|chondroitin|probiotic|enzyme)\b/gi,
      /\b(?:vitamin|mineral|supplement|nutrient)\b/gi
    ];

    const allText = [
      ...data.headings,
      ...data.content,
      ...data.lists.flat()
    ].join(' ').toLowerCase();

    ingredientPatterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        matches.forEach(match => processed.ingredients.add(match.toLowerCase()));
      }
    });

    // Health recommendations extraction
    if (Array.isArray(data.lists)) {
      data.lists.forEach(list => {
        if (Array.isArray(list)) {
          list.forEach(item => {
            const itemLower = item.toLowerCase();
            if (itemLower.includes('recommend') || itemLower.includes('important') || itemLower.includes('essential')) {
              processed.healthRecommendations.push({
                text: item,
                category: 'general-health'
              });
            }
          });
        }
      });
    }

    // Convert Set to Array
    processed.ingredients = [...processed.ingredients];

    return processed;
  }
}

// Run test if called directly
if (require.main === module) {
  const scraper = new SimpleScraper();
  scraper.testSingleSource()
    .then(() => {
      console.log('🎉 Test completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}