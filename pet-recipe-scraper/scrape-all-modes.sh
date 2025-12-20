#!/bin/bash
# MASTER SCRAPER - Run all scraping modes consecutively
# Perfect for running overnight or during a nap

set -e  # Exit on error

echo "🚀 PET PLATES MASTER SCRAPER"
echo "============================"
echo "Running all scraping modes consecutively..."
echo "This will take 30-60 minutes depending on network speed."
echo ""
echo "Started at: $(date)"
echo ""

# Create output directory
OUTPUT_DIR="./output"
mkdir -p "$OUTPUT_DIR"

# Log file
LOG_FILE="$OUTPUT_DIR/scrape-all-$(date +%Y%m%d-%H%M%S).log"
echo "📝 Logging to: $LOG_FILE"
echo ""

# Function to log with timestamp
log() {
    echo "[$(date +%H:%M:%S)] $1" | tee -a "$LOG_FILE"
}

# Function to run a scraping mode with error handling
run_scraper() {
    local mode=$1
    local description=$2
    
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "🔍 Starting: $description"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if npm run "$mode" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Completed: $description"
    else
        log "❌ Failed: $description (continuing anyway...)"
    fi
    
    log ""
    sleep 5  # Brief pause between modes
}

# ============================================================================
# MODE 1: NUTRIENT DATA (Reptiles & Pocket Pets - Safety Lists & Ca:P Ratios)
# ============================================================================
run_scraper "scrape:nutrients" "Nutrient Data Scraping (Tortoise Table, Guinea Lynx, ReptiFiles)"

# ============================================================================
# MODE 2: BLOG DISCOVERY (All Species - Sitemap Crawling)
# ============================================================================
run_scraper "scrape:blogs" "Blog Discovery (Sitemap + JSON-LD Extraction)"

# ============================================================================
# MODE 3: REDDIT SCRAPING (All Species - Community Recipes)
# ============================================================================
run_scraper "scrape:reddit" "Reddit Scraping (25+ Subreddits)"

# ============================================================================
# MODE 4: STANDARD SCRAPING (Veterinary & Brand Sites)
# ============================================================================
run_scraper "scrape:all" "Standard Scraping (Veterinary & Brand Sites)"

# ============================================================================
# SUMMARY
# ============================================================================
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎉 ALL SCRAPING MODES COMPLETE!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "Finished at: $(date)"
log ""

# Count output files
NUTRIENT_FILES=$(ls -1 "$OUTPUT_DIR"/nutrient-*.json 2>/dev/null | wc -l)
BLOG_FILES=$(ls -1 "$OUTPUT_DIR"/blog-*.json 2>/dev/null | wc -l)
REDDIT_FILES=$(ls -1 "$OUTPUT_DIR"/reddit-*.json 2>/dev/null | wc -l)
STANDARD_FILES=$(ls -1 "$OUTPUT_DIR"/*.json 2>/dev/null | grep -v "nutrient\|blog\|reddit" | wc -l)

log "📊 Output Summary:"
log "   Nutrient data files: $NUTRIENT_FILES"
log "   Blog recipe files: $BLOG_FILES"
log "   Reddit recipe files: $REDDIT_FILES"
log "   Standard recipe files: $STANDARD_FILES"
log ""

# List all JSON files
log "📁 Generated Files:"
ls -lh "$OUTPUT_DIR"/*.json 2>/dev/null | tail -20 | tee -a "$LOG_FILE" || log "   No JSON files found"
log ""

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎯 NEXT STEPS:"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "1. Review the scraped data in: $OUTPUT_DIR"
log ""
log "2. Run the training pipeline to generate patterns:"
log "   cd ../scripts/training"
log "   ./run-training-pipeline.sh"
log ""
log "3. The training pipeline will:"
log "   - Canonicalize recipes (map to ingredient registry)"
log "   - Label with LLM (classify meal types, detect warnings)"
log "   - Extract patterns (co-occurrence, Ca:P ratios, etc.)"
log "   - Generate lib/data/recipePriors.json"
log ""
log "4. Your RecipeBuilder will automatically use the patterns!"
log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✨ Happy napping! The scraper did all the work."
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
