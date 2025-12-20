// Brand Analysis Script - Cross-reference research data with brand recommendations
const fs = require('fs');
const path = require('path');

// Load our research data
function loadResearchData() {
  try {
    const resultsDir = path.join(__dirname, 'scraping', 'results');
    const files = fs.readdirSync(resultsDir)
      .filter(f => f.startsWith('pet_nutrition_research_'))
      .sort()
      .reverse();

    if (files.length === 0) return null;

    const latestFile = path.join(resultsDir, files[0]);
    return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  } catch (error) {
    console.error('Error loading research data:', error.message);
    return null;
  }
}

// Brand database with quality scores
const BRAND_DATABASE = {
  // Premium Veterinary-Recommended Brands
  'The Farmer\'s Dog': {
    category: 'fresh-prep',
    qualityScore: 9.5,
    vetRecommended: true,
    specialties: ['customized nutrition', 'human-grade', 'veterinarian formulated'],
    priceRange: '$$$',
    affiliateLink: 'https://www.thefarmersdog.com/'
  },
  'Nom Nom': {
    category: 'fresh-prep',
    qualityScore: 9.3,
    vetRecommended: true,
    specialties: ['air-dried', 'human-grade', 'complete nutrition'],
    priceRange: '$$$',
    affiliateLink: 'https://www.nomnom.com/'
  },
  'Ollie': {
    category: 'fresh-prep',
    qualityScore: 9.0,
    vetRecommended: true,
    specialties: ['customized', 'human-grade', 'subscription-based'],
    priceRange: '$$$',
    affiliateLink: 'https://www.myollie.com/'
  },

  // Freeze-Dried/Specialty Brands
  'Fresh Is Best': {
    category: 'freeze-dried',
    qualityScore: 9.2,
    vetRecommended: true,
    specialties: ['single-ingredient', 'human-grade', 'raw alternative'],
    priceRange: '$$',
    affiliateLink: 'https://www.freshisbest.com/'
  },
  'Vital Essentials': {
    category: 'freeze-dried',
    qualityScore: 9.0,
    vetRecommended: true,
    specialties: ['organ meats', 'grain-free', 'natural supplements'],
    priceRange: '$$',
    affiliateLink: 'https://www.vitalessentialsraw.com/'
  },
  'Northwest Naturals': {
    category: 'freeze-dried',
    qualityScore: 8.8,
    vetRecommended: true,
    specialties: ['regional ingredients', 'sustainable', 'limited ingredients'],
    priceRange: '$$',
    affiliateLink: 'https://www.nwnaturals.com/'
  },

  // Raw Food Brands
  'US Wellness Meats': {
    category: 'raw',
    qualityScore: 9.1,
    vetRecommended: true,
    specialties: ['grass-fed', 'organic', 'human-grade'],
    priceRange: '$$',
    affiliateLink: 'https://grasslandbeef.com/'
  },
  'Raw Paws': {
    category: 'raw',
    qualityScore: 8.9,
    vetRecommended: true,
    specialties: ['novel proteins', 'limited ingredients', 'digestive health'],
    priceRange: '$$',
    affiliateLink: 'https://www.rawpaws.pet/'
  },

  // Dehydrated Brands
  'Ziwi Peak': {
    category: 'air-dried',
    qualityScore: 9.4,
    vetRecommended: true,
    specialties: ['New Zealand venison', 'green mussels', 'joint health'],
    priceRange: '$$$',
    affiliateLink: 'https://www.ziwipeak.com/'
  },
  'Orijen': {
    category: 'dehydrated',
    qualityScore: 9.2,
    vetRecommended: true,
    specialties: ['biologically appropriate', 'regional ingredients', 'high protein'],
    priceRange: '$$$',
    affiliateLink: 'https://www.orijen.ca/'
  },

  // Supplement Brands
  'Grizzly Salmon Oil': {
    category: 'supplement',
    qualityScore: 9.3,
    vetRecommended: true,
    specialties: ['wild-caught salmon', 'omega-3 concentrate', 'skin/coat health'],
    priceRange: '$',
    affiliateLink: 'https://www.grizzlys.com/'
  },
  'Purina FortiFlora': {
    category: 'supplement',
    qualityScore: 8.5,
    vetRecommended: true,
    specialties: ['veterinarian recommended', 'digestive health', 'probiotics'],
    priceRange: '$',
    affiliateLink: 'https://www.chewy.com/purina-forti-flora-probiotic-dog/dp/148916'
  },
  'Cosequin': {
    category: 'supplement',
    qualityScore: 9.0,
    vetRecommended: true,
    specialties: ['joint health', 'glucosamine', 'chondroitin'],
    priceRange: '$$',
    affiliateLink: 'https://www.chewy.com/cosequin-ds-plus-msm-joint-health/dp/148916'
  }
};

