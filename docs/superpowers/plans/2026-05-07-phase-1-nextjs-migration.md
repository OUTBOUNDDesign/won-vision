# Phase 1 — Static HTML → Next.js 16 Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static HTML site at `~/Code/won-media/` with a Next.js 16 App Router project, preserving every production route's URL and visual output. No new features. This phase ships a Next.js scaffold that is ready for Phase 2 (DB + auth) to build on.

**Architecture:** In-place migration. The Next.js project lives at the repo root. Static HTML files are converted to Next.js page components (Server Components) that render the same markup. The single `css/style.css` becomes `app/globals.css`. The single `js/script.js` becomes a client component imported into the root layout. Vercel project link in `.vercel/` is preserved so deploys go to the same target.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4 (only if existing CSS gets refactored — for v1 we keep the original `style.css` verbatim), Playwright for visual snapshot tests.

**Production routes to migrate:**
| Old URL | New route file | Page title |
|---|---|---|
| `/` | `app/page.tsx` | Won Vision — Your listing the star, we make it go far. |
| `/book` | `app/book/page.tsx` | Book a shoot — Won Vision |
| `/book-checkout` | `app/book/checkout/page.tsx` | Checkout — Won Vision |
| `/book-schedule` | `app/book/schedule/page.tsx` | Schedule — Won Vision |
| `/book-confirmation` | `app/book/confirmation/page.tsx` | Booking confirmed — Won Vision |
| `/gallery` | `app/gallery/page.tsx` | Gallery — Won Vision |

**Pages NOT migrated (design explorations, marked "Won Media"):** `examples.html`, `services-options.html`, `heroes.html`, `heroes-v2.html`, `book-hero-options.html`, `steps-more.html`, `loader-text.html`. Move to `_archive/` outside the Next.js project.

---

## Task 1 — Create migration branch and snapshot baseline

**Files:**
- Modify: working tree only

- [ ] **Step 1: Create feature branch**

```bash
cd /Users/kiranc/Code/won-media
git checkout -b feat/nextjs-migration
```

- [ ] **Step 2: Capture baseline screenshots of every production page**

Install Playwright in a temp scratch dir (don't pollute repo yet):

```bash
mkdir -p /tmp/wv-baseline && cd /tmp/wv-baseline
npm init -y
npm i -D @playwright/test
npx playwright install chromium
```

Create `/tmp/wv-baseline/baseline.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const pages = [
  { url: 'https://wonvision.com.au/', name: 'index' },
  { url: 'https://wonvision.com.au/book', name: 'book' },
  { url: 'https://wonvision.com.au/book-checkout', name: 'book-checkout' },
  { url: 'https://wonvision.com.au/book-schedule', name: 'book-schedule' },
  { url: 'https://wonvision.com.au/book-confirmation', name: 'book-confirmation' },
  { url: 'https://wonvision.com.au/gallery', name: 'gallery' },
];

for (const p of pages) {
  test(`baseline ${p.name} desktop`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `screenshots/${p.name}-desktop.png`, fullPage: true });
  });
  test(`baseline ${p.name} mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `screenshots/${p.name}-mobile.png`, fullPage: true });
  });
}
```

Run: `npx playwright test baseline.spec.ts`
Expected: 12 screenshots in `/tmp/wv-baseline/screenshots/`. These are the visual truth we must match post-migration.

- [ ] **Step 3: Commit branch start**

```bash
cd /Users/kiranc/Code/won-media
git commit --allow-empty -m "chore: start nextjs migration — baseline captured at /tmp/wv-baseline/screenshots/"
```

---

## Task 2 — Initialize Next.js 16 in repo root, preserving Vercel link

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx` (placeholder), `.gitignore` (updated), `app/globals.css`
- Move: `index.html` → `_archive/index.html` (and all other html files)
- Preserve: `.vercel/`, `assets/`, `css/`, `js/`, `favicon.ico`, `robots.txt`, `sitemap.xml`

