# MASTER SCRAPER - Run all scraping modes consecutively (PowerShell version)
# Perfect for running overnight or during a nap

$ErrorActionPreference = "Continue"  # Continue on errors

Write-Host "🚀 PET PLATES MASTER SCRAPER" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Running all scraping modes consecutively..."
Write-Host "This will take 30-60 minutes depending on network speed."
Write-Host ""
Write-Host "Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# Create output directory
$OUTPUT_DIR = ".\output"
New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null

# Log file
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LOG_FILE = "$OUTPUT_DIR\scrape-all-$timestamp.log"
Write-Host "📝 Logging to: $LOG_FILE"
Write-Host ""

# Function to log with timestamp
function Write-Log {
    param($Message)
    $logMessage = "[$(Get-Date -Format 'HH:mm:ss')] $Message"
    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# Function to run a scraping mode with error handling
function Run-Scraper {
    param(
        [string]$Mode,
        [string]$Description
    )
    
    Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Log "🔍 Starting: $Description"
    Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    try {
        npm run $Mode 2>&1 | Tee-Object -FilePath $LOG_FILE -Append
        Write-Log "✅ Completed: $Description"
    } catch {
        Write-Log "❌ Failed: $Description (continuing anyway...)"
        Write-Log "   Error: $_"
    }
    
    Write-Log ""
    Start-Sleep -Seconds 5  # Brief pause between modes
}

# ============================================================================
# MODE 1: NUTRIENT DATA (Reptiles & Pocket Pets - Safety Lists & Ca:P Ratios)
# ============================================================================
Run-Scraper -Mode "scrape:nutrients" -Description "Nutrient Data Scraping (Tortoise Table, Guinea Lynx, ReptiFiles)"

# ============================================================================
# MODE 2: BLOG DISCOVERY (All Species - Sitemap Crawling)
# ============================================================================
Run-Scraper -Mode "scrape:blogs" -Description "Blog Discovery (Sitemap + JSON-LD Extraction)"

# ============================================================================
# MODE 3: REDDIT SCRAPING (All Species - Community Recipes)
# ============================================================================
Run-Scraper -Mode "scrape:reddit" -Description "Reddit Scraping (25+ Subreddits)"

# ============================================================================
# MODE 4: STANDARD SCRAPING (Veterinary & Brand Sites)
# ============================================================================
Run-Scraper -Mode "scrape:all" -Description "Standard Scraping (Veterinary & Brand Sites)"

# ============================================================================
# SUMMARY
# ============================================================================
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Log "🎉 ALL SCRAPING MODES COMPLETE!"
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Log ""
Write-Log "Finished at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Log ""

# Count output files
$nutrientFiles = @(Get-ChildItem "$OUTPUT_DIR\nutrient-*.json" -ErrorAction SilentlyContinue).Count
$blogFiles = @(Get-ChildItem "$OUTPUT_DIR\blog-*.json" -ErrorAction SilentlyContinue).Count
$redditFiles = @(Get-ChildItem "$OUTPUT_DIR\reddit-*.json" -ErrorAction SilentlyContinue).Count
$allJsonFiles = @(Get-ChildItem "$OUTPUT_DIR\*.json" -ErrorAction SilentlyContinue)
$standardFiles = ($allJsonFiles | Where-Object { $_.Name -notmatch "nutrient|blog|reddit" }).Count

Write-Log "📊 Output Summary:"
Write-Log "   Nutrient data files: $nutrientFiles"
Write-Log "   Blog recipe files: $blogFiles"
Write-Log "   Reddit recipe files: $redditFiles"
Write-Log "   Standard recipe files: $standardFiles"
Write-Log ""

# List recent JSON files
Write-Log "📁 Generated Files (most recent 20):"
$recentFiles = Get-ChildItem "$OUTPUT_DIR\*.json" -ErrorAction SilentlyContinue | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 20

if ($recentFiles) {
    foreach ($file in $recentFiles) {
        $size = "{0:N2} KB" -f ($file.Length / 1KB)
        $logLine = "   $($file.Name) - $size"
        Write-Log $logLine
    }
} else {
    Write-Log "   No JSON files found"
}
Write-Log ""

Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Log "🎯 NEXT STEPS:"
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Log ""
Write-Log "1. Review the scraped data in: $OUTPUT_DIR"
Write-Log ""
Write-Log "2. Run the training pipeline to generate patterns:"
Write-Log "   cd ..\scripts\training"
Write-Log "   .\run-training-pipeline.sh  # or use bash if available"
Write-Log ""
Write-Log "3. The training pipeline will:"
Write-Log "   - Canonicalize recipes (map to ingredient registry)"
Write-Log "   - Label with LLM (classify meal types, detect warnings)"
Write-Log "   - Extract patterns (co-occurrence, Ca:P ratios, etc.)"
Write-Log "   - Generate lib\data\recipePriors.json"
Write-Log ""
Write-Log "4. Your RecipeBuilder will automatically use the patterns!"
Write-Log ""
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Log "✨ Happy napping! The scraper did all the work."
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
