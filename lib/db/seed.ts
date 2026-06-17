import { users } from "@/features/auth/schema";
import { db } from "@/lib/db";
import "dotenv/config";
import { eq } from "drizzle-orm";

const DEFAULT_ADMIN = {
    authUserId: "seed:massahoudouodanou@gmail.com",
    email: "massahoudouodanou@gmail.com",
    name: "ODANOU",
    isAdmin: true,
};

async function main() {
    const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, DEFAULT_ADMIN.email))
        .limit(1);

    if (existing.length > 0) {
        await db
            .update(users)
            .set({ name: DEFAULT_ADMIN.name, isAdmin: true })
            .where(eq(users.email, DEFAULT_ADMIN.email));
        console.log(`Updated existing admin: ${DEFAULT_ADMIN.email}`);
        return;
    }

    await db.insert(users).values(DEFAULT_ADMIN);
    console.log(`Created default admin: ${DEFAULT_ADMIN.email}`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .then(() => process.exit(0));
