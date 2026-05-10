ALTER TYPE "public"."property_status" ADD VALUE 'queued' BEFORE 'processing';--> statement-breakpoint
ALTER TABLE "photos" ALTER COLUMN "original_dropbox_path" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "magic_link_token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "original_blob_url" text;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "filename" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "submitted_by_id" uuid;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_submitted_by_id_editors_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."editors"("id") ON DELETE no action ON UPDATE no action;