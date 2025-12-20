# Automation Setup Guide

## Overview

This document describes the automation infrastructure for retail validation and recipe auditing.

**Philosophy:**
- ✅ **Auto-run validators/classifiers** on save (fast, safe)
- ✅ **Pre-commit hooks** for CSV/artifact validation (audit trail)
- ❌ **PA-API/scraping stays manual** (rate limits, legal, cost)

---

## 1. VS Code Tasks (Run on Demand)

### Available Tasks

**Run Phase 1.5 Validator** (Ctrl+Shift+B)
- Full retail validation with clustering
- Generates `PHASE_1_5_MANUAL_REVIEW.csv`
- Shows detailed output

**Quick Validation Check**
- Summary only (accepted/review counts)
- Silent output
- Fast feedback

**Run Recipe Audit**
- Comprehensive recipe generation audit
- Tests all species + health concerns
- Default test task

### How to Use

1. **Command Palette** → "Tasks: Run Task"
2. Select task from list
3. View output in terminal panel

**Keyboard shortcuts:**
- `Ctrl+Shift+B` → Run build task (validator)
- `Ctrl+Shift+T` → Run test task (recipe audit)

---

## 2. Auto-Run on Save

### What Triggers Auto-Run

**Files that trigger validation:**
- `lib/validation/*.ts` (any validator file)
- `lib/data/vetted-products.ts` (product database)

**What happens:**
1. File is saved
2. Phase 1.5 classifier runs in background
3. Output logged to `.validation-output.log`
4. CSV updated automatically

### Setup Required

**Install VS Code extension:**
```
Name: Run on Save
ID: emeraldwalk.RunOnSave
```

**Already configured in `.vscode/settings.json`:**
```json
"emeraldwalk.runonsave": {
  "commands": [
    {
      "match": "lib/validation/.*\\.ts$",
      "cmd": "npx tsx lib/generator/Phase1_5_AutoClassify.ts > .validation-output.log 2>&1"
    }
  ]
}
```

### How to Use

1. Install the extension
2. Edit any validation file
3. Save (Ctrl+S)
4. Check `.validation-output.log` for results

**Disable temporarily:**
- Command Palette → "Run on Save: Disable"

---

## 3. Pre-Commit Hook

### What It Does

**Runs before every commit:**
1. Checks if validation files are staged
2. Runs Phase 1.5 classifier
3. Stages updated CSV automatically
4. Warns if CSV files are being committed

### Setup Required

**Install Husky:**
```bash
npm install --save-dev husky
npm run prepare
```

**Already configured in `.husky/pre-commit`**

### How It Works

```bash
git add lib/validation/retailSpecDefinitions.ts
git commit -m "Add new ingredient specs"

# Output:
# 🔍 Checking for validation-related changes...
# 📋 Validation files changed, running Phase 1.5 classifier...
# ✅ Validation passed
# 📊 Staged updated PHASE_1_5_MANUAL_REVIEW.csv
# ✅ Pre-commit checks passed
```

**If CSV files are staged:**
```bash
git add PHASE_1_5_MANUAL_REVIEW.csv
git commit -m "Update manual review list"

# Output:
# ⚠️  CSV files being committed:
# PHASE_1_5_MANUAL_REVIEW.csv
# 
# Make sure these are intentional changes, not auto-generated artifacts.
# Press Enter to continue or Ctrl+C to abort...
```

### Skip Pre-Commit Hook

```bash
git commit --no-verify -m "Skip validation"
```

---

## 4. NPM Scripts

### Validation Scripts

```bash
# Full retail validation
npm run validate:retail

# Quick summary only
npm run validate:retail:quick

# Comprehensive recipe audit
npm run audit:comprehensive
```

### When to Use Each

**`validate:retail`** - After changing:
- Ingredient specs
- Validation logic
- Token equivalence
- Clustering algorithm

**`validate:retail:quick`** - Quick check:
- See if changes broke anything
- Check acceptance rate
- Fast feedback loop

**`audit:comprehensive`** - After changing:
- Recipe generation logic
- Ingredient data
- Nutritional calculations

---

## 5. File Management

### Auto-Generated Files

**Ignored (not tracked):**
- `.validation-output.log` - Auto-run output
- `.pre-commit-validation.log` - Pre-commit output

**Tracked (audit trail):**
- `PHASE_1_5_MANUAL_REVIEW.csv` - Manual review list
- `AUTO_CLASSIFICATION_REPORT.md` - Detailed results
- `PHASE_1_5_COMPLETE.md` - Documentation

### Why Track CSVs?

**Audit trail:**
- See what changed over time
- Track manual review progress
- Blame/history for corrections

**Collaboration:**
- Share review lists
- Coordinate manual verification
- Document decisions

