ALTER TABLE "photos" DROP COLUMN "service";--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "services" text[] NOT NULL DEFAULT ARRAY[]::text[];--> statement-breakpoint
DROP TYPE IF EXISTS "public"."photo_service";
