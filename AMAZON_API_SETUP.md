# Amazon Product Advertising API Setup

## For Automated ASIN Verification

The automated ASIN correction system can use real Amazon data instead of mock data. Here's how to set it up:

### 1. Get Amazon API Credentials

1. **Sign up for Amazon Associates**: https://affiliate-program.amazon.com/
2. **Apply for Product Advertising API access**
3. **Get your credentials**:
   - Access Key ID
   - Secret Access Key

### 2. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Amazon Product Advertising API
AMAZON_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AMAZON_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### 3. API Limits & Costs

- **Free tier**: 8,640 requests/day
- **Cost**: ~$0.0002 per request after free tier
- **Rate limit**: 1 request/second

### 4. Running the Automated System

```bash
# Test Amazon API connection
npm run test-amazon

# Run automated ASIN corrections
npm run correct-asins
```

### 5. What It Does

The automated system will:

1. **Parse your vetted-products.txt** file
2. **Search Amazon** for each ingredient
3. **Calculate match scores** for current vs. potential replacements
4. **Auto-correct ASINs** when better matches are found (>10 point improvement)
5. **Generate reports** of all changes made

### 6. Fallback Behavior

If API keys aren't configured, the system uses mock data but still demonstrates the workflow.

### 7. Legal Notes

- Only use for your own affiliate products
- Respect Amazon's terms of service
- Don't abuse the API or you may get banned

---

**Need API keys?** Contact me for help getting set up with Amazon's affiliate program.
