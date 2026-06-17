import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url =
    process.env.DATABASE_URL ?? process.env.NEXT_PUBLIC_DATABASE_URL ?? "";

export default defineConfig({
    schema: "./lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: { url },
    strict: true,
    verbose: true,
});
