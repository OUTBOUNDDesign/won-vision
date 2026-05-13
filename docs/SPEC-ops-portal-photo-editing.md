# SPEC — Won Vision ↔ Ops Portal Photo-Editing Workflow

**Status:** Locked contract · Implementation pending
**Date:** 2026-05-13
**Owner:** Kiran
**Scope:** Cross-repo (`won-vision` + `outbound-ops`)
**Tenant scope:** Won Vision tenant only on Ops

---

## 1. Purpose

Connect three systems so an agent can book a shoot, review the resulting HDR photos in the Ops client portal, pick which photos need virtual editing, pay, and receive the edits back — without any of it touching the Won Vision /book cart.

Editing is **selected post-shoot, never pre-booked**.

---

## 2. End-to-end flow

1. Agent books on wonvision.com.au → cart submit creates a Job in Ops (existing `booking-submit.js` helper).
2. **On job creation in Ops** → outbound webhook to `won-vision` creates a Vision Studio property auto-populated with the Ops job's address + ref number.
3. Shoot happens. Photographer runs Vision Studio's HDR pipeline.
4. **On HDR export complete in Vision Studio** → for each photo, Vision Studio writes:
   - **Preview JPEG** (web-sized, ≈1MB) → Vercel Blob → permanent URL, served in the Ops portal gallery
   - **Master file** → stays in Dropbox at full resolution — this is the file the editor pipeline operates on
   - The JPEG is **never edited**. It is a viewport only.
5. Vision Studio POSTs the photo manifest to Ops `/api/portal/hdr-delivered` (HMAC-signed) with `{property_id, photos: [{id, dropbox_path, preview_url, width, height}]}`.
6. Agent opens Won Vision client portal in Ops → sees the HDR gallery for their property.
7. Agent ticks photos + selects per-photo edits (multi-select from: virtual staging, decluttering, day-to-dusk, sky replacement, grass enhancement, object removal). Price updates live in the UI.
8. Agent submits → chooses Stripe or Invoice.
   - **Stripe:** Stripe Checkout, paid before edit fires.
   - **Invoice:** edits fire immediately; line items merged into the existing Ops job's invoice.
9. Ops POSTs the edit request to `won-vision` `/api/vision-studio/edit-request` (HMAC-signed) — **auto-fire, no manual approval gate**.
10. Vision Studio runs each requested edit against the **Dropbox master**, writes the resulting image back to Dropbox + a new preview JPEG to Vercel Blob.
11. Vision Studio POSTs `/api/portal/edits-delivered` to Ops → portal gallery refreshes with a second wave showing the edited variants alongside originals.
12. Agent can request a free revision per edit (v1) — same submit flow, same endpoint, no charge.

---

## 3. Storage model (locked)

| Layer | Service | Purpose | Lifecycle |
|---|---|---|---|
| Master HDR | Dropbox | Source of truth · what edits run against | Permanent |
| Preview JPEG | Vercel Blob | Portal gallery render · fast `next/image` thumbnails | Permanent (delete only if property is deleted) |
| Master edited | Dropbox | Source of truth for delivered virtual edits | Permanent |
| Preview edited | Vercel Blob | Portal display of edited variant | Permanent |
| "Download" action | Ops portal → Dropbox temporary link API | Agent grabs full-res | On-demand, link expires per Dropbox default (~4 h) |

**Decision rationale:** Blob delivers fast image rendering with permanent URLs (~$0.15/GB·mo, ~50MB per property). Dropbox stays the master so edits operate at full quality and existing studio archive flow is unchanged.

---

## 4. Pricing engine

All prices ex-GST. 20% launch promo applies until 31 Dec 2026, stacks with volume tiers.

| Service | Rate |
|---|---|
| Virtual staging | Volume-tiered per image: 1–3 = $35, 4–9 = $28, 10+ = $25 |
| Day-to-dusk | $20 / image |
| Decluttering | $15 / image |
| Sky replacement | $15 / image |
| Grass enhancement | $10 / image |
| Object removal | $20 / image |

**Volume tier rule:** Tier is computed across *all virtual-staging selections in a single submit*, not per photo. Adding 4 staged images switches the whole batch to the $28/img rate. Tier breaks shown to the agent live as they tick.

**Promo:** Applied as a line-item discount at checkout / on the invoice. Visible in the UI as crossed-out original price + promo price.

---

## 5. Payment

### 5.1 Stripe path
- Stripe Checkout session created on submit.
- Edit request **does not fire** until Stripe webhook confirms payment.
- Edit request **does fire** the moment payment is confirmed.
- Receipt: Stripe-native email + Ops portal stores reference.

### 5.2 Invoice path
- Edit request fires immediately on submit.
- Line items appended to the existing Ops job invoice (one invoice per job — confirmed by Kiran).
- If the job invoice has already been issued, a supplementary invoice is created with `parent_invoice_ref` linking back to the original. **(Open question — see §10.)**
- Standard 14-day terms (per the Won Vision pricing doc).

---

## 6. API contracts

