# Won Vision Phase 4 — Durable AI Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire a durable AI processing pipeline that picks up properties with `status='queued'`, copies originals to Dropbox, runs each photo through the chained service pipeline on fal.ai (Seedream + Nano Banana Pro at 4K), QAs every variant with Gemini 2.5 Pro, and deposits final pairs in `/02 EDITOR REVIEW/` for Phase 5 to review.

**Architecture:** Vercel Workflow DevKit orchestrates the pipeline as a durable function. Two entry points: (a) direct invocation from `submitProperty` server action when a property goes to `queued`, (b) a `/5min` cron backstop catching any missed rows. Inside the workflow, each photo runs as an independent step (parallel batches of 3 per property) chaining declutter → stage → dusk in fixed order, with intermediate steps producing 1 output and the final step producing 2 variants. Gemini QA gates every variant at ≥7/10 with one auto-retry; failures set `photos.status='rejected'` for human override in Phase 5.

**Tech Stack:** Next.js 16 App Router · Vercel Workflow DevKit (`@vercel/workflow`) · Drizzle ORM · Neon Postgres · fal.ai (`@fal-ai/client`) — Seedream 4.5 + Nano Banana Pro · Google Generative AI (`@google/genai`) — Gemini 2.5 Pro multimodal · Dropbox HTTP API · Vercel Cron · Vercel Blob (read side).

---

## Locked Decisions (2026-05-11)

1. **Chain order is fixed:** declutter → stage → dusk. Intermediate steps produce 1 output; the **final** service in the chain produces 2 variants (variant1, variant2) for human comparison.
2. **Trigger = direct invocation + cron backstop.** `submitProperty` fires the workflow synchronously (fire-and-forget); a Vercel Cron at `*/5 * * * *` sweeps `queued` properties that have no `workflowRunId` set.
3. **QA gate = ≥7/10.** Each variant gets one Gemini QA call. On fail, retry the fal.ai generation once. On second fail, `photos.status='rejected'`. On pass, `photos.status='review'`.
4. **Concurrency = 3 photos in parallel per property.** Batches of 3 prevent fal.ai rate-limit spikes while staying fast.
5. **Dropbox is Won-Vision-only.** Dedicated Dropbox app + refresh token, scoped to this project's env. No reuse from outbound-ops.
6. **Style presets feed the stage prompt only.** Declutter and dusk don't read style. If a photo selects `stage` without a style, default to `modern`.
7. **All AI generations are 4K native.** No upscaling step. If a model returns <4096px long-edge, treat as a generation failure and retry.

---

## File Structure

**Create:**
- `lib/dropbox/client.ts` — auth (refresh-token flow), upload, move, download, ensure-folder
- `lib/dropbox/paths.ts` — slugify(address), buildIntakePath, buildProcessingPath, buildReviewPath
- `lib/fal/client.ts` — thin wrapper around `@fal-ai/client` with model routing
- `lib/fal/prompts.ts` — per-service prompt builders + style prompt fragments
- `lib/gemini/qa.ts` — multimodal QA call returning `{ score, pass, issues }`
- `lib/workflow/process-property.ts` — orchestrator workflow
- `lib/workflow/process-photo.ts` — per-photo chain workflow step
- `lib/workflow/helpers.ts` — chain-ordering + batch helpers
- `app/api/workflow/trigger/route.ts` — POST invoked by `submitProperty`
- `app/api/cron/queue-backstop/route.ts` — GET invoked by Vercel Cron
- `tests/workflow-helpers.test.ts` — unit tests for chain ordering + batching
- `tests/fal-prompts.test.ts` — unit tests for prompt construction
- `tests/dropbox-paths.test.ts` — unit tests for path helpers

**Modify:**
- `lib/db/schema.ts` — add `properties.workflowRunId`, `properties.processingError`, `photos.qaAttempts`
- `lib/intake/actions.ts` — `submitProperty` POSTs to `/api/workflow/trigger` after the status flip
- `app/admin/editor/[id]/page.tsx` — render per-photo pipeline progress + QA scores
- `vercel.json` — add cron schedule (or `vercel.ts` if you prefer; this plan uses `vercel.json` since it already exists)
- `package.json` — add `@vercel/workflow`, `@fal-ai/client`, `@google/genai`, `dropbox`
- `.env.example` — document FAL_API_KEY, GEMINI_API_KEY, DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN

---

### Task 1: Register Dropbox app + capture refresh token (manual + script)

**Files:**
- Create: `scripts/dropbox-bootstrap.ts`

- [ ] **Step 1: User-facing manual setup** (write these instructions to `docs/dropbox-setup.md` for future reference)

```
1. Open https://www.dropbox.com/developers/apps
2. Click "Create app"
   - API: "Scoped access"
   - Access type: "Full Dropbox" (Won Vision uses a dedicated team account)
   - Name: "Won Vision Pipeline"
3. On the app's Settings tab:
   - Add to Permissions tab: files.content.write, files.content.read, files.metadata.read, files.metadata.write
   - Submit. Then return to Settings.
4. Note "App key" and "App secret" — these go in Vercel env as DROPBOX_APP_KEY and DROPBOX_APP_SECRET.
5. Run `npm run dropbox:bootstrap` locally — opens an auth URL, asks for the auth code, exchanges for an offline refresh token, prints it.
6. Copy the refresh token into Vercel env as DROPBOX_REFRESH_TOKEN.
7. Confirm by running `npm run dropbox:bootstrap -- --verify` which lists `/Virtual Editing/` to prove the token works.
```

- [ ] **Step 2: Implement `scripts/dropbox-bootstrap.ts`**

```ts
// scripts/dropbox-bootstrap.ts
import 'dotenv/config';
import readline from 'node:readline/promises';

const KEY = process.env.DROPBOX_APP_KEY!;
const SECRET = process.env.DROPBOX_APP_SECRET!;
if (!KEY || !SECRET) throw new Error('Set DROPBOX_APP_KEY + DROPBOX_APP_SECRET in .env.local first.');

const VERIFY = process.argv.includes('--verify');

async function exchangeAuthCode(code: string) {
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: KEY,
    client_secret: SECRET,
  });
  const res = await fetch('https://api.dropbox.com/oauth2/token', { method: 'POST', body });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; refresh_token: string }>;
}

async function refreshAccessToken(refresh: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: KEY,
    client_secret: SECRET,
  });
  const res = await fetch('https://api.dropbox.com/oauth2/token', { method: 'POST', body });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ access_token: string }>;
}

if (VERIFY) {
  const refresh = process.env.DROPBOX_REFRESH_TOKEN;
  if (!refresh) throw new Error('Set DROPBOX_REFRESH_TOKEN to verify.');
  const { access_token } = await refreshAccessToken(refresh);
  const list = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: '' }),
  });
  console.log('list_folder status:', list.status);
  console.log(await list.text());
  process.exit(list.ok ? 0 : 1);
}

const authUrl =
  `https://www.dropbox.com/oauth2/authorize?client_id=${KEY}` +
  `&token_access_type=offline&response_type=code`;
console.log('Open this URL, sign in to the Won Vision Dropbox, click Allow, then paste the code shown:\n', authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const code = (await rl.question('Auth code: ')).trim();
rl.close();

const tok = await exchangeAuthCode(code);
console.log('\nSave these to Vercel env (all three environments):');
console.log('DROPBOX_REFRESH_TOKEN =', tok.refresh_token);
```

- [ ] **Step 3: Add npm script + commit**

Edit `package.json` scripts:

```json
"dropbox:bootstrap": "dotenv -e .env.local -- tsx scripts/dropbox-bootstrap.ts"
```

- [ ] **Step 4: User executes** the manual setup, runs `npm run dropbox:bootstrap`, captures the refresh token, adds the three vars to Vercel env. Then runs `npm run dropbox:bootstrap -- --verify` and confirms a 200 + listed folders.

- [ ] **Step 5: Commit**

```bash
git add scripts/dropbox-bootstrap.ts docs/dropbox-setup.md package.json
git commit -m "feat(phase-4): dropbox app bootstrap script + setup docs"
```

---

### Task 2: Install pipeline dependencies + env

**Files:**
- Modify: `package.json`, `.env.example`

- [ ] **Step 1: Install**

```bash
npm install @vercel/workflow @fal-ai/client @google/genai
```

(`dropbox` SDK NOT installed — we hit the HTTP API directly to keep the function lean.)

- [ ] **Step 2: Document env**

Append to `.env.example`:

```
# fal.ai — image generation (Seedream + Nano Banana Pro)
FAL_API_KEY=

# Google Generative AI — Gemini 2.5 Pro multimodal QA
GEMINI_API_KEY=

# Dropbox app credentials — see docs/dropbox-setup.md
DROPBOX_APP_KEY=
DROPBOX_APP_SECRET=
DROPBOX_REFRESH_TOKEN=

# Cron auth — Vercel Cron sends this header on invocations
CRON_SECRET=
```

- [ ] **Step 3: User adds the four secrets to Vercel env (Production + Preview + Development).** Generate `CRON_SECRET` as a random 32-char string.

- [ ] **Step 4: Pull env locally**

```bash
vercel env pull .env.local
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore(phase-4): pipeline deps + env scaffolding"
```

---

### Task 3: Schema additions

**Files:**
- Modify: `lib/db/schema.ts`
- Create: `lib/db/migrations/0003_phase4_workflow.sql` (drizzle-generated)

- [ ] **Step 1: Patch schema.ts**

Add to `properties`:

```ts
workflowRunId: text('workflow_run_id'),
processingError: text('processing_error'),
processingStartedAt: timestamp('processing_started_at', { withTimezone: true }),
```

Add to `photos`:

```ts
qaAttempts: integer('qa_attempts').notNull().default(0),
```

Also update `photoStatusEnum` to add `'queued'` between `'pending'` and `'processing'` (so the orchestrator can mark photos `queued` before workers pick them up).

- [ ] **Step 2: Generate + inspect + apply**

```bash
npx drizzle-kit generate --name phase4_workflow
npx dotenv -e .env.local -- npx drizzle-kit migrate
```

Confirm output ends `✓ migrations applied successfully!`.

- [ ] **Step 3: Commit**

```bash
git add lib/db/schema.ts lib/db/migrations/
git commit -m "feat(phase-4): schema for workflow run tracking + QA attempts"
```

---

### Task 4: Dropbox path helpers

**Files:**
- Create: `lib/dropbox/paths.ts`
- Test: `tests/dropbox-paths.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/dropbox-paths.test.ts
import { describe, it, expect } from 'vitest';
import { slugifyAddress, buildIntakePath, buildProcessingPath, buildReviewPath } from '@/lib/dropbox/paths';

describe('dropbox paths', () => {
  it('slugifies AU addresses into folder-safe names', () => {
    expect(slugifyAddress('4/12 Smith St, Brunswick VIC 3056')).toBe('4-12-smith-st-brunswick-vic-3056');
    expect(slugifyAddress('Unit 3, 88 King Rd')).toBe('unit-3-88-king-rd');
  });

  it('builds intake/processing/review paths', () => {
    const addr = '12 Smith St';
    expect(buildIntakePath(addr)).toBe('/Virtual Editing/00 INTAKE/12-smith-st');
    expect(buildProcessingPath(addr)).toBe('/Virtual Editing/01 AI PROCESSING/12-smith-st');
    expect(buildReviewPath(addr)).toBe('/Virtual Editing/02 EDITOR REVIEW/12-smith-st');
  });
});
```

- [ ] **Step 2: Run — expect fail (module missing)**

```bash
npm test -- tests/dropbox-paths.test.ts
```

- [ ] **Step 3: Implement**

```ts
// lib/dropbox/paths.ts
const ROOT = '/Virtual Editing';

export function slugifyAddress(address: string): string {
  return address
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildIntakePath(address: string) {
  return `${ROOT}/00 INTAKE/${slugifyAddress(address)}`;
}
export function buildProcessingPath(address: string) {
  return `${ROOT}/01 AI PROCESSING/${slugifyAddress(address)}`;
}
export function buildReviewPath(address: string) {
  return `${ROOT}/02 EDITOR REVIEW/${slugifyAddress(address)}`;
}
```

- [ ] **Step 4: Run — expect pass + commit**

```bash
npm test -- tests/dropbox-paths.test.ts
git add lib/dropbox/paths.ts tests/dropbox-paths.test.ts
git commit -m "feat(phase-4): dropbox path helpers"
```

---

### Task 5: Dropbox client wrapper

**Files:**
- Create: `lib/dropbox/client.ts`

- [ ] **Step 1: Implement**

```ts
// lib/dropbox/client.ts
// Minimal HTTP client around Dropbox API v2. Refresh-token flow.
// Access tokens are cached in-process for their TTL (default 4h).

let cached: { access: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.access;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: process.env.DROPBOX_REFRESH_TOKEN!,
    client_id: process.env.DROPBOX_APP_KEY!,
    client_secret: process.env.DROPBOX_APP_SECRET!,
  });
  const res = await fetch('https://api.dropbox.com/oauth2/token', { method: 'POST', body });
  if (!res.ok) throw new Error(`Dropbox refresh failed: ${res.status} ${await res.text()}`);
  const json = await res.json() as { access_token: string; expires_in: number };

  cached = { access: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cached.access;
}

async function rpc<T>(endpoint: string, body: unknown): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`https://api.dropboxapi.com/2/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Dropbox ${endpoint} failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function ensureFolder(path: string): Promise<void> {
  try {
    await rpc('files/create_folder_v2', { path, autorename: false });
  } catch (err) {
    // 409 = already exists, which is fine
    if (err instanceof Error && /path.*conflict/i.test(err.message)) return;
    throw err;
  }
}

export async function uploadFromUrl(url: string, dropboxPath: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Source fetch failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const token = await getAccessToken();
  const upload = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: dropboxPath, mode: 'overwrite', autorename: false, mute: true,
      }),
    },
    body: new Uint8Array(buf),
  });
  if (!upload.ok) throw new Error(`Dropbox upload failed: ${upload.status} ${await upload.text()}`);
  const meta = await upload.json() as { path_display: string };
  return meta.path_display;
}

export async function move(fromPath: string, toPath: string): Promise<void> {
  await rpc('files/move_v2', { from_path: fromPath, to_path: toPath, autorename: false });
}

export async function getTemporaryLink(path: string): Promise<string> {
  const json = await rpc<{ link: string }>('files/get_temporary_link', { path });
  return json.link;
}
```

- [ ] **Step 2: Smoke test** (after env vars set in `.env.local`):

```bash
npx dotenv -e .env.local -- tsx -e "import('./lib/dropbox/client.ts').then(async ({ensureFolder}) => { await ensureFolder('/Virtual Editing/test-' + Date.now()); console.log('ok'); })"
```

Expected: `ok`. Then check Dropbox web UI — folder should exist.

- [ ] **Step 3: Commit**

```bash
git add lib/dropbox/client.ts
git commit -m "feat(phase-4): dropbox http client with refresh-token auth"
```

---

### Task 6: fal.ai prompt library

**Files:**
- Create: `lib/fal/prompts.ts`
- Test: `tests/fal-prompts.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/fal-prompts.test.ts
import { describe, it, expect } from 'vitest';
import { buildPrompt } from '@/lib/fal/prompts';

describe('buildPrompt', () => {
  it('declutter prompt does not include style', () => {
    const p = buildPrompt('declutter');
    expect(p).toMatch(/remove all personal items/i);
    expect(p).not.toMatch(/scandinavian|coastal|mid-century/i);
  });

  it('stage prompt embeds the style fragment', () => {
    const p = buildPrompt('stage', 'scandinavian');
    expect(p).toMatch(/scandinavian/i);
    expect(p).toMatch(/photorealistic/i);
  });

  it('stage prompt defaults to modern when no style given', () => {
    const p = buildPrompt('stage');
    expect(p).toMatch(/modern/i);
  });

  it('dusk prompt converts day to twilight', () => {
    const p = buildPrompt('dusk');
    expect(p).toMatch(/twilight|dusk/i);
  });
});
```

- [ ] **Step 2: Run — expect fail. Then implement.**

```ts
// lib/fal/prompts.ts
import type { ServiceId } from '@/app/admin/editor/new/Intake';

const STYLE_FRAGMENTS: Record<string, string> = {
  modern: 'clean lines, neutral palette, minimal clutter, contemporary furniture, soft natural light',
  scandinavian: 'warm pale wood, soft whites and beige tones, cozy textures, hygge accents, sheer natural light',
  coastal: 'light blues and sandy tones, breezy linen textiles, weathered wood, airy bright daylight',
  'mid-century': 'walnut and tan leather, geometric accents, brass details, warm tungsten light',
};

const BASE_REALISM =
  'Photorealistic real-estate interior photograph. Preserve original architecture, windows, fixtures, ' +
  'flooring, ceiling, and wall geometry exactly. Maintain perspective and lens. No warped lines, ' +
  'no extra rooms, no surreal elements. Output at 4096px long edge.';

export function buildPrompt(service: ServiceId, style?: string): string {
  if (service === 'declutter') {
    return `${BASE_REALISM} Remove all personal items, clutter, excess furniture, photographs, ` +
      `magazines, cables, and visual noise. Leave the room empty of decor while preserving large ` +
      `built-in fixtures (kitchen cabinetry, fireplaces, built-in shelving). Keep natural lighting.`;
  }
  if (service === 'stage') {
    const styleKey = style && STYLE_FRAGMENTS[style] ? style : 'modern';
    return `${BASE_REALISM} Add tasteful furniture and decor in ${styleKey} style: ${STYLE_FRAGMENTS[styleKey]}. ` +
      `Furniture must sit correctly on the floor with realistic shadows. Do not alter walls, windows, or fixtures.`;
  }
  // dusk
  return `${BASE_REALISM} Convert the lighting from daytime to dusk/twilight. Sky transitions to warm ` +
    `sunset orange and deepening blue. Interior artificial lights warm and on, visible through windows. ` +
    `Subtle warm ambient glow on the building exterior. Preserve all architecture and composition.`;
}
```

- [ ] **Step 3: Run — expect pass + commit**

```bash
npm test -- tests/fal-prompts.test.ts
git add lib/fal/prompts.ts tests/fal-prompts.test.ts
git commit -m "feat(phase-4): fal.ai per-service prompt library"
```

---

### Task 7: fal.ai client wrapper

**Files:**
- Create: `lib/fal/client.ts`

- [ ] **Step 1: Implement**

```ts
// lib/fal/client.ts
import { fal } from '@fal-ai/client';
import type { ServiceId } from '@/app/admin/editor/new/Intake';
import { buildPrompt } from './prompts';

fal.config({ credentials: process.env.FAL_API_KEY });

// Model routing per service.
// Declutter uses Seedream 4.5 (best at clean removals).
// Stage + dusk use Nano Banana Pro (best at additive realism + lighting).
const MODEL: Record<ServiceId, string> = {
  declutter: 'fal-ai/bytedance/seedream/v4.5/edit',
  stage: 'fal-ai/nano-banana/pro/edit',
  dusk: 'fal-ai/nano-banana/pro/edit',
};

export type GenerateResult = { url: string; width: number; height: number };

export async function generate(opts: {
  service: ServiceId;
  style?: string;
  inputImageUrl: string;
  numOutputs: 1 | 2;
}): Promise<GenerateResult[]> {
  const prompt = buildPrompt(opts.service, opts.style);
  const result = await fal.subscribe(MODEL[opts.service], {
    input: {
      prompt,
      image_url: opts.inputImageUrl,
      num_images: opts.numOutputs,
      image_size: { width: 4096, height: 4096 }, // 4K native; model crops to source aspect
      output_format: 'jpeg',
    },
    logs: false,
  });

  const images = (result.data as { images: { url: string; width: number; height: number }[] }).images;
  if (!images || images.length === 0) throw new Error(`fal.ai returned no images for service=${opts.service}`);

  // Enforce 4K floor — any output <4096 long edge is a generation failure.
  for (const img of images) {
    const longEdge = Math.max(img.width, img.height);
    if (longEdge < 4000) throw new Error(`fal.ai output below 4K floor (${longEdge}px) for service=${opts.service}`);
  }

  return images.map((img) => ({ url: img.url, width: img.width, height: img.height }));
}
```

- [ ] **Step 2: Smoke test** (only if `FAL_API_KEY` is set locally):

```bash
npx dotenv -e .env.local -- tsx -e "
import('./lib/fal/client.ts').then(async ({generate}) => {
  const r = await generate({
    service: 'stage',
    style: 'modern',
    inputImageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=2048',
    numOutputs: 1,
  });
  console.log(r);
})"
```

Expected: array of 1 with a 4K+ image URL. Visit the URL — should look staged.

- [ ] **Step 3: Commit**

```bash
git add lib/fal/client.ts
git commit -m "feat(phase-4): fal.ai client with seedream/nano-banana routing + 4K floor"
```

---

### Task 8: Gemini QA wrapper

**Files:**
- Create: `lib/gemini/qa.ts`

- [ ] **Step 1: Implement**

```ts
// lib/gemini/qa.ts
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type QaResult = {
  score: number;          // 0-10
  pass: boolean;          // true if score >= 7
  issues: string[];       // short bullet list, empty if pass
};

const PROMPT = `You are a senior real-estate photo editor. Compare the ORIGINAL real-estate photo to the EDITED version and rate the edit's quality on a 0-10 scale.

Score on:
1. Photorealism — no warped lines, no impossible geometry, no surreal elements (heaviest weight)
2. Architectural preservation — windows, walls, fixtures, ceiling, flooring all intact and identical placement
3. Lighting consistency — shadows, highlights, white balance plausible for the scene
4. Edit-task quality — if staging, is furniture tasteful and in-style? If decluttering, is the room genuinely clean? If dusk, is the lighting believable?

Respond ONLY with strict JSON in this shape (no prose, no markdown):
{"score": <number 0-10>, "issues": ["short issue 1", "short issue 2"]}

Empty issues array if score >= 7.`;

export async function qaVariant(originalUrl: string, editedUrl: string): Promise<QaResult> {
  const [origBlob, editBlob] = await Promise.all([
    fetch(originalUrl).then((r) => r.arrayBuffer()),
    fetch(editedUrl).then((r) => r.arrayBuffer()),
  ]);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [{
      role: 'user',
      parts: [
        { text: PROMPT },
        { text: 'ORIGINAL:' },
        { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(origBlob).toString('base64') } },
        { text: 'EDITED:' },
        { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(editBlob).toString('base64') } },
      ],
    }],
  });

  const raw = response.text ?? '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Gemini did not return JSON: ${raw.slice(0, 200)}`);

  const parsed = JSON.parse(match[0]) as { score: number; issues: string[] };
  const score = Math.max(0, Math.min(10, Number(parsed.score) || 0));
  return { score, pass: score >= 7, issues: Array.isArray(parsed.issues) ? parsed.issues : [] };
}
```

- [ ] **Step 2: Commit** (no smoke test — costs $$ per call, will be exercised by Task 11).

```bash
git add lib/gemini/qa.ts
git commit -m "feat(phase-4): gemini 2.5 pro multimodal QA wrapper"
```

---

### Task 9: Workflow helpers (chain order + batching)

**Files:**
- Create: `lib/workflow/helpers.ts`
- Test: `tests/workflow-helpers.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/workflow-helpers.test.ts
import { describe, it, expect } from 'vitest';
import { orderServices, batch } from '@/lib/workflow/helpers';

describe('orderServices', () => {
  it('returns declutter → stage → dusk regardless of input order', () => {
    expect(orderServices(['dusk', 'declutter', 'stage'])).toEqual(['declutter', 'stage', 'dusk']);
    expect(orderServices(['stage', 'declutter'])).toEqual(['declutter', 'stage']);
    expect(orderServices(['dusk'])).toEqual(['dusk']);
  });

  it('drops unknown services', () => {
    expect(orderServices(['stage', 'unknown' as any, 'declutter'])).toEqual(['declutter', 'stage']);
  });
});

describe('batch', () => {
  it('splits an array into chunks of given size', () => {
    expect(batch([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    expect(batch([], 3)).toEqual([]);
  });
});
```

- [ ] **Step 2: Implement**

```ts
// lib/workflow/helpers.ts
import type { ServiceId } from '@/app/admin/editor/new/Intake';

const CANONICAL_ORDER: ServiceId[] = ['declutter', 'stage', 'dusk'];

export function orderServices(services: string[]): ServiceId[] {
  return CANONICAL_ORDER.filter((s) => services.includes(s));
}

export function batch<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
```

- [ ] **Step 3: Run + commit**

```bash
npm test -- tests/workflow-helpers.test.ts
git add lib/workflow/helpers.ts tests/workflow-helpers.test.ts
git commit -m "feat(phase-4): workflow helpers (service ordering + batching)"
```

---

### Task 10: Per-photo workflow step

**Files:**
- Create: `lib/workflow/process-photo.ts`

- [ ] **Step 1: Implement**

```ts
// lib/workflow/process-photo.ts
import { step } from '@vercel/workflow';
import { eq } from 'drizzle-orm';
import { db, photos } from '@/lib/db';
import { generate } from '@/lib/fal/client';
import { qaVariant } from '@/lib/gemini/qa';
import { uploadFromUrl, move, getTemporaryLink } from '@/lib/dropbox/client';
import { buildProcessingPath, buildReviewPath } from '@/lib/dropbox/paths';
import { orderServices } from './helpers';
import type { ServiceId } from '@/app/admin/editor/new/Intake';

const MAX_QA_ATTEMPTS = 2; // initial + 1 retry

export async function processPhoto(args: {
  photoId: string;
  address: string;
  originalBlobUrl: string;
  filename: string;
  services: string[];
  style?: string;
}): Promise<void> {
  const chain = orderServices(args.services);
  if (chain.length === 0) {
    await db.update(photos).set({ status: 'approved' }).where(eq(photos.id, args.photoId));
    return;
  }

  await db.update(photos).set({ status: 'processing' }).where(eq(photos.id, args.photoId));

  // Step 1: intake — copy original to /00 INTAKE (already handled by orchestrator), then run the chain.
  let currentUrl = args.originalBlobUrl;

  // For all but the last service: generate 1 intermediate output, save to processing folder.
  for (let i = 0; i < chain.length - 1; i++) {
    const service = chain[i];
    const out = await step(`generate-${service}-${args.photoId}`, () =>
      generate({ service, style: args.style, inputImageUrl: currentUrl, numOutputs: 1 })
    );
    const dropboxPath = `${buildProcessingPath(args.address)}/${args.photoId}_${service}_intermediate.jpg`;
    await step(`upload-intermediate-${service}-${args.photoId}`, () =>
      uploadFromUrl(out[0].url, dropboxPath)
    );
    currentUrl = await step(`tmp-link-${service}-${args.photoId}`, () => getTemporaryLink(dropboxPath));
  }

  // Final service: generate 2 variants, QA each, retry once on fail, move passing to review.
  const finalService = chain[chain.length - 1] as ServiceId;

  for (const variantIdx of [1, 2] as const) {
    let attempt = 0;
    let variantUrl: string | null = null;
    let qaScore = 0;
    let qaIssues: string[] = [];
    let qaPass = false;

    while (attempt < MAX_QA_ATTEMPTS && !qaPass) {
      attempt++;
      const out = await step(`generate-final-v${variantIdx}-att${attempt}-${args.photoId}`, () =>
        generate({ service: finalService, style: args.style, inputImageUrl: currentUrl, numOutputs: 1 })
      );
      const tmpProcessingPath = `${buildProcessingPath(args.address)}/${args.photoId}_v${variantIdx}_att${attempt}.jpg`;
      await step(`upload-final-v${variantIdx}-att${attempt}-${args.photoId}`, () =>
        uploadFromUrl(out[0].url, tmpProcessingPath)
      );
      const editedTmp = await step(`tmp-final-v${variantIdx}-att${attempt}-${args.photoId}`, () =>
        getTemporaryLink(tmpProcessingPath)
      );

      const qa = await step(`qa-v${variantIdx}-att${attempt}-${args.photoId}`, () =>
        qaVariant(args.originalBlobUrl, editedTmp)
      );
      qaScore = qa.score; qaIssues = qa.issues; qaPass = qa.pass;
      variantUrl = tmpProcessingPath;

      await db.update(photos).set({ qaAttempts: attempt }).where(eq(photos.id, args.photoId));
    }

    if (qaPass && variantUrl) {
      const reviewPath = `${buildReviewPath(args.address)}/${args.photoId}_v${variantIdx}.jpg`;
      await step(`promote-v${variantIdx}-${args.photoId}`, () => move(variantUrl!, reviewPath));

      const set: Partial<typeof photos.$inferInsert> = variantIdx === 1
        ? { variant1Path: reviewPath, qaScore, qaIssues: qaIssues as any, qaPass: true }
        : { variant2Path: reviewPath, qaScore, qaIssues: qaIssues as any, qaPass: true };
      await db.update(photos).set(set).where(eq(photos.id, args.photoId));
    } else {
      // Both attempts failed — record the latest score+issues but don't promote.
      await db.update(photos).set({
        qaScore, qaIssues: qaIssues as any, qaPass: false,
      }).where(eq(photos.id, args.photoId));
    }
  }

  // Final photo status: review if at least one variant passed, otherwise rejected.
  const refreshed = await db.query.photos.findFirst({ where: eq(photos.id, args.photoId) });
  const anyPassed = !!(refreshed?.variant1Path || refreshed?.variant2Path);
  await db.update(photos).set({ status: anyPassed ? 'review' : 'rejected' }).where(eq(photos.id, args.photoId));
}
```

- [ ] **Step 2: Commit** (no test — exercised in Task 13 manual run).

```bash
git add lib/workflow/process-photo.ts
git commit -m "feat(phase-4): per-photo chain workflow with QA + retry"
```

---

### Task 11: Property orchestrator workflow

**Files:**
- Create: `lib/workflow/process-property.ts`

- [ ] **Step 1: Implement**

```ts
// lib/workflow/process-property.ts
import { defineWorkflow, step } from '@vercel/workflow';
import { eq } from 'drizzle-orm';
import { db, properties, photos } from '@/lib/db';
import { ensureFolder, uploadFromUrl } from '@/lib/dropbox/client';
import { buildIntakePath, buildProcessingPath, buildReviewPath } from '@/lib/dropbox/paths';
import { batch } from './helpers';
import { processPhoto } from './process-photo';

const BATCH_SIZE = 3;

export const processProperty = defineWorkflow(async ({ propertyId }: { propertyId: string }) => {
  const property = await db.query.properties.findFirst({ where: eq(properties.id, propertyId) });
  if (!property) throw new Error(`Property ${propertyId} not found`);
  if (property.status !== 'queued') return; // idempotent: already in flight or done

  await db.update(properties).set({
    status: 'processing',
    processingStartedAt: new Date(),
  }).where(eq(properties.id, propertyId));

  await step('ensure-folders', async () => {
    await ensureFolder(buildIntakePath(property.address));
    await ensureFolder(buildProcessingPath(property.address));
    await ensureFolder(buildReviewPath(property.address));
  });

  const photoRows = await db.select().from(photos).where(eq(photos.propertyId, propertyId));

  // Copy every original to /00 INTAKE/, record dropbox path on the row.
  for (const p of photoRows) {
    if (!p.originalBlobUrl) continue;
    const target = `${buildIntakePath(property.address)}/${p.id}_${p.filename}`;
    await step(`intake-${p.id}`, async () => {
      const path = await uploadFromUrl(p.originalBlobUrl!, target);
      await db.update(photos).set({ originalDropboxPath: path, status: 'queued' }).where(eq(photos.id, p.id));
    });
  }

  // Process in parallel batches of 3.
  for (const group of batch(photoRows, BATCH_SIZE)) {
    await Promise.all(group.map((p) => processPhoto({
      photoId: p.id,
      address: property.address,
      originalBlobUrl: p.originalBlobUrl!,
      filename: p.filename,
      services: p.services,
      style: p.style ?? undefined,
    })));
  }

  // Property status flips to 'review' when every photo is at review/rejected/approved.
  await db.update(properties).set({ status: 'review' }).where(eq(properties.id, propertyId));
});
```

- [ ] **Step 2: Commit**

```bash
git add lib/workflow/process-property.ts
git commit -m "feat(phase-4): property orchestrator workflow"
```

---

### Task 12: Trigger route + wire into submitProperty

**Files:**
- Create: `app/api/workflow/trigger/route.ts`
- Modify: `lib/intake/actions.ts`

- [ ] **Step 1: Trigger route**

```ts
// app/api/workflow/trigger/route.ts
import { NextResponse } from 'next/server';
import { processProperty } from '@/lib/workflow/process-property';

export async function POST(req: Request) {
  const { propertyId, secret } = await req.json() as { propertyId: string; secret: string };
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Fire-and-forget. Vercel Workflow returns a run handle synchronously and runs durably.
  const run = await processProperty.trigger({ propertyId });
  return NextResponse.json({ ok: true, runId: run.id });
}
```

- [ ] **Step 2: Wire into submitProperty**

Edit `lib/intake/actions.ts` `submitProperty`:

```ts
export async function submitProperty(propertyId: string) {
  await requireEditor();
  z.string().uuid().parse(propertyId);

  await db.update(properties).set({ status: 'queued' }).where(eq(properties.id, propertyId));

  // Fire the workflow — non-blocking. If this fails, cron backstop catches it.
  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  fetch(`${base}/api/workflow/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId, secret: process.env.CRON_SECRET }),
  }).catch((err) => console.error('workflow trigger failed (cron backstop will retry):', err));

  revalidatePath('/admin/editor');
  revalidatePath(`/admin/editor/${propertyId}`);
  return { ok: true as const };
}
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add app/api/workflow/trigger/route.ts lib/intake/actions.ts
git commit -m "feat(phase-4): direct workflow invocation from submitProperty"
```

---

### Task 13: Cron backstop

**Files:**
- Create: `app/api/cron/queue-backstop/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Cron handler**

```ts
// app/api/cron/queue-backstop/route.ts
import { NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db, properties } from '@/lib/db';
import { processProperty } from '@/lib/workflow/process-property';

export async function GET(req: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const stuck = await db.select().from(properties).where(
    and(eq(properties.status, 'queued'), isNull(properties.workflowRunId)),
  ).limit(10);

  const results = [];
  for (const p of stuck) {
    try {
      const run = await processProperty.trigger({ propertyId: p.id });
      await db.update(properties).set({ workflowRunId: run.id }).where(eq(properties.id, p.id));
      results.push({ id: p.id, ok: true, runId: run.id });
    } catch (err) {
      results.push({ id: p.id, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ swept: stuck.length, results });
}
```

- [ ] **Step 2: Cron config in `vercel.json`**

```json
{
  "crons": [
    { "path": "/api/cron/queue-backstop", "schedule": "*/5 * * * *" }
  ]
}
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add app/api/cron/queue-backstop/route.ts vercel.json
git commit -m "feat(phase-4): cron backstop for queued properties"
```

---

### Task 14: Detail page pipeline progress

**Files:**
- Modify: `app/admin/editor/[id]/page.tsx`

- [ ] **Step 1: Enrich the photo table**

Add columns to the rendered table: **QA score**, **Variant 1**, **Variant 2** (link to Dropbox temporary URL or just show path), and a coloured status pill matching B&W brand (filled black for review/approved, outlined for processing/pending/rejected with strikethrough for rejected).

If `property.status === 'processing'`, show an info banner: `Processing — {n}/{total} photos complete` where complete = status in ('review', 'approved', 'rejected').

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add app/admin/editor/[id]/page.tsx
git commit -m "feat(phase-4): detail page shows pipeline progress + QA scores"
```

---

### Task 15: Manual end-to-end verification

- [ ] Confirm all env vars present in Vercel Production (`FAL_API_KEY`, `GEMINI_API_KEY`, `DROPBOX_*`, `CRON_SECRET`).
- [ ] Deploy: `git push origin main` (pushes Tasks 1-14 in one batch if not already pushed). Wait for the deploy to go live.
- [ ] Open `https://wonvision.com.au/admin/editor/new`. Submit a property with **2 small JPEGs**, each tagged with at least one service. Pick declutter on one and stage+dusk on the other to exercise both single-service and chained.
- [ ] Watch `https://wonvision.com.au/admin/editor/<id>` for ~5-10 minutes. Photo statuses should progress: `queued → processing → review` (or `rejected` if QA fails twice).
- [ ] In Dropbox web UI, confirm folder structure:
  ```
  /Virtual Editing/00 INTAKE/<slug>/<photo_id>_<filename>
  /Virtual Editing/01 AI PROCESSING/<slug>/...intermediate + attempt files...
  /Virtual Editing/02 EDITOR REVIEW/<slug>/<photo_id>_v1.jpg, <photo_id>_v2.jpg
  ```
- [ ] In Neon: `select status, qa_score, qa_attempts, variant_1_path, variant_2_path from photos where property_id = '<id>';` — every photo should have v1+v2 paths OR be marked rejected.
- [ ] Visit a variant in Dropbox — it should be ≥4K, photorealistic, matching the service.
- [ ] If anything fails, check Vercel function logs for the workflow run id (`processProperty`) and read the error.

---

### Task 16: Mark Phase 4 shipped

- [ ] Update `docs/superpowers/plans/2026-05-07-won-vision-photo-editor-roadmap.md`: mark Phase 4 ✅ SHIPPED 2026-05-11 with a result summary (N photos processed end-to-end, X% QA pass rate on first attempt, total wall-clock seconds for the test property).
- [ ] Commit + push.

```bash
git add docs/superpowers/plans/2026-05-07-won-vision-photo-editor-roadmap.md
git commit -m "docs: phase 4 shipped"
git push
```

---

## Out of scope (Phase 5)

- Editor review portal (v1 vs v2 side-by-side approval UI) — Phase 5.
- Approval webhook into OUTBOUND Operations — Phase 5.
- Per-property batch download as a ZIP — Phase 5+.
- Custom style prompt overrides — future enhancement.
- Re-running a rejected photo with a different style/service — handled via Phase 5 UI later.
