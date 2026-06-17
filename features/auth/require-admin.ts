import "server-only";

import { db } from "@/lib/db";
import { eq, or } from "drizzle-orm";
import { users, type User } from "./schema";
import { auth } from "./server";

export type AdminResult =
    | { ok: true; user: User }
    | { ok: false; error: string };

/**
 * Resolves the current admin moderator without throwing.
 * Returns a discriminated result so server actions can surface
 * a clean `{ error }` payload to the client.
 */
export async function getAdmin(): Promise<AdminResult> {
    try {
        const { data: session } = await auth.getSession();
        const sessionUser = session?.user;
        if (!sessionUser) return { ok: false, error: "Unauthorized" };

        const email = sessionUser.email;
        if (!email) return { ok: false, error: "Unauthorized" };

        const existing = await db
            .select()
            .from(users)
            .where(or(eq(users.authUserId, sessionUser.id), eq(users.email, email)))
            .limit(1);

        if (existing.length > 0) {
            const row = existing[0];
            if (!row.isAdmin) return { ok: false, error: "Forbidden" };
            if (row.authUserId !== sessionUser.id) {
                const [updated] = await db
                    .update(users)
                    .set({
                        authUserId: sessionUser.id,
                        name: sessionUser.name ?? row.name,
                    })
                    .where(eq(users.id, row.id))
                    .returning();
                return { ok: true, user: updated };
            }
            return { ok: true, user: row };
        }

        const [created] = await db
            .insert(users)
            .values({
                authUserId: sessionUser.id,
                email,
                name: sessionUser.name ?? null,
            })
            .returning();
        return { ok: true, user: created };
    } catch (err) {
        console.error("[getAdmin] failed:", err);
        return {
            ok: false,
            error: err instanceof Error ? err.message : "Auth error",
        };
    }
}

