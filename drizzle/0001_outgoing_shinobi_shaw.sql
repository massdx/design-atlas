CREATE TYPE "public"."resource_type" AS ENUM('external', 'file');--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "type" "resource_type" DEFAULT 'external' NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "file_key" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "file_size" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "file_mime_type" text;