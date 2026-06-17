/**
 * Barrel re-exporting every feature schema so drizzle-kit can pick up all
 * tables from a single entry point (see `drizzle.config.ts`).
 */
export * from "@/features/auth/schema";
export * from "@/features/categories/schema";
export * from "@/features/resources/schema";

