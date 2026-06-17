import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Utilisateurs internes (admins / modérateurs).
 * L'identifiant `authUserId` correspond à l'utilisateur Neon Auth.
 * Toute personne authentifiée via Neon Auth qui apparaît ici peut modérer.
 */
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    authUserId: text("auth_user_id").notNull().unique(),
    email: text("email").notNull().unique(),
    name: text("name"),
    isAdmin: boolean("is_admin").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
