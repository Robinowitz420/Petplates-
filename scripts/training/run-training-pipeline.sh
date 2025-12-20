#!/bin/bash
# COMPLETE TRAINING PIPELINE
# Converts scraped recipes into training data for RecipeBuilder
# Run this after scraping recipes from blogs/Reddit

set -e  # Exit on error

echo "🚀 Pet Plates Recipe Training Pipeline"
echo "========================================"
echo ""

# Configuration
SCRAPER_OUTPUT_DIR="../pet-recipe-scraper/output"
TRAINING_OUTPUT_DIR="./training/output"
PRIORS_OUTPUT="../../lib/data/recipePriors.json"

# Create output directory
mkdir -p "$TRAINING_OUTPUT_DIR"

# Find the most recent scraped recipe file
SCRAPED_FILE=$(ls -t "$SCRAPER_OUTPUT_DIR"/blog-recipes-*.json "$SCRAPER_OUTPUT_DIR"/reddit-recipes-*.json 2>/dev/null | head -n 1)

if [ -z "$SCRAPED_FILE" ]; then
    echo "❌ No scraped recipe files found in $SCRAPER_OUTPUT_DIR"
    echo "   Run the scraper first: cd pet-recipe-scraper && npm run scrape:blogs"
    exit 1
fi

echo "📂 Using scraped recipes: $SCRAPED_FILE"
echo ""

# Step 1: Canonicalize recipes
echo "📖 Step 1: Canonicalizing recipes..."
CANONICAL_FILE="$TRAINING_OUTPUT_DIR/canonical-recipes.json"
npx ts-node canonicalize-recipes.ts "$SCRAPED_FILE" "$CANONICAL_FILE"

if [ ! -f "$CANONICAL_FILE" ]; then
    echo "❌ Canonicalization failed"
    exit 1
fi
echo ""

# Step 2: Label recipes with LLM
echo "🏷️  Step 2: Labeling recipes..."
LABELED_FILE="$TRAINING_OUTPUT_DIR/labeled-recipes.json"
npx ts-node llm-label-recipes.ts "$CANONICAL_FILE" "$LABELED_FILE"

if [ ! -f "$LABELED_FILE" ]; then
    echo "❌ Labeling failed"
    exit 1
fi
echo ""

# Step 3: Extract patterns
echo "📊 Step 3: Extracting patterns..."
npx ts-node extract-patterns.ts "$LABELED_FILE" "$PRIORS_OUTPUT"

if [ ! -f "$PRIORS_OUTPUT" ]; then
    echo "❌ Pattern extraction failed"
    exit 1
fi
echo ""

echo "✅ Training pipeline complete!"
echo ""
echo "📁 Generated files:"
echo "   - Canonical recipes: $CANONICAL_FILE"
echo "   - Labeled recipes: $LABELED_FILE"
echo "   - Recipe priors: $PRIORS_OUTPUT"
echo ""
echo "🎯 Next steps:"
echo "   1. Review the generated recipePriors.json"
echo "   2. The RecipeBuilder will automatically use these priors for scoring"
echo "   3. Generate some recipes to see the improved variety!"
echo ""
