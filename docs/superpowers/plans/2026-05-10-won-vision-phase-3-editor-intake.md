# Won Vision Phase 3 — Internal Editor Intake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an internal, Clerk-protected `/admin/editor/new` flow that lets the Won Vision team submit a property, upload originals to Vercel Blob, tag each photo with a service + style preset, and queue the job for the Phase 4 AI pipeline.

**Architecture:** New `/admin/editor` subtree under the existing Clerk-gated `/admin` route. Multi-step form (property details → upload → tag → review → submit) backed by Next.js Server Actions. Originals upload directly to Vercel Blob via signed client tokens; metadata persists to Neon Postgres. Submitting a property flips its status to `queued`, which Phase 4 will pick up. No Stripe, no magic-link email, no public route — internal use only.

**Tech Stack:** Next.js 16 App Router · Server Actions · Drizzle ORM · Neon Postgres · Clerk · Vercel Blob (`@vercel/blob`) · Playwright for E2E.

---

## Locked Decisions (2026-05-10)

1. **No payment.** Internal-only tool — `properties.stripeSessionId`, `paymentStatus`, and `magicLinkToken` are NOT used in Phase 3. Schema relaxed accordingly.
2. **Photo upload via Vercel Blob.** Phase 4 will move blobs to Dropbox `/00 INTAKE/`. Phase 3 stores Blob URLs only.
3. **Auth = existing admin role.** Reuse `editors` table + Clerk middleware. Any signed-in editor (admin OR editor) can use the intake.
4. **Phase 4 trigger = `properties.status = 'queued'`.** Phase 3 ends at status flip; Phase 4 polls/listens for `queued`.
5. **4 style presets:** Modern, Scandinavian, Coastal, Mid-Century. Stored as a TS constant; `style` column stays free-text in DB so we can extend without migrations.

---

## File Structure

**Create:**
- `lib/db/migrations/0001_phase3_intake.sql` — relax magicLinkToken / dropboxPath, add originalBlobUrl
- `lib/blob.ts` — Vercel Blob client + signed-upload token issuer
- `lib/styles.ts` — STYLE_PRESETS constant
- `lib/intake/actions.ts` — server actions: createDraft, attachPhoto, submitProperty
- `lib/intake/queries.ts` — drizzle queries for the intake list
- `app/api/admin/blob-token/route.ts` — POST handler issuing client upload tokens
- `app/admin/editor/page.tsx` — list of draft + queued properties
- `app/admin/editor/new/page.tsx` — multi-step intake form (client component)
- `app/admin/editor/new/Stepper.tsx` — client component (form state machine)
- `app/admin/editor/[id]/page.tsx` — read-only property detail (post-submit confirmation + queue status)
- `tests/intake.spec.ts` — Playwright E2E
- `tests/intake-actions.test.ts` — server action unit tests (vitest)

**Modify:**
- `lib/db/schema.ts` — make `magicLinkToken` and `originalDropboxPath` nullable; add `originalBlobUrl`
- `app/admin/page.tsx` — add link to `/admin/editor`
- `package.json` — add `@vercel/blob`, `vitest`, `zod`
- `proxy.ts` — already gates `/admin(.*)`, no change needed (verify in Task 1)

---

### Task 1: Verify Clerk gate covers `/admin/editor`

**Files:**
- Read: `proxy.ts`

- [ ] **Step 1: Read `proxy.ts` and confirm `/admin/editor(.*)` is matched by `isProtectedAdminRoute = createRouteMatcher(['/admin(.*)'])`**

Expected: the existing matcher already covers all `/admin/*` paths including new `/admin/editor` routes. No code change required.

- [ ] **Step 2: Confirm finding in writing — paste the matched line and the matcher into the plan execution log**

No commit.

---

### Task 2: Add dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime + dev dependencies**

```bash
cd ~/Code/won-media
npm install @vercel/blob zod
npm install -D vitest @vitejs/plugin-react happy-dom
```

