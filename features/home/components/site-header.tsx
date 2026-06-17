"use client";

import { SubmitResourceDialog } from "@/features/resources/components/submit-resource-dialog";
import { PlusIcon } from "@radix-ui/react-icons";
import { useWebHaptics } from "web-haptics/react";

type Category = { id: string; name: string };

export function SiteHeader({ categories }: { categories: Category[] }) {
    const { trigger } = useWebHaptics({ debug: true });

    return (
        <header className="relative z-10  flex items-center justify-between px-10 py-4">
            <div />
            <div className="font-sans text-[15px] tracking-tight">
                Ressources utiles pour les créateurs du web
            </div>
            <SubmitResourceDialog
                categories={categories}
                trigger={
                    <button
                        type="button"
                        onClick={() => trigger([{ duration: 8 }], { intensity: 0.3 })}
                        className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-[#080807] underline underline-offset-4 hover:opacity-70"
                    >
                        <PlusIcon className="size-3.5" />
                        Submit resource
                    </button>
                }
            />
        </header>
    );
}
