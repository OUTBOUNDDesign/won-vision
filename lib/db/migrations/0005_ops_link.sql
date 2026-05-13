ALTER TABLE "shoots" ALTER COLUMN "photographer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shoots" ADD COLUMN "ops_job_ref" text;--> statement-breakpoint
ALTER TABLE "shoots" ADD COLUMN "ops_tenant_slug" text;--> statement-breakpoint
CREATE UNIQUE INDEX "shoots_ops_job_id_unique" ON "shoots" ("ops_job_id") WHERE "ops_job_id" IS NOT NULL;
