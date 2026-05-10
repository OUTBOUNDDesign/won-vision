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
