import { categories } from "@/features/categories/schema";
import { db } from "@/lib/db";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { resources } from "./schema";

export type ResourceStatus = "pending" | "approved" | "rejected" | "all";

export type ResourceRow = {
    id: string;
    title: string;
    url: string;
    type: "external" | "file";
    description: string | null;
    status: "pending" | "approved" | "rejected";
    submittedByEmail: string | null;
    createdAt: Date;
    category: { id: string; name: string } | null;
};

export type ListResourcesParams = {
    page?: number;
    pageSize?: number;
    status?: ResourceStatus;
    search?: string;
    categoryId?: string;
};

export async function listResources({
    page = 1,
    pageSize = 10,
    status = "all",
    search,
    categoryId,
}: ListResourcesParams) {
    const filters: SQL[] = [];
    if (status !== "all") filters.push(eq(resources.status, status));
    if (categoryId) filters.push(eq(resources.categoryId, categoryId));
    if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        const searchFilter = or(
            ilike(resources.title, term),
            ilike(resources.url, term),
            ilike(resources.description, term),
        );
        if (searchFilter) filters.push(searchFilter);
    }
    const where = filters.length ? and(...filters) : undefined;

    const offset = (Math.max(1, page) - 1) * pageSize;

    const [rows, totalRows] = await Promise.all([
        db
            .select({
                id: resources.id,
                title: resources.title,
                url: resources.url,
                type: resources.type,
                description: resources.description,
                status: resources.status,
                submittedByEmail: resources.submittedByEmail,
                createdAt: resources.createdAt,
                category: {
                    id: categories.id,
                    name: categories.name,
                },
            })
            .from(resources)
            .leftJoin(categories, eq(resources.categoryId, categories.id))
            .where(where)
            .orderBy(desc(resources.createdAt))
            .limit(pageSize)
            .offset(offset),
        db.select({ value: count() }).from(resources).where(where),
    ]);

    const total = totalRows[0]?.value ?? 0;

    return {
        rows: rows as ResourceRow[],
        total,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
}
