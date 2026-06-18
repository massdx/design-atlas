"use client";

import { SubmitResourceDialog } from "@/features/resources/components/submit-resource-dialog";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useWebHaptics } from "web-haptics/react";

type Category = { id: string; name: string };

export function Navbar({ categories }: { categories: Category[] }) {
    const { trigger } = useWebHaptics({ debug: true });

    return (
        <header className="sticky z-50 backdrop-blur-md flex items-center justify-between border-b  px-6 bg-[#E8E8E3]/90  top-0 py-4">
            <div className="mx-auto flex justify-between max-w-220   h-full w-full  ">
                <Link
                    href="/manager"
                    className="font-serif text-[18px] leading-none tracking-tight"
                >
                    Design Atlas
                </Link>
                <SubmitResourceDialog
                    categories={categories}
                    trigger={
                        <button
                            type="button"
                            onClick={() => trigger([{ duration: 8 }], { intensity: 0.3 })}
                            className="inline-flex cursor-pointer items-center gap-1.5 font-sans text-[13px] font-medium text-[#080807] underline underline-offset-4 hover:opacity-70"
                        >
                            <PlusIcon className="size-3.5" />
                            Soumettre une ressource
                        </button>
                    }
                />
            </div>

        </header>
    );
}
