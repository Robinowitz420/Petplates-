const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const pdfParse = require('pdf-parse');

class PetRecipeScraper {
  constructor() {
    this.sources = this.getEducationalSources();
    this.rateLimiter = this.createRateLimiter();
    this.userAgent = 'EducationalResearchBot/1.0 (research@petnutrition.edu) - Academic Research Project';
  }

  getEducationalSources() {
    return [
      // PREMIUM SOURCES - Highest Quality Veterinary Research
      // Tufts University Cummings School of Veterinary Medicine
      {
        url: 'https://vetnutrition.tufts.edu/',
        type: 'veterinary-nutrition',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4, h5',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // Balance IT - Dr. Cailin Heinze (Veterinary Nutritionist)
      {
        url: 'https://balanceit.com/',
        type: 'veterinary-nutrition',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // Whole Dog Journal
      {
        url: 'https://www.whole-dog-journal.com/',
        type: 'pet-health-education',
        category: 'dogs',
        selectors: {
          content: '.content, article, .entry-content, .post-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // Dr. Karen Becker - Mercola Healthy Pets
      {
        url: 'https://healthypets.mercola.com/',
        type: 'holistic-veterinary',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .entry-content, .post-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // Dr. Judy Morgan
      {
        url: 'https://drjudymorgan.com/',
        type: 'veterinary-nutrition',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .entry-content, .post-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // Lafeber Company - Avian Veterinary
      {
        url: 'https://lafeber.com/',
        type: 'avian-veterinary',
        category: 'birds',
        selectors: {
          content: '.content, article, .entry-content, .main-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // Association of Avian Veterinarians
      {
        url: 'https://www.aav.org/',
        type: 'avian-veterinary',
        category: 'birds',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // Association of Exotic Mammal Veterinarians
      {
        url: 'https://www.aemv.org/',
        type: 'exotic-mammal-veterinary',
        category: 'pocket-pets',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // House Rabbit Society
      {
        url: 'https://rabbit.org/',
        type: 'rabbit-care',
        category: 'pocket-pets',
        selectors: {
          content: '.content, article, .entry-content, .main-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // California Academy of Sciences - Herpetology
      {
        url: 'https://www.calacademy.org/',
        type: 'herpetology-education',
        category: 'reptiles',
        selectors: {
          content: '.content, article, .entry-content, .main-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // REPTILES - Additional Sources
      {
        url: 'https://www.reptifiles.com/',
        type: 'reptile-care',
        category: 'reptiles',
        selectors: {
          content: '.content, article, .entry-content, .main-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reptilesmagazine.com/',
        type: 'reptile-education',
        category: 'reptiles',
        selectors: {
          content: '.content, article, .entry-content, .main-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.beardeddragon.org/',
        type: 'reptile-forum',
        category: 'reptiles',
        selectors: {
          content: '.content, article, .entry-content, .main-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // BIRDS - Additional Sources
      {
        url: 'https://www.parrots.org/',
        type: 'avian-education',
        category: 'birds',
        selectors: {
          content: '.content, article, .entry-content, .main-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // POCKET PETS - Additional Sources
      {
        url: 'https://www.guineapigcages.com/',
        type: 'pocket-pet-care',
        category: 'pocket-pets',
        selectors: {
          content: '.content, article, .entry-content, .main-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.hamsterhideout.com/',
        type: 'pocket-pet-care',
        category: 'pocket-pets',
        selectors: {
          content: '.content, article, .entry-content, .main-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // ADDITIONAL VETERINARY SCHOOL SOURCES
      // Cornell University College of Veterinary Medicine
      {
        url: 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-nutrition',
        type: 'veterinary-nutrition',
        category: 'cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // University of California Davis Veterinary Medicine
      {
        url: 'https://www.vetmed.ucdavis.edu/hospital/small-animal/nutrition',
        type: 'veterinary-nutrition',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // Colorado State University Veterinary Teaching Hospital
      {
        url: 'https://www.csu.edu/',
        type: 'veterinary-nutrition',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // University of Florida Veterinary Hospitals
      {
        url: 'https://smallanimal.vethospital.ufl.edu/',
        type: 'veterinary-nutrition',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // ADDITIONAL SPECIALTY SOURCES
      // American College of Veterinary Nutrition (ACVN)
      {
        url: 'https://www.acvn.org/',
        type: 'veterinary-nutrition-specialty',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // World Small Animal Veterinary Association (WSAVA)
      {
        url: 'https://wsava.org/',
        type: 'international-veterinary',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // American Animal Hospital Association (AAHA)
      {
        url: 'https://www.aaha.org/',
        type: 'veterinary-practice',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // =================================================================
      // FORUM AND COMMUNITY SOURCES (User-Generated Content)
      // =================================================================

      // REDDIT COMMUNITIES
      {
        url: 'https://www.reddit.com/r/dogs/',
        type: 'pet-forum-reddit',
        category: 'dogs',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/cats/',
        type: 'pet-forum-reddit',
        category: 'cats',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/veterinary/',
        type: 'professional-forum-reddit',
        category: 'dogs-cats',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/dogfood/',
        type: 'nutrition-forum-reddit',
        category: 'dogs',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/catfood/',
        type: 'nutrition-forum-reddit',
        category: 'cats',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/birdfood/',
        type: 'nutrition-forum-reddit',
        category: 'birds',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/rabbits/',
        type: 'pet-forum-reddit',
        category: 'pocket-pets',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/hamsters/',
        type: 'pet-forum-reddit',
        category: 'pocket-pets',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      // Additional Reddit Sources for Exotics
      {
        url: 'https://www.reddit.com/r/parrots/',
        type: 'pet-forum-reddit',
        category: 'birds',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/cockatiel/',
        type: 'pet-forum-reddit',
        category: 'birds',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/budgies/',
        type: 'pet-forum-reddit',
        category: 'birds',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/BeardedDragons/',
        type: 'pet-forum-reddit',
        category: 'reptiles',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/leopardgeckos/',
        type: 'pet-forum-reddit',
        category: 'reptiles',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/snakes/',
        type: 'pet-forum-reddit',
        category: 'reptiles',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/guineapigs/',
        type: 'pet-forum-reddit',
        category: 'pocket-pets',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/chinchilla/',
        type: 'pet-forum-reddit',
        category: 'pocket-pets',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/ferrets/',
        type: 'pet-forum-reddit',
        category: 'pocket-pets',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.reddit.com/r/hedgehog/',
        type: 'pet-forum-reddit',
        category: 'pocket-pets',
        selectors: {
          content: '.Post, [data-testid="post-container"], .Comment',
          headings: 'h1, h2, h3, h4, .Post h3, .Comment h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // PET FORUMS AND COMMUNITIES
      {
        url: 'https://www.dogforum.com/',
        type: 'pet-forum-general',
        category: 'dogs',
        selectors: {
          content: '.post-content, .thread-content, .message-content',
          headings: 'h1, h2, h3, h4, .threadtitle',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.catforum.com/',
        type: 'pet-forum-general',
        category: 'cats',
        selectors: {
          content: '.post-content, .thread-content, .message-content',
          headings: 'h1, h2, h3, h4, .threadtitle',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.petforums.co.uk/',
        type: 'pet-forum-general',
        category: 'dogs-cats',
        selectors: {
          content: '.post-content, .thread-content, .message-content',
          headings: 'h1, h2, h3, h4, .threadtitle',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.petcommunity.com/',
        type: 'pet-forum-general',
        category: 'dogs-cats',
        selectors: {
          content: '.post-content, .thread-content, .message-content',
          headings: 'h1, h2, h3, h4, .threadtitle',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // SPECIALIZED PET FORUMS
      {
        url: 'https://www.birdforum.net/',
        type: 'pet-forum-specialized',
        category: 'birds',
        selectors: {
          content: '.post-content, .thread-content, .message-content',
          headings: 'h1, h2, h3, h4, .threadtitle',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.rabbitforum.com/',
        type: 'pet-forum-specialized',
        category: 'pocket-pets',
        selectors: {
          content: '.post-content, .thread-content, .message-content',
          headings: 'h1, h2, h3, h4, .threadtitle',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.guineapigcages.com/forum/',
        type: 'pet-forum-specialized',
        category: 'pocket-pets',
        selectors: {
          content: '.post-content, .thread-content, .message-content',
          headings: 'h1, h2, h3, h4, .threadtitle',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // DIGG AND OTHER SOCIAL NEWS
      {
        url: 'https://digg.com/',
        type: 'social-news-aggregator',
        category: 'general',
        selectors: {
          content: '.digg-story, .content, article',
          headings: 'h1, h2, h3, h4, .digg-story__title',
          lists: 'ul, ol',
          tables: 'table'
        }
      },

      // PET NEWS AND DISCUSSION SITES
      {
        url: 'https://www.petmd.com/',
        type: 'pet-news-discussion',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .post-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      },
      {
        url: 'https://www.aspca.org/pet-care',
        type: 'animal-welfare-forum',
        category: 'dogs-cats',
        selectors: {
          content: '.content, article, .main-content, .entry-content',
          headings: 'h1, h2, h3, h4',
          lists: 'ul, ol',
          tables: 'table'
        }
      }
    ];
  }

  createRateLimiter() {
    let lastRequest = 0;
    const minDelay = 3000; // 3 seconds between requests (professional sites)
    const forumDelay = 8000; // 8 seconds for forums (more restrictive)

    return {
      async wait(sourceType = 'professional') {
        const now = Date.now();
        const timeSinceLast = now - lastRequest;
        const requiredDelay = sourceType.includes('forum') || sourceType.includes('reddit') ? forumDelay : minDelay;

        if (timeSinceLast < requiredDelay) {
          const waitTime = requiredDelay - timeSinceLast;
          console.log(`⏱️  Waiting ${waitTime}ms for ${sourceType} source...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        lastRequest = Date.now();
        return true;
      }
    };
  }

  async scrapeSource(source) {
    console.log(`🔍 Scraping: ${source.url}`);

    // Try HTTP first (more reliable), fall back to Puppeteer if needed
    try {
      const response = await axios.get(source.url, {
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

      const extractTables = () => {
        const tables = $('table');
        return tables.map((i, table) => {
          const rows = $(table).find('tr');
          return rows.map((j, row) => {
            const cells = $(row).find('td, th');
            return cells.map((k, cell) => $(cell).text().trim()).get();
          }).get();
        }).get();
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

      const data = {
        title: $('title').text().trim(),
        headings: extractText(source.selectors.headings),
        content: extractText(source.selectors.content),
        lists: extractLists() || [],
        tables: extractTables() || [],
        url: response.config.url,
        timestamp: new Date().toISOString(),
        method: 'http-primary'
      };

      // Special handling for forum content
      if (source.type.includes('forum') || source.type.includes('reddit')) {
        const forumData = this.extractForumContent($, source);
        data.forumPosts = forumData.posts;
        data.forumComments = forumData.comments;
        data.forumThreads = forumData.threads;
      }

      // Extract PDF content if available
      const pdfContents = await this.findAndExtractPdfs($, response.config.url);
      if (pdfContents.length > 0) {
        data.pdfs = pdfContents;
      }

      console.log(`✅ Successfully scraped (HTTP): ${source.url}`);
      return {
        source: source,
        data: data,
        success: true
      };

    } catch (httpError) {
      console.log(`⚠️ HTTP failed for ${source.url}, trying Puppeteer fallback...`);

      // Fallback to Puppeteer for JavaScript-heavy sites
      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--disable-default-apps',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ],
          ignoreDefaultArgs: ['--disable-extensions'],
          ignoreHTTPSErrors: true,
          timeout: 60000
        });

        try {
          const page = await browser.newPage();

          // Set headers to appear more legitimate
          await page.setUserAgent(this.userAgent);
          await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          });

          // Navigate and wait for content to load
          await page.goto(source.url, {
            waitUntil: 'networkidle2',
            timeout: 30000
          });

          // Extract data using page evaluation
          const data = await page.evaluate((selectors) => {
            const extractText = (selector) => {
              const elements = document.querySelectorAll(selector);
              return Array.from(elements).map(el => el.textContent.trim()).filter(text => text.length > 0);
            };

            const extractTables = () => {
              const tables = document.querySelectorAll('table');
              return Array.from(tables).map(table => {
                const rows = table.querySelectorAll('tr');
                return Array.from(rows).map(row => {
                  const cells = row.querySelectorAll('td, th');
                  return Array.from(cells).map(cell => cell.textContent.trim());
                });
              });
            };

            const extractLists = () => {
              const lists = document.querySelectorAll('ul, ol');
              return Array.from(lists).map(list => {
                const items = list.querySelectorAll('li');
                return Array.from(items).map(item => item.textContent.trim()).filter(text => text.length > 0);
              });
            };

            return {
              title: document.title,
              headings: extractText(selectors.headings),
              content: extractText(selectors.content),
              lists: extractLists(),
              tables: extractTables(),
              url: window.location.href,
              timestamp: new Date().toISOString()
            };
          }, source.selectors);

          console.log(`✅ Successfully scraped (Puppeteer fallback): ${source.url}`);
          return {
            source: source,
            data: data,
            success: true
          };

        } finally {
          await browser.close();
        }

      } catch (puppeteerError) {
        console.error(`❌ Both HTTP and Puppeteer failed for ${source.url}:`, httpError.message, puppeteerError.message);
        return {
          source: source,
          error: `HTTP: ${httpError.message}, Puppeteer: ${puppeteerError.message}`,
          success: false
        };
      }
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
      credibility: this.assessSourceCredibility(scrapedData.source)
    };

    if (!scrapedData.success || !scrapedData.data) {
      return processed;
    }

    const { data } = scrapedData;

    // Enhanced ingredient extraction with species-specific patterns
    const ingredientPatterns = this.getIngredientPatterns(scrapedData.source.category);

    const allText = [
      ...data.headings,
      ...data.content,
      ...data.lists.flat(),
      ...(data.pdfs ? data.pdfs.map(pdf => pdf.content.text).join(' ') : []),
      ...(data.forumPosts ? data.forumPosts.map(post => post.title + ' ' + post.content).join(' ') : []),
      ...(data.forumComments ? data.forumComments.map(comment => comment.content).join(' ') : []),
      ...(data.forumThreads ? data.forumThreads.map(thread => thread.title + ' ' + thread.content).join(' ') : [])
    ].join(' ').toLowerCase();

    ingredientPatterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        matches.forEach(match => processed.ingredients.add(match.toLowerCase()));
      }
    });

    // Extract nutritional information from tables with better categorization
    data.tables.forEach(table => {
      table.forEach(row => {
        const rowText = row.join(' ').toLowerCase();
        if (this.isNutritionalContent(rowText)) {
          processed.nutritionalInfo.push({
            data: row,
            category: this.categorizeNutrient(rowText),
            source: scrapedData.source.type
          });
        }
      });
    });

    // Enhanced health recommendations extraction
    if (Array.isArray(data.lists)) {
      data.lists.forEach(list => {
        if (Array.isArray(list)) {
          list.forEach(item => {
            const itemLower = item.toLowerCase();
            if (this.isHealthRecommendation(itemLower)) {
              processed.healthRecommendations.push({
                text: item,
                category: this.categorizeHealthConcern(itemLower),
                source: scrapedData.source.type
              });
            }
          });
        }
      });
    }

    // Extract preparation methods with species context
    if (Array.isArray(data.lists)) {
      data.lists.forEach(list => {
        if (Array.isArray(list)) {
          list.forEach(item => {
            const itemLower = item.toLowerCase();
            if (this.isPreparationMethod(itemLower)) {
              processed.preparationMethods.push({
                text: item,
                species: scrapedData.source.category,
                method: this.categorizePrepMethod(itemLower)
              });
            }
          });
        }
      });
    }

    // Extract veterinary insights and research findings with NLP enhancement
    const allContent = [...data.headings, ...data.content];
    allContent.forEach(content => {
      const contentLower = content.toLowerCase();

      // Veterinary insights (from DACVN vets, university research)
      if (this.isVeterinaryInsight(contentLower)) {
        const nlpAnalysis = this.processTextWithNLP(content);
        processed.veterinaryInsights.push({
          text: content,
          type: scrapedData.source.type,
          credibility: processed.credibility,
          nlpAnalysis: nlpAnalysis
        });
      }

      // Research findings
      if (this.isResearchFinding(contentLower)) {
        const nlpAnalysis = this.processTextWithNLP(content);
        processed.researchFindings.push({
          text: content,
          source: scrapedData.source.url,
          category: scrapedData.source.category,
          nlpAnalysis: nlpAnalysis
        });
      }
    });

    // Convert Set to Array for JSON serialization
    processed.ingredients = [...processed.ingredients];

    return processed;
  }

  getIngredientPatterns(category) {
    const basePatterns = [
      /\b(?:chicken|turkey|beef|lamb|fish|salmon|tuna|sweet potato|pumpkin|carrot|pea|rice|oat)\b/gi,
      /\b(?:taurine|lysine|glucosamine|chondroitin|probiotic|enzyme)\b/gi,
      /\b(?:vitamin|mineral|supplement|nutrient)\b/gi
    ];

    const categoryPatterns = {
      'dogs-cats': [
        /\b(?:heart|kidney|bladder|prostate|thyroid|adrenal)\b/gi,
        /\b(?:omega-3|omega-6|epa|dha|antioxidant)\b/gi
      ],
      'birds': [
        /\b(?:pellet|seed|millet|sprout|chop|fruit|vegetable)\b/gi,
        /\b(?:cuttlebone|grit|calcium|vitamin-d)\b/gi
      ],
      'reptiles': [
        /\b(?:cricket|mealworm|superworm|roach|dubia|gut-loading|hornworm|silkworm|waxworm|phoenix|black.*soldier.*fly|locust|mantid|fruit.*fly)\b/gi,
        /\b(?:collard|mustard|dandelion|turnip|beet|greens|kale|spinach|arugula|endive|escarole|bok.*choy|cabbage|squash|pumpkin|butternut|acorn)\b/gi,
        /\b(?:calcium|phosphorus|vitamin.*d|uvb|supplement|dusting|gut.*load)\b/gi
      ],
      'pocket-pets': [
        /\b(?:hay|timothy|alfalfa|pellet|block|treat|orchard.*grass|meadow|bermuda|bluegrass|fescue|ryegrass|straw)\b/gi,
        /\b(?:vitamin-c|guinea.*pig|chinchilla|degus|rabbit|hamster|gerbil|rat|mouse|ferret|hedgehog)\b/gi,
        /\b(?:romaine|lettuce|bell.*pepper|carrot|cucumber|parsley|cilantro|kale|spinach|broccoli|arugula)\b/gi,
        /\b(?:apple|strawberry|blueberry|banana|melon|grape|papaya|pear|peach|plum|apricot|cherry)\b/gi
      ]
    };

    return [...basePatterns, ...(categoryPatterns[category] || [])];
  }

  assessSourceCredibility(source) {
    const credibilityScores = {
      // PROFESSIONAL VETERINARY SOURCES (High Credibility)
      'veterinary-nutrition': 10,           // DACVN certified vets
      'veterinary-nutrition-specialty': 10, // ACVN board certified
      'holistic-veterinary': 8,             // Experienced holistic vets
      'pet-health-education': 7,            // Reputable publications
      'avian-veterinary': 9,                // Avian specialists
      'exotic-mammal-veterinary': 9,        // Exotic mammal vets
      'rabbit-care': 8,                     // Species-specific experts
      'herpetology-education': 8,           // Academic herpetology
      'international-veterinary': 9,        // WSAVA global standards
      'veterinary-practice': 8,             // AAHA practice guidelines

      // USER-GENERATED FORUM CONTENT (Lower Credibility)
      'pet-forum-reddit': 3,                // Reddit communities - mixed quality
      'professional-forum-reddit': 4,       // r/veterinary - some professional input
      'nutrition-forum-reddit': 3,          // Food-specific subreddits
      'pet-forum-general': 3,               // General pet forums
      'pet-forum-specialized': 4,           // Species-specific forums
      'social-news-aggregator': 2,          // Digg, etc. - highly variable
      'pet-news-discussion': 5,             // PetMD discussions - some expert input
      'animal-welfare-forum': 6             // ASPCA forums - higher credibility
    };

    return credibilityScores[source.type] || 5;
  }

  isNutritionalContent(text) {
    return text.includes('protein') || text.includes('fat') || text.includes('calcium') ||
           text.includes('phosphorus') || text.includes('vitamin') || text.includes('mineral') ||
           text.includes('kcal') || text.includes('calorie') || text.includes('nutrition');
  }

  categorizeNutrient(text) {
    if (text.includes('protein')) return 'protein';
    if (text.includes('fat') || text.includes('lipid')) return 'fat';
    if (text.includes('calcium') || text.includes('phosphorus')) return 'minerals';
    if (text.includes('vitamin')) return 'vitamins';
    if (text.includes('kcal') || text.includes('calorie')) return 'energy';
    return 'other';
  }

  isHealthRecommendation(text) {
    return text.includes('recommend') || text.includes('important') || text.includes('essential') ||
           text.includes('provide') || text.includes('include') || text.includes('add') ||
           text.includes('should') || text.includes('avoid') || text.includes('prevent');
  }

  categorizeHealthConcern(text) {
    if (text.includes('kidney') || text.includes('renal') || text.includes('urinary')) return 'kidney-urinary';
    if (text.includes('joint') || text.includes('arthritis') || text.includes('hip')) return 'joint-health';
    if (text.includes('skin') || text.includes('coat') || text.includes('hair')) return 'skin-coat';
    if (text.includes('digestive') || text.includes('gut') || text.includes('stomach')) return 'digestive-health';
    if (text.includes('heart') || text.includes('cardiac')) return 'cardiac-health';
    if (text.includes('immune') || text.includes('vitamin')) return 'immune-system';
    if (text.includes('weight') || text.includes('obesity')) return 'weight-management';
    if (text.includes('diabetes') || text.includes('blood sugar')) return 'diabetes';
    if (text.includes('allerg')) return 'allergies';
    return 'general-health';
  }

  isPreparationMethod(text) {
    return text.includes('cook') || text.includes('prepare') || text.includes('serve') ||
           text.includes('feed') || text.includes('mix') || text.includes('combine') ||
           text.includes('chop') || text.includes('blend') || text.includes('boil');
  }

  categorizePrepMethod(text) {
    if (text.includes('raw') || text.includes('fresh')) return 'raw-fresh';
    if (text.includes('cook') || text.includes('boil') || text.includes('steam')) return 'cooked';
    if (text.includes('dry') || text.includes('dehydrate')) return 'dried';
    if (text.includes('freeze') || text.includes('frozen')) return 'frozen';
    return 'general';
  }

  isVeterinaryInsight(text) {
    return text.includes('veterinary') || text.includes('veterinarian') ||
           text.includes('clinical') || text.includes('study') || text.includes('research') ||
           text.includes('evidence') || text.includes('based on');
  }

  isResearchFinding(text) {
    return text.includes('study') || text.includes('research') || text.includes('found') ||
            text.includes('according to') || text.includes('evidence') || text.includes('clinical trial');
  }

  // Basic NLP processing for enhanced content analysis
  processTextWithNLP(text) {
    const sentences = this.segmentSentences(text);
    const keywords = this.extractKeywords(text);
    const relationships = this.extractRelationships(text);

    return {
      sentences,
      keywords,
      relationships,
      sentiment: this.analyzeSentiment(text),
      entities: this.extractEntities(text)
    };
  }

  segmentSentences(text) {
    // Basic sentence segmentation
    return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  }

  extractKeywords(text) {
    const keywords = [];
    const textLower = text.toLowerCase();

    // Ingredient keywords
    const ingredientWords = ['chicken', 'turkey', 'beef', 'lamb', 'fish', 'salmon', 'taurine', 'vitamin', 'mineral', 'protein', 'fat', 'fiber'];
    ingredientWords.forEach(word => {
      if (textLower.includes(word)) keywords.push(word);
    });

    // Health keywords
    const healthWords = ['health', 'nutrition', 'diet', 'disease', 'treatment', 'prevention', 'supplement', 'vitamin'];
    healthWords.forEach(word => {
      if (textLower.includes(word)) keywords.push(word);
    });

    return [...new Set(keywords)]; // Remove duplicates
  }

  extractRelationships(text) {
    const relationships = [];
    const textLower = text.toLowerCase();

    // Look for ingredient-health relationships
    const patterns = [
      { pattern: /(\w+)\s+(?:helps|supports|aids|benefits)\s+(\w+)/gi, type: 'benefit' },
      { pattern: /(\w+)\s+(?:prevents|reduces|helps with)\s+(\w+)/gi, type: 'prevention' },
      { pattern: /(\w+)\s+(?:causes|leads to|results in)\s+(\w+)/gi, type: 'cause' }
    ];

    patterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(textLower)) !== null) {
        relationships.push({
          subject: match[1],
          object: match[2],
          type: type,
          context: text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
        });
      }
    });

    return relationships;
  }

  // Forum-specific content extraction
  extractForumContent($, source) {
    const forumData = {
      posts: [],
      comments: [],
      threads: []
    };

    try {
      // REDDIT SPECIFIC EXTRACTION
      if (source.url.includes('reddit.com')) {
        // Extract Reddit posts
        $('[data-testid="post-container"], .Post').each((i, post) => {
          const $post = $(post);
          const title = $post.find('h3, [data-testid="post-title"]').text().trim();
          const content = $post.find('[data-testid="post-content"], .Post-body').text().trim();
          const author = $post.find('[data-testid="post_author_link"], .author').text().trim();
          const upvotes = $post.find('[data-testid="upvote-button"], .score').text().trim();

          if (title || content) {
            forumData.posts.push({
              title,
              content,
              author: author || 'anonymous',
              upvotes: upvotes || '0',
              timestamp: new Date().toISOString(),
              type: 'reddit-post'
            });
          }
        });

        // Extract Reddit comments
        $('.Comment, [data-testid="comment"]').each((i, comment) => {
          const $comment = $(comment);
          const content = $comment.find('[data-testid="comment-content"], .Comment-body').text().trim();
          const author = $comment.find('[data-testid="comment_author_link"], .author').text().trim();
          const upvotes = $comment.find('[data-testid="upvote-button"], .score').text().trim();

          if (content && content.length > 10) {
            forumData.comments.push({
              content,
              author: author || 'anonymous',
              upvotes: upvotes || '0',
              timestamp: new Date().toISOString(),
              type: 'reddit-comment'
            });
          }
        });
      }

      // GENERAL FORUM EXTRACTION
      else {
        // Extract forum threads/posts
        $('.thread, .post, .topic, [class*="thread"], [class*="post"]').each((i, thread) => {
          const $thread = $(thread);
          const title = $thread.find('.threadtitle, .post-title, h2, h3').text().trim();
          const content = $thread.find('.post-content, .thread-content, .message-content').text().trim();
          const author = $thread.find('.author, .username, .poster').text().trim();
          const replies = $thread.find('.replies, .comments').text().trim();

          if (title || content) {
            forumData.threads.push({
              title,
              content,
              author: author || 'anonymous',
              replies: replies || '0',
              timestamp: new Date().toISOString(),
              type: 'forum-thread'
            });
          }
        });

        // Extract forum replies/comments
        $('.reply, .comment, [class*="reply"], [class*="comment"]').each((i, reply) => {
          const $reply = $(reply);
          const content = $reply.find('.reply-content, .comment-content, .message').text().trim();
          const author = $reply.find('.author, .username').text().trim();

          if (content && content.length > 10) {
            forumData.comments.push({
              content,
              author: author || 'anonymous',
              timestamp: new Date().toISOString(),
              type: 'forum-reply'
            });
          }
        });
      }

      // Limit results to prevent overwhelming data
      forumData.posts = forumData.posts.slice(0, 20);
      forumData.comments = forumData.comments.slice(0, 50);
      forumData.threads = forumData.threads.slice(0, 20);

    } catch (error) {
      console.error('Error extracting forum content:', error);
    }

    return forumData;
  }

  analyzeSentiment(text) {
    const positiveWords = ['beneficial', 'healthy', 'good', 'excellent', 'recommended', 'essential', 'important'];
    const negativeWords = ['harmful', 'dangerous', 'toxic', 'avoid', 'risk', 'problem', 'issue'];

    const textLower = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
      if (textLower.includes(word)) score += 1;
    });

    negativeWords.forEach(word => {
      if (textLower.includes(word)) score -= 1;
    });

    return score;
  }

  extractEntities(text) {
    const entities = { ingredients: [], conditions: [], nutrients: [] };

    const textLower = text.toLowerCase();

    // Extract ingredients
    const ingredientPatterns = [
      /\b(?:chicken|turkey|beef|lamb|fish|salmon|tuna|sweet potato|pumpkin|carrot|pea|rice|oat)\b/gi,
      /\b(?:taurine|lysine|glucosamine|chondroitin|probiotic|enzyme)\b/gi,
      /\b(?:vitamin|mineral|supplement|nutrient)\b/gi
    ];

    ingredientPatterns.forEach(pattern => {
      const matches = textLower.match(pattern);
      if (matches) {
        entities.ingredients.push(...matches);
      }
    });

    // Extract health conditions
    const conditionPatterns = [
      /\b(?:kidney|bladder|urinary|joint|arthritis|skin|coat|digestive|heart|cardiac)\b/gi,
      /\b(?:diabetes|obesity|weight|immune|allerg)\b/gi
    ];

    conditionPatterns.forEach(pattern => {
      const matches = textLower.match(pattern);
      if (matches) {
        entities.conditions.push(...matches);
      }
    });

    // Extract nutrients
    const nutrientPatterns = [
      /\b(?:protein|fat|calcium|phosphorus|vitamin|mineral|kcal|calorie)\b/gi
    ];

    nutrientPatterns.forEach(pattern => {
      const matches = textLower.match(pattern);
      if (matches) {
        entities.nutrients.push(...matches);
      }
    });

    // Remove duplicates
    entities.ingredients = [...new Set(entities.ingredients)];
    entities.conditions = [...new Set(entities.conditions)];
    entities.nutrients = [...new Set(entities.nutrients)];

    return entities;
  }

  // PDF content extraction capability
  async extractPdfContent(url) {
    try {
      console.log(`📄 Extracting PDF content from: ${url}`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/pdf,*/*'
        },
        timeout: 30000
      });

      const data = await pdfParse(Buffer.from(response.data));
      const text = data.text;

      console.log(`📄 Extracted ${text.length} characters from PDF`);

      return {
        text: text,
        pages: data.numpages,
        info: data.info,
        url: url
      };

    } catch (error) {
      console.error(`❌ PDF extraction failed for ${url}:`, error.message);
      return null;
    }
  }

  async findAndExtractPdfs($, baseUrl) {
    const pdfLinks = [];

    // Find all PDF links
    $('a[href$=".pdf"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
        pdfLinks.push({
          url: fullUrl,
          text: $(elem).text().trim(),
          title: $(elem).attr('title') || $(elem).text().trim()
        });
      }
    });

    console.log(`📄 Found ${pdfLinks.length} PDF links`);

    // Extract content from PDFs (limit to first 3 for performance)
    const pdfContents = [];
    for (let i = 0; i < Math.min(pdfLinks.length, 3); i++) {
      const pdfContent = await this.extractPdfContent(pdfLinks[i].url);
      if (pdfContent) {
        pdfContents.push({
          ...pdfLinks[i],
          content: pdfContent
        });
      }
      // Rate limiting between PDF downloads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return pdfContents;
  }

  async scrapeAll() {
    console.log('🚀 Starting comprehensive pet nutrition research scraping...');
    console.log(`📋 Will scrape ${this.sources.length} educational sources`);

    const results = [];

    for (let i = 0; i < this.sources.length; i++) {
      const source = this.sources[i];
      console.log(`\n📊 Progress: ${i + 1}/${this.sources.length}`);

      await this.rateLimiter.wait(source.type);

      try {
        const scrapedData = await this.scrapeSource(source);
        const processedData = this.processScrapedData(scrapedData);
        results.push(processedData);

        // Save individual results
        const filename = `source_${i + 1}_${source.type}.json`;
        await fs.writeJson(path.join(__dirname, 'results', filename), processedData, { spaces: 2 });

      } catch (error) {
        console.error(`💥 Error processing ${source.url}:`, error);
        results.push({
          source: source.url,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  async saveResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pet_nutrition_research_${timestamp}.json`;

    // Generate insights from successful results
    const successfulResults = results.filter(r => r.success !== false);
    const insights = this.generateInsights(successfulResults);

    await fs.ensureDir(path.join(__dirname, 'results'));
    await fs.writeJson(path.join(__dirname, 'results', filename), {
      metadata: {
        totalSources: results.length,
        successfulScrapes: successfulResults.length,
        timestamp: new Date().toISOString(),
        description: 'Educational research data for pet nutrition analysis'
      },
      results: results,
      insights: insights
    }, { spaces: 2 });

    console.log(`💾 Results saved to: results/${filename}`);
    console.log(`📊 Generated insights: ${Object.keys(insights.commonIngredients).length} common ingredients found`);
    return filename;
  }

  // Generate insights from scraped data
  generateInsights(results) {
    const insights = {
      commonIngredients: {},
      nutritionalThemes: {},
      healthFocusAreas: {},
      preparationPatterns: {}
    };

    results.forEach(result => {
      if (result.success === false) return;

      // Count ingredient frequency
      result.ingredients.forEach(ingredient => {
        insights.commonIngredients[ingredient] = (insights.commonIngredients[ingredient] || 0) + 1;
      });

      // Analyze health recommendations
      result.healthRecommendations.forEach(rec => {
        const theme = this.categorizeHealthTheme(rec.text || rec);
        insights.healthFocusAreas[theme] = (insights.healthFocusAreas[theme] || 0) + 1;
      });
    });

    return insights;
  }

  categorizeHealthTheme(text) {
    const textLower = text.toLowerCase();

    if (textLower.includes('taurine') || textLower.includes('heart')) return 'cardiac-health';
    if (textLower.includes('joint') || textLower.includes('arthritis')) return 'joint-health';
    if (textLower.includes('kidney') || textLower.includes('urinary')) return 'renal-health';
    if (textLower.includes('skin') || textLower.includes('coat') || textLower.includes('omega')) return 'skin-coat';
    if (textLower.includes('digestive') || textLower.includes('gut')) return 'digestive-health';
    if (textLower.includes('immune') || textLower.includes('vitamin')) return 'immune-system';
    if (textLower.includes('weight') || textLower.includes('obesity')) return 'weight-management';
    if (textLower.includes('hairball') || textLower.includes('fiber')) return 'hairball-prevention';

    return 'general-nutrition';
  }
}

// Export for use in other files
module.exports = PetRecipeScraper;

// CLI usage
if (require.main === module) {
  const scraper = new PetRecipeScraper();

  scraper.scrapeAll()
    .then(results => {
      return scraper.saveResults(results);
    })
    .then(filename => {
      console.log('🎉 Scraping complete!');
      console.log(`📁 Results saved to: scraping/results/${filename}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Scraping failed:', error);
      process.exit(1);
    });
}