- [ ] **Step 1: Move static HTML out of the way**

```bash
cd /Users/kiranc/Code/won-media
mkdir -p _archive
mv index.html book.html book-checkout.html book-schedule.html book-confirmation.html gallery.html _archive/
mv examples.html services-options.html heroes.html heroes-v2.html book-hero-options.html steps-more.html loader-text.html _archive/
```

- [ ] **Step 2: Initialize Next.js without overwriting `.vercel/` or assets**

We do NOT use `create-next-app` here because it would overwrite `.gitignore` and possibly conflict with `.vercel/`. Manually scaffold:

Create `/Users/kiranc/Code/won-media/package.json`:

```json
{
  "name": "won-vision",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test:visual": "playwright test"
  },
  "dependencies": {
    "next": "16.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0"
  }
}
```

Run: `npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Add TypeScript config**

Create `/Users/kiranc/Code/won-media/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "_archive"]
}
```

- [ ] **Step 4: Add Next.js config**

Create `/Users/kiranc/Code/won-media/next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Keep existing public folder layout: /assets/*, /favicon.ico, /robots.txt, /sitemap.xml
  // Next.js serves files from /public/ by default, so move static assets there in Step 5
};

export default config;
```

- [ ] **Step 5: Move static assets into `public/`**

```bash
cd /Users/kiranc/Code/won-media
mkdir -p public
mv assets public/assets
mv favicon.ico public/favicon.ico
mv robots.txt public/robots.txt
mv sitemap.xml public/sitemap.xml
```

The CSS and JS stay at `css/style.css` and `js/script.js` for now — they will be imported into the layout next, not served as static files.

- [ ] **Step 6: Create root layout with global CSS**

Create `/Users/kiranc/Code/won-media/app/globals.css` by copying the existing stylesheet verbatim:

```bash
mkdir -p app
cp css/style.css app/globals.css
```

Create `/Users/kiranc/Code/won-media/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://wonvision.com.au'),
  title: { default: 'Won Vision', template: '%s — Won Vision' },
  description: 'Melbourne real estate photography by Won Vision.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Move script.js into `public/`**

```bash
mkdir -p public
mv js/script.js public/script.js
rmdir js 2>/dev/null || rm -rf js
rmdir css 2>/dev/null || rm -rf css
```

- [ ] **Step 8: Add a placeholder home page so dev server boots**

Create `/Users/kiranc/Code/won-media/app/page.tsx`:

```typescript
export default function HomePage() {
  return <main><h1>Won Vision — placeholder</h1></main>;
}
```

- [ ] **Step 9: Update `.gitignore`**

Read `/Users/kiranc/Code/won-media/.gitignore` then append:

```
node_modules
.next
out
*.tsbuildinfo
next-env.d.ts
playwright-report
test-results
```

- [ ] **Step 10: Verify dev server boots**

Run: `npm run dev`
Expected: Next.js starts on `http://localhost:3000`, placeholder home page renders, no errors.
Stop the server (Ctrl+C) before continuing.

- [ ] **Step 11: Verify production build succeeds**

Run: `npm run build`
Expected: Build completes, `.next/` directory created, no TypeScript or build errors.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 — assets in public/, html archived to _archive/"
```

---

## Task 3 — Migrate `index.html` to `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`
- Reference: `_archive/index.html`
- Test: `tests/visual/home.spec.ts`

- [ ] **Step 1: Read the original HTML**

Read `_archive/index.html` start to finish. Identify:
- The `<head>` content (title, meta, link tags)
- The `<body>` content (all visible markup)
- Any inline `<script>` tags

- [ ] **Step 2: Convert head metadata to Next.js metadata API**

Update the head data into `app/page.tsx` using exported `metadata`:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your listing the star, we make it go far.',
  description: 'Melbourne real estate photography by Won Vision — a property media studio offering listing photography, video, CASA-licensed drone, floor plans, virtual staging, agent headshots and day-to-dusk conversions. Flexible packages and add-ons built to sell premium property faster.',
};

export default function HomePage() {
  return (
    /* paste body markup here, converted to JSX */
  );
}
```

The `<title>` and the long description from `_archive/index.html` lines containing `<title>` and `<meta name="description">` go into the `metadata` export. Leave the `metadataBase` from the layout as-is.

- [ ] **Step 3: Convert body markup to JSX**

Paste the entire `<body>` inner HTML into the JSX return. Apply the standard HTML→JSX transforms:
- `class=` → `className=`
- `for=` → `htmlFor=`
- Self-close all void elements: `<img>` → `<img />`, `<br>` → `<br />`, `<input>` → `<input />`, `<meta>` → `<meta />`, `<link>` → `<link />`
- `style="..."` strings need to become JSX style objects: `style="color: red; font-size: 14px"` → `style={{ color: 'red', fontSize: 14 }}`
- HTML comments `<!-- x -->` → `{/* x */}`
- Any inline event handlers like `onclick="foo()"` → remove (handled by `script.js` from layout)

If there are inline `<script>` blocks inside the body, lift them into a `<Script id="..." strategy="afterInteractive">{`...`}</Script>` from `next/script`.

- [ ] **Step 4: Run dev server and visually inspect**

Run: `npm run dev`
Open `http://localhost:3000/` in a browser. Compare side-by-side with `/tmp/wv-baseline/screenshots/index-desktop.png` and `index-mobile.png`. Visual must match. Fix any JSX errors and any markup divergence.

