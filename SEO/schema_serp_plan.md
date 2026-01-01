# Pet Plates — Sitewide Schema & SERP Feature Plan (Content-Only)

Scope:
- Content guidance only.
- Focus on schema that improves eligibility for rich results and site trust signals.
- Use schema conservatively for YMYL: only claim what the page truly contains.

---

## 1) Global schema (sitewide)

### Organization schema
**Use on**: Sitewide (e.g., root layout, or footer-included JSON-LD).
- Include:
  - `name`, `url`, `logo`
  - `sameAs` (social profiles if real)
  - `contactPoint` only if you actually have support contact
- **Goal**: brand entity clarity.

### WebSite schema
**Use on**: Sitewide (homepage or root layout).
- Include:
  - `name`, `url`
  - `potentialAction` → `SearchAction` only if you have site search
- **Goal**: sitelinks search box eligibility (when applicable).

### BreadcrumbList schema
**Use on**: All content pages that have breadcrumbs.
- **Goal**: breadcrumb rich results and clearer hierarchy.

---

## 2) Page-type schema (for our 10 pages)

### A) Ingredient safety pages (5 pages)
Pages:
- Can dogs eat garlic?
- Can cats eat tuna every day?
- Is avocado toxic to birds?
- Can bearded dragons eat spinach?
- Can rabbits eat iceberg lettuce?

**Primary SERP features to target**:
- Featured snippet / paragraph snippet
- People Also Ask (PAA)
- FAQ rich results (if eligible)

**Schema recommendations**:
- **FAQPage**
  - Use when the page includes a clear FAQ section with discrete Q/A.
  - Keep answers short, factual, and safety-first.
- **Article** (or `BlogPosting`)
  - Use if the page is editorial in structure.
  - Include `headline`, `datePublished`, `dateModified` (if true), `author` (mascot persona as editorial author is okay if consistent), `publisher`.

**Snippet formatting rules**:
- Put a 1–2 sentence “Quick answer” immediately after the H1.
- Use short subsections:
  - “Why it’s risky”
  - “Symptoms to watch for”
  - “What to do if your pet ate it”
  - “Safer alternatives”


### B) Condition pages (2 pages)
Pages:
- Homemade dog food for pancreatitis
- Homemade cat food for kidney disease (CKD)

**Primary SERP features to target**:
- PAA
- Featured snippet
- Sitelinks within page (jump links from structured headings)

**Schema recommendations**:
- **FAQPage**
  - Only for FAQs you explicitly include.
- **Article** (`MedicalWebPage` is tempting but generally not recommended unless you can meet stricter medical markup expectations.)

**YMYL safety rules**:
- Avoid definitive medical claims.
- Include “work with your veterinarian” phrasing.

**Snippet formatting rules**:
- Add a “priority stack” section:
  - “What matters most”
  - “Common mistakes”
  - “When to pause and call your vet”


### C) Education/comparison pages (2 pages)
Pages:
- Pellets vs seeds for pet birds
- Reptile calcium basics

**Primary SERP features to target**:
- Featured snippet
- PAA
- “Best practices” style snippets

**Schema recommendations**:
- **Article**
- **FAQPage** (optional, if you include an FAQ section)

**Formatting rules**:
- Use comparison framing:
  - “Quick answer”
  - “Pros / cons” headings
  - “Transition approach” (birds)
  - “Common mistakes” (reptiles)


### D) Shopping page (1 page)
Page:
- Budget-friendly guinea pig grocery list

**Primary SERP features to target**:
- PAA
- List snippet

**Schema recommendations**:
- **Article**
- **FAQPage** (optional)

**Avoid**:
- `Product` schema unless the page is actually a product detail page.
- Overusing `ItemList` unless you truly present a stable list that matches the markup.

---

## 3) Trust pages schema usage (supporting E‑E‑A‑T)
Trust pages in `SEO/trust_pages.md`:
- How Pet Plates Recipes Are Created
- Our Nutrition Standards
- How We Use AAFCO Guidelines
- What Pet Plates Is (and Is Not)
- Pet Food Safety & Allergies

**Schema recommendations**:
- **Article** for each trust page.
- **BreadcrumbList** for each.

**SERP targets**:
- Brand trust queries (navigational)
- “Is Pet Plates legit/safe” type queries

---

## 4) FAQ schema guardrails (important)

- Only mark up FAQs that are visible on the page.
- Answers should be:
  - concise
  - non-promissory
  - aligned with the page content
- Avoid FAQ spam. Limit to 3–6 per page.

---

## 5) Author/owner model (mascots) — content-only guidance

To keep mascot ownership consistent without misleading medical authority:
- Use a consistent pattern like:
  - `author.name`: “Sherlock Shells (Pet Plates Editorial Mascot)”
  - `author.type`: `Person`
- Use `publisher` as Pet Plates (Organization).
- If you have real human reviewers, add them as reviewers and include a “Reviewed by” line on page.

---

## 6) Implementation notes (non-code)

- Prefer JSON-LD per page.
- Keep schema minimal and accurate.
- Ensure canonical URLs are correct.
- Use `dateModified` only if you actually update pages.
