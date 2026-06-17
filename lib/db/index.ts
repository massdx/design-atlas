import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
    process.env.DATABASE_URL ?? process.env.NEXT_PUBLIC_DATABASE_URL;

if (!connectionString) {
    throw new Error(
        "DATABASE_URL (or NEXT_PUBLIC_DATABASE_URL) is not set in the environment.",
    );
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
export { schema };
