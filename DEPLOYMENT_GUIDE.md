# 🚀 Deployment Guide

## Prerequisites

1. Node.js 18+ installed
2. Vercel account
3. Firebase project
4. Clerk account

## Step 1: Firebase Setup

### 1.1 Create Firebase Project
```bash
# Go to https://console.firebase.google.com/
# Click "Add project"
# Follow the wizard
```

### 1.2 Enable Firestore
```bash
# In Firebase Console:
# Build > Firestore Database > Create database
# Start in production mode
# Choose region closest to your users
```

### 1.3 Deploy Security Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 1.4 Get Firebase Config
```bash
# In Firebase Console:
# Project Settings > General > Your apps
# Add web app if not exists
# Copy the config object
```

## Step 2: Clerk Setup

### 2.1 Create Clerk Application
```bash
# Go to https://clerk.com/
# Sign up / Log in
# Create new application
# Choose authentication methods (Email, Google, etc.)
```

### 2.2 Get API Keys
```bash
# In Clerk Dashboard:
# API Keys section
# Copy:
# - Publishable Key (starts with pk_...)
# - Secret Key (starts with sk_...)
```

## Step 3: Local Development

### 3.1 Clone & Install
```bash
git clone <your-repo>
cd pet_plates_meal_platform
npm install
```

### 3.2 Configure Environment
```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local with your keys:
# - Clerk keys
# - Firebase config
```

### 3.3 Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## Step 4: Vercel Deployment

### 4.1 Connect Repository
```bash
# Go to https://vercel.com/
# New Project > Import Git Repository
# Select your repo
```

### 4.2 Configure Environment Variables
```bash
# In Vercel Dashboard > Project > Settings > Environment Variables
# Add ALL variables from .env.local
# Make sure to set them for Production, Preview, and Development
```

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 4.3 Deploy
```bash
# Option 1: Via Vercel Dashboard
# Click "Deploy"

# Option 2: Via CLI
npm install -g vercel
vercel login
vercel --prod
```

## Step 5: Post-Deployment

### 5.1 Verify Clerk Integration
```bash
# In Clerk Dashboard:
# Go to Domains
# Add your Vercel domain (e.g., yourapp.vercel.app)
```

### 5.2 Test Firestore Connection
```bash
# Create a test pet
# Check Firebase Console > Firestore
# Verify data appears
```

### 5.3 Monitor Errors
```bash
# Check Vercel Dashboard > Deployments > Logs
# Check Firebase Console > Firestore > Usage
```

## Step 6: Custom Domain (Optional)

### 6.1 Add Domain in Vercel
```bash
# Vercel Dashboard > Project > Settings > Domains
# Add your domain
```

### 6.2 Update DNS
```bash
# Add CNAME record:
# Type: CNAME
# Name: www (or @)
# Value: cname.vercel-dns.com
```

### 6.3 Update Clerk Domain
```bash
# Clerk Dashboard > Domains
# Add your custom domain
```

## Troubleshooting

### Build Fails
```bash
# Check TypeScript errors
npm run build

# Check linting
npm run lint
```

### Clerk Auth Not Working
```bash
# Verify environment variables are set in Vercel
# Check Clerk dashboard > Domains includes your deployment URL
```

### Firestore Permission Denied
```bash
# Check firestore.rules are deployed
firebase deploy --only firestore:rules

# Verify user is authenticated
# Check userId matches between Clerk and Firestore
```

### Environment Variables Not Loading
```bash
# Redeploy after adding environment variables
vercel --prod

# Verify variables are set for correct environment
# (Production vs Preview vs Development)
```

## Monitoring & Maintenance

### Performance Monitoring
```bash
# Vercel Analytics (built-in)
# Firebase Performance Monitoring (optional)
# Web Vitals tracking
```

### Error Tracking
```bash
# Consider adding Sentry:
npm install @sentry/nextjs
# Follow Sentry Next.js setup
```

### Database Backups
```bash
# Firebase Backups (automatic in paid plan)
# Or manual export:
gcloud firestore export gs://[BUCKET_NAME]
```

## Scaling Considerations

### Vercel
- Free tier: 100GB bandwidth/month
- Pro tier: 1TB bandwidth/month
- Automatic scaling for traffic

### Firebase
- Free tier: 50k reads + 20k writes/day
- Pay-as-you-go: $0.06 per 100k reads
- Monitor usage in Firebase Console

## Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] Firestore rules deployed and tested
- [ ] Clerk authentication working
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] API routes protected with authentication
- [ ] Input validation enabled
- [ ] Error messages don't leak sensitive info

## Support

For issues:
1. Check Vercel deployment logs
2. Check Firebase Console errors
3. Check browser console (F12)
4. Review this guide
5. Contact support

## Next Steps

After successful deployment:
1. Test all major features
2. Monitor error rates
3. Set up backups
4. Configure monitoring/alerts
5. Document any custom configurations

