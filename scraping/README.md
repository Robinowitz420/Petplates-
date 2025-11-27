# 🕷️ Pet Nutrition Research Scraper

A comprehensive web scraper for gathering educational pet nutrition data from veterinary and educational sources. This tool helps research and improve recipe generation algorithms by collecting nutritional information, ingredient patterns, and health recommendations from reputable sources.

## ⚖️ Legal & Ethical Notice

**IMPORTANT:** This scraper is designed for educational and research purposes only. It targets publicly available information from educational institutions and veterinary organizations. Always respect website terms of service and robots.txt files.

- ✅ **Permitted:** Educational research, public domain data, veterinary guidelines
- ❌ **Not Permitted:** Commercial use, copyright infringement, overwhelming servers

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the scraper
npm run scrape
```

## 📊 What It Scrapes

### Target Sources (Premium Veterinary & Educational)
- **Tufts University Cummings School** - Board-certified veterinary nutritionists (DACVN)
- **Balance IT (Dr. Cailin Heinze)** - Leading veterinary nutrition research
- **Whole Dog Journal** - Reputable pet health journalism
- **Dr. Karen Becker (Mercola)** - Holistic veterinary expertise
- **Dr. Judy Morgan** - Veterinary nutrition specialist
- **Lafeber Company** - Avian veterinary excellence
- **Association of Avian Veterinarians** - Bird health specialists
- **Association of Exotic Mammal Veterinarians** - Pocket pet experts
- **House Rabbit Society** - Definitive rabbit care authority
- **California Academy of Sciences** - Herpetology research

### Data Collected
- **Ingredients & Nutrients:** Common ingredients mentioned in veterinary literature
- **Nutritional Information:** Tables and data about nutrient requirements
- **Health Recommendations:** Veterinary advice on pet nutrition
- **Preparation Methods:** Safe food preparation techniques

## 🏗️ Architecture

```
scraping/
├── scraper.js          # Main scraping engine
├── package.json        # Dependencies and scripts
├── results/           # Scraped data output
│   ├── source_1_cat-nutrition.json
│   ├── source_2_dog-nutrition.json
│   └── pet_nutrition_research_[timestamp].json
└── README.md          # This file
```

## 🔧 Technical Details

### Dependencies
- **Puppeteer:** Browser automation for JavaScript-heavy sites
- **Cheerio:** Fast HTML parsing and manipulation
- **Axios:** HTTP requests for API endpoints
- **Natural:** Text processing and analysis
- **fs-extra:** Enhanced file system operations

### Rate Limiting
- 3-second delays between requests
- Respects server load
- Includes proper user agent headers

### Data Processing
- Extracts ingredients using regex patterns
- Parses nutritional tables
- Categorizes health recommendations
- Generates research insights

## 📈 Output Format

### Individual Source Results
```json
{
  "ingredients": ["salmon", "taurine", "sweet potato", "pumpkin"],
  "nutritionalInfo": [["Protein", "30%", "25-35%"], ["Fat", "15%", "10-20%"]],
  "healthRecommendations": [
    "Taurine is essential for cats and must be supplemented",
    "Provide moisture-rich foods for urinary health"
  ],
  "preparationMethods": [
    "Cook meats thoroughly to prevent bacterial contamination",
    "Serve food at room temperature"
  ],
  "source": "https://www.vet.cornell.edu/...",
  "type": "cat-nutrition"
}
```

### Consolidated Research Report
```json
{
  "metadata": {
    "totalSources": 6,
    "successfulScrapes": 5,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "description": "Educational research data for pet nutrition analysis"
  },
  "results": [...],
  "insights": {
    "commonIngredients": { "taurine": 5, "salmon": 4 },
    "healthFocusAreas": { "cardiac-health": 12, "digestive-health": 8 }
  }
}
```

## 🎯 Usage Examples

### Basic Scraping
```javascript
const scraper = new PetRecipeScraper();
const results = await scraper.scrapeAll();
await scraper.saveResults(results);
```

### Custom Source Addition
```javascript
const customSource = {
  url: 'https://example-vet-site.com/nutrition',
  type: 'bird-nutrition',
  selectors: {
    content: '.article-content',
    headings: 'h1, h2, h3',
    lists: 'ul, ol',
    tables: 'table'
  }
};
scraper.sources.push(customSource);
```

### Data Analysis
```javascript
const insights = scraper.generateInsights(results);
console.log('Most common ingredients:', insights.commonIngredients);
console.log('Health focus areas:', insights.healthFocusAreas);
```

## 🔍 Research Applications

### Recipe Generation Improvement
- Identify commonly recommended ingredients
- Understand nutritional patterns from experts
- Validate ingredient combinations

### Health Concern Analysis
- Map ingredients to specific health conditions
- Understand veterinary recommendations
- Improve recipe scoring algorithms

### Content Validation
- Cross-reference generated recipes with expert advice
- Ensure nutritional completeness
- Validate preparation methods

## ⚠️ Best Practices

### Respectful Scraping
1. **Identify as research:** Use educational user agent
2. **Rate limit:** Minimum 3-second delays between requests
3. **Off-peak hours:** Run during non-business hours
4. **Monitor impact:** Check server response times

### Data Ethics
1. **Educational use only:** Don't use for commercial advantage
2. **Credit sources:** Always attribute information
3. **Transform data:** Create new insights, don't copy verbatim
4. **Regular review:** Update sources and methods

### Technical Maintenance
1. **Update selectors:** Websites change, update CSS selectors
2. **Handle errors:** Graceful failure for individual sources
3. **Data validation:** Check scraped data quality
4. **Version control:** Track changes to scraping logic

## 🚨 Troubleshooting

### Common Issues
- **Blocked requests:** Change user agent or add delays
- **Changed selectors:** Update CSS selectors for target sites
- **Rate limiting:** Increase delays between requests
- **JavaScript loading:** Ensure `waitUntil: 'networkidle2'`

### Error Handling
```javascript
try {
  const data = await scraper.scrapeSource(source);
} catch (error) {
  console.error(`Scraping failed: ${error.message}`);
  // Continue with other sources
}
```

## 📋 Future Enhancements

- [ ] Add more veterinary school sources
- [ ] Implement content analysis with NLP
- [ ] Create ingredient relationship mapping
- [ ] Add nutritional requirement extraction
- [ ] Implement change detection for updates
- [ ] Add support for PDF content extraction

## 🤝 Contributing

This is an educational research tool. Contributions should focus on:
- Adding reputable educational sources
- Improving data extraction accuracy
- Enhancing research analysis capabilities
- Maintaining ethical scraping practices

## 📞 Support

For questions about this research tool, please contact the development team. Remember: this tool is for educational research purposes only.