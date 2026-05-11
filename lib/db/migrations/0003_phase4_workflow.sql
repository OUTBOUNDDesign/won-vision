ALTER TYPE "public"."photo_status" ADD VALUE 'queued' BEFORE 'processing';--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "qa_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "workflow_run_id" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "processing_error" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "processing_started_at" timestamp with time zone;