- [ ] **Step 5: Add visual snapshot test**

Create `/Users/kiranc/Code/won-media/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  webServer: {
    command: 'npm run build && npm start',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
```

Create `/Users/kiranc/Code/won-media/tests/visual/home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('home page renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Won Vision/);
  expect(errors).toEqual([]);
});

test('home page contains hero copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText('Won Vision');
});
```

- [ ] **Step 6: Run the test**

Run: `npx playwright test tests/visual/home.spec.ts --project=desktop`
Expected: PASS. Title contains "Won Vision", no console errors, hero copy present.

If it fails because `script.js` writes to `console.error`, fix `script.js` or relax the test.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx tests/visual/home.spec.ts playwright.config.ts
git commit -m "feat(migration): port index.html to app/page.tsx with metadata + visual test"
```

---

## Task 4 — Migrate `book.html` → `app/book/page.tsx`

**Files:**
- Create: `app/book/page.tsx`, `tests/visual/book.spec.ts`
- Reference: `_archive/book.html`

- [ ] **Step 1: Read `_archive/book.html`** start to finish.

- [ ] **Step 2: Create the page file**

Create `/Users/kiranc/Code/won-media/app/book/page.tsx`:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a shoot',
  description: 'Book a Melbourne real estate shoot with Won Vision — photography, listing video, CASA-licensed drone, floor plans, virtual staging and headshots. Flexible packages and add-ons across Melbourne and Victoria.',
};

export default function BookPage() {
  return (
    /* convert _archive/book.html body to JSX following the rules from Task 3 Step 3 */
  );
}
```

- [ ] **Step 3: Convert body markup to JSX** following the same HTML→JSX rules as Task 3 Step 3.

- [ ] **Step 4: Update internal links**

Search the JSX for `href="book.html"`, `href="book-checkout.html"`, `href="book-schedule.html"`, `href="book-confirmation.html"`, `href="gallery.html"`, `href="index.html"`, `href="/index.html"` and rewrite to clean Next.js routes:

| Old | New |
|---|---|
| `book.html` | `/book` |
| `book-checkout.html` | `/book/checkout` |
| `book-schedule.html` | `/book/schedule` |
| `book-confirmation.html` | `/book/confirmation` |
| `gallery.html` | `/gallery` |
| `index.html` | `/` |

Replace `<a href="...">` with `<Link href="...">` from `next/link` for internal navigation:

```typescript
import Link from 'next/link';
// ...
<Link href="/book/checkout">Continue</Link>
```

External links and email links stay as `<a>`.

- [ ] **Step 5: Run dev server, visually verify against baseline**

Run: `npm run dev`
Open `http://localhost:3000/book` and compare to `/tmp/wv-baseline/screenshots/book-desktop.png` and `book-mobile.png`.

- [ ] **Step 6: Add visual test**

Create `/Users/kiranc/Code/won-media/tests/visual/book.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('book page renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('/book');
  await expect(page).toHaveTitle(/Book a shoot/);
  expect(errors).toEqual([]);
});

test('book page links to checkout', async ({ page }) => {
  await page.goto('/book');
  const link = page.locator('a[href="/book/checkout"]').first();
  await expect(link).toBeVisible();
});
```

- [ ] **Step 7: Run test**

Run: `npx playwright test tests/visual/book.spec.ts --project=desktop`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/book/page.tsx tests/visual/book.spec.ts
git commit -m "feat(migration): port book.html to /book"
```

---

## Task 5 — Migrate `book-checkout.html` → `app/book/checkout/page.tsx`

Repeat the Task 4 pattern exactly, with these specifics:

**Files:**
- Create: `app/book/checkout/page.tsx`, `tests/visual/book-checkout.spec.ts`
- Reference: `_archive/book-checkout.html`

**Metadata:**
```typescript
export const metadata: Metadata = { title: 'Checkout', description: '...' };
```
(Use the description from `_archive/book-checkout.html` `<meta name="description">`.)

- [ ] **Step 1:** Read `_archive/book-checkout.html`.
- [ ] **Step 2:** Create the page file with metadata.
- [ ] **Step 3:** Convert body to JSX (HTML→JSX rules).
- [ ] **Step 4:** Rewrite internal links per Task 4 Step 4 mapping.
- [ ] **Step 5:** Visually verify against `/tmp/wv-baseline/screenshots/book-checkout-*.png`.
- [ ] **Step 6:** Add `tests/visual/book-checkout.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('checkout page renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('/book/checkout');
  await expect(page).toHaveTitle(/Checkout/);
  expect(errors).toEqual([]);
});
```

- [ ] **Step 7:** Run `npx playwright test tests/visual/book-checkout.spec.ts --project=desktop`. Expected: PASS.
- [ ] **Step 8:** Commit `git commit -m "feat(migration): port book-checkout.html to /book/checkout"`.

---

## Task 6 — Migrate `book-schedule.html` → `app/book/schedule/page.tsx`

Repeat Task 5 pattern.

- [ ] **Step 1:** Read `_archive/book-schedule.html`.
- [ ] **Step 2:** Create `app/book/schedule/page.tsx` with `title: 'Schedule'`.
- [ ] **Step 3:** Convert body to JSX.
- [ ] **Step 4:** Rewrite internal links.
- [ ] **Step 5:** Visually verify against baseline.
- [ ] **Step 6:** Add `tests/visual/book-schedule.spec.ts` (copy of book-checkout test, swap path and title).
- [ ] **Step 7:** Run test. Expected: PASS.
- [ ] **Step 8:** Commit `git commit -m "feat(migration): port book-schedule.html to /book/schedule"`.

---

## Task 7 — Migrate `book-confirmation.html` → `app/book/confirmation/page.tsx`

Repeat Task 5 pattern.

- [ ] **Step 1:** Read `_archive/book-confirmation.html`.
- [ ] **Step 2:** Create `app/book/confirmation/page.tsx` with `title: 'Booking confirmed'`.
- [ ] **Step 3:** Convert body to JSX.
- [ ] **Step 4:** Rewrite internal links.
- [ ] **Step 5:** Visually verify against baseline.
- [ ] **Step 6:** Add `tests/visual/book-confirmation.spec.ts`.
- [ ] **Step 7:** Run test. Expected: PASS.
- [ ] **Step 8:** Commit `git commit -m "feat(migration): port book-confirmation.html to /book/confirmation"`.

---

## Task 8 — Migrate `gallery.html` → `app/gallery/page.tsx`

Repeat Task 5 pattern.

- [ ] **Step 1:** Read `_archive/gallery.html`.
- [ ] **Step 2:** Create `app/gallery/page.tsx` with the original gallery title and description.
- [ ] **Step 3:** Convert body to JSX. Image paths starting with `assets/...` are still valid because we moved `assets/` to `public/assets/` — Next.js serves `/assets/...` automatically.
- [ ] **Step 4:** Rewrite internal links.
- [ ] **Step 5:** Visually verify against baseline.
- [ ] **Step 6:** Add `tests/visual/gallery.spec.ts`.
- [ ] **Step 7:** Run test. Expected: PASS.
- [ ] **Step 8:** Commit `git commit -m "feat(migration): port gallery.html to /gallery"`.

---

## Task 9 — Add legacy URL redirects so old `*.html` URLs don't 404

**Files:**
- Modify: `next.config.ts`

The site is indexed by Google with `.html` extensions. We must 301 the old URLs to the clean ones.

- [ ] **Step 1: Add redirects to `next.config.ts`**

Replace `next.config.ts` content with:

```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/index.html',             destination: '/',                  permanent: true },
      { source: '/book.html',              destination: '/book',              permanent: true },
      { source: '/book-checkout.html',     destination: '/book/checkout',     permanent: true },
      { source: '/book-schedule.html',     destination: '/book/schedule',     permanent: true },
      { source: '/book-confirmation.html', destination: '/book/confirmation', permanent: true },
      { source: '/gallery.html',           destination: '/gallery',           permanent: true },
    ];
  },
};

