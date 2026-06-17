"use server";

import { getAdmin } from "@/features/auth/require-admin";
import { users } from "@/features/auth/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function inviteAdmin(rawEmail: string, rawName?: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };

        const email = rawEmail.trim().toLowerCase();
        const name = rawName?.trim() || null;
        if (!email) return { error: "Email requis" };
        if (!EMAIL_RE.test(email)) return { error: "Email invalide" };

        const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existing.length > 0) {
            const row = existing[0];
            if (row.isAdmin) return { error: "Cet email est déjà admin" };
            const [restored] = await db
                .update(users)
                .set({ isAdmin: true, name: name ?? row.name })
                .where(eq(users.id, row.id))
                .returning();
            revalidatePath("/manager/admins");
            return { id: restored.id, email: restored.email };
        }

        const [created] = await db
            .insert(users)
            .values({
                authUserId: `invite:${crypto.randomUUID()}`,
                email,
                name,
                isAdmin: true,
            })
            .returning();

        revalidatePath("/manager/admins");
        return { id: created.id, email: created.email };
    } catch (err) {
        console.error("[inviteAdmin] failed:", err);
        return {
            error: err instanceof Error ? err.message : "Échec de l'invitation",
        };
    }
}

export async function revokeAdmin(id: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };
        if (admin.user.id === id) {
            return { error: "Vous ne pouvez pas révoquer votre propre accès" };
        }

        await db.update(users).set({ isAdmin: false }).where(eq(users.id, id));
        revalidatePath("/manager/admins");
        return { success: true };
    } catch (err) {
        console.error("[revokeAdmin] failed:", err);
        return {
            error: err instanceof Error ? err.message : "Échec de la révocation",
        };
    }
}

export async function restoreAdmin(id: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };

        await db.update(users).set({ isAdmin: true }).where(eq(users.id, id));
        revalidatePath("/manager/admins");
        return { success: true };
    } catch (err) {
        console.error("[restoreAdmin] failed:", err);
        return {
            error: err instanceof Error ? err.message : "Échec",
        };
    }
}
