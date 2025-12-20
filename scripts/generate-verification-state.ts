// scripts/generate-verification-state.ts
// Generate initial verification state based on analysis results

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AnalysisResult {
  ingredient: string;
  analysis: {
    confidence: 'high' | 'medium' | 'low';
  };
  needsManualCheck: boolean;
}

function generateVerificationState() {
  // Read the analysis results
  const analysisFile = path.join(__dirname, '../data/asin-analysis-results.json');

  if (!fs.existsSync(analysisFile)) {
    console.error('Analysis results not found. Run the verification script first.');
    process.exit(1);
  }

  const analysisData = JSON.parse(fs.readFileSync(analysisFile, 'utf-8')) as {
    results: AnalysisResult[];
  };

  // Generate initial state where high-confidence items are pre-verified
  const initialState = analysisData.results.map(result => ({
    ingredient: result.ingredient,
    verified: result.analysis.confidence === 'high',
    needsReview: result.needsManualCheck,
    autoVerified: result.analysis.confidence === 'high'
  }));

  // Save to a file that can be imported
  const outputFile = path.join(__dirname, '../lib/data/verification-state.ts');
  const tsCode = `// Generated verification state - ${new Date().toISOString()}\n` +
    `// High-confidence products are auto-verified, others need manual review\n\n` +
    `export interface VerificationState {\n` +
    `  ingredient: string;\n` +
    `  verified: boolean;\n` +
    `  needsReview: boolean;\n` +
    `  autoVerified: boolean;\n` +
    `}\n\n` +
    `export const INITIAL_VERIFICATION_STATE: VerificationState[] = ${JSON.stringify(initialState, null, 2)};\n`;

  fs.writeFileSync(outputFile, tsCode);

  console.log(`✅ Generated verification state for ${initialState.length} products`);
  console.log(`📊 Auto-verified: ${initialState.filter(s => s.autoVerified).length}`);
  console.log(`🔍 Needs review: ${initialState.filter(s => s.needsReview).length}`);
  console.log(`📄 Saved to: ${outputFile}`);
}

generateVerificationState();
