# PetPlates Setup Checklist

Follow this checklist to get your PetPlates website up and running.

## ✅ Phase 1: Prerequisites

### Install Node.js
- [ ] Go to https://nodejs.org/
- [ ] Download the LTS (Long Term Support) version
- [ ] Run the installer
- [ ] Accept all default settings
- [ ] Restart your terminal/command prompt after installation
- [ ] Verify installation:
  ```bash
  node --version    # Should show v18.x.x or higher
  npm --version     # Should show 9.x.x or higher
  ```

**Why Node.js?**
Node.js is required to run Next.js, the framework this website is built with.

---

## ✅ Phase 2: Install Dependencies

### Open Terminal
- [ ] Open PowerShell, Command Prompt, or Terminal
- [ ] Navigate to project folder:
  ```bash
  cd C:\Users\Robin\Workspace\pet_plates_meal_platform
  ```

### Install Packages
- [ ] Run the installation command:
  ```bash
  npm install
  ```
- [ ] Wait for installation to complete (may take 2-5 minutes)
- [ ] Look for "added XXX packages" message
- [ ] Check that a `node_modules` folder was created

**What gets installed?**
- Next.js (web framework)
- React (UI library)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Lucide React (icons)

---

## ✅ Phase 3: Start Development Server

### Option A: Use Startup Script (Recommended)
- [ ] In PowerShell, run:
  ```powershell
  .\start.ps1
  ```
- [ ] Or in Git Bash/Mac/Linux, run:
  ```bash
  ./start.sh
  ```

### Option B: Use npm Command Directly
- [ ] Run:
  ```bash
  npm run dev
  ```

### Verify Server Started
- [ ] Look for message: "Ready in X.Xs"
- [ ] Look for: "Local: http://localhost:3000"
- [ ] Server should keep running (don't close the terminal)

---

## ✅ Phase 4: Test the Website

### Open in Browser
- [ ] Open your web browser
- [ ] Go to: http://localhost:3000
- [ ] Homepage should load

### Test Navigation
- [ ] Click on each navigation link:
  - [ ] Home
  - [ ] Recipes
  - [ ] Meal Plans
  - [ ] About
  - [ ] Subscribe

### Test Pet Categories
- [ ] Click on Dogs category
- [ ] Try selecting a breed
- [ ] Try selecting an age group
- [ ] Try selecting a health concern
- [ ] Verify recipes filter correctly

### Test Recipe Pages
- [ ] Click on any recipe card
- [ ] Scroll through the recipe
- [ ] Check ingredient list
- [ ] Check instructions
- [ ] Check nutritional information panel
- [ ] Click "Buy on Amazon" link (should open Amazon)

### Test Search & Filters
- [ ] Go to "Recipes" page
- [ ] Try searching for a recipe
- [ ] Try category filter
- [ ] Try tag filter
- [ ] Verify results update

### Test Meal Plans
- [ ] Go to "Meal Plans" page
- [ ] Select different pet categories
- [ ] Click on plan types
- [ ] View sample weekly menu

### Test Mobile Responsiveness
- [ ] Resize browser window to mobile size
- [ ] Check hamburger menu appears
- [ ] Test mobile navigation
- [ ] Verify layout looks good on small screens

---

## ✅ Phase 5: Customization (Optional)

### Add More Recipes
- [ ] Open `lib/data/recipes.ts`
- [ ] Copy an existing recipe structure
- [ ] Modify with your own data
- [ ] Save file
- [ ] Refresh browser to see changes

### Change Colors
- [ ] Open `tailwind.config.ts`
- [ ] Modify the primary color values
- [ ] Save file
- [ ] Changes should auto-reload

### Add More Breeds
- [ ] Open `lib/data/pets.ts`
- [ ] Add breeds to the appropriate array
- [ ] Save file
- [ ] Refresh browser

### Update Nutritional Guidelines
- [ ] Open `lib/data/nutritional-guidelines.ts`
- [ ] Modify values as needed
- [ ] Save file

---

## ✅ Phase 6: Build for Production (Optional)

### Create Production Build
- [ ] Stop development server (Ctrl+C)
- [ ] Run build command:
  ```bash
  npm run build
  ```
- [ ] Wait for build to complete
- [ ] Look for "Compiled successfully" message

### Test Production Build Locally
- [ ] Run:
  ```bash
  npm start
  ```
- [ ] Open http://localhost:3000
- [ ] Test the site (should be faster)

---

## ✅ Phase 7: Deploy to Vercel (Optional)

### Setup Git Repository
- [ ] Initialize git (if not done):
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```
- [ ] Create repository on GitHub
- [ ] Push code to GitHub:
  ```bash
  git remote add origin YOUR_GITHUB_URL
  git push -u origin main
  ```

### Deploy to Vercel
- [ ] Go to https://vercel.com
- [ ] Sign up or log in
- [ ] Click "Import Project"
- [ ] Select your GitHub repository
- [ ] Click "Deploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Get your live URL (yourproject.vercel.app)

---

## 🔧 Troubleshooting

### "npm: command not found"
**Problem**: Node.js not installed or not in PATH
**Solution**: 
1. Install Node.js from nodejs.org
2. Restart your terminal
3. Try again

### "Port 3000 already in use"
**Problem**: Another app is using port 3000
**Solution**:
1. Stop other apps using port 3000
2. Or change port in package.json:
   ```json
   "dev": "next dev -p 3001"
   ```

### "Module not found" errors
**Problem**: Dependencies not installed
**Solution**:
```bash
npm install
```

### Page not loading / Blank screen
**Problem**: JavaScript errors
**Solution**:
1. Open browser console (F12)
2. Look for error messages
3. Check terminal for errors
4. Try restarting dev server

### Images not loading
**Problem**: Network connection
**Solution**:
- Check internet connection
- Images are from Unsplash CDN
- Or replace image URLs with local files

### Changes not showing
**Problem**: Browser cache
**Solution**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Restart dev server

---

## 📋 Post-Setup Checklist

### Functionality
- [ ] All pages load without errors
- [ ] Navigation works on all pages
- [ ] Category filtering works
- [ ] Recipe pages display correctly
- [ ] Search functionality works
- [ ] Mobile responsive design works
- [ ] External links open correctly

### Performance
- [ ] Pages load quickly
- [ ] No console errors
- [ ] Images load properly
- [ ] Smooth animations

### Content
- [ ] All text is readable
- [ ] Images display correctly
- [ ] Nutritional data is accurate
- [ ] Links go to correct destinations

---

## 🎉 Success!

If all items are checked, your PetPlates website is ready!

### Next Steps:
1. **Add more recipes**: Expand your recipe library
2. **Customize branding**: Update colors, logo, images
3. **Add backend**: User accounts, database, payments
4. **Launch**: Deploy and share with users
5. **Market**: Social media, SEO, advertising

---

## 📞 Need Help?

**Documentation:**
- README.md - Full project documentation
- GETTING_STARTED.md - Detailed setup guide
- PROJECT_SUMMARY.md - Feature overview
- SITEMAP.md - Site structure

**Common Resources:**
- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- TypeScript: https://typescriptlang.org

**Check the code:**
- All files are well-commented
- TypeScript provides helpful errors
- Console logs for debugging

---

**Happy pet meal prepping! 🐾**
