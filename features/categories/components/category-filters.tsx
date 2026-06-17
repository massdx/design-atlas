import type { Category } from "@/features/categories/schema";
import { buildHref } from "@/lib/build-href";
import { categoryColor } from "@/lib/dot-color";
import { CategoryPill } from "./category-pill";

type CategoryFiltersProps = {
    categories: Pick<Category, "id" | "name" | "color">[];
    activeCategoryId: string | null;
    search?: string;
};

export function CategoryFilters({
    categories,
    activeCategoryId,
    search,
}: CategoryFiltersProps) {
    return (
        <section className="relative z-10 mx-auto mt-6  px-6">
            <p className="mb-2 font-(--font-dm-mono) text-[12px] uppercase tracking-wider text-[#080807]/40">
                Filtre
            </p>
            <div className="flex flex-wrap items-center gap-2">
                <CategoryPill
                    href={buildHref("/", { q: search })}
                    active={!activeCategoryId}
                    label="Tous"
                />
                {categories.map((c) => (
                    <CategoryPill
                        key={c.id}
                        href={buildHref("/", { q: search, category: c.id })}
                        active={activeCategoryId === c.id}
                        label={c.name}
                        dot={categoryColor(c)}
                    />
                ))}
            </div>
        </section>
    );
}
