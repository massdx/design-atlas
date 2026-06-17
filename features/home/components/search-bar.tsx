"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitResourceDialog } from "@/features/resources/components/submit-resource-dialog";
import { useTapHaptic } from "@/hooks/use-tap-haptic";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type Category = { id: string; name: string };

type SearchBarProps = {
    defaultValue?: string;
    /** Preserved across submissions as a hidden field. */
    keepCategoryId?: string;
    categories: Category[];
};

const DEBOUNCE_MS = 250;

export function SearchBar({
    defaultValue = "",
    keepCategoryId,
    categories,
}: SearchBarProps) {
    const tap = useTapHaptic();
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [value, setValue] = useState(defaultValue);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastPushedRef = useRef(defaultValue);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    function push(next: string) {
        if (next === lastPushedRef.current) return;
        lastPushedRef.current = next;
        const params = new URLSearchParams();
        if (next.trim()) params.set("q", next.trim());
        if (keepCategoryId) params.set("category", keepCategoryId);
        const qs = params.toString();
        startTransition(() => {
            router.replace(qs ? `/?${qs}` : "/", { scroll: false });
        });
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const next = e.target.value;
        setValue(next);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => push(next), DEBOUNCE_MS);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        push(value);
    }

    return (
        <section className="relative z-10  mt-8 flex  max-w-104    items-center gap-2 px-6">
            <form onSubmit={handleSubmit} className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-[#757575]" />
                <Input
                    name="q"
                    value={value}
                    onChange={handleChange}
                    placeholder="Rechercher ici..."
                    className="h-10   shadow-2xs  w-full rounded-none border-none bg-[#F5F5F5] pl-6 pr-3 text-[13px]  placeholder:text-[#757575] focus:outline-none focus:ring-1 focus:ring-[#080807]/20"
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
                        className="inline-flex h-10 cursor-pointer  items-center gap-1.5   bg-[#080807] px-5 py-1.5 text-[13px]  font-medium text-white underline-offset-4 hover:underline"
                    >
                        <PlusIcon className="size-4" />
                    </Button>
                }
            />
        </section>
    );
}
