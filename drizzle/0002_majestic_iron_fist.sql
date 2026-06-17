ALTER TABLE "categories" DROP CONSTRAINT "categories_slug_unique";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "description";