All cross-repo calls authenticated with HMAC-SHA256 over the raw body using a shared secret stored in env (`OPS_VISION_SECRET`). Header: `X-Signature: sha256=<hex>`. Idempotency-Key header required on every request.

### 6.1 Ops → Vision Studio: property-from-job

**Trigger:** Job created in Ops (Won Vision tenant only)
**Endpoint:** `POST https://wonvision.com.au/api/vision-studio/property-from-job`
**Body:**
```json
{
  "ops_job_id": "string",
  "ops_job_ref": "WV-2026-0042",
  "address": {
    "formatted": "12 Smith St, Carlton VIC 3053",
    "unit": "4",
    "street": "12 Smith St",
    "suburb": "Carlton",
    "state": "VIC",
    "postcode": "3053",
    "lat": -37.798,
    "lng": 144.971
  },
  "agent": { "name": "string", "email": "string", "phone": "string" },
  "shoot_date": "2026-05-20",
  "booked_services": ["sales_standard_upgrade", "twilight"]
}
```
**Response:** `201 { "vision_property_id": "string" }`

### 6.2 Vision Studio → Ops: HDR delivered

**Trigger:** Vision Studio export pipeline finishes
**Endpoint:** `POST https://<ops-domain>/api/portal/hdr-delivered`
**Body:**
```json
{
  "vision_property_id": "string",
  "ops_job_id": "string",
  "photos": [
    {
      "id": "photo_abc123",
      "dropbox_path": "/wonvision/2026-05/12-smith-st/hdr/IMG_0001.tif",
      "preview_url": "https://blob.vercel-storage.com/.../IMG_0001.jpg",
      "width": 1600,
      "height": 1067,
      "room_hint": "kitchen|living|master|exterior|null",
      "captured_at": "2026-05-20T14:32:00+10:00"
    }
  ]
}
```
**Response:** `200 { "received": 24 }`

### 6.3 Ops → Vision Studio: edit request

**Trigger:** Agent submits portal selection (after payment confirmed if Stripe; immediately if Invoice)
**Endpoint:** `POST https://wonvision.com.au/api/vision-studio/edit-request`
**Body:**
```json
{
  "vision_property_id": "string",
  "ops_job_id": "string",
  "edit_request_id": "string",
  "is_revision_of": "edit_request_id | null",
  "billing": {
    "method": "stripe|invoice",
    "stripe_session_id": "string | null",
    "ops_invoice_id": "string | null",
    "amount_aud_ex_gst": 235.20,
    "promo_applied": true
  },
  "photos": [
    {
      "photo_id": "photo_abc123",
      "dropbox_path": "/wonvision/.../IMG_0001.tif",
      "edits": ["staging", "declutter"]
    }
  ]
}
```
**Response:** `202 { "edit_request_id": "string", "estimated_completion": "2026-05-21T09:00:00+10:00" }`

### 6.4 Vision Studio → Ops: edits delivered

**Trigger:** Edit pipeline finishes (per-photo, or per-batch — see §10)
**Endpoint:** `POST https://<ops-domain>/api/portal/edits-delivered`
**Body:**
```json
{
  "edit_request_id": "string",
  "results": [
    {
      "photo_id": "photo_abc123",
      "edit_type": "staging",
      "variant_dropbox_path": "/wonvision/.../IMG_0001_staged.tif",
      "variant_preview_url": "https://blob.../IMG_0001_staged.jpg"
    }
  ]
}
```

---

## 7. Database additions

### 7.1 Ops side
- `won_vision_properties` (one row per Vision Studio property linked to a job)
  - `id`, `ops_job_id` FK, `vision_property_id`, `created_at`
- `hdr_photos`
  - `id`, `won_vision_property_id` FK, `vision_photo_id` UNIQUE, `dropbox_path`, `preview_blob_url`, `width`, `height`, `room_hint`, `captured_at`, `created_at`
- `edit_requests`
  - `id`, `won_vision_property_id` FK, `is_revision_of` self-FK nullable, `billing_method` enum, `stripe_session_id`, `ops_invoice_id`, `amount_cents`, `promo_applied` bool, `status` enum(`pending_payment`, `processing`, `partial`, `complete`, `failed`), `submitted_at`, `completed_at`
- `edit_request_items`
  - `id`, `edit_request_id` FK, `hdr_photo_id` FK, `edit_types` text[], `unit_price_cents`, `status` enum(`pending`, `delivered`, `failed`)
- `edit_results`
  - `id`, `edit_request_item_id` FK, `edit_type` enum, `variant_dropbox_path`, `variant_preview_blob_url`, `delivered_at`

### 7.2 Vision Studio side
Extend existing `properties` table:
- Add nullable `ops_job_id`, `ops_job_ref`, `ops_tenant_slug` columns to link back when a property originated from an Ops job.

New table:
- `edit_requests_inbound` mirroring the §6.3 payload + processing state.

---

## 8. Client portal UX (Ops side)

