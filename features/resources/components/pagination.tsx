"use client";

import { ADMIN_META_CLASS } from "@/features/admin/components/admin-styles";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
};

const NAV_BTN_CLASS =
    "inline-flex h-8 items-center px-3 text-[11px] font-medium font-mono uppercase tracking-wider shadow-2xs transition-colors bg-[#F5F5F5] text-[#080807] hover:bg-[#080807]/10";

const NAV_BTN_DISABLED =
    "inline-flex h-8 items-center px-3 text-[11px] font-medium font-mono uppercase tracking-wider shadow-2xs bg-[#F5F5F5] text-[#080807]/30";

export function Pagination({ page, pageCount, total, pageSize }: Props) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function hrefFor(p: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(p));
        return `${pathname}?${params.toString()}`;
    }

    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    return (
        <div className="mt-4 flex items-center justify-between">
            <span className={ADMIN_META_CLASS}>
                {start}–{end} sur {total}
            </span>
            <div className="flex items-center gap-2">
                {page > 1 ? (
                    <Link href={hrefFor(page - 1)} className={NAV_BTN_CLASS}>
                        Précédent
                    </Link>
                ) : (
                    <span className={NAV_BTN_DISABLED}>Précédent</span>
                )}
                <span className={cn(ADMIN_META_CLASS, "px-2")}>
                    Page {page} / {Math.max(1, pageCount)}
                </span>
                {page < pageCount ? (
                    <Link href={hrefFor(page + 1)} className={NAV_BTN_CLASS}>
                        Suivant
                    </Link>
                ) : (
                    <span className={NAV_BTN_DISABLED}>Suivant</span>
                )}
            </div>
        </div>
    );
}
