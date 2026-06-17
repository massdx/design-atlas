import { users } from "@/features/auth/schema";
import { categories } from "@/features/categories/schema";
import { sql } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const resourceStatusEnum = pgEnum("resource_status", [
    "pending",
    "approved",
    "rejected",
]);

export const resourceTypeEnum = pgEnum("resource_type", ["external", "file"]);

/**
 * Ressources soumises. Une ressource peut être soumise sans être connecté
 * (submittedBy nullable) et doit être approuvée par un admin pour être
 * visible publiquement.
 */
export const resources = pgTable(
    "resources",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        url: text("url").notNull(),
        type: resourceTypeEnum("type").notNull().default("external"),
        fileKey: text("file_key"),
        fileSize: text("file_size"),
        fileMimeType: text("file_mime_type"),
        imageUrl: text("image_url"),
        description: text("description"),
        categoryId: uuid("category_id").references(() => categories.id, {
            onDelete: "set null",
        }),
        tags: text("tags")
            .array()
            .notNull()
            .default(sql`'{}'::text[]`),
        status: resourceStatusEnum("status").notNull().default("pending"),
        submittedByEmail: text("submitted_by_email"),
        reviewedBy: uuid("reviewed_by").references(() => users.id, {
            onDelete: "set null",
        }),
        reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (t) => [
        index("resources_status_idx").on(t.status),
        index("resources_category_idx").on(t.categoryId),
        index("resources_created_at_idx").on(sql`${t.createdAt} DESC`),
    ],
);

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
