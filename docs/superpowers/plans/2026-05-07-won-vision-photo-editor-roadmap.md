# Won Vision AI Photo Editor — Master Roadmap

**Created:** 2026-05-07
**Status:** Phase 0 (planning) — Phase 1 plan written, ready to execute

> **For agentic workers:** This is a multi-phase build. Each phase has its own plan file. Always start with the latest unfinished phase plan. Use superpowers:subagent-driven-development to execute each phase.

---

## Goal

Add a 4K-native AI photo editing service to wonvision.com.au — clients submit a property, upload photos, choose which service each photo needs (declutter / stage / day-to-dusk / declutter+stage), pay per property, and receive 4K AI-edited results after editor verification.

## Architecture

Migrate the existing static HTML site at `~/Code/won-media/` to **Next.js 16 App Router on Vercel**. Marketing pages stay server-rendered; the new `/editor` subtree adds the photo editor flow. Backend is Next.js route handlers calling **fal.ai** (Seedream 4.5 + Nano Banana Pro at native 4K), **Gemini 2.5 Pro** for multimodal QA, and the **Dropbox API** for the `/Virtual Editing/` folder pipeline. The durable processing pipeline runs on **Vercel Workflow DevKit** — no n8n, no separate server.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router on Vercel |
| Database | Neon Postgres (Vercel Marketplace, auto-provisioned env) |
| Auth | Clerk (Vercel Marketplace) — admin/editor only; clients are anonymous |
| Payments | Stripe Checkout (hosted) |
| Workflow | Vercel Workflow DevKit |
| AI image (declutter) | Seedream 4.5 on fal.ai (4K native) |
| AI image (stage / dusk) | Nano Banana Pro on fal.ai (4096×4096 native) |
| AI QA | Gemini 2.5 Pro multimodal (Google AI Studio API) |
| File storage | Dropbox (`/Virtual Editing/` parent folder) |
| Email | Resend (transactional) |
| Hosting | Vercel (existing project linked via `.vercel/`) |

---

## Locked Decisions (2026-05-07)

1. **4K NATIVE ONLY.** Every image is generated at the model's native 4K (4096px long edge). No Real-ESRGAN, no Topaz, no upscaling step in the pipeline ever. If a model can't do 4K natively it is not in the stack.
2. **Pricing model: per-property, tiered by photo count.** Placeholder tiers (final prices TBD by Kiran):
   - Small (up to 10 photos): $X
   - Standard (up to 25 photos): $Y
   - Large (up to 50 photos): $Z
   No client accounts. Anonymous submit → Stripe Checkout → magic-link email when ready (Baker pattern).
3. **Editor verification is a hard human gate.** AI output never goes to the client until the editor moves the file `/02 EDITOR REVIEW/ → /03 APPROVED/` via the admin UI. Skipping this is not allowed.
4. **No third-party workflow tool.** All durable processing in Vercel Workflow DevKit inside the Next.js app.
5. **Per-photo service tagging.** Inside one property submission, each photo is tagged with which service(s) it needs. The pipeline routes each photo independently.

---

## Dropbox Folder Structure

```
/Virtual Editing/
  /00 INTAKE/{property_address}/        ← originals land here from website upload
    _job_info.json
    00_ORIGINAL_{name}
  /01 AI PROCESSING/{property_address}/ ← workflow moves here when picked up
    {photo_id}_v1_{name}
    {photo_id}_v2_{name}
  /02 EDITOR REVIEW/{property_address}/ ← awaits human approval
  /03 APPROVED/{property_address}/      ← editor moves accepted variants here
  /04 DELIVERED/{property_address}/     ← published to client portal + emailed
  /99 REJECTED/{property_address}/      ← failed QA, retry or kill
  /ARCHIVE/                              ← mirrored to Backblaze B2 monthly
```

---

## Database Schema (preview — locked in Phase 2)

```sql
-- properties: one row per client submission
properties (
  id uuid pk,
  address text,
  contact_email text,
  tier text,              -- 'small' | 'standard' | 'large'
  photo_count int,
  stripe_session_id text,
  payment_status text,    -- 'pending' | 'paid' | 'failed'
  status text,            -- 'intake' | 'processing' | 'review' | 'approved' | 'delivered'
  created_at timestamptz,
  delivered_at timestamptz,
  magic_link_token text   -- for client portal access
);

-- photos: per-photo records inside a property
photos (
  id uuid pk,
  property_id uuid fk,
  original_dropbox_path text,
  service text,           -- 'declutter' | 'stage' | 'dusk' | 'declutter-stage'
  style text,             -- staging style preset (only for stage/declutter-stage)
  workflow_run_id text,
  variant_1_path text,
  variant_2_path text,
  qa_score int,
  qa_pass bool,
  qa_issues jsonb,
  editor_decision text,   -- 'approved' | 'rejected' | 'pending'
  approved_variant int,   -- 1 or 2
  status text             -- 'pending' | 'processing' | 'review' | 'approved' | 'delivered' | 'rejected'
);

-- editors: admin users (Clerk-backed)
editors (
  id uuid pk,
  clerk_user_id text unique,
  email text,
  role text               -- 'admin' | 'editor'
);
```

