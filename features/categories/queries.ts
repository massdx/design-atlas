import { resources } from "@/features/resources/schema";
import { db } from "@/lib/db";
import { count, desc, eq, isNotNull } from "drizzle-orm";
import { categories } from "./schema";

export async function listCategories() {
    return db.select().from(categories).orderBy(categories.name);
}

export type CategoryWithCount = {
    id: string;
    name: string;
    color: string | null;
    createdAt: Date;
    resourceCount: number;
};

export async function listCategoriesWithCount(): Promise<CategoryWithCount[]> {
    const rows = await db
        .select({
            id: categories.id,
            name: categories.name,
            color: categories.color,
            createdAt: categories.createdAt,
            resourceCount: count(resources.id),
        })
        .from(categories)
        .leftJoin(resources, eq(resources.categoryId, categories.id))
        .groupBy(categories.id)
        .orderBy(desc(categories.createdAt));
    return rows.map((r) => ({
        ...r,
        resourceCount: Number(r.resourceCount),
    }));
}

export async function listUsedCategoryColors(): Promise<string[]> {
    const rows = await db
        .select({ color: categories.color })
        .from(categories)
        .where(isNotNull(categories.color));
    return rows.map((r) => r.color).filter((c): c is string => !!c);
}

