# COMMERCIAL PET FOOD TRAINING PIPELINE
# Runs: scrape → canonicalize → extract patterns

Write-Host "`n🚀 Starting Commercial Pet Food Training Pipeline`n" -ForegroundColor Green

# Step 1: Scrape commercial products
Write-Host "Step 1: Scraping Open Pet Food Facts..." -ForegroundColor Cyan
npx tsx scrape-commercial.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Scraping failed!" -ForegroundColor Red
    exit 1
}

# Find the most recent commercial products file
$latestProducts = Get-ChildItem -Path ".\output\commercial-products-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $latestProducts) {
    Write-Host "❌ No commercial products file found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Found products file: $($latestProducts.Name)" -ForegroundColor Green

# Step 2: Canonicalize ingredients
Write-Host "`nStep 2: Canonicalizing ingredients..." -ForegroundColor Cyan
npx tsx canonicalize-commercial.ts $latestProducts.FullName ".\output"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Canonicalization failed!" -ForegroundColor Red
    exit 1
}

# Find the most recent canonical file
$latestCanonical = Get-ChildItem -Path ".\output\canonical-commercial-*.json" -Exclude "*-all-*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $latestCanonical) {
    Write-Host "❌ No canonical file found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Found canonical file: $($latestCanonical.Name)" -ForegroundColor Green

# Step 3: Extract patterns
Write-Host "`nStep 3: Extracting commercial patterns..." -ForegroundColor Cyan
npx tsx extract-commercial-patterns.ts $latestCanonical.FullName "..\..\lib\data\recipePriors.json"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Pattern extraction failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Commercial training pipeline complete!" -ForegroundColor Green
Write-Host "📊 Updated recipePriors.json with commercial data" -ForegroundColor Green