### 8.1 Property detail page (existing or new)
- Header: address, ref, shoot date, status pill (`Awaiting shoot` → `HDR delivered` → `Edits in progress` → `Complete`)
- Tabs: **Gallery** (default) · **Floor plans** · **Documents** · **Invoice**

### 8.2 Gallery tab
- Grid of HDR photos, lazy-loaded via `next/image` from Blob.
- Each card: thumbnail, room hint label, "edit me" toggle.
- Top-right: filter chips (`All`, `Selected for editing`).
- Bottom-right: persistent **Edit cart drawer** showing per-photo selected edits + running total + tier-break hint (e.g. "Add 1 more staging to hit volume tier — save $28").
- Hovering a photo in the cart highlights it in the grid.

### 8.3 Per-photo edit picker
- Click "edit me" → modal with the 6 edit options as toggles.
- Multi-select allowed (a photo can have staging + sky replacement).
- Preview area shows the source.
- Save closes modal, updates the cart.

### 8.4 Submit
- "Submit & pay" button → step screen:
  - Choose Stripe or Invoice (radio).
  - Stripe → redirect to Checkout.
  - Invoice → confirm, fire.
- Confirmation page: "Submitted — estimated delivery [date]. You'll get an email when ready."

### 8.5 Second-wave delivery
- When edits return, portal shows new badges on each photo: a small "S/D/D2D/Sky/G/OR" chip stack.
- Each chip click expands to show the edited variant + "Request revision" link (v1 free).

---

## 9. Acceptance criteria

The build is complete when **all** of the following are true:

1. A new Ops job for the Won Vision tenant triggers a Vision Studio property within 30 s, carrying the address + ref.
2. Vision Studio's HDR export writes preview JPEGs to Blob and posts the manifest to Ops; Ops portal gallery renders all photos within 5 s of the manifest webhook.
3. Agent can toggle photos + edits and see the price update with correct volume-tier math AND launch promo applied.
4. Stripe path: edit request only fires after Stripe webhook payment confirmation.
5. Invoice path: edit request fires immediately, and Ops shows the new line items on the job invoice (or supplementary).
6. Vision Studio receives the edit request, runs against Dropbox masters (not previews), and posts results back.
7. Portal gallery shows edited variants as a second wave alongside originals.
8. Agent can request a free revision once per delivered edit in v1.
9. All cross-repo calls reject unsigned or replayed requests (HMAC + Idempotency-Key enforced).
10. The Won Vision /book cart contains zero virtual-editing line items — editing surfaces only in the Ops portal.

---

## 10. Open questions (resolve before kicking off implementation milestones)

1. **Invoice supplementary behaviour.** When edits are added after the job invoice has been issued, do we (a) append to the existing invoice and re-issue, (b) create a separate supplementary invoice linked to the original, or (c) hold edits until the invoice is finalised? Default proposed: **(b) supplementary**.
2. **Edit delivery granularity.** Does Vision Studio post `edits-delivered` per photo as each one finishes, or only when the whole batch is done? Per-photo gives faster perceived turnaround; batch is simpler. Default proposed: **per-photo with debounce (max 1 POST / 30 s)**.
3. **Vision Studio export trigger.** Today the editor runs in `app/admin/editor/new` interactively. Do we add an "Export to portal" action there, or have an auto-export step in the existing pipeline? Default proposed: **explicit "Export to portal" button per property — gives photographer a final review gate**.
4. **Notification to agent.** When HDR lands and when edits land, does the agent get an email/SMS? If so, which channel and from which service (Ops's existing notification stack)? Default proposed: **email from Ops, no SMS in v1**.
5. **Revision counter cap.** "Free revision" — is that one free revision per edit, or unlimited free revisions in v1? Default proposed: **one free revision per delivered edit**.
6. **Edit failure path.** If Vision Studio fails to process an edit (e.g. virtual staging engine errors), how does that surface to the agent? Default proposed: **portal shows "couldn't process" on the photo + auto-refund / invoice credit**.

---

## 11. Out of scope (v1)

- Non-Won-Vision Ops tenants — this UI is gated to the Won Vision tenant.
- 3D Matterport tours (doc flags as phase 2).
- AI tagging / room-hint auto-detection — `room_hint` ships as nullable, filled manually or by Vision Studio if convenient.
- Multi-agent collaboration in the portal (only the booking agent sees the gallery).
- Bulk-edit shortcuts (e.g. "stage all kitchens") — single-photo selection only in v1.
- Public share links of the edited gallery — internal portal only.
- Revision counting/billing beyond v1's free policy.

---

## 12. Next steps

1. **Resolve §10 open questions** with Kiran.
2. **Split into two repo milestones**:
   - `won-vision`: property-from-job endpoint, HDR export → Blob, edit-request endpoint, edit pipeline trigger, edits-delivered POST.
   - `outbound-ops`: portal gallery, photo-picker UI, live-price engine, Stripe + invoice submit, two inbound webhook handlers.
3. **Optionally**: `/gsd-new-milestone` in each repo to formalise planning if/when GSD is initialised there.