---

## Phases

Each phase ships independently and produces working software. Plan files for phases 2-7 are written as we begin each phase.

### Phase 1 — Static HTML → Next.js migration ✅ SHIPPED 2026-05-08
**Plan:** `2026-05-07-phase-1-nextjs-migration.md`
**Result:** wonvision.com.au runs on Next.js 16.2.5 with visual parity. PR #1 merged. 20-test Playwright suite green on prod.

### Phase 2 — Foundations: DB, auth, account model ✅ SHIPPED 2026-05-10
**Plan:** `2026-05-08-phase-2-db-auth-foundations.md`
**Result:** Drizzle ORM + Neon Postgres (properties / photos / editors), Clerk auth via Vercel Marketplace at custom domain `clerk.wonvision.com.au` (DNS verified at GoDaddy), hidden `/admin` route with DB-backed editor authorization, seed-editor CLI script. PR #2 merged + vercel.json fix. 4/4 admin auth tests + 6/6 redirects + 5/5 smoke green on prod. First editor (`main@wonvision.com.au`) seeded and verified working.

### Phase 3 — Property submission + Stripe Checkout ⬅ NEXT
**Outcome:** Public `/editor/new` flow: property details → upload photos → tag each with service → review → Stripe Checkout → confirmation page with magic-link email. No actual AI yet — payment + intake only.
**Depends on:** Phase 2.
**Open decisions to lock at start of plan:** real pricing tiers ($X/$Y/$Z), Stripe pre-created Price IDs vs dynamic, photo upload mechanism (direct-to-Dropbox vs Vercel Blob first), staging style preset count.

### Phase 4 — Vercel Workflow pipeline (fal.ai + Gemini QA + Dropbox)
**Outcome:** Paid properties trigger a durable workflow that uploads originals to Dropbox, calls fal.ai per photo (Seedream 4.5 / Nano Banana Pro at 4K), runs Gemini 2.5 Pro QA, retries once on fail, drops results into `/02 EDITOR REVIEW/`. End-to-end working with no editor UI.
**Depends on:** Phase 3.

### Phase 5 — Admin / editor portal
**Outcome:** Clerk-protected `/admin` route on wonvision.com.au for editors. **Hidden URL, no public link from the marketing site nav** — editors type the URL or bookmark it. Lists properties in review, shows variant 1 vs variant 2 side-by-side, lets editor pick + approve or reject + retry. Approval triggers Dropbox move to `/03 APPROVED/` and queues delivery. On approval, fires a webhook to OUTBOUND Operations so Ops can update the corresponding job's status to "delivered" — Ops stays the source of truth on job state; Won Vision owns the editing workflow.
**Depends on:** Phase 4.

**Decided 2026-05-08:** Admin lives in the Won Vision Next.js app, NOT inside OUTBOUND Operations. Reasoning: (1) photo editing review UI is domain-specific and doesn't generalize across Ops tenants; (2) the Vercel Workflow pipeline lives in this codebase, so co-locating UI keeps it one repo / one deploy; (3) avoids bloating Ops with a vertical feature. Lightweight webhook integration with Ops on approval keeps job-state ownership in Ops.

### Phase 6 — Client delivery + magic-link portal
**Outcome:** When all photos in a property are approved, system moves to `/04 DELIVERED/`, sends client an email with magic-link, and the client's `/portal/{token}` page lets them download all 4K finals. Property status flips to delivered.
**Depends on:** Phase 5.

### Phase 7 — Tier 3 security pass + production launch
**Outcome:** Full 7-step security audit (secrets/env hygiene, input validation, auth boundaries, rate limiting on public submit, signed Dropbox URLs, mass-assignment review, OWASP top-10 sweep). Prod launch on wonvision.com.au.
**Depends on:** Phase 6.

---

## Out of Scope (v1)

- Mask-drawing UI (text prompt is enough for v1; revisit if QA fail rate >20%)
- Multi-tenant / agency white-label (single tenant: Won Vision)
- Mobile apps (responsive web only)
- Auto-retry beyond 1 attempt (failed jobs surface to editor)
- Few-shot QA library (revisit after 100+ approved renders)
- Backblaze B2 archive automation (manual mirror initially)

---

## Success Criteria

- [ ] Existing wonvision.com.au routes all serve identically post-migration
- [ ] Anonymous client can submit a property and pay via Stripe in <3 minutes
- [ ] Workflow processes a 10-photo property in <15 minutes end-to-end
- [ ] Editor can review and approve a property in <5 minutes via admin UI
- [ ] Every delivered image is native 4K (4096px long edge), zero upscaling
- [ ] T3 security pass clean (no critical, no high findings)
