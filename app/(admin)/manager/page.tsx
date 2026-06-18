import { auth } from "@/features/auth/server";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";
import {
  listCategories,
  listUsedCategoryColors,
} from "@/features/categories/queries";
import { CreateResourceDialog } from "@/features/resources/components/create-resource-dialog";
import { Pagination } from "@/features/resources/components/pagination";
import { ResourcesDataTable } from "@/features/resources/components/resources-data-table";
import { ResourcesFilters } from "@/features/resources/components/resources-filters";
import { listResources, type ResourceStatus } from "@/features/resources/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  page?: string;
  status?: ResourceStatus;
  q?: string;
}>;

export default async function ManagerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/manager/sign-in");

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const status = (params.status ?? "all") as ResourceStatus;
  const search = params.q ?? "";

  const [{ rows, total, pageCount }, categories, usedColors] = await Promise.all([
    listResources({
      page,
      pageSize: PAGE_SIZE,
      status,
      search,
    }),
    listCategories(),
    listUsedCategoryColors(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between pb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#080807]/50">
            Espace admin
          </p>
          <h1 className="mt-1 font-serif text-[32px] leading-none">
            Ressources
          </h1>
          <p className="mt-2 text-[13px] text-[#080807]/60">
            Validez, approuvez et modérez les soumissions de la communauté.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#080807]/50">
            {session.user.email}
          </p>
          <div className="flex items-center gap-2">
            <CreateCategoryDialog usedColors={usedColors} />
            <CreateResourceDialog
              categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
              }))}
            />
          </div>
        </div>
      </header>

      <div className="mb-4">
        <ResourcesFilters />
      </div>

      <ResourcesDataTable rows={rows} />

      <Pagination
        page={page}
        pageCount={pageCount}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </main>
  );
}