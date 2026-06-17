import { categories } from "@/features/categories/schema";
import { resources } from "@/features/resources/schema";
import { db } from "@/lib/db";
import { faker } from "@faker-js/faker";
import "dotenv/config";

const CATEGORY_NAMES = [
    "Typography",
    "Color",
    "Components",
    "Icons",
    "Tools",
    "Articles",
    "Videos",
    "Books",
    "Inspiration",
    "Animation",
];

const TITLE_PREFIXES = [
    "Mammoth", "Atlas", "Northern", "Velvet", "Solid", "Glass", "Ember", "Quiet",
    "Brutal", "Soft", "Stellar", "Nebula", "Compass", "Crafted", "Liminal",
    "Modular", "Tactile", "Foundry", "Studio", "Maker",
];
const TITLE_SUFFIXES = [
    "Murals", "Type", "Kit", "Lab", "Press", "Forge", "Co", "Notes",
    "Library", "Atlas", "Index", "Field", "House", "Works", "Bureau",
];

function randomTitle() {
    return `${faker.helpers.arrayElement(TITLE_PREFIXES)} ${faker.helpers.arrayElement(TITLE_SUFFIXES)}`;
}

function randomUrl() {
    const slug = faker.lorem.slug({ min: 1, max: 2 });
    const tld = faker.helpers.arrayElement(["com", "io", "co", "design", "studio", "art"]);
    return `https://${slug}.${tld}`;
}

const COUNT = Number(process.env.SEED_COUNT ?? "120");

async function main() {
    console.log(`Seeding ${COUNT} fake resources...`);

    // Ensure categories exist
    const existingCats = await db.select().from(categories);
    const byName = new Map(existingCats.map((c) => [c.name, c]));
    const missing = CATEGORY_NAMES.filter((n) => !byName.has(n));
    if (missing.length > 0) {
        const inserted = await db
            .insert(categories)
            .values(missing.map((name) => ({ name })))
            .returning();
        for (const c of inserted) byName.set(c.name, c);
        console.log(`Inserted ${inserted.length} new categories.`);
    }
    const allCats = Array.from(byName.values());

    // Build fake resources
    const now = Date.now();
    const rows = Array.from({ length: COUNT }, () => {
        const status = faker.helpers.weightedArrayElement([
            { value: "approved" as const, weight: 8 },
            { value: "pending" as const, weight: 1 },
            { value: "rejected" as const, weight: 1 },
        ]);
        const createdAt = new Date(
            now - faker.number.int({ min: 0, max: 365 }) * 24 * 60 * 60 * 1000,
        );
        const cat = faker.helpers.maybe(() => faker.helpers.arrayElement(allCats), {
            probability: 0.85,
        });
        return {
            title: randomTitle(),
            url: randomUrl(),
            type: "external" as const,
            description: faker.lorem.sentence({ min: 6, max: 14 }),
            categoryId: cat?.id ?? null,
            status,
            submittedByEmail: faker.internet.email().toLowerCase(),
            createdAt,
            updatedAt: createdAt,
        };
    });

    // Chunk inserts to avoid huge payloads
    const CHUNK = 50;
    for (let i = 0; i < rows.length; i += CHUNK) {
        await db.insert(resources).values(rows.slice(i, i + CHUNK));
    }

    console.log(`Inserted ${rows.length} resources across ${allCats.length} categories.`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .then(() => process.exit(0));
