# Phase 2 — DB + Auth Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Neon Postgres + Drizzle ORM + Clerk auth to the migrated Won Vision Next.js app. Schema for `properties`, `photos`, `editors`. Clerk-protected `/admin` route returning a placeholder dashboard. No editor UI logic yet — that's Phase 5. End state: visit `/admin` → Clerk sign-in → if authenticated AND in `editors` table → see "Welcome, editor" placeholder. If authenticated but NOT an editor → 403.

**Architecture:** Drizzle ORM with the Neon HTTP driver for serverless reads/writes (zero cold-start cost on Vercel Functions), and the Neon node-postgres driver for migrations (`drizzle-kit push` runs against the unpooled URL). Clerk handles identity (Vercel Marketplace integration, env vars already provisioned). `proxy.ts` (Next.js 16's replacement for `middleware.ts`) gates `/admin/**`. Editor authorization is a two-step check: Clerk verifies you're a logged-in human; a DB lookup against `editors.clerk_user_id` verifies you're explicitly trusted as an editor. Random Clerk signups never get in.

**Tech Stack:**
- `drizzle-orm` + `drizzle-kit` for schema and migrations
- `@neondatabase/serverless` for runtime queries
- `pg` for migration runs
- `@clerk/nextjs` for auth
- Next.js 16 App Router, `proxy.ts` (NOT `middleware.ts`)

**Prerequisites already done (2026-05-08):**
- Neon Postgres provisioned via Vercel Marketplace (`won-vision-db`, Sydney syd1, free tier)
- Clerk provisioned via Vercel Marketplace (`won-vision-auth`, free tier, email + Google sign-in)
- Env vars present in `.env.local` (DATABASE_URL, DATABASE_URL_UNPOOLED, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
- Vercel project `won-media` (yes, still that label) auto-syncs env vars to Production + Preview + Development

**Branch:** `feat/phase-2-db-auth` cut from latest `main`.

---

## Task 1 — Install Drizzle + Neon serverless driver

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Cut feature branch from main**

```bash
cd /Users/kiranc/Code/won-media
git checkout main && git pull --ff-only
git checkout -b feat/phase-2-db-auth
```

- [ ] **Step 2: Install runtime + dev deps**

```bash
npm install drizzle-orm @neondatabase/serverless pg
npm install -D drizzle-kit @types/pg
```

Expected: 4 deps + 2 dev deps added. No vulnerabilities flagged. If dependabot-style audit warnings appear, ignore unless they're CVEs on the freshly-installed packages.

- [ ] **Step 3: Create `drizzle.config.ts`**

```typescript
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED is required for drizzle-kit migrations');
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED },
  verbose: true,
  strict: true,
});
```

- [ ] **Step 4: Verify drizzle-kit can read the env**

```bash
npx drizzle-kit --help 2>&1 | head -3
```

Expected: prints help. No "DATABASE_URL_UNPOOLED is required" error (the config only throws when migrations actually run, not on `--help`).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json drizzle.config.ts
git commit -m "feat(db): install drizzle + neon serverless driver"
```

---

## Task 2 — Define schema for properties, photos, editors

**Files:**
- Create: `lib/db/schema.ts`, `lib/db/index.ts`

- [ ] **Step 1: Create the schema file**

Create `/Users/kiranc/Code/won-media/lib/db/schema.ts`:

```typescript
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const tierEnum = pgEnum('property_tier', ['small', 'standard', 'large']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const propertyStatusEnum = pgEnum('property_status', [
  'draft',
  'intake',
  'processing',
  'review',
  'approved',
  'delivered',
  'cancelled',
]);
export const photoServiceEnum = pgEnum('photo_service', [
  'declutter',
  'stage',
  'dusk',
  'declutter-stage',
]);
export const photoStatusEnum = pgEnum('photo_status', [
  'pending',
  'processing',
  'review',
  'approved',
  'delivered',
  'rejected',
]);
export const editorDecisionEnum = pgEnum('editor_decision', ['pending', 'approved', 'rejected']);
export const editorRoleEnum = pgEnum('editor_role', ['admin', 'editor']);

export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  address: text('address').notNull(),
  contactEmail: text('contact_email').notNull(),
  tier: tierEnum('tier').notNull(),
  photoCount: integer('photo_count').notNull(),
  stripeSessionId: text('stripe_session_id'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  status: propertyStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  magicLinkToken: text('magic_link_token').notNull().unique(),
});

export const photos = pgTable('photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  originalDropboxPath: text('original_dropbox_path').notNull(),
  service: photoServiceEnum('service').notNull(),
  style: text('style'),
  workflowRunId: text('workflow_run_id'),
  variant1Path: text('variant_1_path'),
  variant2Path: text('variant_2_path'),
  qaScore: integer('qa_score'),
  qaPass: boolean('qa_pass'),
  qaIssues: jsonb('qa_issues'),
  editorDecision: editorDecisionEnum('editor_decision').notNull().default('pending'),
  approvedVariant: integer('approved_variant'),
  status: photoStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const editors = pgTable('editors', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  email: text('email').notNull().unique(),
  role: editorRoleEnum('role').notNull().default('editor'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type Editor = typeof editors.$inferSelect;
export type NewEditor = typeof editors.$inferInsert;
```

- [ ] **Step 2: Create the runtime DB client**

Create `/Users/kiranc/Code/won-media/lib/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export * from './schema';
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: zero errors. If errors mention drizzle types, double-check the import paths.

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts lib/db/index.ts
git commit -m "feat(db): define schema for properties, photos, editors"
```

---

## Task 3 — Generate and apply the first migration

**Files:**
- Create: `lib/db/migrations/0000_*.sql`, `lib/db/migrations/meta/*`
- Create: `tests/db/schema.spec.ts`

- [ ] **Step 1: Generate the migration SQL**

```bash
npx drizzle-kit generate
```

Expected: prints `Reading schema from lib/db/schema.ts` then `Your SQL migration file ➜ lib/db/migrations/0000_<descriptor>.sql 🚀`. The file contains `CREATE TYPE ... AS ENUM` statements for all enums and `CREATE TABLE` statements for all 3 tables.

- [ ] **Step 2: Inspect the generated SQL**

```bash
ls lib/db/migrations/
cat lib/db/migrations/0000_*.sql | head -60
```

Expected: 1 SQL file + a `meta/` directory. SQL contains `CREATE TYPE "public"."property_tier" AS ENUM ('small', 'standard', 'large')` and `CREATE TABLE "properties"`. No DROP statements.

- [ ] **Step 3: Apply migration to Neon**

```bash
npx drizzle-kit migrate
```

Expected: `Reading migration files`, then `Pushed schema to database`. If it asks for confirmation, type `y`.

- [ ] **Step 4: Verify tables exist on Neon**

```bash
psql "$DATABASE_URL_UNPOOLED" -c "\dt" 2>&1
```

Expected output includes 3 rows for `properties`, `photos`, `editors`. If `psql` is not installed, alternative:

```bash
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL_UNPOOLED);
sql\`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename\`.then(r => console.log(r));
" 2>&1
```

Expected: `[ { tablename: 'editors' }, { tablename: 'photos' }, { tablename: 'properties' }, ... ]`. The drizzle migrations metadata table (`__drizzle_migrations`) will also appear; that's expected.

- [ ] **Step 5: Add a schema sanity test**

Create `/Users/kiranc/Code/won-media/tests/db/schema.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { neon } from '@neondatabase/serverless';

test('schema: required tables exist', async () => {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  const rows = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  const names = rows.map((r: { tablename: string }) => r.tablename);
  expect(names).toEqual(expect.arrayContaining(['editors', 'photos', 'properties']));
});

test('schema: properties.magic_link_token is unique', async () => {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  const rows = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'properties' AND indexdef LIKE '%magic_link_token%' AND indexdef LIKE '%UNIQUE%'
  `;
  expect(rows.length).toBeGreaterThan(0);
});

test('schema: editors.clerk_user_id is unique', async () => {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  const rows = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'editors' AND indexdef LIKE '%clerk_user_id%' AND indexdef LIKE '%UNIQUE%'
  `;
  expect(rows.length).toBeGreaterThan(0);
});
```

- [ ] **Step 6: Run the schema test**

```bash
npx playwright test tests/db/schema.spec.ts --project=desktop
```

Expected: 3 PASS. If `DATABASE_URL_UNPOOLED` isn't loaded into the test env, add `dotenv` to `playwright.config.ts` or use `dotenv-cli`:

```bash
npx dotenv -e .env.local -- npx playwright test tests/db/schema.spec.ts --project=desktop
```

If `dotenv-cli` isn't installed: `npm i -D dotenv-cli`, then re-run.

- [ ] **Step 7: Commit**

```bash
git add lib/db/migrations tests/db/schema.spec.ts package.json package-lock.json
git commit -m "feat(db): apply initial migration and add schema sanity tests"
```

---

## Task 4 — Install and configure Clerk for Next.js 16

**Files:**
- Modify: `package.json`, `package-lock.json`, `app/layout.tsx`
- Reference: env vars already in `.env.local`

- [ ] **Step 1: Install Clerk**

```bash
npm install @clerk/nextjs
```

Expected: 1 package added.

- [ ] **Step 2: Wrap the root layout in `<ClerkProvider>`**

Edit `/Users/kiranc/Code/won-media/app/layout.tsx`. Current content wraps `<body>` directly. New content wraps that in `<ClerkProvider>`:

```typescript
import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  metadataBase: new URL('https://wonvision.com.au'),
  title: { default: 'Won Vision', template: '%s — Won Vision' },
  description: 'Melbourne real estate photography by Won Vision.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body id="top">
          {children}
          <Script src="/script.js" strategy="afterInteractive" />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Verify dev server still boots**

```bash
npm run dev &
sleep 5
curl -sf -o /dev/null -w "/ %{http_code}\n" http://localhost:3000/
pkill -f "next dev" || true
```

Expected: `/ 200`. If Clerk throws "missing publishable key" the env var didn't load — confirm `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (without quotes).

- [ ] **Step 4: Verify production build still succeeds**

```bash
rm -rf .next && npm run build 2>&1 | tail -10
```

Expected: clean build, all 7 routes still prerendered as static.

- [ ] **Step 5: Run existing visual tests to confirm no regression**

```bash
npx playwright test tests/visual --project=desktop
```

Expected: all 20 prior tests still pass. (Clerk wraps everything but `<ClerkProvider>` is transparent for unauthenticated public routes.)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json app/layout.tsx
git commit -m "feat(auth): install @clerk/nextjs and wrap root layout in ClerkProvider"
```

---

## Task 5 — Create `proxy.ts` to gate `/admin/**`

**Files:**
- Create: `proxy.ts`

Next.js 16 uses `proxy.ts` at the project root for what was `middleware.ts` in earlier versions. Same execution model, just renamed.

- [ ] **Step 1: Create the proxy file**

Create `/Users/kiranc/Code/won-media/proxy.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

- [ ] **Step 2: Verify the proxy registers**

```bash
npm run dev &
sleep 5
# Should redirect to Clerk sign-in (Clerk's hosted page or your /admin/sign-in route)
curl -sI http://localhost:3000/admin/anything | head -5
pkill -f "next dev" || true
```

Expected: a 307/302 redirect to a sign-in URL. NOT a 200, NOT a 404. The redirect Location header should contain `clerk` or `/admin/sign-in`.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat(auth): add proxy.ts gating /admin via Clerk"
```

---

## Task 6 — Build `/admin/sign-in`, `/admin` layout, and placeholder dashboard

**Files:**
- Create: `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/sign-in/[[...sign-in]]/page.tsx`

- [ ] **Step 1: Create the sign-in route**

Create `/Users/kiranc/Code/won-media/app/admin/sign-in/[[...sign-in]]/page.tsx`:

```typescript
import { SignIn } from '@clerk/nextjs';

export const metadata = { title: 'Editor sign-in' };

export default function SignInPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <SignIn signUpUrl="/admin/sign-up" forceRedirectUrl="/admin" />
    </main>
  );
}
```

- [ ] **Step 2: Create the sign-up route (so the link from sign-in works)**

Create `/Users/kiranc/Code/won-media/app/admin/sign-up/[[...sign-up]]/page.tsx`:

```typescript
import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Editor sign-up' };

export default function SignUpPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <SignUp signInUrl="/admin/sign-in" forceRedirectUrl="/admin" />
    </main>
  );
}
```

Note: signing up alone does NOT make you an editor. The `editors` table check in Task 7 is the real gate.

- [ ] **Step 3: Create the admin layout**

Create `/Users/kiranc/Code/won-media/app/admin/layout.tsx`:

```typescript
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export const metadata = { title: 'Editor admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid #2a2a2a',
      }}>
        <Link href="/admin" style={{ fontWeight: 600 }}>Won Vision · Editor</Link>
        <UserButton afterSignOutUrl="/admin/sign-in" />
      </header>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  );
}
```

`robots: { index: false }` makes sure search engines never index any `/admin/*` page. The hidden URL stays hidden.

- [ ] **Step 4: Create the placeholder dashboard**

Create `/Users/kiranc/Code/won-media/app/admin/page.tsx`:

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, editors } from '@/lib/db';
import { eq } from 'drizzle-orm';

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');

  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });

  if (!editor) {
    const user = await currentUser();
    return (
      <section>
        <h1>Access denied</h1>
        <p>Your account ({user?.primaryEmailAddress?.emailAddress}) is signed in, but is not authorized as an editor.</p>
        <p>Ask the administrator to add you to the editors table.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Welcome, {editor.email}</h1>
      <p>Role: {editor.role}</p>
      <p>This is the placeholder editor dashboard. The review queue ships in Phase 5.</p>
    </section>
  );
}
```

- [ ] **Step 5: Build and smoke**

```bash
rm -rf .next && npm run build 2>&1 | tail -10
```

Expected: build succeeds, including the new `/admin`, `/admin/sign-in/[[...sign-in]]`, `/admin/sign-up/[[...sign-up]]` routes. They should be marked `ƒ (Dynamic)` in the build output (because they call `auth()`).

- [ ] **Step 6: Commit**

```bash
git add app/admin tsconfig.json
git commit -m "feat(admin): hidden /admin route, sign-in/up pages, placeholder dashboard"
```

---

## Task 7 — Editor authorization integration test

**Files:**
- Create: `tests/admin/auth.spec.ts`

The unauthenticated and authenticated-but-not-editor cases are testable without a real Clerk login by hitting public routes and verifying redirects.

- [ ] **Step 1: Add auth flow test**

Create `/Users/kiranc/Code/won-media/tests/admin/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('admin: unauthenticated user is redirected to sign-in', async ({ page }) => {
  const response = await page.goto('/admin');
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toMatch(/\/admin\/sign-in/);
});

test('admin: deep route also redirects to sign-in when unauthenticated', async ({ page }) => {
  await page.goto('/admin/properties/anything');
  expect(new URL(page.url()).pathname).toMatch(/\/admin\/sign-in/);
});

test('admin sign-in page renders', async ({ page }) => {
  await page.goto('/admin/sign-in');
  await expect(page).toHaveTitle(/Editor sign-in/);
  await expect(page.locator('text=/sign in/i').first()).toBeVisible();
});

test('admin pages have noindex robots meta', async ({ page }) => {
  await page.goto('/admin/sign-in');
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toMatch(/noindex/);
});
```

- [ ] **Step 2: Run the test**

```bash
npx playwright test tests/admin/auth.spec.ts --project=desktop
```

Expected: 4 PASS.

- [ ] **Step 3: Run the entire test suite**

```bash
npx playwright test --project=desktop
```

Expected: all prior tests + 4 new admin tests + 3 db schema tests = ~27 tests, all passing.

- [ ] **Step 4: Commit**

```bash
git add tests/admin
git commit -m "test(admin): verify unauthenticated /admin redirects to sign-in"
```

---

## Task 8 — Seed first editor and write a manual smoke runbook

**Files:**
- Create: `scripts/seed-editor.ts`, `package.json` (add script)

The first editor can't add themselves — there's a chicken-and-egg problem (you can't reach `/admin` to add yourself before you're an editor). So we use a script that takes a Clerk user ID + email and inserts a row.

- [ ] **Step 1: Add the seed script**

Create `/Users/kiranc/Code/won-media/scripts/seed-editor.ts`:

```typescript
import { db, editors } from '../lib/db';

async function main() {
  const clerkUserId = process.argv[2];
  const email = process.argv[3];
  const role = (process.argv[4] || 'admin') as 'admin' | 'editor';

  if (!clerkUserId || !email) {
    console.error('Usage: tsx scripts/seed-editor.ts <clerkUserId> <email> [role]');
    process.exit(1);
  }

  const existing = await db.query.editors.findFirst({
    where: (t, { eq }) => eq(t.clerkUserId, clerkUserId),
  });

  if (existing) {
    console.log(`Editor already exists: ${existing.email} (${existing.role})`);
    process.exit(0);
  }

  const [created] = await db.insert(editors).values({ clerkUserId, email, role }).returning();
  console.log(`Created editor: ${created.email} (${created.role}, id ${created.id})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Add tsx as a dev dep and a package.json script**

```bash
npm install -D tsx
```

Edit `/Users/kiranc/Code/won-media/package.json` scripts section to add:

```json
"seed:editor": "dotenv -e .env.local -- tsx scripts/seed-editor.ts"
```

(Keep the other scripts. `dotenv-cli` was installed in Task 3 Step 6.)

- [ ] **Step 3: Smoke test the seed script with a fake user (dry-run, no changes)**

Skip actually writing data — that requires a real Clerk user ID. Instead, verify the script errors out cleanly with no args:

```bash
npm run seed:editor 2>&1 | head -3
```

Expected: prints `Usage: tsx scripts/seed-editor.ts <clerkUserId> <email> [role]` and exits non-zero.

- [ ] **Step 4: Write the runbook for adding the first editor**

Create `/Users/kiranc/Code/won-media/docs/runbooks/add-first-editor.md`:

```markdown
# Add the first editor (Phase 2 setup)

After Phase 2 ships, before Phase 5 admin features, the first editor needs to be inserted manually.

1. Go to https://wonvision.com.au/admin/sign-up and create your Clerk account with the editor's email.
2. Sign in. The dashboard will say "Your account is signed in, but is not authorized as an editor."
3. Find your Clerk user ID:
   - Clerk dashboard → Users → click your user → copy the User ID (starts with `user_`)
4. Run:
   ```bash
   cd ~/Code/won-media
   npm run seed:editor user_XXXXXXXXXXXXXX you@email.com admin
   ```
5. Refresh https://wonvision.com.au/admin — you should now see the placeholder dashboard.

To add another editor later: repeat steps 1-4 but use `editor` instead of `admin` for the role argument (or omit, defaults to admin).
```

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-editor.ts package.json package-lock.json docs/runbooks/add-first-editor.md
git commit -m "feat(admin): seed-editor script + first-editor runbook"
```

---

## Task 9 — Deploy preview, verify, promote to production

**Files:**
- No code changes; deployment + manual verification only.

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/phase-2-db-auth
```

- [ ] **Step 2: Wait for Vercel preview build**

```bash
until vercel ls 2>&1 | head -3 | grep -q "● Ready.*Preview"; do sleep 10; done
vercel ls 2>&1 | head -3
```

Capture the preview URL.

- [ ] **Step 3: Smoke against preview**

```bash
PLAYWRIGHT_BASE_URL=<preview-url> npx playwright test tests/admin/auth.spec.ts tests/visual/smoke.spec.ts --project=desktop
```

Expected: ALL pass against the preview. Marketing routes still work; `/admin` redirects to sign-in.

- [ ] **Step 4: Verify Clerk widget loads on preview**

Manually visit `<preview-url>/admin/sign-in` in a browser. The Clerk-hosted sign-in widget should render. If it shows a Clerk error like "Missing publishable key" or "Invalid host," double-check the env vars are present in Vercel for the Preview environment.

- [ ] **Step 5: Open PR**

```bash
gh pr create --title "feat: phase 2 — DB + auth foundations" --body "$(cat <<'EOF'
## Summary
- Drizzle ORM + Neon Postgres (schema for properties, photos, editors)
- Clerk auth wired via Vercel Marketplace
- proxy.ts gates /admin/**
- Hidden /admin route with placeholder dashboard
- DB-backed editor authorization (Clerk auth alone is not enough — must also be in editors table)
- Seed script + first-editor runbook
- 4 new admin auth tests + 3 schema tests

## Phase 2 of 7
Foundation for Phases 3-7. No editor UI logic yet.

See `docs/superpowers/plans/2026-05-08-phase-2-db-auth-foundations.md` for the detailed plan.

## Test plan
- [x] All Playwright tests pass on desktop
- [ ] Preview /admin redirects to sign-in
- [ ] Production /admin redirects to sign-in
- [ ] First editor seeded successfully via runbook

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 6: Merge**

```bash
gh pr merge --squash --delete-branch
```

- [ ] **Step 7: Wait for prod deploy**

```bash
until vercel ls 2>&1 | head -3 | grep -q "● Ready.*Production"; do sleep 10; done
```

- [ ] **Step 8: Smoke against production**

```bash
PLAYWRIGHT_BASE_URL=https://wonvision.com.au npx playwright test tests/admin/auth.spec.ts tests/visual/smoke.spec.ts --project=desktop
```

Expected: ALL pass against production.

- [ ] **Step 9: Add yourself as the first editor**

Follow `docs/runbooks/add-first-editor.md`. Verify you can reach `/admin` and see the dashboard.

- [ ] **Step 10: Sync local main**

```bash
git checkout main && git pull --ff-only
```

---

## Phase 2 Done When

- [ ] All 9 tasks complete with passing tests
- [ ] Schema deployed to Neon (`properties`, `photos`, `editors` tables exist)
- [ ] `/admin` 307-redirects unauthenticated users to `/admin/sign-in` on production
- [ ] Logged-in editor can view the placeholder dashboard
- [ ] Logged-in non-editor sees "Access denied"
- [ ] First editor seeded via runbook
- [ ] Existing public routes (`/`, `/book`, `/gallery`) still work identically
- [ ] All visual + smoke + admin + schema tests green on prod (~27 tests)

**Next:** Phase 3 plan — public `/editor/new` property submission flow + Stripe Checkout. Will be written before Phase 3 begins.

---

## Open Questions for Phase 3 (not blocking Phase 2)

- Real pricing tiers ($X / $Y / $Z) — Kiran to provide
- Stripe products: pre-create three Price IDs (small/standard/large) in Stripe dashboard or create dynamically per submission?
- Photo upload mechanism: direct-to-Dropbox via the Dropbox API on the client, or upload to Vercel Blob first then transfer? (Affects upload speed + which token is needed in the browser)
- Style presets for "stage" service: how many built-in styles (Scandinavian / Coastal / Modern / etc.) vs free-text prompt?