---

## 6. PA-API / Scraping (Manual Only)

### Why Manual?

**Rate limits:**
- PA-API: 8,640 requests/day
- Third-party: $50-200/month
- Don't waste on auto-runs

**Legal:**
- Scraping violates Amazon TOS
- PA-API requires approval
- Manual = safer

**Cost:**
- Third-party APIs charge per request
- Auto-run = expensive
- Manual = controlled

### How to Run

**PA-API scripts (when implemented):**
```bash
# NOT auto-run, always manual
npm run fetch:amazon-metadata
npm run validate:amazon-links
```

**Current scraping scripts:**
```bash
# Existing scripts - use sparingly
npm run vet:amazon
npm run correct-asins-scraper
```

---

## 7. Workflow Examples

### Scenario 1: Adding New Ingredient Specs

```bash
# 1. Edit spec file
code lib/validation/retailSpecDefinitions.ts

# 2. Add new spec
export const RETAIL_SPECS = {
  'new-ingredient': {
    requiredTokens: ['token1', 'token2'],
    forbiddenTokens: ['bad1', 'bad2'],
    ...
  }
}

# 3. Save (auto-runs validation)
# Check .validation-output.log for results

# 4. Commit
git add lib/validation/retailSpecDefinitions.ts
git commit -m "Add spec for new-ingredient"
# Pre-commit hook runs, stages updated CSV

# 5. Review results
code PHASE_1_5_MANUAL_REVIEW.csv
```

### Scenario 2: Updating Product Database

```bash
# 1. Edit vetted products
code lib/data/vetted-products.ts

# 2. Update ASIN
export const VETTED_PRODUCTS = {
  'rabbit meat': {
    productName: 'New Rabbit Product',
    asinLink: 'https://amazon.com/dp/NEWASINNNN?tag=robinfrench-20'
  }
}

# 3. Save (auto-runs validation)

# 4. Check results
npm run validate:retail:quick

# 5. Commit if good
git add lib/data/vetted-products.ts
git commit -m "Fix rabbit meat ASIN"
```

### Scenario 3: Recipe Generation Changes

```bash
# 1. Edit recipe builder
code lib/generator/RecipeBuilder.ts

# 2. Make changes

# 3. Test manually
npm run audit:comprehensive

# 4. Review results
# Check pass rates for all species

# 5. Commit if passing
git add lib/generator/RecipeBuilder.ts
git commit -m "Improve recipe generation"
```

---

## 8. Troubleshooting

### Auto-Run Not Working

**Check extension:**
```
Extensions → Run on Save → Installed?
```

**Check settings:**
```
.vscode/settings.json → emeraldwalk.runonsave configured?
```

**Check logs:**
```
cat .validation-output.log
```

### Pre-Commit Hook Not Running

**Check Husky:**
```bash
ls -la .husky/pre-commit
# Should be executable

# Make executable if needed (Git Bash):
chmod +x .husky/pre-commit
```

**Reinstall Husky:**
```bash
npm run prepare
```

### Validation Failing

**Check TypeScript errors:**
```bash
npx tsc --noEmit
```

**Run manually:**
```bash
npm run validate:retail
```

**Check dependencies:**
```bash
npm install
```

---

## 9. Best Practices

### DO

✅ **Let auto-run handle validation** - Don't manually run after every save
✅ **Review pre-commit output** - Make sure changes are expected
✅ **Track CSV changes** - They're part of the audit trail
✅ **Use quick validation** - Fast feedback during development
✅ **Keep PA-API manual** - Avoid rate limits and costs

### DON'T

❌ **Commit without reviewing CSV** - Pre-commit stages it automatically
❌ **Skip pre-commit hooks habitually** - They catch real issues
❌ **Auto-run PA-API scripts** - Expensive and rate-limited
❌ **Ignore validation failures** - They indicate real problems
❌ **Delete log files manually** - They're gitignored anyway

---

## 10. Summary

**Automation levels:**
1. **Auto-run on save** → Validators/classifiers (fast, safe)
2. **Pre-commit hook** → Validation + CSV staging (audit trail)
3. **Manual only** → PA-API/scraping (rate limits, cost, legal)

**Files to track:**
- ✅ CSV review lists (audit trail)
- ✅ Classification reports (documentation)
- ❌ Log files (ephemeral)

**Commands to remember:**
```bash
npm run validate:retail        # Full validation
npm run validate:retail:quick  # Quick summary
npm run audit:comprehensive    # Recipe audit
git commit --no-verify         # Skip pre-commit (rare)
```

**Extension needed:**
- Run on Save (emeraldwalk.RunOnSave)

**Setup:**
```bash
npm install --save-dev husky
npm run prepare
```

Done! Automation is ready.
