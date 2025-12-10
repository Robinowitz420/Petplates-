# Score Debug Harness

## Quick Start

1. **Run the harness:**ash
   npx tsx scripts/debugScoreHarness.ts
   2. **Or import in code:**script
   import { debugRecipeScore } from './scripts/debugScoreHarness';
   const result = debugRecipeScore(pet, recipe);
   ## What It Does

Compares:
- **UI Score** (`scoreRecipeImproved`) - What users see
- **Generator Score** (`computeFinalGenerationScore`) - What generator uses

Shows all modifiers and detects score drift.

## Cursor Prompt

Paste this into Cursor:
