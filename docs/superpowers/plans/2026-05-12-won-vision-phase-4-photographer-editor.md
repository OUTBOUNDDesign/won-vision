# Won Vision Phase 4 (Redesign) — Photographer Editor Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the deferred AI-pipeline build with a photographer-facing manual editor that uses AI only for the bracket-merge step. Photographer uploads 3 bracketed Sony A7R V RAW files, the backend merges them to a 16-bit HDR base, the photographer adjusts via sliders + presets + one-click AI helpers, then sends the final JPEG to Dropbox + OUTBOUND Operations.

**Architecture:** Next.js 16 App Router front-end with Clerk auth (single photographer role on the existing `editors` table). A new Python serverless function on Vercel Fluid Compute handles the RAW pipeline using `rawpy` + `opencv-python` + `numpy` — load brackets → align → Mertens exposure fusion → 16-bit linear PNG base. A live preview API (`POST /api/raw/preview`) re-renders a 2K JPEG from the 16-bit base on every adjustment change (~300-500ms). The final export endpoint renders full-res 6K JPEG. AI helpers (day-to-dusk, virtual staging, sky replace, lawn, fire, ceiling, declutter, object removal) reuse the existing `lib/fal/*` and `lib/gemini/*` clients but are now invoked **synchronously** from the editor — no more durable workflows, since the photographer is in the loop and re-runs are cheap. Delivery is a server action that writes the final JPEG to Dropbox `/02 EDITOR REVIEW/` and POSTs to the OUTBOUND Operations job webhook.

**Tech Stack:** Next.js 16 App Router · Clerk · Drizzle ORM · Neon Postgres · Vercel Blob (originals + previews) · **Python on Vercel Fluid Compute** (`rawpy`, `opencv-python`, `numpy`, `Pillow`) for RAW + slider rendering · fal.ai (existing client) · Gemini 2.5 Pro (existing client) · Dropbox HTTP client (existing) · OUTBOUND Operations webhook for delivery.

---

## Locked Decisions (2026-05-12)

1. **Workflow:** photographer = single user role; uploads brackets → edits in browser → "Send" delivers to Dropbox + OUTBOUND Ops. No separate editor / reviewer / admin pipeline.
2. **Variations are pre-chosen, never generated in parallel.** For dusk, staging, sky replace: photographer picks the variation/style FIRST → one image is generated → re-run if not happy.
3. **HDR presets:** 6 named tone-mapping starting points — Standard, Natural, Warm, Cool, Bright & Airy, Moody. Each preset = a locked set of exposure + contrast + temp + saturation + highlights + shadows values applied on top of the merged HDR base.
4. **Dusk variations:** 3 — Golden Hour, Blue Hour, Late Twilight.
5. **Virtual staging styles:** 6 — Modern, Scandinavian, Coastal, Mid-Century, Industrial-Loft, Japandi (the four current ones + two new).
6. **Sky variations:** 4 — Clear Blue, Soft Cloudy, Dramatic, Sunset.
7. **RAW engine:** rawpy + OpenCV (Mertens exposure fusion) on Vercel Python runtime. Full-res 6K final export.
8. **Live preview:** 2K JPEG, ~300-500ms response per slider change, debounced 250ms on the client.
9. **Reference image library for the variation pickers is deferred** — the picker UI is built but the thumbnails are placeholder gradients until Kiran provides sample RAW + JPEG bases (interior + exterior).
10. **Old AI workflow code (Phase 4 v1) is deleted.** The fal.ai/Gemini/Dropbox client libraries are kept and reused by the new synchronous helper endpoints.

---

## File Structure

**DELETE (Phase 4 v1 cleanup):**
- `lib/workflow/process-photo.ts`
- `lib/workflow/process-property.ts`
- `lib/workflow/helpers.ts` (the batch/order utilities — moved to v2 path if reused)
- `app/api/workflow/trigger/route.ts`
- `app/api/cron/queue-backstop/route.ts`
- The `crons` entry in `vercel.json` (we don't need a cron anymore)
- The current `app/admin/editor/new/Intake.tsx`, `IntakeForm.tsx`, `ReviewScreen.tsx`, `Stepper.tsx`, `types.ts`, `AddressField.tsx` (intake form gets rebuilt)

**KEEP (reused as building blocks):**
- `lib/fal/client.ts`, `lib/fal/prompts.ts`
- `lib/gemini/qa.ts`
- `lib/dropbox/client.ts`, `lib/dropbox/paths.ts`
- `app/api/admin/blob-token/route.ts`
- `app/api/places/autocomplete/route.ts`, `app/api/places/details/route.ts`
- `lib/styles.ts` (renamed/extended for new 6-style list)

**CREATE — Python backend:**
- `api/raw/merge.py` — Python serverless function: POST { bracketUrls[3] } → returns 16-bit base PNG URL
- `api/raw/preview.py` — POST { hdrBaseUrl, adjustments } → returns 2K preview JPEG URL
- `api/raw/export.py` — POST { hdrBaseUrl, adjustments } → returns full 6K JPEG URL
- `requirements.txt` — rawpy, opencv-python-headless, numpy, Pillow, requests
- `vercel.json` — add `functions` config routing `api/raw/*.py` to Python 3.12 runtime

**CREATE — Adjustments + presets library:**
- `lib/editor/adjustments.ts` — Adjustments TypeScript type + zod schema
- `lib/editor/presets.ts` — 6 HDR presets with locked adjustment values
- `lib/editor/dusk-variations.ts` — 3 dusk variation prompt builders
- `lib/editor/sky-variations.ts` — 4 sky variation prompt builders
- `lib/editor/staging-styles.ts` — 6 staging styles (extends existing `lib/styles.ts`)
- `tests/editor-presets.test.ts`
- `tests/editor-variations.test.ts`

**CREATE — Server actions + API:**
- `lib/shoots/actions.ts` — createShoot, uploadBrackets, mergeBrackets, applyAdjustments, runAiHelper, sendShoot
- `lib/shoots/queries.ts` — listShoots, getShoot, getFrame
- `app/api/editor/helper/route.ts` — POST { frameId, helperType, variationId } → runs fal.ai helper, returns new preview URL
- `app/api/editor/deliver/route.ts` — POST { shootId } → writes final JPEGs to Dropbox + OUTBOUND Ops, marks shoot delivered

**CREATE — Photographer UI:**
- `app/admin/editor/shoots/page.tsx` — list of shoots
- `app/admin/editor/shoots/new/page.tsx` — create-shoot form (address + email)
- `app/admin/editor/shoots/[id]/page.tsx` — shoot detail: photographer uploads bracket sets, sees frames
- `app/admin/editor/shoots/[id]/frames/[frameId]/page.tsx` — manual editor for one frame
- `app/admin/editor/shoots/[id]/frames/[frameId]/Editor.tsx` — full client editor component
- `app/admin/editor/shoots/[id]/frames/[frameId]/SliderPanel.tsx` — slider UI
- `app/admin/editor/shoots/[id]/frames/[frameId]/PresetPicker.tsx` — 6 HDR preset cards
- `app/admin/editor/shoots/[id]/frames/[frameId]/VariationPicker.tsx` — generic variation picker used by dusk/sky/staging
- `app/admin/editor/shoots/[id]/frames/[frameId]/HelperBar.tsx` — one-click AI helper buttons (declutter, fire, lawn, etc.)

**MODIFY:**
- `lib/db/schema.ts` — add `shoots` and `frames` tables (replace conceptual `properties`/`photos` use; old tables stay in place for now, marked deprecated, dropped in Task 26)
- `app/admin/page.tsx` — replace `Editor intake` link with `Photographer shoots`

---

### Task 1: Tear down Phase 4 v1 workflow code

**Files:**
- Delete: `lib/workflow/process-photo.ts`, `lib/workflow/process-property.ts`, `lib/workflow/helpers.ts`
- Delete: `app/api/workflow/trigger/route.ts`, `app/api/cron/queue-backstop/route.ts`
- Delete: `tests/workflow-helpers.test.ts`
- Modify: `vercel.json` — remove `crons` entry
- Modify: `next.config.ts` — remove `withWorkflow()` wrap
- Modify: `proxy.ts` — remove the `.well-known/workflow/` matcher exclusion
- Modify: `lib/intake/actions.ts` — remove the fire-and-forget trigger call from `submitProperty`

- [ ] **Step 1: Delete files**

```bash
cd ~/Code/won-vision
git rm -r lib/workflow app/api/workflow app/api/cron tests/workflow-helpers.test.ts
```

- [ ] **Step 2: Edit `next.config.ts`** — remove the `withWorkflow()` wrap, leave a plain default export.

- [ ] **Step 3: Edit `proxy.ts`** — drop the `\\.well-known/workflow/` entry from the matcher.

- [ ] **Step 4: Edit `vercel.json`** — remove the `crons` array entirely.

- [ ] **Step 5: Edit `lib/intake/actions.ts` `submitProperty`** — strip the fire-and-forget `fetch(...)` call back to just the status flip + revalidate (the function will be removed entirely in Task 24, but leaving it stub-safe for now keeps the build green).

- [ ] **Step 6: Build to confirm nothing else imports the deleted modules**

```bash
npm run build
```

Expected: clean build. If any import fails, search-and-fix the offending file.

- [ ] **Step 7: Uninstall the workflow package**

```bash
npm uninstall workflow
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore(phase-4-v2): remove Phase 4 v1 workflow + cron + trigger"
```

---

### Task 2: Tear down old intake form (rebuild later)

**Files:**
- Delete: `app/admin/editor/new/` (whole directory: `page.tsx`, `Intake.tsx`, `IntakeForm.tsx`, `ReviewScreen.tsx`, `Stepper.tsx`, `types.ts`, `AddressField.tsx`)
- Delete: `lib/intake/` (whole directory: `actions.ts`, `queries.ts`)
- Delete: `app/admin/editor/[id]/page.tsx` + `AutoRefresh.tsx` (rebuilt as `shoots/[id]/page.tsx`)
- Delete: `app/admin/editor/page.tsx` (rebuilt as `shoots/page.tsx`)
- Delete: `tests/intake-actions.test.ts`, `tests/intake.spec.ts`
- Modify: `app/admin/page.tsx` — temporarily replace the `/admin/editor` link with `Photographer shoots — coming Task 19`

- [ ] **Step 1: Delete**

```bash
cd ~/Code/won-vision
git rm -r app/admin/editor lib/intake tests/intake-actions.test.ts tests/intake.spec.ts
```

- [ ] **Step 2: Stub `app/admin/page.tsx`**

Edit the JSX to replace the editor link with:

```tsx
<ul>
  <li>Photographer shoots — coming soon</li>
</ul>
```

- [ ] **Step 3: Build clean**

```bash
npm run build
```

Expected: clean build. Routes list no longer shows `/admin/editor/*`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(phase-4-v2): remove old intake form and editor routes"
```

---

### Task 3: Schema — `shoots` and `frames` tables

**Files:**
- Modify: `lib/db/schema.ts`
- Create: `lib/db/migrations/0004_phase4_v2_shoots.sql` (drizzle-generated)

- [ ] **Step 1: Patch schema.ts**

Add two new tables (do NOT drop properties/photos yet — Task 26 cleans those up):

```ts
export const shootStatusEnum = pgEnum('shoot_status', [
  'draft',
  'uploading',
  'editing',
  'sent',
  'archived',
]);

export const frameStatusEnum = pgEnum('frame_status', [
  'draft',
  'merging',
  'ready',     // hdr base ready, ready to edit
  'editing',
  'exporting',
  'exported',
  'failed',
]);

export const shoots = pgTable('shoots', {
  id: uuid('id').defaultRandom().primaryKey(),
  photographerId: uuid('photographer_id').notNull().references(() => editors.id),
  address: text('address').notNull(),
  contactEmail: text('contact_email').notNull(),
  status: shootStatusEnum('status').notNull().default('draft'),
  opsJobId: text('ops_job_id'),
  dropboxFolder: text('dropbox_folder'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
});

export const frames = pgTable('frames', {
  id: uuid('id').defaultRandom().primaryKey(),
  shootId: uuid('shoot_id').notNull().references(() => shoots.id, { onDelete: 'cascade' }),
  bracketBlobUrls: jsonb('bracket_blob_urls').notNull(),    // string[] of 3 URLs
  filename: text('filename').notNull(),                      // base filename (e.g. "DSC_0001")
  hdrBaseUrl: text('hdr_base_url'),                          // 16-bit linear PNG after merge
  previewUrl: text('preview_url'),                           // current 2K JPEG
  finalJpegUrl: text('final_jpeg_url'),                      // full-res 6K JPEG
  adjustments: jsonb('adjustments').notNull().default({}),   // current slider values
  presetId: text('preset_id').notNull().default('standard'), // current HDR preset
  appliedHelpers: jsonb('applied_helpers').notNull().default([]), // list of helper runs
  status: frameStatusEnum('status').notNull().default('draft'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Shoot = typeof shoots.$inferSelect;
export type NewShoot = typeof shoots.$inferInsert;
export type Frame = typeof frames.$inferSelect;
export type NewFrame = typeof frames.$inferInsert;
```

- [ ] **Step 2: Generate + inspect + apply**

```bash
npx drizzle-kit generate --name phase4_v2_shoots
npx dotenv -e .env.local -- npx drizzle-kit migrate
```

Expected: `✓ migrations applied successfully!`

- [ ] **Step 3: Verify**

```bash
npx dotenv -e .env.local -- tsx -e "import { db, shoots } from './lib/db'; db.select().from(shoots).limit(1).then(r => console.log('ok', r.length))"
```

Expected: `ok 0`.

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts lib/db/migrations/
git commit -m "feat(phase-4-v2): shoots + frames schema"
```

---

### Task 4: Adjustments type + zod schema

**Files:**
- Create: `lib/editor/adjustments.ts`
- Test: `tests/editor-adjustments.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/editor-adjustments.test.ts
import { describe, it, expect } from 'vitest';
import { adjustmentsSchema, DEFAULT_ADJUSTMENTS, type Adjustments } from '@/lib/editor/adjustments';

describe('adjustments', () => {
  it('DEFAULT_ADJUSTMENTS has every required slider at neutral', () => {
    expect(DEFAULT_ADJUSTMENTS).toEqual({
      exposure: 0, contrast: 0, temperature: 0, tint: 0,
      saturation: 0, highlights: 0, shadows: 0, whites: 0,
      blacks: 0, sharpening: 0, clarity: 0, dehaze: 0,
    });
  });

  it('schema accepts default values', () => {
    expect(() => adjustmentsSchema.parse(DEFAULT_ADJUSTMENTS)).not.toThrow();
  });

  it('schema rejects values outside the ±100 range', () => {
    expect(() => adjustmentsSchema.parse({ ...DEFAULT_ADJUSTMENTS, exposure: 200 })).toThrow();
    expect(() => adjustmentsSchema.parse({ ...DEFAULT_ADJUSTMENTS, exposure: -200 })).toThrow();
  });

  it('schema accepts partial inputs and fills defaults via parse', () => {
    const out = adjustmentsSchema.parse({ exposure: 25 });
    expect(out.exposure).toBe(25);
    expect(out.contrast).toBe(0);
  });
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- tests/editor-adjustments.test.ts
```

- [ ] **Step 3: Implement**

```ts
// lib/editor/adjustments.ts
import { z } from 'zod';

const slider = (label: string) => z.number().min(-100).max(100).default(0).describe(label);

export const adjustmentsSchema = z.object({
  exposure: slider('Exposure'),
  contrast: slider('Contrast'),
  temperature: slider('Temperature'),
  tint: slider('Tint'),
  saturation: slider('Saturation'),
  highlights: slider('Highlights'),
  shadows: slider('Shadows'),
  whites: slider('Whites'),
  blacks: slider('Blacks'),
  sharpening: slider('Sharpening'),
  clarity: slider('Clarity'),
  dehaze: slider('Dehaze'),
});

export type Adjustments = z.infer<typeof adjustmentsSchema>;

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  exposure: 0, contrast: 0, temperature: 0, tint: 0,
  saturation: 0, highlights: 0, shadows: 0, whites: 0,
  blacks: 0, sharpening: 0, clarity: 0, dehaze: 0,
};

export const SLIDER_KEYS: (keyof Adjustments)[] = [
  'exposure', 'contrast', 'temperature', 'tint',
  'highlights', 'shadows', 'whites', 'blacks',
  'saturation', 'clarity', 'dehaze', 'sharpening',
];
```

- [ ] **Step 4: Run — expect pass + commit**

```bash
npm test -- tests/editor-adjustments.test.ts
git add lib/editor/adjustments.ts tests/editor-adjustments.test.ts
git commit -m "feat(phase-4-v2): adjustments type + zod schema"
```

---

### Task 5: HDR presets library

**Files:**
- Create: `lib/editor/presets.ts`
- Test: `tests/editor-presets.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/editor-presets.test.ts
import { describe, it, expect } from 'vitest';
import { HDR_PRESETS, getPreset } from '@/lib/editor/presets';

describe('HDR_PRESETS', () => {
  it('contains exactly 6 named presets', () => {
    expect(HDR_PRESETS.map(p => p.id)).toEqual([
      'standard', 'natural', 'warm', 'cool', 'bright-airy', 'moody',
    ]);
  });

  it('getPreset returns the matching preset', () => {
    expect(getPreset('warm')?.label).toBe('Warm');
    expect(getPreset('nope' as any)).toBeUndefined();
  });

  it('every preset has all 12 adjustment keys', () => {
    for (const p of HDR_PRESETS) {
      const keys = Object.keys(p.adjustments).sort();
      expect(keys).toEqual([
        'blacks', 'clarity', 'contrast', 'dehaze', 'exposure', 'highlights',
        'saturation', 'shadows', 'sharpening', 'temperature', 'tint', 'whites',
      ]);
    }
  });
});
```

- [ ] **Step 2: Run — expect fail.**

- [ ] **Step 3: Implement**

```ts
// lib/editor/presets.ts
import type { Adjustments } from './adjustments';
import { DEFAULT_ADJUSTMENTS } from './adjustments';

export type HdrPreset = {
  id: 'standard' | 'natural' | 'warm' | 'cool' | 'bright-airy' | 'moody';
  label: string;
  blurb: string;
  adjustments: Adjustments;
};

export const HDR_PRESETS: HdrPreset[] = [
  {
    id: 'standard',
    label: 'Standard',
    blurb: 'MLS-safe neutral. True colour, balanced contrast.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
  },
  {
    id: 'natural',
    label: 'Natural',
    blurb: 'Lifelike, slightly desaturated, soft contrast.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, saturation: -8, contrast: -5, clarity: -5, sharpening: 8 },
  },
  {
    id: 'warm',
    label: 'Warm',
    blurb: 'Golden white balance, inviting, lifted shadows.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: 12, shadows: 10, highlights: -8, saturation: 6 },
  },
  {
    id: 'cool',
    label: 'Cool',
    blurb: 'Slight blue cast, crisp shadows, contemporary feel.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: -10, tint: -3, contrast: 8, whites: 4 },
  },
  {
    id: 'bright-airy',
    label: 'Bright & Airy',
    blurb: 'High-key, walls pushed to white, lifted shadows.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, exposure: 12, shadows: 20, whites: 14, contrast: -8, clarity: -8 },
  },
  {
    id: 'moody',
    label: 'Moody',
    blurb: 'Deeper contrast, rich shadows, magazine drama.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 18, blacks: -14, shadows: -10, clarity: 10, saturation: -4 },
  },
];

export function getPreset(id: string): HdrPreset | undefined {
  return HDR_PRESETS.find(p => p.id === id);
}
```

- [ ] **Step 4: Run + commit**

```bash
npm test -- tests/editor-presets.test.ts
git add lib/editor/presets.ts tests/editor-presets.test.ts
git commit -m "feat(phase-4-v2): 6 HDR tone-mapping presets"
```

---

### Task 6: Dusk + sky + staging variation libraries

**Files:**
- Create: `lib/editor/dusk-variations.ts`
- Create: `lib/editor/sky-variations.ts`
- Modify: `lib/editor/staging-styles.ts` (extend the existing `lib/styles.ts` from 4 to 6 styles, move into editor dir)
- Test: `tests/editor-variations.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/editor-variations.test.ts
import { describe, it, expect } from 'vitest';
import { DUSK_VARIATIONS, buildDuskPrompt } from '@/lib/editor/dusk-variations';
import { SKY_VARIATIONS, buildSkyPrompt } from '@/lib/editor/sky-variations';
import { STAGING_STYLES } from '@/lib/editor/staging-styles';

describe('DUSK_VARIATIONS', () => {
  it('has exactly 3 variations', () => {
    expect(DUSK_VARIATIONS.map(v => v.id)).toEqual(['golden-hour', 'blue-hour', 'late-twilight']);
  });
  it('buildDuskPrompt embeds the variation description', () => {
    expect(buildDuskPrompt('golden-hour')).toMatch(/warm orange/i);
    expect(buildDuskPrompt('blue-hour')).toMatch(/cobalt|deep blue/i);
    expect(buildDuskPrompt('late-twilight')).toMatch(/indigo|near-dark/i);
  });
});

describe('SKY_VARIATIONS', () => {
  it('has exactly 4 variations', () => {
    expect(SKY_VARIATIONS.map(v => v.id)).toEqual(['clear-blue', 'soft-cloudy', 'dramatic', 'sunset']);
  });
  it('buildSkyPrompt embeds variation copy', () => {
    expect(buildSkyPrompt('clear-blue')).toMatch(/cloudless/i);
    expect(buildSkyPrompt('dramatic')).toMatch(/cumulus|dramatic/i);
  });
});

describe('STAGING_STYLES', () => {
  it('has exactly 6 styles', () => {
    expect(STAGING_STYLES.map(s => s.id)).toEqual([
      'modern', 'scandinavian', 'coastal', 'mid-century', 'industrial-loft', 'japandi',
    ]);
  });
});
```

- [ ] **Step 2: Run — expect fail.**

- [ ] **Step 3: Implement dusk variations**

```ts
// lib/editor/dusk-variations.ts
export type DuskVariationId = 'golden-hour' | 'blue-hour' | 'late-twilight';

export const DUSK_VARIATIONS: { id: DuskVariationId; label: string; blurb: string; promptFragment: string }[] = [
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    blurb: 'Warm orange & pink horizon, sun just below the skyline.',
    promptFragment:
      'Sky: warm orange and soft pink at the horizon, gilded cirrus clouds, fading to pale lavender ' +
      'overhead. The sun has just set — residual warm light catches the building facade.',
  },
  {
    id: 'blue-hour',
    label: 'Blue Hour',
    blurb: 'Deep cobalt sky, dramatic interior-vs-exterior contrast.',
    promptFragment:
      'Sky: deep cobalt to indigo overhead, transitioning to a thin warm orange band on the horizon. ' +
      'Interior lights blaze warm against the cool sky — the classic real-estate twilight look.',
  },
  {
    id: 'late-twilight',
    label: 'Late Twilight',
    blurb: 'Near-dark sky, interior lights become the dominant light.',
    promptFragment:
      'Sky: near-dark indigo with the first stars faintly visible, a thin dark-purple horizon. ' +
      'Interior 2700K lamps dominate the scene with strong warm spill through every window.',
  },
];

const DUSK_BASE =
  'Convert the daytime real-estate photo to dusk/twilight. Every visible interior lamp, pendant, and ' +
  'downlight is switched ON at 2700-3000K. Landscape and path lights on. Shadows match the new low-angle ' +
  'light direction. Preserve architecture, geometry, composition, framing, and aspect ratio exactly.';

export function buildDuskPrompt(id: DuskVariationId): string {
  const v = DUSK_VARIATIONS.find(x => x.id === id);
  if (!v) throw new Error(`Unknown dusk variation: ${id}`);
  return `${DUSK_BASE} ${v.promptFragment}`;
}
```

- [ ] **Step 4: Implement sky variations**

```ts
// lib/editor/sky-variations.ts
export type SkyVariationId = 'clear-blue' | 'soft-cloudy' | 'dramatic' | 'sunset';

export const SKY_VARIATIONS: { id: SkyVariationId; label: string; blurb: string; promptFragment: string }[] = [
  {
    id: 'clear-blue',
    label: 'Clear Blue',
    blurb: 'Cloudless mid-blue sky, sharp sunlight.',
    promptFragment: 'Sky: cloudless mid-blue with a slight horizon haze. Clean, sharp sunlight.',
  },
  {
    id: 'soft-cloudy',
    label: 'Soft Cloudy',
    blurb: 'High wispy cirrus on pale blue — flattering, low contrast.',
    promptFragment: 'Sky: pale blue with wispy high cirrus clouds. Soft, even, flattering light without harsh shadows.',
  },
  {
    id: 'dramatic',
    label: 'Dramatic',
    blurb: 'Heavy cumulus, bright rim-lit highlights, magazine contrast.',
    promptFragment: 'Sky: dramatic cumulus cloud formations with bright rim-lit highlights, deep blue gaps, magazine-style contrast.',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    blurb: 'Warm horizon transitioning to soft pink and lavender.',
    promptFragment: 'Sky: warm orange sun low on the horizon, transitioning through soft pink and lavender to pale blue overhead. Golden hour glow on the building.',
  },
];

const SKY_BASE =
  'Replace ONLY the sky in this real-estate exterior photo. Preserve every building, landscape, plant, ' +
  'paving, and architectural detail exactly. Match the new sky light direction with realistic exterior ' +
  'shadows and warm/cool cast on the facade. No warped lines, no extra rooms, no surreal elements. ' +
  'Preserve original aspect ratio with no borders or letterboxing.';

export function buildSkyPrompt(id: SkyVariationId): string {
  const v = SKY_VARIATIONS.find(x => x.id === id);
  if (!v) throw new Error(`Unknown sky variation: ${id}`);
  return `${SKY_BASE} ${v.promptFragment}`;
}
```

- [ ] **Step 5: Implement staging styles**

```ts
// lib/editor/staging-styles.ts
export type StagingStyleId = 'modern' | 'scandinavian' | 'coastal' | 'mid-century' | 'industrial-loft' | 'japandi';

export const STAGING_STYLES: { id: StagingStyleId; label: string; blurb: string }[] = [
  { id: 'modern',          label: 'Modern',          blurb: 'Greige textiles, oak, brushed black accents.' },
  { id: 'scandinavian',    label: 'Scandinavian',    blurb: 'Soft whites, pale ash, hygge texture.' },
  { id: 'coastal',         label: 'Coastal',         blurb: 'Whitewashed timber, linen, weathered driftwood.' },
  { id: 'mid-century',     label: 'Mid-Century',     blurb: 'Walnut + tan leather, brass + mustard accents.' },
  { id: 'industrial-loft', label: 'Industrial Loft', blurb: 'Black metal, exposed brick, Edison bulbs, leather.' },
  { id: 'japandi',         label: 'Japandi',         blurb: 'Japanese-Scandi minimalism, low-profile, sage + ivory.' },
];
```

- [ ] **Step 6: Run + commit**

```bash
npm test -- tests/editor-variations.test.ts
git add lib/editor/ tests/editor-variations.test.ts
git commit -m "feat(phase-4-v2): dusk + sky + staging variation libraries"
```

---

### Task 7: Extend `lib/fal/prompts.ts` to accept new variations

**Files:**
- Modify: `lib/fal/prompts.ts`

Currently `buildPrompt(service, style?)` handles `declutter | stage | dusk` with the old 4-style list. Extend to support the full new set: 6 staging styles + 3 dusk variations + 4 sky variations + the legacy declutter prompt. Add additional helpers: `lawn`, `fire`, `ceiling`, `object-removal`.

- [ ] **Step 1: Rewrite `lib/fal/prompts.ts` to a switch-based dispatcher**

```ts
// lib/fal/prompts.ts
import { buildDuskPrompt, type DuskVariationId } from '@/lib/editor/dusk-variations';
import { buildSkyPrompt, type SkyVariationId } from '@/lib/editor/sky-variations';
import { STAGING_STYLES, type StagingStyleId } from '@/lib/editor/staging-styles';

export type HelperType =
  | { type: 'declutter' }
  | { type: 'stage';   style: StagingStyleId }
  | { type: 'dusk';    variation: DuskVariationId }
  | { type: 'sky';     variation: SkyVariationId }
  | { type: 'lawn' }
  | { type: 'fire' }
  | { type: 'ceiling' }
  | { type: 'object-removal'; maskHint: string };

const BASE_REALISM = [
  'Photorealistic professional real-estate interior photograph.',
  'SOURCE: shot on a Sony A7R V full-frame mirrorless camera (61 megapixel, 14-bit RAW), Sony FE 16-35mm GM',
  'at 16-24mm, f/8, ISO 100, on a tripod. Input image is an HDR-merged composite from 3 bracketed exposures,',
  'tone-mapped naturally, white balance ~5500K.',
  'OUTPUT REQUIREMENTS: photoreal, sharp edge-to-edge, perfectly vertical lines (architectural correction),',
  'no warped lines, no impossible geometry, no AI artifacts, no duplicated/melted objects, no oversaturation.',
  'FRAMING: preserve the ORIGINAL aspect ratio exactly. NO borders, black bars, white bars, letterboxing,',
  'pillarboxing, frames, vignette, Polaroid edges, postcard mats. NO text, watermarks, logos, captions, timestamps.',
  'Output at 4096px long edge JPEG at maximum quality.',
].join(' ');

// Full per-style staging prompts from the previous prompt file are preserved here.
// (See current lib/fal/prompts.ts for the existing modern / scandi / coastal / mid-century bodies.
//  Add two new entries.)
const STAGE_PROMPTS: Record<StagingStyleId, string> = {
  modern: '/* paste existing modern body verbatim */',
  scandinavian: '/* paste existing scandinavian body verbatim */',
  coastal: '/* paste existing coastal body verbatim */',
  'mid-century': '/* paste existing mid-century body verbatim */',
  'industrial-loft': [
    'STAGING STYLE: INDUSTRIAL LOFT (NYC warehouse conversion aesthetic).',
    'PALETTE: black metal, exposed brick red-brown, raw concrete grey, cognac and oxblood leather, brass fittings.',
    'FURNITURE: black steel-frame sofa with deep cognac leather cushions; reclaimed timber coffee table with ',
    'visible knots and steel hairpin legs; Tolix-style metal chairs in matte black; oversized Edison-bulb pendant ',
    'cluster on black cloth cord; industrial wheeled bar cart; black bookshelf with steel angle-iron uprights.',
    'TEXTILES: chunky wool throws in charcoal or rust, leather floor cushions, dark Persian-style rug.',
    'DECOR: vintage typewriter or camera as sculpture, framed black-and-white architectural photography, ',
    'a single trailing pothos in a concrete planter, stack of design books with black spines.',
    'LIGHTING: warm 2700K bulbs in exposed sockets, no diffusers. Strong directional daylight casting hard shadows.',
    'AVOID: shabby chic, country kitsch, plastic anything, gold or chrome, light woods, anything that reads "loft apartment showroom" instead of "real industrial conversion."',
  ].join(' '),
  japandi: [
    'STAGING STYLE: JAPANDI (Japanese + Scandinavian fusion).',
    'PALETTE: warm ivory, sage green, soft charcoal, pale natural wood (white oak or beech), accents of black-stained timber and matte black metal. No bright colours.',
    'FURNITURE: low-profile sofa in ivory linen with clean lines and exposed wood legs; pale oak coffee table sitting close to the floor; a single sculptural lounge chair (Yanagi Butterfly or similar); minimal sideboard with sliding doors.',
    'TEXTILES: linen, raw cotton, undyed wool. One textured throw, one ceramic-toned cushion. A cream wool tatami-style rug.',
    'DECOR: a single ikebana arrangement in a hand-thrown ceramic vessel, one piece of abstract sumi-ink art, a black ceramic tea set on a wooden tray, a low bonsai or a tall sculptural snake plant.',
    'LIGHTING: soft 3000K diffused light, paper-shade pendant lamps, sunlight through sheer linen curtains creating soft geometric patterns on the floor.',
    'AVOID: bright reds, anime references, kitsch Japanese imagery, dark heavy woods, busy patterns, anything maximalist.',
  ].join(' '),
};

export function buildPrompt(helper: HelperType): string {
  switch (helper.type) {
    case 'declutter':
      return `${BASE_REALISM} TASK: DECLUTTER. Remove every removable personal item, paperwork, photo frame, ` +
        `cable, kitchen clutter, toiletries, rubbish bin, laundry, and visually noisy item. Remove excess ` +
        `portable furniture (extra chairs, ironing boards, card tables, portable heaters). PRESERVE all built-in ` +
        `fixtures, windows, doors, fittings, flooring, paint colour, and the original lighting.`;
    case 'stage': {
      const styleBody = STAGE_PROMPTS[helper.style];
      return `${BASE_REALISM} TASK: VIRTUAL STAGING. ${styleBody} CRITICAL: furniture sits physically flat on the ` +
        `original floor with realistic contact shadows. Scale matches the room. No clipping, floating, or warped ` +
        `edges. Do not alter walls, windows, doors, fixtures, or flooring.`;
    }
    case 'dusk':
      return `${BASE_REALISM} TASK: DAY-TO-DUSK CONVERSION. ${buildDuskPrompt(helper.variation)}`;
    case 'sky':
      return `${BASE_REALISM} TASK: SKY REPLACEMENT. ${buildSkyPrompt(helper.variation)}`;
    case 'lawn':
      return `${BASE_REALISM} TASK: LAWN ENHANCEMENT. Improve only the lawn / grass / garden vegetation in this ` +
        `photo. Greener, healthier, denser turf. Remove brown patches, weeds, and bare soil. Preserve every ` +
        `building, hardscape, plant bed, tree, and pathway exactly. No new objects. Do not change the lighting or sky.`;
    case 'fire':
      return `${BASE_REALISM} TASK: FIRE ON. If the photo contains a fireplace, ignite a realistic warm flame ` +
        `in it with appropriate glow on surrounding stone/brick/timber and the room. Flames should look natural ` +
        `for the fireplace type (gas / wood / electric). Add subtle warm light spill on nearby surfaces. ` +
        `Do not alter anything else. If no fireplace is present, return the image unchanged.`;
    case 'ceiling':
      return `${BASE_REALISM} TASK: CEILING BRIGHTEN. Lift the ceiling exposure subtly so it reads clean white ` +
        `or near-white without losing texture, shadow detail, or natural light direction. Remove any yellow ` +
        `cast from incandescent lighting on the ceiling. Preserve every cornice, downlight, fan, beam, and architectural feature.`;
    case 'object-removal':
      return `${BASE_REALISM} TASK: OBJECT REMOVAL. Remove the following items from the photo: ${helper.maskHint}. ` +
        `Fill the removed areas with surrounding textures, shadows, and lighting that match the rest of the photo perfectly. ` +
        `No ghosting, no soft patches, no obvious AI fill. Preserve everything else exactly.`;
  }
}
```

(The implementer must paste in the full existing modern/scandi/coastal/mid-century bodies from the current `lib/fal/prompts.ts` — they are unchanged.)

- [ ] **Step 2: Update test file** `tests/fal-prompts.test.ts` to use the new `buildPrompt({ type: 'declutter' })` API. Replace the 4 existing tests with equivalents that match the new dispatcher.

- [ ] **Step 3: Run + commit**

```bash
npm test -- tests/fal-prompts.test.ts
git add lib/fal/prompts.ts tests/fal-prompts.test.ts
git commit -m "feat(phase-4-v2): full helper dispatcher in fal prompts"
```

---

### Task 8: Python runtime + requirements.txt

**Files:**
- Create: `requirements.txt`
- Modify: `vercel.json`

- [ ] **Step 1: Write `requirements.txt`**

```
rawpy==0.21.0
opencv-python-headless==4.10.0.84
numpy==1.26.4
Pillow==10.4.0
requests==2.32.3
```

- [ ] **Step 2: Patch `vercel.json` to route Python functions**

```json
{
  "functions": {
    "api/raw/*.py": {
      "runtime": "python3.12",
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

- [ ] **Step 3: Verify Vercel CLI sees the Python config**

```bash
vercel build --no-deploy 2>&1 | tail -20
```

Expected: build output mentions Python detection. If the CLI complains about missing files, that's fine — Task 9 creates them.

- [ ] **Step 4: Commit**

```bash
git add requirements.txt vercel.json
git commit -m "chore(phase-4-v2): python 3.12 runtime + rawpy/opencv deps"
```

---

### Task 9: Python RAW merge endpoint

**Files:**
- Create: `api/raw/merge.py`

- [ ] **Step 1: Implement**

```python
# api/raw/merge.py
"""POST /api/raw/merge — load 3 bracketed ARW files from URLs, align, exposure-fuse via Mertens, output 16-bit PNG to Blob."""
import io
import json
import os
import uuid
import numpy as np
import rawpy
import requests
import cv2
from PIL import Image


def fetch_bytes(url: str) -> bytes:
    r = requests.get(url, timeout=120)
    r.raise_for_status()
    return r.content


def raw_to_linear(arw_bytes: bytes) -> np.ndarray:
    """Decode RAW to a linear float32 RGB image, normalised to [0, 1]."""
    with rawpy.imread(io.BytesIO(arw_bytes)) as raw:
        rgb = raw.postprocess(
            use_camera_wb=True,
            no_auto_bright=True,
            output_bps=16,
            output_color=rawpy.ColorSpace.sRGB,
            gamma=(1.0, 1.0),  # linear
        )
    return rgb.astype(np.float32) / 65535.0


def align_and_fuse(frames: list[np.ndarray]) -> np.ndarray:
    """ECC-align middle exposure first, then fuse via OpenCV Mertens."""
    # Convert to 8-bit BGR for alignment + fusion
    bgr8 = [cv2.cvtColor((f * 255).clip(0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR) for f in frames]
    fuser = cv2.createMergeMertens(contrast_weight=1.0, saturation_weight=1.0, exposure_weight=1.0)
    fused = fuser.process(bgr8)  # float32 0..1
    fused = np.clip(fused, 0, 1)
    return cv2.cvtColor(fused, cv2.COLOR_BGR2RGB)


def upload_to_blob(image_rgb_float: np.ndarray, key: str) -> str:
    """Upload a 16-bit PNG to Vercel Blob via the put-by-pathname HTTP API."""
    arr16 = (image_rgb_float * 65535).clip(0, 65535).astype(np.uint16)
    pil = Image.fromarray(arr16, mode='RGB')
    buf = io.BytesIO()
    pil.save(buf, format='PNG', compress_level=3)
    buf.seek(0)

    token = os.environ['BLOB_READ_WRITE_TOKEN']
    resp = requests.put(
        f'https://blob.vercel-storage.com/{key}',
        headers={
            'Authorization': f'Bearer {token}',
            'x-content-type': 'image/png',
            'x-add-random-suffix': '1',
        },
        data=buf.read(),
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()['url']


def handler(request):
    body = request.json
    urls = body.get('bracketUrls', [])
    if len(urls) != 3:
        return {'statusCode': 400, 'body': json.dumps({'error': 'bracketUrls must be 3 URLs'})}

    frames = [raw_to_linear(fetch_bytes(u)) for u in urls]
    fused = align_and_fuse(frames)
    url = upload_to_blob(fused, f'hdr-base/{uuid.uuid4()}.png')
    return {'statusCode': 200, 'body': json.dumps({'hdrBaseUrl': url})}
```

- [ ] **Step 2: Local smoke test** (only run if `BLOB_READ_WRITE_TOKEN` is set in `.env.local` AND you have 3 sample ARW files):

```bash
# Skip this step if no sample ARWs available — Task 23 covers full smoke.
```

- [ ] **Step 3: Commit**

```bash
git add api/raw/merge.py
git commit -m "feat(phase-4-v2): python raw merge endpoint (rawpy + mertens)"
```

---

### Task 10: Python adjustments-to-preview endpoint

**Files:**
- Create: `api/raw/preview.py`

- [ ] **Step 1: Implement**

```python
# api/raw/preview.py
"""POST /api/raw/preview — apply Adjustments JSON to the 16-bit HDR base, return a 2K JPEG."""
import io
import json
import os
import uuid
import numpy as np
import requests
import cv2
from PIL import Image


def fetch_base(url: str) -> np.ndarray:
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    img = Image.open(io.BytesIO(r.content))
    arr = np.asarray(img).astype(np.float32) / 65535.0
    return arr


def apply_adjustments(rgb: np.ndarray, adj: dict) -> np.ndarray:
    """Map slider values (-100..+100) to image operations. Inputs assumed in linear-ish 0..1."""

    def s(key: str, scale: float = 1.0) -> float:
        return float(adj.get(key, 0)) / 100.0 * scale

    out = rgb.copy()
    # exposure (±2EV at full slider)
    out *= 2.0 ** (s('exposure', 2.0))

    # temperature (warm vs cool — shift R up / B up)
    temp = s('temperature', 0.15)
    out[..., 0] *= 1.0 + temp
    out[..., 2] *= 1.0 - temp

    # tint (green vs magenta)
    tint = s('tint', 0.10)
    out[..., 1] *= 1.0 + tint
    out[..., 0] *= 1.0 - tint * 0.5
    out[..., 2] *= 1.0 - tint * 0.5

    # contrast around 0.5
    contrast = s('contrast', 0.5)
    out = (out - 0.5) * (1.0 + contrast) + 0.5

    # highlights / shadows (split tone via luma)
    luma = (0.2126 * out[..., 0] + 0.7152 * out[..., 1] + 0.0722 * out[..., 2])
    hi_mask = np.clip((luma - 0.5) * 2.0, 0, 1)[..., None]
    sh_mask = np.clip((0.5 - luma) * 2.0, 0, 1)[..., None]
    out += hi_mask * s('highlights', 0.3)
    out += sh_mask * s('shadows', 0.4)

    # whites / blacks (anchor stretch)
    out = out * (1.0 + s('whites', 0.2)) - s('blacks', 0.15)

    # saturation (HSV)
    out8 = np.clip(out * 255, 0, 255).astype(np.uint8)
    hsv = cv2.cvtColor(out8, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] *= 1.0 + s('saturation', 0.6)
    hsv[..., 1] = np.clip(hsv[..., 1], 0, 255)
    out8 = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
    out = out8.astype(np.float32) / 255.0

    # clarity (local contrast via unsharp mask)
    clarity = s('clarity', 1.0)
    if abs(clarity) > 0.01:
        blur = cv2.GaussianBlur(out, (0, 0), sigmaX=20)
        out = out + clarity * (out - blur) * 0.5
        out = np.clip(out, 0, 1)

    # dehaze (very crude — subtract median + boost contrast on darks)
    dehaze = s('dehaze', 0.4)
    if abs(dehaze) > 0.01:
        med = np.median(out, axis=(0, 1))
        out = (out - med * dehaze) / max(1e-3, 1.0 - dehaze)
        out = np.clip(out, 0, 1)

    # sharpening (final pass unsharp)
    sharp = s('sharpening', 1.0)
    if abs(sharp) > 0.01:
        blur = cv2.GaussianBlur(out, (0, 0), sigmaX=1.2)
        out = out + sharp * (out - blur)
        out = np.clip(out, 0, 1)

    return np.clip(out, 0, 1)


def upload_jpeg(rgb: np.ndarray, key: str) -> str:
    arr8 = (rgb * 255).clip(0, 255).astype(np.uint8)
    pil = Image.fromarray(arr8, mode='RGB')
    # Resize to max 2048 long edge for preview
    long_edge = max(pil.size)
    if long_edge > 2048:
        ratio = 2048 / long_edge
        pil = pil.resize((int(pil.size[0] * ratio), int(pil.size[1] * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    pil.save(buf, format='JPEG', quality=88, optimize=True)
    buf.seek(0)

    token = os.environ['BLOB_READ_WRITE_TOKEN']
    resp = requests.put(
        f'https://blob.vercel-storage.com/{key}',
        headers={
            'Authorization': f'Bearer {token}',
            'x-content-type': 'image/jpeg',
            'x-add-random-suffix': '1',
        },
        data=buf.read(),
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()['url']


def handler(request):
    body = request.json
    hdr_url = body.get('hdrBaseUrl')
    adj = body.get('adjustments', {})
    if not hdr_url:
        return {'statusCode': 400, 'body': json.dumps({'error': 'hdrBaseUrl required'})}

    base = fetch_base(hdr_url)
    out = apply_adjustments(base, adj)
    url = upload_jpeg(out, f'preview/{uuid.uuid4()}.jpg')
    return {'statusCode': 200, 'body': json.dumps({'previewUrl': url})}
```

- [ ] **Step 2: Commit**

```bash
git add api/raw/preview.py
git commit -m "feat(phase-4-v2): python preview endpoint (12-slider adjustment pipeline)"
```

---

### Task 11: Python full-res export endpoint

**Files:**
- Create: `api/raw/export.py`

- [ ] **Step 1: Implement**

This is the same as `preview.py` but **without the 2048 long-edge resize**, and JPEG quality 95 instead of 88. The implementer should literally copy `preview.py` and modify only those two lines.

```python
# api/raw/export.py
# (identical to preview.py except the resize step is skipped and quality=95)
```

- [ ] **Step 2: Commit**

```bash
git add api/raw/export.py
git commit -m "feat(phase-4-v2): python full-res export endpoint"
```

---

### Task 12: Server actions — shoots + frames lifecycle

**Files:**
- Create: `lib/shoots/actions.ts`
- Create: `lib/shoots/queries.ts`
- Test: `tests/shoots-actions.test.ts`

- [ ] **Step 1: Implement queries**

```ts
// lib/shoots/queries.ts
import { desc, eq } from 'drizzle-orm';
import { db, shoots, frames } from '@/lib/db';

export async function listShoots(photographerId: string) {
  return db.select().from(shoots)
    .where(eq(shoots.photographerId, photographerId))
    .orderBy(desc(shoots.createdAt))
    .limit(100);
}

export async function getShoot(id: string) {
  return db.query.shoots.findFirst({ where: eq(shoots.id, id) });
}

export async function getFrame(id: string) {
  return db.query.frames.findFirst({ where: eq(frames.id, id) });
}

export async function listFrames(shootId: string) {
  return db.select().from(frames).where(eq(frames.shootId, shootId)).orderBy(frames.createdAt);
}
```

- [ ] **Step 2: Implement actions**

```ts
// lib/shoots/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, editors, shoots, frames } from '@/lib/db';
import { adjustmentsSchema, DEFAULT_ADJUSTMENTS, type Adjustments } from '@/lib/editor/adjustments';
import { HDR_PRESETS } from '@/lib/editor/presets';

async function requirePhotographer() {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  const editor = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!editor) throw new Error('Not authorised');
  return editor;
}

const newShootSchema = z.object({
  address: z.string().min(5).max(300),
  contactEmail: z.string().email(),
});

export async function createShoot(input: z.infer<typeof newShootSchema>) {
  const me = await requirePhotographer();
  const data = newShootSchema.parse(input);
  const [row] = await db.insert(shoots).values({
    photographerId: me.id,
    address: data.address,
    contactEmail: data.contactEmail,
    status: 'draft',
  }).returning({ id: shoots.id });
  return { ok: true as const, shootId: row.id };
}

const attachFrameSchema = z.object({
  shootId: z.string().uuid(),
  bracketBlobUrls: z.array(z.string().url()).length(3),
  filename: z.string().min(1).max(300),
});

export async function attachFrame(input: z.infer<typeof attachFrameSchema>) {
  await requirePhotographer();
  const data = attachFrameSchema.parse(input);
  const [row] = await db.insert(frames).values({
    shootId: data.shootId,
    bracketBlobUrls: data.bracketBlobUrls,
    filename: data.filename,
    status: 'draft',
    adjustments: DEFAULT_ADJUSTMENTS,
    presetId: 'standard',
  }).returning({ id: frames.id });
  revalidatePath(`/admin/editor/shoots/${data.shootId}`);
  return { ok: true as const, frameId: row.id };
}

export async function mergeFrame(frameId: string) {
  await requirePhotographer();
  const frame = await db.query.frames.findFirst({ where: eq(frames.id, frameId) });
  if (!frame) throw new Error('Frame not found');

  await db.update(frames).set({ status: 'merging' }).where(eq(frames.id, frameId));

  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const resp = await fetch(`${base}/api/raw/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bracketUrls: frame.bracketBlobUrls }),
  });
  if (!resp.ok) {
    await db.update(frames).set({ status: 'failed', errorMessage: await resp.text() }).where(eq(frames.id, frameId));
    throw new Error('Merge failed');
  }
  const { hdrBaseUrl } = await resp.json() as { hdrBaseUrl: string };
  await db.update(frames).set({ hdrBaseUrl, status: 'ready' }).where(eq(frames.id, frameId));
  revalidatePath(`/admin/editor/shoots/${frame.shootId}/frames/${frameId}`);
  return { ok: true as const, hdrBaseUrl };
}

const adjustSchema = z.object({
  frameId: z.string().uuid(),
  adjustments: adjustmentsSchema.partial(),
  presetId: z.string().optional(),
});

export async function applyAdjustments(input: z.infer<typeof adjustSchema>) {
  await requirePhotographer();
  const data = adjustSchema.parse(input);

  const frame = await db.query.frames.findFirst({ where: eq(frames.id, data.frameId) });
  if (!frame || !frame.hdrBaseUrl) throw new Error('Frame not ready');

  // Merge incoming partial onto current adjustments
  const merged: Adjustments = { ...(frame.adjustments as Adjustments), ...data.adjustments };

  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const resp = await fetch(`${base}/api/raw/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hdrBaseUrl: frame.hdrBaseUrl, adjustments: merged }),
  });
  if (!resp.ok) throw new Error('Preview render failed');
  const { previewUrl } = await resp.json() as { previewUrl: string };

  await db.update(frames).set({
    adjustments: merged,
    presetId: data.presetId ?? frame.presetId,
    previewUrl,
    status: 'editing',
  }).where(eq(frames.id, data.frameId));

  return { ok: true as const, previewUrl, adjustments: merged };
}

export async function exportFrame(frameId: string) {
  await requirePhotographer();
  const frame = await db.query.frames.findFirst({ where: eq(frames.id, frameId) });
  if (!frame || !frame.hdrBaseUrl) throw new Error('Frame not ready');

  await db.update(frames).set({ status: 'exporting' }).where(eq(frames.id, frameId));

  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const resp = await fetch(`${base}/api/raw/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hdrBaseUrl: frame.hdrBaseUrl, adjustments: frame.adjustments }),
  });
  if (!resp.ok) {
    await db.update(frames).set({ status: 'failed', errorMessage: await resp.text() }).where(eq(frames.id, frameId));
    throw new Error('Export failed');
  }
  const { previewUrl: finalUrl } = await resp.json() as { previewUrl: string };
  await db.update(frames).set({ finalJpegUrl: finalUrl, status: 'exported' }).where(eq(frames.id, frameId));
  return { ok: true as const, finalJpegUrl: finalUrl };
}
```

- [ ] **Step 3: Write minimal smoke test (mock-based)**

```ts
// tests/shoots-actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn(async () => ({ userId: 'u1' })) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/db', async () => {
  return {
    db: {
      query: {
        editors: { findFirst: vi.fn(async () => ({ id: 'e1', clerkUserId: 'u1' })) },
        shoots: { findFirst: vi.fn() },
        frames: { findFirst: vi.fn() },
      },
      insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(async () => [{ id: 'new-id' }]) })) })),
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(async () => undefined) })) })),
      select: vi.fn(),
    },
    editors: {}, shoots: {}, frames: {},
  };
});

import { createShoot } from '@/lib/shoots/actions';

describe('createShoot', () => {
  beforeEach(() => vi.clearAllMocks());
  it('creates a shoot and returns its id', async () => {
    const r = await createShoot({ address: '12 Smith St, Brunswick', contactEmail: 'a@b.com' });
    expect(r).toEqual({ ok: true, shootId: 'new-id' });
  });
});
```

- [ ] **Step 4: Run + commit**

```bash
npm test -- tests/shoots-actions.test.ts
git add lib/shoots/ tests/shoots-actions.test.ts
git commit -m "feat(phase-4-v2): shoots/frames server actions + queries"
```

---

### Task 13: AI helper endpoint (synchronous, single-image)

**Files:**
- Create: `app/api/editor/helper/route.ts`

- [ ] **Step 1: Implement**

```ts
// app/api/editor/helper/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors, frames } from '@/lib/db';
import { generate } from '@/lib/fal/client';
import { buildPrompt, type HelperType } from '@/lib/fal/prompts';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const editor = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!editor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { frameId: string; helper: HelperType };
  const frame = await db.query.frames.findFirst({ where: eq(frames.id, body.frameId) });
  if (!frame || !frame.previewUrl) {
    return NextResponse.json({ error: 'Frame must be merged + previewed first' }, { status: 400 });
  }

  const prompt = buildPrompt(body.helper);

  try {
    const results = await generate({
      service: body.helper.type === 'stage' ? 'stage' :
               body.helper.type === 'dusk' ? 'dusk' :
               'declutter', // routing: all non-dusk/stage land on Seedream for now
      style: body.helper.type === 'stage' ? body.helper.style : undefined,
      inputImageUrl: frame.previewUrl,
      numOutputs: 1,
    });
    const newPreviewUrl = results[0].url;

    // Append to appliedHelpers + update previewUrl
    const appliedHelpers = [...((frame.appliedHelpers ?? []) as any[]), {
      type: body.helper.type,
      params: body.helper,
      previewBefore: frame.previewUrl,
      previewAfter: newPreviewUrl,
      at: new Date().toISOString(),
    }];
    await db.update(frames).set({
      previewUrl: newPreviewUrl,
      appliedHelpers,
    }).where(eq(frames.id, body.frameId));

    return NextResponse.json({ ok: true, previewUrl: newPreviewUrl });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Helper failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: NOTE** — the existing `lib/fal/client.ts` `generate()` signature uses `service: 'declutter' | 'stage' | 'dusk' | 'declutter-stage'`. Refactor `generate()` in Task 13b (sub-step):
  - Accept a `prompt` string directly OR continue building one internally.
  - Add a `modelOverride?: string` param so dusk/sky/lawn/fire/ceiling/declutter can all use Seedream while staging uses Nano Banana Pro.
  - The implementer reads the current `lib/fal/client.ts` and adapts — keep backwards compatibility minimal since nothing else uses the old signature after Task 1's deletes.

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add app/api/editor/helper/route.ts lib/fal/client.ts
git commit -m "feat(phase-4-v2): synchronous AI helper endpoint"
```

---

### Task 14: Photographer shoots index page

**Files:**
- Create: `app/admin/editor/shoots/page.tsx`
- Modify: `app/admin/page.tsx` — replace the stub link with `<Link href="/admin/editor/shoots">Photographer shoots →</Link>`

- [ ] **Step 1: Implement**

```tsx
// app/admin/editor/shoots/page.tsx
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { listShoots } from '@/lib/shoots/queries';

export default async function ShootsIndex() {
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');
  const me = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!me) redirect('/admin');

  const rows = await listShoots(me.id);

  return (
    <section style={{ padding: '32px', maxWidth: 1000 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Shoots</h1>
        <Link href="/admin/editor/shoots/new" style={primaryBtn}>+ New shoot</Link>
      </header>

      {rows.length === 0 ? (
        <div style={{ padding: 32, border: '1px dashed #000', textAlign: 'center' }}>
          No shoots yet. Start with <strong>+ New shoot</strong>.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              <th style={th}>Address</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #E5E5E5' }}>
                <td style={td}><Link href={`/admin/editor/shoots/${r.id}`}>{r.address}</Link></td>
                <td style={td}>{r.status}</td>
                <td style={td}>{new Date(r.createdAt).toLocaleString('en-AU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

const primaryBtn: React.CSSProperties = {
  background: '#000', color: '#fff', padding: '10px 20px',
  fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
  textDecoration: 'none', border: '1px solid #000',
};
const th: React.CSSProperties = { padding: '12px 8px', fontWeight: 500, color: '#737373' };
const td: React.CSSProperties = { padding: '12px 8px', fontSize: 14 };
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add app/admin/editor/shoots/page.tsx app/admin/page.tsx
git commit -m "feat(phase-4-v2): shoots index page"
```

---

### Task 15: New-shoot form

**Files:**
- Create: `app/admin/editor/shoots/new/page.tsx`
- Create: `app/admin/editor/shoots/new/NewShootForm.tsx`
- Create: `app/admin/editor/shoots/new/AddressField.tsx` (re-port from old intake; same Places autocomplete with unit input)

- [ ] **Step 1: Re-port `AddressField.tsx`** from the deleted Task 2 intake form (use git history if needed: `git show HEAD~N:app/admin/editor/new/AddressField.tsx`). The component logic is unchanged — just lives at the new path.

- [ ] **Step 2: Server wrapper**

```tsx
// app/admin/editor/shoots/new/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { NewShootForm } from './NewShootForm';

export default async function NewShoot() {
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');
  const me = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!me) redirect('/admin');

  return (
    <section style={{ padding: 32, maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>New shoot</h1>
      <NewShootForm />
    </section>
  );
}
```

- [ ] **Step 3: Client form**

```tsx
// app/admin/editor/shoots/new/NewShootForm.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createShoot } from '@/lib/shoots/actions';
import { AddressField, formatAddress } from './AddressField';

export function NewShootForm() {
  const router = useRouter();
  const [unit, setUnit] = useState('');
  const [addressBase, setAddressBase] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const r = await createShoot({ address: formatAddress(unit, addressBase), contactEmail: email });
      router.push(`/admin/editor/shoots/${r.shootId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <label style={lbl}>Address
        <div style={{ marginTop: 6 }}>
          <AddressField unit={unit} onUnitChange={setUnit} base={addressBase} onBaseChange={setAddressBase} />
        </div>
      </label>
      <label style={lbl}>Contact email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inp} />
      </label>
      {err && <p role="alert" style={{ color: '#000', border: '1px solid #000', padding: '8px 12px' }}>{err}</p>}
      <button type="submit" disabled={busy || !addressBase || !email} style={btn}>
        {busy ? 'Creating…' : 'Create shoot →'}
      </button>
    </form>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase' };
const inp: React.CSSProperties = { display: 'block', width: '100%', padding: '10px 12px', border: '1px solid #000', fontSize: 14, marginTop: 6 };
const btn: React.CSSProperties = { background: '#000', color: '#fff', padding: '12px 24px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', border: '1px solid #000', cursor: 'pointer' };
```

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add app/admin/editor/shoots/new/
git commit -m "feat(phase-4-v2): new-shoot form with places autocomplete"
```

---

### Task 16: Shoot detail page — bracket-set upload

**Files:**
- Create: `app/admin/editor/shoots/[id]/page.tsx`
- Create: `app/admin/editor/shoots/[id]/Uploader.tsx`

- [ ] **Step 1: Server page**

```tsx
// app/admin/editor/shoots/[id]/page.tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { getShoot, listFrames } from '@/lib/shoots/queries';
import { Uploader } from './Uploader';

export default async function ShootDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');
  const me = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!me) redirect('/admin');

  const shoot = await getShoot(id);
  if (!shoot) notFound();
  const frames = await listFrames(id);

  return (
    <section style={{ padding: 32, maxWidth: 1200 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{shoot.address}</h1>
      <p style={{ color: '#737373', marginBottom: 24 }}>Status: {shoot.status} · {frames.length} frame{frames.length === 1 ? '' : 's'}</p>

      <Uploader shootId={id} />

      {frames.length > 0 && (
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 32 }}>
          {frames.map((f) => (
            <li key={f.id} style={{ border: '1px solid #E5E5E5' }}>
              <Link href={`/admin/editor/shoots/${id}/frames/${f.id}`}>
                <div style={{ aspectRatio: '3/2', background: f.previewUrl ? `url(${f.previewUrl}) center/cover` : '#F5F5F5' }} />
                <div style={{ padding: '8px 12px', fontSize: 12 }}>
                  <div>{f.filename}</div>
                  <div style={{ color: '#737373' }}>{f.status}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Client uploader**

```tsx
// app/admin/editor/shoots/[id]/Uploader.tsx
'use client';
import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { attachFrame, mergeFrame } from '@/lib/shoots/actions';

const ARW_TYPES = ['image/x-sony-arw', 'image/x-adobe-dng', 'image/jpeg'];

export function Uploader({ shootId }: { shootId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const all = Array.from(files);
    if (all.length % 3 !== 0) {
      setErr(`Upload in sets of 3 (received ${all.length}).`);
      return;
    }
    setBusy(true); setErr(null);
    try {
      // Group consecutive triples by filename order
      for (let i = 0; i < all.length; i += 3) {
        const triple = all.slice(i, i + 3);
        const uploaded = [];
        for (const f of triple) {
          const blob = await upload(f.name, f, {
            access: 'public',
            handleUploadUrl: `/api/admin/blob-token?propertyId=${shootId}`,
          });
          uploaded.push(blob.url);
        }
        const baseName = triple[0].name.replace(/\.[^.]+$/, '');
        const r = await attachFrame({ shootId, bracketBlobUrls: uploaded, filename: baseName });
        // Fire merge async — UI shows status='merging' until it finishes
        mergeFrame(r.frameId).catch((e) => console.error('merge failed', e));
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  return (
    <div>
      <p style={{ fontSize: 12, color: '#737373', marginBottom: 8 }}>
        Drop your bracket sets (3 RAW files per shot, in -2EV / 0EV / +2EV order).
      </p>
      <label style={{ display: 'block', border: '1px dashed #000', padding: 32, textAlign: 'center', cursor: 'pointer' }}>
        <input type="file" multiple accept=".arw,.dng,.jpg,.jpeg,image/*" onChange={(e) => onFiles(e.target.files)} disabled={busy} style={{ display: 'none' }} />
        {busy ? 'Uploading…' : '+ Select bracket files (multiple of 3)'}
      </label>
      {err && <p role="alert" style={{ color: '#000', border: '1px solid #000', padding: '8px 12px', marginTop: 12 }}>{err}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add app/admin/editor/shoots/[id]/
git commit -m "feat(phase-4-v2): shoot detail page + bracket uploader"
```

---

### Task 17: Manual editor — frame page + Editor shell

**Files:**
- Create: `app/admin/editor/shoots/[id]/frames/[frameId]/page.tsx`
- Create: `app/admin/editor/shoots/[id]/frames/[frameId]/Editor.tsx`

- [ ] **Step 1: Server page**

```tsx
// app/admin/editor/shoots/[id]/frames/[frameId]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { getFrame } from '@/lib/shoots/queries';
import { Editor } from './Editor';

export default async function FramePage({ params }: { params: Promise<{ id: string; frameId: string }> }) {
  const { id, frameId } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');
  const me = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!me) redirect('/admin');

  const frame = await getFrame(frameId);
  if (!frame) notFound();

  return <Editor shootId={id} frame={frame} />;
}
```

- [ ] **Step 2: Editor client shell**

```tsx
// app/admin/editor/shoots/[id]/frames/[frameId]/Editor.tsx
'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { applyAdjustments, exportFrame } from '@/lib/shoots/actions';
import { DEFAULT_ADJUSTMENTS, type Adjustments } from '@/lib/editor/adjustments';
import { SliderPanel } from './SliderPanel';
import { PresetPicker } from './PresetPicker';
import { HelperBar } from './HelperBar';
import type { Frame } from '@/lib/db';

export function Editor({ shootId, frame }: { shootId: string; frame: Frame }) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState(frame.previewUrl ?? frame.hdrBaseUrl ?? '');
  const [adj, setAdj] = useState<Adjustments>((frame.adjustments as Adjustments) ?? DEFAULT_ADJUSTMENTS);
  const [presetId, setPresetId] = useState(frame.presetId);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Debounced slider commit
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  function onSliderChange(next: Partial<Adjustments>, nextPreset?: string) {
    setAdj((prev) => ({ ...prev, ...next }));
    if (nextPreset) setPresetId(nextPreset);
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => {
      startTransition(async () => {
        try {
          const r = await applyAdjustments({ frameId: frame.id, adjustments: { ...adj, ...next }, presetId: nextPreset });
          setPreviewUrl(r.previewUrl);
        } catch (e) {
          setErr(e instanceof Error ? e.message : String(e));
        }
      });
    }, 250));
  }

  async function onSend() {
    startTransition(async () => {
      try {
        const r = await exportFrame(frame.id);
        router.push(`/admin/editor/shoots/${shootId}`);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, minHeight: '100vh' }}>
      <main style={{ padding: 24, background: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {previewUrl ? (
          <img src={previewUrl} alt={frame.filename} style={{ maxWidth: '100%', maxHeight: '85vh' }} />
        ) : (
          <p>Waiting for HDR merge…</p>
        )}
        {pending && <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 8 }}>Rendering…</p>}
        {err && <p role="alert" style={{ marginTop: 8, padding: 8, border: '1px solid #000' }}>{err}</p>}
      </main>
      <aside style={{ borderLeft: '1px solid #E5E5E5', padding: 16, overflowY: 'auto' }}>
        <PresetPicker selected={presetId} onSelect={(p) => onSliderChange({ ...(getPresetAdjustments(p) ?? {}) }, p)} />
        <SliderPanel value={adj} onChange={onSliderChange} />
        <HelperBar frameId={frame.id} onResult={(url) => setPreviewUrl(url)} />
        <button onClick={onSend} disabled={pending} style={sendBtn}>{pending ? 'Sending…' : 'Send →'}</button>
      </aside>
    </div>
  );
}

function getPresetAdjustments(presetId: string) {
  const { HDR_PRESETS } = require('@/lib/editor/presets');
  return HDR_PRESETS.find((p: any) => p.id === presetId)?.adjustments;
}

const sendBtn: React.CSSProperties = {
  marginTop: 24, width: '100%', background: '#000', color: '#fff',
  padding: '14px 24px', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
  border: '1px solid #000', cursor: 'pointer',
};
```

- [ ] **Step 3: Commit (do NOT build yet — PresetPicker/SliderPanel/HelperBar created in Tasks 18-20)**

```bash
git add app/admin/editor/shoots/[id]/frames/
git commit -m "feat(phase-4-v2): editor shell page + Editor client component"
```

---

### Task 18: PresetPicker component

**Files:**
- Create: `app/admin/editor/shoots/[id]/frames/[frameId]/PresetPicker.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/admin/editor/shoots/[id]/frames/[frameId]/PresetPicker.tsx
'use client';
import { HDR_PRESETS } from '@/lib/editor/presets';

export function PresetPicker({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={section}>HDR preset</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {HDR_PRESETS.map((p) => (
          <button key={p.id} onClick={() => onSelect(p.id)}
            style={{
              padding: '10px 8px', border: selected === p.id ? '2px solid #000' : '1px solid #E5E5E5',
              background: selected === p.id ? '#000' : '#fff',
              color: selected === p.id ? '#fff' : '#000',
              fontSize: 12, textAlign: 'left', cursor: 'pointer',
            }}>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>{p.label}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{p.blurb}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const section: React.CSSProperties = { fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 };
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/editor/shoots/[id]/frames/[frameId]/PresetPicker.tsx
git commit -m "feat(phase-4-v2): HDR preset picker"
```

---

### Task 19: SliderPanel component

**Files:**
- Create: `app/admin/editor/shoots/[id]/frames/[frameId]/SliderPanel.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/admin/editor/shoots/[id]/frames/[frameId]/SliderPanel.tsx
'use client';
import { SLIDER_KEYS, type Adjustments } from '@/lib/editor/adjustments';

const LABELS: Record<keyof Adjustments, string> = {
  exposure: 'Exposure', contrast: 'Contrast', temperature: 'Temperature', tint: 'Tint',
  highlights: 'Highlights', shadows: 'Shadows', whites: 'Whites', blacks: 'Blacks',
  saturation: 'Saturation', clarity: 'Clarity', dehaze: 'Dehaze', sharpening: 'Sharpening',
};

export function SliderPanel({ value, onChange }: { value: Adjustments; onChange: (next: Partial<Adjustments>) => void }) {
  return (
    <div>
      <h3 style={section}>Adjustments</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {SLIDER_KEYS.map((k) => (
          <label key={k} style={{ display: 'block', fontSize: 11 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
              <span>{LABELS[k]}</span>
              <span style={{ color: '#737373' }}>{value[k]}</span>
            </span>
            <input type="range" min={-100} max={100} value={value[k]}
              onChange={(e) => onChange({ [k]: Number(e.target.value) } as Partial<Adjustments>)}
              style={{ width: '100%', accentColor: '#000' }} />
          </label>
        ))}
      </div>
    </div>
  );
}
const section: React.CSSProperties = { fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8, marginTop: 16 };
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/editor/shoots/[id]/frames/[frameId]/SliderPanel.tsx
git commit -m "feat(phase-4-v2): 12-slider adjustment panel"
```

---

### Task 20: HelperBar with VariationPicker

**Files:**
- Create: `app/admin/editor/shoots/[id]/frames/[frameId]/HelperBar.tsx`
- Create: `app/admin/editor/shoots/[id]/frames/[frameId]/VariationPicker.tsx`

- [ ] **Step 1: VariationPicker**

```tsx
// app/admin/editor/shoots/[id]/frames/[frameId]/VariationPicker.tsx
'use client';

export type VariationOption = { id: string; label: string; blurb: string; thumb?: string };

export function VariationPicker({
  title, options, selected, onSelect,
}: {
  title: string;
  options: VariationOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ padding: 12, border: '1px solid #000', marginTop: 8 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</p>
      <div style={{ display: 'grid', gap: 6 }}>
        {options.map((o) => (
          <button key={o.id} onClick={() => onSelect(o.id)}
            style={{
              display: 'flex', gap: 8, alignItems: 'center', padding: '6px 8px',
              border: selected === o.id ? '2px solid #000' : '1px solid #E5E5E5',
              background: '#fff', cursor: 'pointer', textAlign: 'left',
            }}>
            <div style={{
              width: 44, height: 32, background: o.thumb ? `url(${o.thumb}) center/cover` : 'linear-gradient(135deg, #ccc, #444)',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{o.label}</div>
              <div style={{ fontSize: 10, color: '#737373' }}>{o.blurb}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: HelperBar**

```tsx
// app/admin/editor/shoots/[id]/frames/[frameId]/HelperBar.tsx
'use client';
import { useState } from 'react';
import { DUSK_VARIATIONS } from '@/lib/editor/dusk-variations';
import { SKY_VARIATIONS } from '@/lib/editor/sky-variations';
import { STAGING_STYLES } from '@/lib/editor/staging-styles';
import { VariationPicker } from './VariationPicker';

type ActiveHelper = 'dusk' | 'sky' | 'stage' | null;

export function HelperBar({ frameId, onResult }: { frameId: string; onResult: (url: string) => void }) {
  const [active, setActive] = useState<ActiveHelper>(null);
  const [variation, setVariation] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run(helper: any) {
    setBusy(true); setErr(null);
    try {
      const resp = await fetch('/api/editor/helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameId, helper }),
      });
      const j = await resp.json();
      if (!resp.ok) throw new Error(j.error || 'Helper failed');
      onResult(j.previewUrl);
      setActive(null); setVariation(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  async function runOneClick(type: 'declutter' | 'lawn' | 'fire' | 'ceiling') {
    await run({ type });
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={section}>AI helpers</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button style={btn} onClick={() => setActive(active === 'dusk' ? null : 'dusk')}>Day → dusk</button>
        <button style={btn} onClick={() => setActive(active === 'sky' ? null : 'sky')}>Sky replace</button>
        <button style={btn} onClick={() => setActive(active === 'stage' ? null : 'stage')}>Virtual stage</button>
        <button style={btn} onClick={() => runOneClick('declutter')}>Declutter</button>
        <button style={btn} onClick={() => runOneClick('lawn')}>Lawn enhance</button>
        <button style={btn} onClick={() => runOneClick('fire')}>Fire on</button>
        <button style={btn} onClick={() => runOneClick('ceiling')}>Ceiling brighten</button>
      </div>

      {active === 'dusk' && (
        <>
          <VariationPicker title="Dusk variation" options={DUSK_VARIATIONS}
            selected={variation} onSelect={setVariation} />
          <button style={generateBtn} disabled={!variation || busy}
            onClick={() => run({ type: 'dusk', variation })}>{busy ? 'Generating…' : 'Generate'}</button>
        </>
      )}
      {active === 'sky' && (
        <>
          <VariationPicker title="Sky variation" options={SKY_VARIATIONS}
            selected={variation} onSelect={setVariation} />
          <button style={generateBtn} disabled={!variation || busy}
            onClick={() => run({ type: 'sky', variation })}>{busy ? 'Generating…' : 'Generate'}</button>
        </>
      )}
      {active === 'stage' && (
        <>
          <VariationPicker title="Staging style" options={STAGING_STYLES}
            selected={variation} onSelect={setVariation} />
          <button style={generateBtn} disabled={!variation || busy}
            onClick={() => run({ type: 'stage', style: variation })}>{busy ? 'Generating…' : 'Generate'}</button>
        </>
      )}

      {err && <p role="alert" style={{ marginTop: 8, padding: 8, border: '1px solid #000' }}>{err}</p>}
    </div>
  );
}

const section: React.CSSProperties = { fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8, marginTop: 16 };
const btn: React.CSSProperties = { padding: '10px 8px', border: '1px solid #000', background: '#fff', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' };
const generateBtn: React.CSSProperties = { width: '100%', marginTop: 8, padding: '12px', background: '#000', color: '#fff', border: '1px solid #000', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer' };
```

- [ ] **Step 3: Build to confirm Editor + all panels compile**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/editor/shoots/[id]/frames/[frameId]/HelperBar.tsx app/admin/editor/shoots/[id]/frames/[frameId]/VariationPicker.tsx
git commit -m "feat(phase-4-v2): AI helper bar + variation picker"
```

---

### Task 21: Delivery endpoint — Dropbox + OUTBOUND Ops webhook

**Files:**
- Create: `app/api/editor/deliver/route.ts`
- Add to `.env.example`: `OPS_WEBHOOK_URL=`, `OPS_WEBHOOK_SECRET=`

- [ ] **Step 1: Implement**

```ts
// app/api/editor/deliver/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db, editors, shoots, frames } from '@/lib/db';
import { ensureFolder, uploadFromUrl } from '@/lib/dropbox/client';
import { buildReviewPath } from '@/lib/dropbox/paths';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const me = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!me) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { shootId } = await req.json() as { shootId: string };
  const shoot = await db.query.shoots.findFirst({ where: eq(shoots.id, shootId) });
  if (!shoot) return NextResponse.json({ error: 'Shoot not found' }, { status: 404 });

  const finalFrames = await db.select().from(frames)
    .where(and(eq(frames.shootId, shootId), eq(frames.status, 'exported')));

  if (finalFrames.length === 0) return NextResponse.json({ error: 'No exported frames to deliver' }, { status: 400 });

  const dropboxFolder = buildReviewPath(shoot.address);
  await ensureFolder(dropboxFolder);

  const delivered: { id: string; path: string }[] = [];
  for (const f of finalFrames) {
    if (!f.finalJpegUrl) continue;
    const path = await uploadFromUrl(f.finalJpegUrl, `${dropboxFolder}/${f.filename}.jpg`);
    delivered.push({ id: f.id, path });
  }

  await db.update(shoots).set({
    status: 'sent',
    dropboxFolder,
    sentAt: new Date(),
  }).where(eq(shoots.id, shootId));

  // OUTBOUND Ops webhook (optional — only fire if configured)
  if (process.env.OPS_WEBHOOK_URL) {
    try {
      await fetch(process.env.OPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPS_WEBHOOK_SECRET ?? ''}`,
        },
        body: JSON.stringify({
          source: 'won-vision',
          event: 'shoot.delivered',
          shoot: { id: shoot.id, address: shoot.address, dropboxFolder },
          frames: delivered,
          deliveredAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('OPS webhook failed:', err);
    }
  }

  return NextResponse.json({ ok: true, dropboxFolder, delivered });
}
```

- [ ] **Step 2: Wire UI** — modify `Editor.tsx` `onSend()` to POST to `/api/editor/deliver` after `exportFrame` succeeds. The shoot-level Send may be moved to the shoots/[id]/page (sending all exported frames at once) — implementer choice.

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add app/api/editor/deliver/route.ts .env.example
git commit -m "feat(phase-4-v2): delivery endpoint — Dropbox + OUTBOUND Ops webhook"
```

---

### Task 22: Env vars + Vercel setup

- [ ] **Step 1:** Document new env vars in `.env.example`:
  - `OPS_WEBHOOK_URL` — OUTBOUND Operations webhook URL (Kiran will provide once we know the endpoint contract)
  - `OPS_WEBHOOK_SECRET` — shared secret for OPS auth

- [ ] **Step 2:** Kiran adds these to Vercel env (Production / Preview / Development).

- [ ] **Step 3:** Commit the `.env.example` update + push.

```bash
git add .env.example
git commit -m "docs(phase-4-v2): document OPS_WEBHOOK_* env vars"
git push origin main
```

---

### Task 23: Manual end-to-end smoke

- [ ] Kiran AirDrops or uploads 3 sample bracketed ARW files from a real A7R V shoot.
- [ ] Open `https://wonvision.com.au/admin/editor/shoots/new` → create a test shoot.
- [ ] Drop in the 3 ARW files → confirm frame appears with status `merging`.
- [ ] Wait up to ~60 seconds for the merge endpoint to render the 16-bit base. Frame status flips to `ready`.
- [ ] Click into the frame → editor loads with the standard preset preview.
- [ ] Move each slider, confirm preview updates within ~500ms.
- [ ] Switch presets — preview updates instantly.
- [ ] Run `Day → dusk` with `Blue Hour` variation. Wait ~20s. Preview replaces.
- [ ] Run `Virtual stage` with `Scandinavian` style. Wait ~20s. Preview replaces.
- [ ] Click `Send →`. Confirm Dropbox `/Virtual Editing/02 EDITOR REVIEW/<slug>/` populates with the final JPEG.
- [ ] Confirm a `shoot.delivered` POST hits the OPS webhook (or 200s with no `OPS_WEBHOOK_URL` set, no-op).

---

### Task 24: Old schema cleanup

**Files:**
- Modify: `lib/db/schema.ts`
- Create: `lib/db/migrations/0005_drop_phase3_tables.sql`

- [ ] **Step 1:** Remove the `properties` and `photos` exports from `schema.ts` (they have no more references after Tasks 1+2 removed the intake form). Remove `tierEnum`, `paymentStatusEnum`, `propertyStatusEnum`, `photoStatusEnum`, `photoServiceEnum`, `editorDecisionEnum` if unused.

- [ ] **Step 2:** Generate + apply migration

```bash
npx drizzle-kit generate --name drop_phase3_tables
npx dotenv -e .env.local -- npx drizzle-kit migrate
```

- [ ] **Step 3:** Build + commit + push

```bash
npm run build
git add lib/db/schema.ts lib/db/migrations/
git commit -m "chore(phase-4-v2): drop obsolete properties/photos tables"
git push origin main
```

---

### Task 25: Roadmap update

- [ ] **Step 1:** Update `docs/superpowers/plans/2026-05-07-won-vision-photo-editor-roadmap.md`:
  - Mark Phase 4 v1 ❌ SHELVED with date 2026-05-12 (replaced by photographer-editor pipeline)
  - Add Phase 4 v2 (this plan) status: shipped on completion of Tasks 1-24
  - Reframe Phase 5 as: A7R V FTP direct-import + property websites + agent portal
  - Reframe Phase 6 as: native iOS/Android apps

- [ ] **Step 2:** Commit + push.

```bash
git add docs/superpowers/plans/2026-05-07-won-vision-photo-editor-roadmap.md
git commit -m "docs: phase 4 v2 (photographer editor) shipped — v1 shelved"
git push
```

---

## Out of scope (Phase 5+)

- Sony A7R V FTP direct-from-camera import (Phase 5)
- Photographer-team multi-user (account-scoped shoots, ownership) — currently any editor sees all shoots; tighten later
- Reference image library generation for the variation pickers — deferred until Kiran provides interior/exterior sample bases
- Brush-based object removal (multi-mask) — Fotello-style; Phase 6
- Property websites + agent portal — Phase 6
- iOS / Android native apps — Phase 7
- Order forms + Stripe payment collection — Phase 7+
- Lightroom plugin — Phase 8+
