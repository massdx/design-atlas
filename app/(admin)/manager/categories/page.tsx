import { auth } from "@/features/auth/server";
import { CategoriesDataTable } from "@/features/categories/components/categories-data-table";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";
import { listCategoriesWithCount } from "@/features/categories/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
    const { data: session } = await auth.getSession();
    if (!session?.user) redirect("/manager/sign-in");

    const categories = await listCategoriesWithCount();

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <header className="mb-8 flex items-end justify-between pb-6">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#080807]/50">
                        Espace admin
                    </p>
                    <h1 className="mt-1 font-serif text-[32px] leading-none">
                        Catégories
                    </h1>
                    <p className="mt-2 text-[13px] text-[#080807]/60">
                        Organisez la bibliothèque publique par thématiques.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CreateCategoryDialog />
                </div>
            </header>

            <CategoriesDataTable categories={categories} />
        </main>
    );
}
