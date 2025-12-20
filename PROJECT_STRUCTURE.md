# 📁 Project Structure

This document explains the organized folder structure of the Pet Plates Meal Platform.

## 🗂️ Root Directory Organization

```
pet_plates_meal_platform/
├── app/                    # Next.js app directory (pages, API routes)
├── components/             # React components
├── lib/                    # Core business logic, utilities, generators
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
│
├── docs/                   # 📚 All documentation
│   ├── architecture/       # System design, phases, constraints
│   ├── reports/            # Audit reports, diagnostics
│   ├── guides/             # Setup, deployment, testing guides
│   └── progress/           # Changelogs, completion summaries
│
├── scripts/                # 🔧 Utility scripts
│   ├── maintenance/        # Fix, update, and maintenance scripts
│   ├── generation/         # Data generation scripts (images, recipes)
│   ├── testing/            # Test and debug scripts
│   └── data/               # Data extraction and analysis scripts
│
├── config/                 # ⚙️ Configuration files
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── vitest.config.ts
│   └── .env.local
│
├── data/                   # 📊 Data files
│   ├── csv/                # CSV data files
│   ├── json/               # JSON data files
│   └── txt/                # Text data files
│
├── temp/                   # 🗑️ Temporary files, logs, patches
│
├── pet-ingredient-scraper/ # Amazon product scraper
├── pet-recipe-scraper/     # Recipe scraper (20+ sources)
├── scraping/               # Legacy scraping system
│
└── package.json            # Project dependencies
```

## 📚 Documentation (`docs/`)

### `docs/architecture/`
System architecture, design documents, and technical specifications:
- `ARCHITECTURE_*.md` - Architecture audits and reviews
- `PHASE_*.md` - Development phase documentation
- `RECIPE_ENGINE_HANDOFF.md` - Recipe generation system docs
- `GENERATION_PIPELINE.md` - Recipe generation pipeline
- `HARD_CONSTRAINTS.md` - System constraints
- `SOFT_OBJECTIVES.md` - System objectives

### `docs/reports/`
Audit reports, diagnostics, and analysis:
- `*_REPORT.md` - Various audit reports
- `*_AUDIT*.md` - System audits
- `DIAGNOSTIC_SUMMARY.md` - System diagnostics
- `KNOWN_ISSUES.md` - Known issues tracker

### `docs/guides/`
Setup, deployment, and usage guides:
- `GETTING_STARTED.md` - Quick start guide
- `SETUP_*.md` - Setup instructions
- `DEPLOYMENT_*.md` - Deployment guides
- `LAUNCH_CHECKLIST.md` - Pre-launch checklist
- `MANUAL_TESTING_CHECKLIST.md` - Testing procedures
- `AI_COLLABORATION_GUIDE.md` - AI pairing guide

### `docs/progress/`
Development progress and changelogs:
- `CHANGELOG.md` - Version history
- `TODAYS_PROGRESS_*.md` - Daily progress logs
- `*_COMPLETE.md` - Completion reports
- `*_SUMMARY.md` - Feature summaries
- `REFACTOR_*.md` - Refactoring documentation

## 🔧 Scripts (`scripts/`)

### `scripts/maintenance/`
System maintenance and fixes:
- `fix-*.js` - Fix scripts
- `update-*.js` - Update scripts
- `simple-*.js` - Simple utility scripts

### `scripts/generation/`
Data and asset generation:
- `generate-*.js` - JavaScript generators
- `generate_*.py` - Python generators

### `scripts/testing/`
Testing and debugging:
- `test-*.js` - Test scripts
- `debug-*.js` - Debug scripts
- `check-*.ps1` - Validation scripts

### `scripts/data/`
Data processing:
- `extract-*.js` - Data extraction
- `analyze-*.js` - Data analysis
- `fetch-*.js` - Data fetching

## ⚙️ Configuration (`config/`)

All configuration files:
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `vitest.config.ts` - Vitest test configuration
- `.env.local` - Environment variables
- `firestore.rules` - Firestore security rules

## 📊 Data (`data/`)

Organized data files:
- `csv/` - CSV data files
- `json/` - JSON data files
- `txt/` - Text data files

## 🗑️ Temp (`temp/`)

Temporary files, logs, and patches that can be safely deleted.

## 🎯 Key Directories (Unchanged)

These core directories remain in the root:
- `app/` - Next.js application
- `components/` - React components
- `lib/` - Core business logic
- `hooks/` - React hooks
- `public/` - Static assets
- `node_modules/` - Dependencies

## 📝 Notes

- **Config files** are now in `config/` but Next.js will still find them via symlinks if needed
- **Documentation** is organized by type for easy navigation
- **Scripts** are categorized by purpose
- **Data files** are separated by format
- **Temp files** can be safely deleted periodically

## 🔄 Migration

If you need to reference old paths:
- Docs: Check `docs/` subdirectories
- Scripts: Check `scripts/` subdirectories
- Config: Check `config/`
- Data: Check `data/` subdirectories

---

**Last Updated:** December 18, 2025