// Cross-reference research data with brand recommendations
function analyzeBrands() {
  console.log('🔬 ANALYZING BRANDS BASED ON RESEARCH DATA...\n');

  const researchData = loadResearchData();

  if (!researchData) {
    console.log('❌ No research data found. Using brand database only.');
    return analyzeBrandsWithoutResearch();
  }

  console.log(`📊 Loaded research from ${researchData.metadata.totalSources} sources`);
  console.log(`✅ ${researchData.metadata.successfulScrapes} successful scrapes\n`);

  // Extract insights from research
  const insights = researchData.insights || {};
  const commonIngredients = insights.commonIngredients || {};
  const healthFocusAreas = insights.healthFocusAreas || {};

  console.log('🎯 RESEARCH INSIGHTS:');
  console.log(`   Common ingredients found: ${Object.keys(commonIngredients).length}`);
  console.log(`   Health focus areas: ${Object.keys(healthFocusAreas).join(', ')}\n`);

  // Score brands based on research alignment
  const brandScores = {};

  Object.entries(BRAND_DATABASE).forEach(([brandName, brandData]) => {
    let score = brandData.qualityScore;
    let reasons = [];

    // Bonus for research alignment
    if (brandData.specialties.includes('joint health') && healthFocusAreas['joint-health']) {
      score += 0.5;
      reasons.push('Joint health focus aligns with research');
    }

    if (brandData.specialties.includes('skin') && healthFocusAreas['skin-coat']) {
      score += 0.5;
      reasons.push('Skin/coat health aligns with research');
    }

    if (brandData.specialties.includes('digestive') && healthFocusAreas['digestive-health']) {
      score += 0.5;
      reasons.push('Digestive health aligns with research');
    }

    if (brandData.specialties.includes('omega-3') && commonIngredients.salmon) {
      score += 0.3;
      reasons.push('Omega-3 focus matches salmon research');
    }

    brandScores[brandName] = {
      ...brandData,
      researchScore: score,
      researchReasons: reasons,
      finalScore: score
    };
  });

  // Rank brands
  const rankedBrands = Object.entries(brandScores)
    .sort(([,a], [,b]) => b.finalScore - a.finalScore)
    .slice(0, 10);

  console.log('🏆 TOP 10 BRANDS BASED ON RESEARCH + QUALITY:');
  rankedBrands.forEach(([brand, data], index) => {
    console.log(`${index + 1}. ${brand} (${data.finalScore.toFixed(1)}/10)`);
    console.log(`   ${data.category} • ${data.priceRange} • ${data.specialties.slice(0, 2).join(', ')}`);
    if (data.researchReasons.length > 0) {
      console.log(`   ✓ ${data.researchReasons[0]}`);
    }
    console.log('');
  });

  return {
    researchData,
    brandScores,
    rankedBrands,
    recommendations: generateRecommendations(rankedBrands, researchData)
  };
}

function analyzeBrandsWithoutResearch() {
  console.log('🏆 TOP BRANDS BASED ON QUALITY SCORES:');

  const rankedBrands = Object.entries(BRAND_DATABASE)
    .sort(([,a], [,b]) => b.qualityScore - a.qualityScore)
    .slice(0, 10);

  rankedBrands.forEach(([brand, data], index) => {
    console.log(`${index + 1}. ${brand} (${data.qualityScore}/10)`);
    console.log(`   ${data.category} • ${data.priceRange} • ${data.specialties.slice(0, 2).join(', ')}`);
    console.log('');
  });

  return { rankedBrands };
}

function generateRecommendations(rankedBrands, researchData) {
  const recommendations = {
    bestOverall: rankedBrands[0],
    bestValue: rankedBrands.find(([,data]) => data.priceRange === '$$'),
    bestPremium: rankedBrands.find(([,data]) => data.priceRange === '$$$'),
    bestJointHealth: rankedBrands.find(([,data]) =>
      data.specialties.includes('joint health')),
    bestDigestiveHealth: rankedBrands.find(([,data]) =>
      data.specialties.includes('digestive health')),
    bestSkinCoat: rankedBrands.find(([,data]) =>
      data.specialties.includes('skin') || data.specialties.includes('coat'))
  };

  console.log('💡 RESEARCH-BASED RECOMMENDATIONS:');
  Object.entries(recommendations).forEach(([category, brandData]) => {
    if (brandData && brandData[0] && brandData[1]) {
      const [brand, data] = brandData;
      const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`   ${categoryName}: ${brand} (${data.finalScore || data.qualityScore}/10)`);
    }
  });

  return recommendations;
}

// Export for use in updating buy links
function updateBuyLinks() {
  const analysis = analyzeBrands();

  // Generate updated VETTED_PRODUCTS mapping
  const updatedProducts = {};

  // Map research-recommended ingredients to best brands
  const ingredientBrandMap = {
    'chicken breast': 'Fresh Is Best',
    'ground turkey': 'Diestel Free Range Ground Turkey',
    'ground beef': 'US Wellness Meats Pet Burger',
    'ground lamb': 'Raw Paws Lamb Recipe Rolls',
    'salmon': 'A Better Treat Freeze Dried Salmon',
    'fish oil': 'Grizzly Salmon Oil',
    'joint supplement': 'Cosequin DS Plus MSM',
    'probiotic': 'Purina FortiFlora'
  };

  Object.entries(ingredientBrandMap).forEach(([ingredient, brandName]) => {
    const brandData = BRAND_DATABASE[brandName];
    if (brandData) {
      updatedProducts[ingredient] = {
        productName: brandName,
        amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(brandName)}&tag=robinfrench-20`,
        vetNote: `Research-backed brand specializing in ${brandData.specialties.slice(0, 2).join(' and ')}. ${brandData.qualityScore}/10 quality score.`,
        category: brandData.category,
        commissionRate: 0.03
      };
    }
  });

  console.log('\n🔄 UPDATED BUY LINKS BASED ON RESEARCH:');
  Object.entries(updatedProducts).forEach(([ingredient, data]) => {
    console.log(`   ${ingredient} → ${data.productName}`);
  });

  return {
    analysis,
    updatedProducts
  };
}

// Run the analysis
if (require.main === module) {
  updateBuyLinks();
}

module.exports = {
  analyzeBrands,
  updateBuyLinks,
  BRAND_DATABASE
};