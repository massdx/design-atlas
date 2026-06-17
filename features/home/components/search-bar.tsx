"use client";

import { Button } from "@/components/ui/button";
import { SubmitResourceDialog } from "@/features/resources/components/submit-resource-dialog";
import { useTapHaptic } from "@/hooks/use-tap-haptic";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";

type Category = { id: string; name: string };

type SearchBarProps = {
    defaultValue?: string;
    /** Preserved across submissions as a hidden field. */
    keepCategoryId?: string;
    categories: Category[];
};

export function SearchBar({
    defaultValue = "",
    keepCategoryId,
    categories,
}: SearchBarProps) {
    const tap = useTapHaptic();

    return (
        <section className="relative z-10  mt-8 flex  max-w-104    items-center gap-2 px-6">
            <form action="/" className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#757575]" />
                <input
                    name="q"
                    defaultValue={defaultValue}
                    placeholder="Search here..."
                    className="h-9   shadow-2xs  w-full  bg-[#F5F5F5] pl-8 pr-3 text-[13px]  placeholder:text-[#757575] focus:outline-none focus:ring-1 focus:ring-[#080807]/20"
                />
                {keepCategoryId && (
                    <input type="hidden" name="category" value={keepCategoryId} />
                )}
            </form>
            <SubmitResourceDialog
                categories={categories}
                trigger={
                    <Button
                        type="button"
                        size="sm"
                        onClick={tap}
                        aria-label="Soumettre une ressource"
                        className="inline-flex h-9  items-center gap-1.5   bg-[#080807] px-3 py-1.5 text-[13px]  font-medium text-white underline-offset-4 hover:underline"
                    >
                        <PlusIcon className="size-3.5" />
                    </Button>
                }
            />
        </section>
    );
}
