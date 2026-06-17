import { users } from "@/features/auth/schema";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";

export type AdminRow = {
    id: string;
    email: string;
    name: string | null;
    isAdmin: boolean;
    linked: boolean;
    createdAt: Date;
};

export async function listAdmins(): Promise<AdminRow[]> {
    const rows = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            isAdmin: users.isAdmin,
            authUserId: users.authUserId,
            createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

    return rows.map((r) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        isAdmin: r.isAdmin,
        linked: !r.authUserId.startsWith("invite:"),
        createdAt: r.createdAt,
    }));
}
