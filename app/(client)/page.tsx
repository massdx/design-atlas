import { CategoryFilters } from "@/features/categories/components/category-filters";
import { listCategories } from "@/features/categories/queries";
import { Hero } from "@/features/home/components/hero";
import { SearchBar } from "@/features/home/components/search-bar";
import { SiteHeader } from "@/features/home/components/site-header";
import { ResourcesList } from "@/features/resources/components/resources-list";
import { listResources } from "@/features/resources/queries";


export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  category?: string;
}>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q: search = "", category = "all" } = await searchParams;

  const categories = await listCategories();
  const activeCategory =
    category === "all" ? null : categories.find((c) => c.id === category) ?? null;

  const { rows, total } = await listResources({
    status: "approved",
    pageSize: 50,
    search,
    categoryId: activeCategory?.id,
  });

  return (
    <main className="relative   max-w-220 mx-auto">
      {/* <DecorativeBlobs /> */}
      <SiteHeader categories={categories} />
      <Hero />
      <SearchBar
        defaultValue={search}
        keepCategoryId={activeCategory?.id}
        categories={categories}
      />
      <CategoryFilters
        categories={categories}
        activeCategoryId={activeCategory?.id ?? null}
        search={search}
      />
      <ResourcesList rows={rows} total={total} />
    </main>
  );
}