export default config;
```

- [ ] **Step 2: Add a redirect test**

Create `/Users/kiranc/Code/won-media/tests/visual/redirects.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const redirects = [
  { from: '/index.html',             to: '/' },
  { from: '/book.html',              to: '/book' },
  { from: '/book-checkout.html',     to: '/book/checkout' },
  { from: '/book-schedule.html',     to: '/book/schedule' },
  { from: '/book-confirmation.html', to: '/book/confirmation' },
  { from: '/gallery.html',           to: '/gallery' },
];

for (const r of redirects) {
  test(`redirect ${r.from} → ${r.to}`, async ({ page }) => {
    const response = await page.goto(r.from);
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(r.to);
  });
}
```

- [ ] **Step 3: Run test**

Run: `npx playwright test tests/visual/redirects.spec.ts --project=desktop`
Expected: 6 passes.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts tests/visual/redirects.spec.ts
git commit -m "feat(migration): 301 legacy .html URLs to clean Next.js routes"
```

---

## Task 10 — Update `sitemap.xml` and `robots.txt` for new URLs

**Files:**
- Modify: `public/sitemap.xml`, `public/robots.txt`

- [ ] **Step 1: Read existing `public/sitemap.xml`** and identify all `.html` entries.

- [ ] **Step 2: Replace `.html` URLs with clean routes**

Edit `public/sitemap.xml` so every `<loc>` uses the new clean URL (`/book` not `/book.html`, etc.). Keep `<lastmod>` as today's date `2026-05-07`.

- [ ] **Step 3: Verify `public/robots.txt`** points to the correct sitemap URL `https://wonvision.com.au/sitemap.xml` and has no rules referring to `.html` paths.

- [ ] **Step 4: Commit**

```bash
git add public/sitemap.xml public/robots.txt
git commit -m "feat(migration): update sitemap and robots for clean URLs"
```

---

## Task 11 — Add a top-level migration smoke test

**Files:**
- Create: `tests/visual/smoke.spec.ts`

- [ ] **Step 1: Write a smoke test that hits every production route**

