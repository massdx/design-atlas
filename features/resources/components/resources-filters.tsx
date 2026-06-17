"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ADMIN_INPUT_CLASS,
    ADMIN_SELECT_TRIGGER_CLASS,
} from "@/features/admin/components/admin-styles";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

const STATUS_OPTIONS = [
    { value: "all", label: "Toutes" },
    { value: "pending", label: "En attente" },
    { value: "approved", label: "Approuvées" },
    { value: "rejected", label: "Rejetées" },
];

export function ResourcesFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();
    const [search, setSearch] = useState(searchParams.get("q") ?? "");

    const updateParam = useCallback(
        (key: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (!value) params.delete(key);
            else params.set(key, value);
            params.delete("page");
            startTransition(() => {
                router.push(`?${params.toString()}`);
            });
        },
        [router, searchParams],
    );

    return (
        <div className="flex items-center gap-2">
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") updateParam("q", search || null);
                }}
                placeholder="Rechercher une ressource..."
                className={`${ADMIN_INPUT_CLASS} w-72`}
            />
            <Select
                value={searchParams.get("status") ?? "all"}
                onValueChange={(v) => updateParam("status", v === "all" ? null : v)}
            >
                <SelectTrigger className={`${ADMIN_SELECT_TRIGGER_CLASS} w-36`}>
                    <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-0 bg-[#F5F5F5] shadow-2xs">
                    {STATUS_OPTIONS.map((o) => (
                        <SelectItem
                            key={o.value}
                            value={o.value}
                            className="rounded-none text-[13px] focus:bg-[#080807]/5 focus:text-[#080807]"
                        >
                            {o.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
