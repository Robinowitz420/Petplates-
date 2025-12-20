# PowerShell script to check for all TypeScript errors before starting dev server
# This runs TypeScript compiler in check mode without emitting files

Write-Host "🔍 Checking for TypeScript errors..." -ForegroundColor Cyan
Write-Host ""

# Run TypeScript compiler in no-emit mode (type-check only)
npx tsc --noEmit

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ No TypeScript errors found!" -ForegroundColor Green
    Write-Host "   You can safely run: npm run dev" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ TypeScript errors found. Fix them before starting dev server." -ForegroundColor Red
    Write-Host "   See errors above." -ForegroundColor Gray
    exit 1
}