- [ ] **Step 2: Add vitest scripts**

Edit `package.json` `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: [],
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore(phase-3): add @vercel/blob, zod, vitest"
```

---

### Task 3: Schema migration — relax stripe fields, add blob URL

**Files:**
- Modify: `lib/db/schema.ts`
- Create: `lib/db/migrations/0001_phase3_intake.sql`

- [ ] **Step 1: Update schema.ts**

Replace the `properties` and `photos` tables:

```ts
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
  magicLinkToken: text('magic_link_token').unique(),               // ← nullable now
  submittedById: uuid('submitted_by_id').references(() => editors.id),
});

export const photos = pgTable('photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  originalBlobUrl: text('original_blob_url'),                      // ← new
  originalDropboxPath: text('original_dropbox_path'),              // ← nullable now (Phase 4 fills)
  filename: text('filename').notNull(),                            // ← new
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
```

Also add `'queued'` to `propertyStatusEnum`:

```ts
export const propertyStatusEnum = pgEnum('property_status', [
  'draft',
  'intake',
  'queued',
  'processing',
  'review',
  'approved',
  'delivered',
  'cancelled',
]);
```

- [ ] **Step 2: Generate migration**

```bash
cd ~/Code/won-media
npx drizzle-kit generate --name phase3_intake
```

Expected: a new SQL file under `lib/db/migrations/0001_*.sql`.

- [ ] **Step 3: Inspect the generated SQL**

Confirm it contains: `ALTER TYPE property_status ADD VALUE 'queued'`, `ALTER TABLE properties ALTER COLUMN magic_link_token DROP NOT NULL`, `ALTER TABLE photos ALTER COLUMN original_dropbox_path DROP NOT NULL`, `ALTER TABLE photos ADD COLUMN original_blob_url text`, `ALTER TABLE photos ADD COLUMN filename text NOT NULL`, `ALTER TABLE properties ADD COLUMN submitted_by_id uuid`.

If `filename NOT NULL` would fail on existing rows, edit the SQL to make it nullable initially (no rows expected — staging DB only — but guard anyway).

- [ ] **Step 4: Apply migration**

```bash
npx dotenv -e .env.local -- npx drizzle-kit migrate
```

Expected output: `Applied 1 migration`.

- [ ] **Step 5: Verify**

```bash
npx dotenv -e .env.local -- tsx -e "import { db, properties } from './lib/db'; db.select().from(properties).limit(1).then(r => console.log('ok', r.length))"
```

Expected: `ok 0` (or however many rows exist).

- [ ] **Step 6: Commit**

```bash
git add lib/db/schema.ts lib/db/migrations/
git commit -m "feat(phase-3): schema for internal intake (queued status, blob url, nullable stripe)"
```

---

### Task 4: Style presets constant

**Files:**
- Create: `lib/styles.ts`
- Test: `tests/styles.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/styles.test.ts
import { describe, it, expect } from 'vitest';
import { STYLE_PRESETS, isStylePreset } from '@/lib/styles';

describe('STYLE_PRESETS', () => {
  it('lists exactly the 4 launch presets', () => {
    expect(STYLE_PRESETS.map((p) => p.id)).toEqual([
      'modern',
      'scandinavian',
      'coastal',
      'mid-century',
    ]);
  });

  it('isStylePreset accepts known ids and rejects others', () => {
    expect(isStylePreset('modern')).toBe(true);
    expect(isStylePreset('art-deco')).toBe(false);
  });
});
```

- [ ] **Step 2: Run — expect fail (module missing)**

```bash
npm test -- tests/styles.test.ts
```

- [ ] **Step 3: Implement**

```ts
// lib/styles.ts
export const STYLE_PRESETS = [
  { id: 'modern',       label: 'Modern',       blurb: 'Clean lines, neutral palette, minimal clutter.' },
  { id: 'scandinavian', label: 'Scandinavian', blurb: 'Warm woods, soft whites, cozy textures.' },
  { id: 'coastal',      label: 'Coastal',      blurb: 'Light blues, sandy tones, breezy linens.' },
  { id: 'mid-century',  label: 'Mid-Century',  blurb: 'Walnut + tan leather, geometric accents.' },
] as const;

export type StylePresetId = (typeof STYLE_PRESETS)[number]['id'];

export function isStylePreset(value: string): value is StylePresetId {
  return STYLE_PRESETS.some((p) => p.id === value);
}
```

- [ ] **Step 4: Run — expect pass**

- [ ] **Step 5: Commit**

```bash
git add lib/styles.ts tests/styles.test.ts
git commit -m "feat(phase-3): style presets (modern, scandi, coastal, mid-century)"
```

---

### Task 5: Vercel Blob client wrapper

**Files:**
- Create: `lib/blob.ts`

- [ ] **Step 1: Implement**

```ts
// lib/blob.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export async function handleClientBlobUpload(
  body: HandleUploadBody,
  request: Request,
  opts: { propertyId: string; editorId: string }
) {
  return handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => ({
      allowedContentTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
      addRandomSuffix: true,
      tokenPayload: JSON.stringify({
        propertyId: opts.propertyId,
        editorId: opts.editorId,
        pathname,
      }),
      maximumSizeInBytes: 50 * 1024 * 1024, // 50MB per photo
    }),
    onUploadCompleted: async () => {
      // No-op: blob row gets attached via attachPhoto server action.
    },
  });
}
```

- [ ] **Step 2: Verify env var documentation**

Add `BLOB_READ_WRITE_TOKEN` to `.env.example` (create if missing) with comment:

```
# Vercel Blob — auto-set by `vercel env pull`. Required for /admin/editor uploads.
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 3: Pull env**

```bash
vercel env pull .env.local
```

Confirm `BLOB_READ_WRITE_TOKEN` is present. If not, run `vercel blob create won-vision-intake` and re-pull.

- [ ] **Step 4: Commit**

```bash
git add lib/blob.ts .env.example
git commit -m "feat(phase-3): vercel blob client upload wrapper"
```

---

### Task 6: Blob upload route

**Files:**
- Create: `app/api/admin/blob-token/route.ts`

- [ ] **Step 1: Implement**

```ts
// app/api/admin/blob-token/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { handleClientBlobUpload } from '@/lib/blob';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });
  if (!editor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const propertyId = url.searchParams.get('propertyId');
  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId required' }, { status: 400 });
  }

  const body = await request.json();
  try {
    const result = await handleClientBlobUpload(body, request, {
      propertyId,
      editorId: editor.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload error' },
      { status: 400 }
    );
  }
}
```

- [ ] **Step 2: Manual smoke test (after Task 9 UI exists, revisit). Skip for now.**

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/blob-token/route.ts
git commit -m "feat(phase-3): authed blob upload token route"
```

---

### Task 7: Intake server actions

