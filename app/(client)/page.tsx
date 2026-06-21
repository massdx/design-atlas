import { StaggerIn } from "@/components/custom-ui/stagger-in";
import { CategoryFilters } from "@/features/categories/components/category-filters";
import { listCategories } from "@/features/categories/queries";
import { Hero } from "@/features/home/components/hero";
import { Navbar } from "@/features/home/components/navbar";
import { SearchBar } from "@/features/home/components/search-bar";
import { ResourcesList } from "@/features/resources/components/resources-list";
import { ResourcesListSkeleton } from "@/features/resources/components/resources-list-skeleton";
import { listResources } from "@/features/resources/queries";
import { Suspense } from "react";


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

  return (
    <main className="relative   max-w-220 mx-auto">

      <Navbar categories={categories} />
      <Hero />
      <StaggerIn delay={0.25} step={0.09}>
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
        <Suspense
          key={`${search}::${activeCategory?.id ?? "all"}`}
          fallback={<ResourcesListSkeleton />}
        >
          <ResourcesAsync search={search} categoryId={activeCategory?.id} />
        </Suspense>
      </StaggerIn>
    </main>
  );
}

async function ResourcesAsync({
  search,
  categoryId,
}: {
  search: string;
  categoryId?: string;
}) {
  const { rows, total } = await listResources({
    status: "approved",
    pageSize: 100,
    search,
    categoryId,
  });
  return <ResourcesList rows={rows} total={total} />;
}
