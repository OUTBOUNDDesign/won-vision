CREATE TYPE "public"."frame_status" AS ENUM('draft', 'merging', 'ready', 'editing', 'exporting', 'exported', 'failed');--> statement-breakpoint
CREATE TYPE "public"."shoot_status" AS ENUM('draft', 'uploading', 'editing', 'sent', 'archived');--> statement-breakpoint
CREATE TABLE "frames" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shoot_id" uuid NOT NULL,
	"bracket_blob_urls" jsonb NOT NULL,
	"filename" text NOT NULL,
	"hdr_base_url" text,
	"preview_url" text,
	"final_jpeg_url" text,
	"adjustments" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"preset_id" text DEFAULT 'standard' NOT NULL,
	"applied_helpers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "frame_status" DEFAULT 'draft' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shoots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"photographer_id" uuid NOT NULL,
	"address" text NOT NULL,
	"contact_email" text NOT NULL,
	"status" "shoot_status" DEFAULT 'draft' NOT NULL,
	"ops_job_id" text,
	"dropbox_folder" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "frames" ADD CONSTRAINT "frames_shoot_id_shoots_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."shoots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoots" ADD CONSTRAINT "shoots_photographer_id_editors_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."editors"("id") ON DELETE no action ON UPDATE no action;