# COMPLETE TRAINING PIPELINE (PowerShell version)
# Converts scraped recipes into training data for RecipeBuilder
# Run this after scraping recipes from blogs/Reddit

$ErrorActionPreference = "Stop"

Write-Host "Pet Plates Recipe Training Pipeline" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SCRAPER_OUTPUT_DIR = "..\..\pet-recipe-scraper\output"
$TRAINING_OUTPUT_DIR = ".\output"
$PRIORS_OUTPUT = "..\..\lib\data\recipePriors.json"

# Create output directory
New-Item -ItemType Directory -Force -Path $TRAINING_OUTPUT_DIR | Out-Null

# Find the most recent scraped recipe file
$blogFiles = Get-ChildItem "$SCRAPER_OUTPUT_DIR\blog-recipes-*.json" -ErrorAction SilentlyContinue
$redditFiles = Get-ChildItem "$SCRAPER_OUTPUT_DIR\reddit-recipes-*.json" -ErrorAction SilentlyContinue
$bulkFiles = Get-ChildItem "$SCRAPER_OUTPUT_DIR\bulk-recipes-*.json" -ErrorAction SilentlyContinue

$allFiles = @($blogFiles) + @($redditFiles) + @($bulkFiles) | Sort-Object LastWriteTime -Descending

if ($allFiles.Count -eq 0) {
    Write-Host "ERROR: No scraped recipe files found in $SCRAPER_OUTPUT_DIR" -ForegroundColor Red
    Write-Host "   Run the scraper first: cd pet-recipe-scraper && npm run scrape:blogs"
    exit 1
}

$SCRAPED_FILE = $allFiles[0].FullName
Write-Host "Using scraped recipes: $($allFiles[0].Name)"
Write-Host "   File size: $([math]::Round($allFiles[0].Length / 1KB, 2)) KB"
Write-Host ""

# Quick check: how many recipes are in the file?
try {
    $recipeData = Get-Content $SCRAPED_FILE | ConvertFrom-Json
    $recipeCount = $recipeData.Count
    Write-Host "   Contains: $recipeCount recipes" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   WARNING: Could not parse recipe count" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Canonicalize recipes
Write-Host "Step 1: Canonicalizing recipes..." -ForegroundColor Cyan
$CANONICAL_FILE = "$TRAINING_OUTPUT_DIR\canonical-recipes.json"
npx tsx canonicalize-recipes.ts "$SCRAPED_FILE" "$CANONICAL_FILE"

if (-not (Test-Path $CANONICAL_FILE)) {
    Write-Host "ERROR: Canonicalization failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Label recipes with LLM
Write-Host "Step 2: Labeling recipes..." -ForegroundColor Cyan
$LABELED_FILE = "$TRAINING_OUTPUT_DIR\labeled-recipes.json"
npx tsx llm-label-recipes.ts "$CANONICAL_FILE" "$LABELED_FILE"

if (-not (Test-Path $LABELED_FILE)) {
    Write-Host "ERROR: Labeling failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Extract patterns
Write-Host "Step 3: Extracting patterns..." -ForegroundColor Cyan
npx tsx extract-patterns.ts "$LABELED_FILE" "$PRIORS_OUTPUT"

if (-not (Test-Path $PRIORS_OUTPUT)) {
    Write-Host "ERROR: Pattern extraction failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "SUCCESS: Training pipeline complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Generated files:"
Write-Host "   - Canonical recipes: $CANONICAL_FILE"
Write-Host "   - Labeled recipes: $LABELED_FILE"
Write-Host "   - Recipe priors: $PRIORS_OUTPUT"
Write-Host ""
Write-Host "Next steps:"
Write-Host "   1. Review the generated recipePriors.json"
Write-Host "   2. The RecipeBuilder will automatically use these priors for scoring"
Write-Host "   3. Generate some recipes to see the improved variety!"
Write-Host ""
