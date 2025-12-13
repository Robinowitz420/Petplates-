import { Recipe } from '@/lib/types/recipe';
import { Pet } from '@/lib/types/pet';
import { calculateEnhancedCompatibility } from './enhancedCompatibilityScoring';

export interface ScoreDistributionAnalysis {
  totalRecipes: number;
  scoreRanges: {
    '95-100': number;
    '90-94': number;
    '80-89': number;
    '70-79': number;
    '60-69': number;
    '50-59': number;
    '40-49': number;
    '30-39': number;
    '0-29': number;
  };
  perfectMatches: number;
  clustering: {
    at40: number;
    at100: number;
  };
  averageScore: number;
  medianScore: number;
  standardDeviation: number;
  isBinaryDistribution: boolean;
  recommendations: string[];
}

/**
 * Analyze score distribution for a set of recipes and a pet
 * Helps identify clustering, binary distributions, and scoring issues
 */
export function analyzeScoreDistribution(
  recipes: Recipe[],
  pet: Pet
): ScoreDistributionAnalysis {
  const scores = recipes.map(recipe => 
    calculateEnhancedCompatibility(recipe, pet).overallScore
  );
  
  // Calculate statistics
  const totalRecipes = scores.length;
  const averageScore = scores.reduce((a, b) => a + b, 0) / totalRecipes;
  const sortedScores = [...scores].sort((a, b) => a - b);
  const medianScore = totalRecipes > 0 
    ? sortedScores[Math.floor(totalRecipes / 2)]
    : 0;
  
  // Calculate standard deviation
  const variance = scores.reduce((sum, score) => {
    return sum + Math.pow(score - averageScore, 2);
  }, 0) / totalRecipes;
  const standardDeviation = Math.sqrt(variance);
  
  // Count score ranges
  const scoreRanges = {
    '95-100': scores.filter(s => s >= 95).length,
    '90-94': scores.filter(s => s >= 90 && s < 95).length,
    '80-89': scores.filter(s => s >= 80 && s < 90).length,
    '70-79': scores.filter(s => s >= 70 && s < 80).length,
    '60-69': scores.filter(s => s >= 60 && s < 70).length,
    '50-59': scores.filter(s => s >= 50 && s < 60).length,
    '40-49': scores.filter(s => s >= 40 && s < 50).length,
    '30-39': scores.filter(s => s >= 30 && s < 40).length,
    '0-29': scores.filter(s => s < 30).length,
  };
  
  // Count perfect matches (95-100)
  const perfectMatches = scoreRanges['95-100'];
  
  // Detect clustering (scores within 2 points of 40 or 100)
  const clustering = {
    at40: scores.filter(s => Math.abs(s - 40) < 2).length,
    at100: scores.filter(s => Math.abs(s - 100) < 2).length,
  };
  
  // Check for binary distribution
  // Binary if >30% at 40 and >30% at 100, or if standard deviation is very low
  const isBinaryDistribution = 
    (clustering.at40 > totalRecipes * 0.3 && clustering.at100 > totalRecipes * 0.3) ||
    (standardDeviation < 10 && (clustering.at40 > totalRecipes * 0.2 || clustering.at100 > totalRecipes * 0.2));
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (isBinaryDistribution) {
    recommendations.push('⚠️ Binary distribution detected - adjust scoring granularity');
  }
  
  if (clustering.at40 > totalRecipes * 0.2) {
    recommendations.push('⚠️ Too many recipes clustering at 40% - lower safety floor or improve penalty granularity');
  }
  
  if (clustering.at100 > totalRecipes * 0.2) {
    recommendations.push('⚠️ Too many perfect scores - make isPerfectMatch() stricter or reduce perfect match bonus');
  }
  
  if (standardDeviation < 15) {
    recommendations.push('⚠️ Scores too similar - increase penalty/bonus differentiation');
  }
  
  if (perfectMatches > totalRecipes * 0.2) {
    recommendations.push('⚠️ Too many perfect matches (>20%) - tighten perfect match criteria');
  }
  
  if (perfectMatches === 0 && averageScore > 80) {
    recommendations.push('ℹ️ No perfect matches but high average - consider allowing some 95-100% scores');
  }
  
  if (scoreRanges['0-29'] > totalRecipes * 0.3) {
    recommendations.push('⚠️ Too many very low scores - check if penalties are too harsh');
  }
  
  return {
    totalRecipes,
    scoreRanges,
    perfectMatches,
    clustering,
    averageScore: Math.round(averageScore * 10) / 10,
    medianScore,
    standardDeviation: Math.round(standardDeviation * 10) / 10,
    isBinaryDistribution,
    recommendations,
  };
}

/**
 * Generate a detailed report of score distribution
 */
export function generateDistributionReport(
  recipes: Recipe[],
  pet: Pet
): string {
  const analysis = analyzeScoreDistribution(recipes, pet);
  
  let report = `\n=== Score Distribution Analysis ===\n\n`;
  report += `Total Recipes: ${analysis.totalRecipes}\n`;
  report += `Average Score: ${analysis.averageScore}%\n`;
  report += `Median Score: ${analysis.medianScore}%\n`;
  report += `Standard Deviation: ${analysis.standardDeviation}\n\n`;
  
  report += `Score Ranges:\n`;
  report += `  95-100: ${analysis.scoreRanges['95-100']} (${Math.round(analysis.scoreRanges['95-100'] / analysis.totalRecipes * 100)}%)\n`;
  report += `  90-94: ${analysis.scoreRanges['90-94']} (${Math.round(analysis.scoreRanges['90-94'] / analysis.totalRecipes * 100)}%)\n`;
  report += `  80-89: ${analysis.scoreRanges['80-89']} (${Math.round(analysis.scoreRanges['80-89'] / analysis.totalRecipes * 100)}%)\n`;
  report += `  70-79: ${analysis.scoreRanges['70-79']} (${Math.round(analysis.scoreRanges['70-79'] / analysis.totalRecipes * 100)}%)\n`;
  report += `  60-69: ${analysis.scoreRanges['60-69']} (${Math.round(analysis.scoreRanges['60-69'] / analysis.totalRecipes * 100)}%)\n`;
  report += `  50-59: ${analysis.scoreRanges['50-59']} (${Math.round(analysis.scoreRanges['50-59'] / analysis.totalRecipes * 100)}%)\n`;
  report += `  40-49: ${analysis.scoreRanges['40-49']} (${Math.round(analysis.scoreRanges['40-49'] / analysis.totalRecipes * 100)}%)\n`;
  report += `  30-39: ${analysis.scoreRanges['30-39']} (${Math.round(analysis.scoreRanges['30-39'] / analysis.totalRecipes * 100)}%)\n`;
  report += `  0-29: ${analysis.scoreRanges['0-29']} (${Math.round(analysis.scoreRanges['0-29'] / analysis.totalRecipes * 100)}%)\n\n`;
  
  report += `Clustering:\n`;
  report += `  At 40%: ${analysis.clustering.at40} recipes\n`;
  report += `  At 100%: ${analysis.clustering.at100} recipes\n\n`;
  
  report += `Binary Distribution: ${analysis.isBinaryDistribution ? 'YES ⚠️' : 'NO ✓'}\n\n`;
  
  if (analysis.recommendations.length > 0) {
    report += `Recommendations:\n`;
    analysis.recommendations.forEach(rec => {
      report += `  ${rec}\n`;
    });
  }
  
  return report;
}

