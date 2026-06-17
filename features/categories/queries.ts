import { resources } from "@/features/resources/schema";
import { db } from "@/lib/db";
import { count, desc, eq } from "drizzle-orm";
import { categories } from "./schema";

export async function listCategories() {
    return db.select().from(categories).orderBy(categories.name);
}

export type CategoryWithCount = {
    id: string;
    name: string;
    createdAt: Date;
    resourceCount: number;
};

export async function listCategoriesWithCount(): Promise<CategoryWithCount[]> {
    const rows = await db
        .select({
            id: categories.id,
            name: categories.name,
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