Create `/Users/kiranc/Code/won-media/tests/visual/smoke.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const routes = [
  { path: '/',                  title: /Won Vision/ },
  { path: '/book',              title: /Book a shoot/ },
  { path: '/book/checkout',     title: /Checkout/ },
  { path: '/book/schedule',     title: /Schedule/ },
  { path: '/book/confirmation', title: /Booking confirmed/ },
  { path: '/gallery',           title: /Gallery/ },
];

for (const r of routes) {
  test(`smoke ${r.path} renders 200, has title, no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    const response = await page.goto(r.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(r.title);
    expect(errors).toEqual([]);
  });
}
```

- [ ] **Step 2: Run full visual test suite**

Run: `npx playwright test --project=desktop`
Expected: ALL tests PASS (home, book, checkout, schedule, confirmation, gallery, redirects, smoke = ~14+ tests).

- [ ] **Step 3: Run mobile project too**

Run: `npx playwright test --project=mobile`
Expected: All smoke + page tests PASS on mobile viewport.

- [ ] **Step 4: Commit**

```bash
git add tests/visual/smoke.spec.ts
git commit -m "test(migration): smoke test across all 6 production routes"
```

---

## Task 12 — Deploy preview, verify, then promote to production

**Files:**
- No code changes — deployment only.

- [ ] **Step 1: Push branch and let Vercel build a preview**

```bash
cd /Users/kiranc/Code/won-media
git push -u origin feat/nextjs-migration
```

Wait for Vercel to publish the preview URL. Look in the Vercel dashboard or run:

```bash
vercel ls won-vision --limit 3
```

- [ ] **Step 2: Run smoke test against the preview URL**

Override the baseURL:

```bash
PLAYWRIGHT_BASE_URL=https://<preview-url>.vercel.app npx playwright test tests/visual/smoke.spec.ts --project=desktop
```

Expected: ALL pass.

- [ ] **Step 3: Visual diff preview vs production baseline**

Manually compare every preview URL page to `/tmp/wv-baseline/screenshots/*.png`. Acceptable variance: minor antialiasing. NOT acceptable: layout shifts, missing sections, font swaps, color changes.

- [ ] **Step 4: Disable Vercel Deployment Protection on the preview**

Per `feedback_vercel_protection_off.md`. Use the Vercel API to disable SSO + password protection if enabled.

- [ ] **Step 5: Open PR and merge**

```bash
gh pr create --title "feat: migrate static site to Next.js 16" --body "$(cat <<'EOF'
## Summary
- Static HTML → Next.js 16 App Router migration
- 6 production routes ported with visual parity
- Legacy .html URLs 301 redirect to clean routes
- Playwright smoke + visual tests added

## Test plan
- [ ] All Playwright tests pass on desktop and mobile
- [ ] Preview URL pages match baseline screenshots
- [ ] /sitemap.xml and /robots.txt return 200 with correct URLs

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Then merge after preview is verified.

- [ ] **Step 6: Confirm production is live and healthy**

After merge to `main`, Vercel auto-deploys to production. Run:

```bash
PLAYWRIGHT_BASE_URL=https://wonvision.com.au npx playwright test tests/visual/smoke.spec.ts --project=desktop
```

Expected: ALL pass against production.

- [ ] **Step 7: Disable Vercel Deployment Protection on production**

Per `feedback_vercel_protection_off.md`.

- [ ] **Step 8: Delete the migration branch**

```bash
git branch -d feat/nextjs-migration
git push origin --delete feat/nextjs-migration
```

---

## Phase 1 Done When

- [ ] All 12 tasks complete with passing tests
- [ ] `wonvision.com.au` serves Next.js with visual parity to pre-migration
- [ ] All `.html` legacy URLs 301 redirect correctly
- [ ] Vercel Deployment Protection disabled on production
- [ ] `_archive/` removed in a follow-up cleanup commit (optional — keep for one rollback window)

**Next:** Phase 2 plan (DB + auth foundations) — to be written before Phase 2 begins.