**Files:**
- Create: `lib/intake/actions.ts`
- Test: `tests/intake-actions.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/intake-actions.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user_test' })),
}));

vi.mock('@/lib/db', async () => {
  const actual = await vi.importActual<any>('drizzle-orm');
  return {
    db: {
      query: { editors: { findFirst: vi.fn() } },
      insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(async () => [{ id: 'prop_1' }]) })) })),
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(async () => undefined) })) })),
    },
    editors: {},
    properties: {},
    photos: {},
    ...actual,
  };
});

import { createDraft, submitProperty } from '@/lib/intake/actions';
import { db } from '@/lib/db';

describe('intake actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (db.query.editors.findFirst as any).mockResolvedValue({ id: 'editor_1', role: 'admin' });
  });

  it('createDraft inserts a property with status=draft and returns id', async () => {
    const result = await createDraft({
      address: '12 Smith St, Brunswick',
      contactEmail: 'agent@example.com',
      tier: 'standard',
      photoCount: 12,
    });
    expect(result).toEqual({ ok: true, propertyId: 'prop_1' });
    expect(db.insert).toHaveBeenCalled();
  });

  it('createDraft rejects unauthenticated callers', async () => {
    (await import('@clerk/nextjs/server')).auth = vi.fn(async () => ({ userId: null })) as any;
    await expect(
      createDraft({ address: 'x', contactEmail: 'a@b', tier: 'small', photoCount: 1 })
    ).rejects.toThrow(/auth/i);
  });

  it('submitProperty flips status to queued', async () => {
    const r = await submitProperty('prop_1');
    expect(r).toEqual({ ok: true });
    expect(db.update).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run — expect fail (module missing)**

- [ ] **Step 3: Implement**

```ts
// lib/intake/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db, editors, properties, photos } from '@/lib/db';
import { isStylePreset } from '@/lib/styles';

async function requireEditor() {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });
  if (!editor) throw new Error('Not authorised');
  return editor;
}

const draftSchema = z.object({
  address: z.string().min(5).max(300),
  contactEmail: z.string().email(),
  tier: z.enum(['small', 'standard', 'large']),
  photoCount: z.number().int().min(1).max(200),
});

export async function createDraft(input: z.infer<typeof draftSchema>) {
  const editor = await requireEditor();
  const data = draftSchema.parse(input);

  const [row] = await db
    .insert(properties)
    .values({
      address: data.address,
      contactEmail: data.contactEmail,
      tier: data.tier,
      photoCount: data.photoCount,
      status: 'draft',
      submittedById: editor.id,
    })
    .returning({ id: properties.id });

  return { ok: true as const, propertyId: row.id };
}

const photoSchema = z.object({
  propertyId: z.string().uuid(),
  blobUrl: z.string().url(),
  filename: z.string().min(1).max(300),
  service: z.enum(['declutter', 'stage', 'dusk', 'declutter-stage']),
  style: z.string().refine(isStylePreset, 'Unknown style preset').optional(),
});

export async function attachPhoto(input: z.infer<typeof photoSchema>) {
  await requireEditor();
  const data = photoSchema.parse(input);

  await db.insert(photos).values({
    propertyId: data.propertyId,
    originalBlobUrl: data.blobUrl,
    filename: data.filename,
    service: data.service,
    style: data.style,
  });

  revalidatePath(`/admin/editor/new`);
  return { ok: true as const };
}

