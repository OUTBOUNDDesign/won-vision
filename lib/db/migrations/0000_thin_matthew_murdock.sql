CREATE TYPE "public"."editor_decision" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."editor_role" AS ENUM('admin', 'editor');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."photo_service" AS ENUM('declutter', 'stage', 'dusk', 'declutter-stage');--> statement-breakpoint
CREATE TYPE "public"."photo_status" AS ENUM('pending', 'processing', 'review', 'approved', 'delivered', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('draft', 'intake', 'processing', 'review', 'approved', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."property_tier" AS ENUM('small', 'standard', 'large');--> statement-breakpoint
CREATE TABLE "editors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "editor_role" DEFAULT 'editor' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "editors_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "editors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"original_dropbox_path" text NOT NULL,
	"service" "photo_service" NOT NULL,
	"style" text,
	"workflow_run_id" text,
	"variant_1_path" text,
	"variant_2_path" text,
	"qa_score" integer,
	"qa_pass" boolean,
	"qa_issues" jsonb,
	"editor_decision" "editor_decision" DEFAULT 'pending' NOT NULL,
	"approved_variant" integer,
	"status" "photo_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" text NOT NULL,
	"contact_email" text NOT NULL,
	"tier" "property_tier" NOT NULL,
	"photo_count" integer NOT NULL,
	"stripe_session_id" text,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"status" "property_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone,
	"magic_link_token" text NOT NULL,
	CONSTRAINT "properties_magic_link_token_unique" UNIQUE("magic_link_token")
);
--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;