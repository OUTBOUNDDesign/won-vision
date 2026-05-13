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
  'queued',
  'processing',
  'review',
  'approved',
  'delivered',
  'cancelled',
]);
export const photoStatusEnum = pgEnum('photo_status', [
  'pending',
  'queued',
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
  magicLinkToken: text('magic_link_token').unique(),               // ← nullable now
  submittedById: uuid('submitted_by_id').references(() => editors.id),
  workflowRunId: text('workflow_run_id'),
  processingError: text('processing_error'),
  processingStartedAt: timestamp('processing_started_at', { withTimezone: true }),
});

export const photos = pgTable('photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  originalBlobUrl: text('original_blob_url'),                      // ← new
  originalDropboxPath: text('original_dropbox_path'),              // ← nullable now (Phase 4 fills)
  filename: text('filename'),                                      // ← new (nullable for existing rows)
  services: text('services').array().notNull().default(sql`ARRAY[]::text[]`),
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
  qaAttempts: integer('qa_attempts').notNull().default(0),
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

// ── Phase 4 v2: photographer pipeline ────────────────────────────────────────

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
  photographerId: uuid('photographer_id').references(() => editors.id),
  address: text('address').notNull(),
  contactEmail: text('contact_email').notNull(),
  status: shootStatusEnum('status').notNull().default('draft'),
  opsJobId: text('ops_job_id'),
  opsJobRef: text('ops_job_ref'),
  opsTenantSlug: text('ops_tenant_slug'),
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