export async function submitProperty(propertyId: string) {
  await requireEditor();
  z.string().uuid().parse(propertyId);

  await db
    .update(properties)
    .set({ status: 'queued' })
    .where(eq(properties.id, propertyId));

  revalidatePath('/admin/editor');
  revalidatePath(`/admin/editor/${propertyId}`);
  return { ok: true as const };
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- tests/intake-actions.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/intake/ tests/intake-actions.test.ts
git commit -m "feat(phase-3): intake server actions (createDraft, attachPhoto, submitProperty)"
```

---

### Task 8: Intake list query + page

**Files:**
- Create: `lib/intake/queries.ts`
- Create: `app/admin/editor/page.tsx`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Write query**

```ts
// lib/intake/queries.ts
import { desc } from 'drizzle-orm';
import { db, properties } from '@/lib/db';

export async function listEditorProperties() {
  return db.select().from(properties).orderBy(desc(properties.createdAt)).limit(50);
}
```

- [ ] **Step 2: Write list page**

```tsx
// app/admin/editor/page.tsx
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { listEditorProperties } from '@/lib/intake/queries';

export default async function EditorIndex() {
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');

  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });
  if (!editor) redirect('/admin');

  const rows = await listEditorProperties();

  return (
    <section>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Editor intake</h1>
        <Link href="/admin/editor/new">+ New property</Link>
      </header>
      {rows.length === 0 ? (
        <p>No properties yet. Start one with “New property”.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Tier</th>
              <th>Photos</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/admin/editor/${r.id}`}>{r.address}</Link>
                </td>
                <td>{r.tier}</td>
                <td>{r.photoCount}</td>
                <td>{r.status}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Add link from `/admin`**

In `app/admin/page.tsx`, replace the placeholder paragraph with a link list:

```tsx
return (
  <section>
    <h1>Welcome, {editor.email}</h1>
    <p>Role: {editor.role}</p>
    <ul>
      <li><a href="/admin/editor">Editor intake →</a></li>
    </ul>
  </section>
);
```

- [ ] **Step 4: Build + smoke**

```bash
npm run build
```

Expected: build succeeds, no type errors.

- [ ] **Step 5: Commit**

```bash
git add lib/intake/queries.ts app/admin/editor/page.tsx app/admin/page.tsx
git commit -m "feat(phase-3): editor intake list + admin link"
```

---

### Task 9: Intake new-property stepper UI

**Files:**
- Create: `app/admin/editor/new/page.tsx`
- Create: `app/admin/editor/new/Stepper.tsx`

- [ ] **Step 1: Server wrapper page**

```tsx
// app/admin/editor/new/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { Stepper } from './Stepper';
import { STYLE_PRESETS } from '@/lib/styles';

export default async function NewProperty() {
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');

  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });
  if (!editor) redirect('/admin');

  return (
    <section>
      <h1>New property intake</h1>
      <Stepper stylePresets={STYLE_PRESETS} />
    </section>
  );
}
```

- [ ] **Step 2: Client stepper**

```tsx
// app/admin/editor/new/Stepper.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { createDraft, attachPhoto, submitProperty } from '@/lib/intake/actions';

type Tier = 'small' | 'standard' | 'large';
type Service = 'declutter' | 'stage' | 'dusk' | 'declutter-stage';

type StylePreset = { id: string; label: string; blurb: string };

type UploadedPhoto = {
  blobUrl: string;
  filename: string;
  service: Service;
  style?: string;
};

const SERVICES: { id: Service; label: string }[] = [
  { id: 'declutter', label: 'Declutter' },
  { id: 'stage', label: 'Virtual stage' },
  { id: 'dusk', label: 'Day → dusk' },
  { id: 'declutter-stage', label: 'Declutter + stage' },
];

export function Stepper({ stylePresets }: { stylePresets: readonly StylePreset[] }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [tier, setTier] = useState<Tier>('standard');
  const [photoCount, setPhotoCount] = useState(10);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreateDraft(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await createDraft({ address, contactEmail, tier, photoCount });
      setPropertyId(r.propertyId);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }

  async function onUpload(files: FileList | null) {
    if (!files || !propertyId) return;
    setBusy(true); setError(null);
    try {
      for (const file of Array.from(files)) {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: `/api/admin/blob-token?propertyId=${propertyId}`,
        });
        setPhotos((prev) => [...prev, {
          blobUrl: blob.url,
          filename: file.name,
          service: 'stage',
        }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }

  function updatePhoto(idx: number, patch: Partial<UploadedPhoto>) {
    setPhotos((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  async function onSubmit() {
    if (!propertyId) return;
    setBusy(true); setError(null);
    try {
      for (const p of photos) {
        await attachPhoto({
          propertyId,
          blobUrl: p.blobUrl,
          filename: p.filename,
          service: p.service,
          style: p.style,
        });
      }
      await submitProperty(propertyId);
      router.push(`/admin/editor/${propertyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <ol style={{ display: 'flex', gap: '1rem', listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
        {['Details', 'Upload', 'Tag', 'Review'].map((label, i) => (
          <li key={label} style={{ fontWeight: step === i + 1 ? 700 : 400 }}>{i + 1}. {label}</li>
        ))}
      </ol>

      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      {step === 1 && (
        <form onSubmit={onCreateDraft}>
          <label>Address<input required value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          <label>Contact email<input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></label>
          <label>Tier
            <select value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
              <option value="small">Small (≤10)</option>
              <option value="standard">Standard (≤25)</option>
              <option value="large">Large (≤50)</option>
            </select>
          </label>
          <label>Photo count<input type="number" min={1} max={200} value={photoCount} onChange={(e) => setPhotoCount(Number(e.target.value))} /></label>
          <button disabled={busy} type="submit">{busy ? '…' : 'Create draft & continue'}</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <p>Drag in originals. Each upload goes straight to Vercel Blob.</p>
          <input type="file" multiple accept="image/jpeg,image/png,image/heic,image/webp" onChange={(e) => onUpload(e.target.files)} disabled={busy} />
          <ul>
            {photos.map((p, i) => <li key={i}>{p.filename}</li>)}
          </ul>
          <button onClick={() => setStep(3)} disabled={busy || photos.length === 0}>Next: tag photos</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p>Pick a service for each photo. Style only matters for staging services.</p>
          <table>
            <thead><tr><th>File</th><th>Service</th><th>Style</th></tr></thead>
            <tbody>
              {photos.map((p, i) => (
                <tr key={i}>
                  <td>{p.filename}</td>
                  <td>
                    <select value={p.service} onChange={(e) => updatePhoto(i, { service: e.target.value as Service })}>
                      {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={p.style ?? ''} onChange={(e) => updatePhoto(i, { style: e.target.value || undefined })}>
                      <option value="">—</option>
                      {stylePresets.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setStep(4)}>Next: review</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>Review</h2>
          <p><strong>{address}</strong> — {contactEmail} — {tier} — {photos.length} photos</p>
          <button onClick={onSubmit} disabled={busy}>{busy ? 'Submitting…' : 'Submit & queue'}</button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add app/admin/editor/new/
git commit -m "feat(phase-3): intake stepper UI (details → upload → tag → submit)"
```

---

### Task 10: Property detail page

**Files:**
- Create: `app/admin/editor/[id]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/admin/editor/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors, properties, photos } from '@/lib/db';

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');
  const editor = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!editor) redirect('/admin');

  const property = await db.query.properties.findFirst({ where: eq(properties.id, id) });
  if (!property) notFound();

  const rows = await db.select().from(photos).where(eq(photos.propertyId, id));

  return (
    <section>
      <h1>{property.address}</h1>
      <p>Status: <strong>{property.status}</strong> · Tier {property.tier} · {rows.length} photos</p>
      <p>Contact: {property.contactEmail}</p>
      {property.status === 'queued' && <p>Queued for the AI pipeline (Phase 4 picks this up).</p>}
      <table>
        <thead><tr><th>File</th><th>Service</th><th>Style</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{p.filename}</td>
              <td>{p.service}</td>
              <td>{p.style ?? '—'}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/editor/[id]/page.tsx
git commit -m "feat(phase-3): property detail confirmation page"
```

---

### Task 11: Playwright E2E

**Files:**
- Create: `tests/intake.spec.ts`

- [ ] **Step 1: Write test**

```ts
// tests/intake.spec.ts
import { test, expect } from '@playwright/test';

test.describe('@requires-auth editor intake', () => {
  test.skip(!process.env.E2E_EDITOR_SESSION_COOKIE, 'set E2E_EDITOR_SESSION_COOKIE to run');

  test('admin can reach intake list', async ({ page, context }) => {
    await context.addCookies([{
      name: '__session',
      value: process.env.E2E_EDITOR_SESSION_COOKIE!,
      domain: new URL(process.env.E2E_BASE_URL || 'http://localhost:3000').hostname,
      path: '/',
    }]);
    await page.goto((process.env.E2E_BASE_URL || 'http://localhost:3000') + '/admin/editor');
    await expect(page.getByRole('heading', { name: 'Editor intake' })).toBeVisible();
    await expect(page.getByRole('link', { name: '+ New property' })).toBeVisible();
  });
});

test('unauthenticated user is redirected from intake', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
  const resp = await page.goto(base + '/admin/editor');
  expect(resp?.status()).toBeLessThan(500);
  await expect(page).toHaveURL(/sign-in/);
});
```

- [ ] **Step 2: Run against local dev**

```bash
npm run dev   # in another shell
npx playwright test tests/intake.spec.ts
```

Expected: redirect test passes; authed test skipped without env.

- [ ] **Step 3: Commit**

```bash
git add tests/intake.spec.ts
git commit -m "test(phase-3): playwright redirect + authed intake list"
```

---

### Task 12: Manual verification checklist

- [ ] Sign in at `/admin/sign-in` as a seeded editor.
- [ ] Click `Editor intake →` from `/admin`.
- [ ] Click `+ New property`.
- [ ] Step 1: enter address, email, tier=standard, photo count=2 → continue.
- [ ] Step 2: upload 2 small JPEGs. Confirm filenames appear.
- [ ] Step 3: pick service per photo + style for staging rows. Continue.
- [ ] Step 4: submit. Confirm redirect to `/admin/editor/<id>` and status reads `queued`.
- [ ] Reload `/admin/editor` — new row visible with status `queued`.
- [ ] In Vercel dashboard → Storage → Blob, confirm 2 uploaded objects exist.
- [ ] In Neon, `select status, photo_count from properties order by created_at desc limit 1;` returns `queued`.

---

### Task 13: Deploy + protection check

- [ ] **Step 1: Push to main, watch Vercel deploy**

```bash
git push origin main
```

- [ ] **Step 2: Disable Vercel protection if it re-enabled**

Per global feedback: confirm SSO + password protection is off on the production deployment via API.

- [ ] **Step 3: Re-run manual checklist on `https://wonvision.com.au/admin/editor`.**

- [ ] **Step 4: Update master roadmap**

Edit `docs/superpowers/plans/2026-05-07-won-vision-photo-editor-roadmap.md`: mark Phase 3 ✅ SHIPPED with date and result line. Commit + push.

```bash
git add docs/superpowers/plans/2026-05-07-won-vision-photo-editor-roadmap.md
git commit -m "docs: phase 3 shipped"
git push
```

---

## Out of scope (Phase 4+)

- AI processing (fal.ai, Gemini QA) — Phase 4.
- Editor review portal (variant 1 vs 2 approval) — Phase 5.
- Moving blobs to Dropbox `/00 INTAKE/` — Phase 4 first task.
- Public booking flow + Stripe — deferred indefinitely; if reactivated, branch from this Phase 3 codebase.

---

## 2026-05-10 PM revision — structural change

**Two screens, not four.** The 4-step `Stepper.tsx` was replaced with:
- `Intake.tsx` — parent toggling between intake/review modes
- `IntakeForm.tsx` — single page: property details (address + email only, no tier/photo-count) + drop zone + per-photo service chips (appear as photos upload)
- `ReviewScreen.tsx` — summary card + photo list + Edit/Submit buttons

**Multi-service support.** `photos.service` (single `photo_service` enum) replaced with `photos.services text[]`. Migration: `0002_phase3_multi_service.sql` — drops `service` column + `photo_service` enum type, adds `services text[] NOT NULL DEFAULT ARRAY[]::text[]`. Applied 2026-05-10.

**Schema change:** `photoServiceEnum` export and `service` column removed from `lib/db/schema.ts`. Server action `attachPhoto` now accepts `services: z.array(z.enum(['declutter','stage','dusk']))`.

**UX:** Service chips are pill toggles (Klein Blue active, grey outline inactive). Style select appears only when 'stage' is in the services array. "Continue to review" button disabled until address + email + ≥1 photo with ≥1 service.
