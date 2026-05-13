# PLAN — Won Vision ↔ Ops Portal Photo-Editing

**SPEC:** `docs/SPEC-ops-portal-photo-editing.md`
**Status:** Phase 1 in progress
**Date:** 2026-05-13

Phased implementation order. Each phase is independently shippable — earlier phases stay useful even if later ones slip.

---

## Phase 1 — Foundations (won-vision)

**Goal:** Shared HMAC helper + property-from-job endpoint live.
**Why first:** Unblocks Ops → Vision Studio job sync. Smallest unit with the auth primitives every later phase needs.

Tasks:
1. `lib/crypto/hmac.ts` — sign + verify helpers using `OPS_VISION_SECRET` env, SHA-256 over raw body. Replay protection via `Idempotency-Key` header (in-memory LRU keyed by HMAC for 24 h is enough for v1).
2. `app/api/vision-studio/property-from-job/route.ts` — validates HMAC, creates a `properties` row (extends existing Vision Studio property schema with `ops_job_id`, `ops_job_ref`, `ops_tenant_slug` columns), returns `{ vision_property_id }`.
3. Drizzle migration adding the three columns to `properties`.
4. Env: add `OPS_VISION_SECRET` to `.env.example` + Vercel.

Ship: commit + push. Vercel deploys. No UI change.

---

## Phase 2 — Ops → Vision Studio sync (outbound-ops)

**Goal:** On Won Vision tenant job creation, POST to property-from-job endpoint.

Tasks:
1. Mirror `lib/crypto/hmac.ts` into ops repo (same signing function).
2. Hook into existing job-creation flow — fire async POST on commit, tenant-gated to Won Vision slug.
3. Store returned `vision_property_id` on the job row (Drizzle migration adds `won_vision_property_id` nullable column to `jobs`).
4. Retry-on-failure: simple pg-boss or SETTLED-status row in a `pending_vision_sync` table for hand-retry. No fancy queue.
5. Env: same `OPS_VISION_SECRET` in Ops Vercel.

Ship: a new Won Vision tenant job in Ops creates a matching Vision Studio property within 30 s.

---

## Phase 3 — HDR export + manifest (won-vision)

**Goal:** Photographer hits "Export to portal" — preview JPEGs land in Blob, manifest lands in Ops.

Tasks:
1. Extend Vision Studio editor with "Export to portal" button (per property, post-HDR).
2. Background job: for each finished HDR, generate web-sized JPEG (1600px long edge, 80 quality), upload to Vercel Blob.
3. Build manifest payload + POST to Ops `/api/portal/hdr-delivered` with HMAC.
4. Status on the property: `hdr_exported_at` timestamp.

Ship: photographer test on one property — Blob has previews, manifest lands.

---

## Phase 4 — Portal HDR receiver + gallery (outbound-ops)

**Goal:** Ops portal shows the HDR gallery.

Tasks:
1. Drizzle migration: `won_vision_properties`, `hdr_photos` tables (per SPEC §7.1).
2. `app/api/portal/hdr-delivered/route.ts` — HMAC verify, upsert rows.
3. Portal page extension: client portal → property → **Gallery** tab. Grid with `next/image` from `preview_blob_url`. Status pill updates.
4. Empty state, loading state, mobile grid (2-col per Kiran's mobile rule).

Ship: agent sees HDR photos in portal.

---

## Phase 5 — Photo picker + live pricing (outbound-ops)

**Goal:** Agent ticks photos + edits, sees live price with volume-tier math.

Tasks:
1. `lib/edit-pricing.ts` — pure function: takes `{ photoId, edits: EditType[] }[]` → returns line items + subtotal + promo discount. Volume tier computed across whole batch.
2. Photo edit modal (multi-select toggles for 6 edit types).
3. Persistent edit-cart drawer in the gallery.
4. Live total + tier-break hint UI.
5. Drizzle migration: `edit_requests`, `edit_request_items` (status enum, billing fields).

Ship: agent can build a basket, see live price, but submit is disabled.

---

## Phase 6 — Submit + Stripe + invoice (outbound-ops)

**Goal:** Agent can submit and pay.

Tasks:
1. Submit endpoint: creates `edit_requests` row with `status='pending_payment'` (Stripe) or `status='processing'` (invoice).
2. Stripe Checkout session for Stripe path. Stripe webhook flips status + fires the Vision Studio call.
3. Invoice path: append line items to existing job invoice (or create supplementary with `parent_invoice_ref`) + fire Vision Studio call immediately.
4. Ops → Vision Studio HMAC POST to `/api/vision-studio/edit-request`.
5. Confirmation page.
6. Email to agent: "submitted, expected delivery [date]".

Ship: end-to-end submit works (Vision Studio doesn't actually process yet, just acks).

---

## Phase 7 — Edit pipeline (won-vision)

**Goal:** Vision Studio actually runs the edits against Dropbox masters and posts results back.

Tasks:
1. `app/api/vision-studio/edit-request/route.ts` — HMAC verify, enqueue (n8n or in-app job runner).
2. Per-edit-type pipeline calls (existing virtual-staging stack from `project_won_vision_photo_editor.md` memory — Seedream + Nano Banana routing, Gemini QA).
3. On each edit complete: write edited master back to Dropbox, generate preview JPEG to Blob, POST `/api/portal/edits-delivered` to Ops (30 s debounce per `edit_request_id`).
4. Failure handling: per SPEC §10.6 — mark item `failed`, POST failure event to Ops which triggers credit.

Ship: agent submits, edits actually appear in portal within turnaround time.

---

## Phase 8 — Second-wave display + revisions (outbound-ops)

**Goal:** Portal shows edited variants, agent can request one free revision per edit.

Tasks:
1. `app/api/portal/edits-delivered/route.ts` — upsert `edit_results` rows.
2. Gallery UI: edit-type chip stack overlay on each photo. Click → expand to variant viewer.
3. Revision button per delivered edit. Submitting a revision creates a new `edit_requests` row with `is_revision_of` set + amount = $0, fires straight to Vision Studio.
4. Email to agent on "edits ready".

Ship: full loop closed.

---

## Phase 9 — Failure UI + credit flow (outbound-ops)

**Goal:** Failed edits surface cleanly + agent gets money back.

Tasks:
1. UI: "couldn't process — credit issued" on failed photos.
2. Stripe: programmatic refund on payment intent for failed line.
3. Invoice: credit note attached to the invoice.

Ship: failures aren't silent.

---

## Sequencing notes

- Phases 1, 2 can run back-to-back (small).
- Phase 3 needs Phase 1 endpoint live.
- Phase 4 needs Phase 3 sending manifests.
- Phases 5, 6 can run in parallel with Phase 7 once Phase 4 is done (Stripe + UI work doesn't block edit pipeline build).
- Phases 8, 9 land last.

## Test surfaces

- Manual: one staging property end-to-end after each phase.
- Automated: HMAC sign/verify unit tests, pricing engine unit tests (volume tier breakpoints), API contract tests with Vitest.

## Starting now

**Phase 1, all tasks.** Next push: HMAC helper + property-from-job endpoint + migration.
