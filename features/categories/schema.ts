import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Catégories listées (ex: "Typography", "Color", "Components", ...).
 * Gérées par les admins.
 */
export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    color: text("color"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
