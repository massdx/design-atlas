"use server";

import { getAdmin } from "@/features/auth/require-admin";
import { db } from "@/lib/db";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { categories } from "./schema";

export async function createCategory(name: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };

        const trimmed = name.trim();
        if (!trimmed) return { error: "Name is required" };

        const existing = await db
            .select()
            .from(categories)
            .where(eq(categories.name, trimmed))
            .limit(1);
        if (existing.length > 0) {
            return { id: existing[0].id, name: existing[0].name };
        }

        const [created] = await db
            .insert(categories)
            .values({ name: trimmed })
            .returning();
        revalidatePath("/manager");
        revalidatePath("/manager/categories");
        revalidatePath("/");
        return { id: created.id, name: created.name };
    } catch (err) {
        console.error("[createCategory] failed:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to create category",
        };
    }
}

export async function updateCategory(id: string, name: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };

        const trimmed = name.trim();
        if (!trimmed) return { error: "Name is required" };

        const conflict = await db
            .select({ id: categories.id })
            .from(categories)
            .where(and(eq(categories.name, trimmed), ne(categories.id, id)))
            .limit(1);
        if (conflict.length > 0) {
            return { error: "Another category already uses this name" };
        }

        const [updated] = await db
            .update(categories)
            .set({ name: trimmed })
            .where(eq(categories.id, id))
            .returning();
        if (!updated) return { error: "Category not found" };

        revalidatePath("/manager");
        revalidatePath("/manager/categories");
        revalidatePath("/");
        return { id: updated.id, name: updated.name };
    } catch (err) {
        console.error("[updateCategory] failed:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to update category",
        };
    }
}

export async function deleteCategory(id: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };

        await db.delete(categories).where(eq(categories.id, id));
        revalidatePath("/manager");
        revalidatePath("/manager/categories");
        revalidatePath("/");
        return { success: true };
    } catch (err) {
        console.error("[deleteCategory] failed:", err);
        return {
            error: err instanceof Error ? err.message : "Failed to delete category",
        };
    }
}


