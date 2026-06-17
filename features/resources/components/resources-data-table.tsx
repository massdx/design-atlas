"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ADMIN_META_CLASS,
    ADMIN_TABLE_HEAD_CLASS,
} from "@/features/admin/components/admin-styles";
import {
    approveResource,
    deleteResource,
    rejectResource,
} from "@/features/resources/actions";
import type { ResourceRow } from "@/features/resources/queries";
import { cn } from "@/lib/utils";
import {
    CheckIcon,
    Cross2Icon,
    DotsHorizontalIcon,
    TrashIcon,
} from "@radix-ui/react-icons";
import { useTransition } from "react";
import { toast } from "sonner";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
});

const STATUS_DOT = {
    pending: "bg-amber-500",
    approved: "bg-emerald-600",
    rejected: "bg-red-600",
} as const;

const STATUS_LABEL = {
    pending: "En attente",
    approved: "Approuvée",
    rejected: "Rejetée",
} as const;

export function ResourcesDataTable({ rows }: { rows: ResourceRow[] }) {
    const [isPending, startTransition] = useTransition();

    function run(
        action: () => Promise<{ error?: string } | undefined | void>,
        msg: string,
    ) {
        startTransition(async () => {
            try {
                const res = await action();
                if (res?.error) {
                    toast.error(res.error);
                    return;
                }
                toast.success(msg);
            } catch (e) {
                console.error("[ResourcesDataTable] action failed:", e);
                toast.error(e instanceof Error ? e.message : "Échec de l'action");
            }
        });
    }

    if (rows.length === 0) {
        return (
            <div className="flex items-center justify-center bg-[#F5F5F5] py-16 text-[12px] text-[#080807]/50 shadow-2xs">
                Aucune ressource
            </div>
        );
    }

    return (
        <div className="bg-[#F5F5F5] shadow-2xs">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-[#080807]/10 hover:bg-transparent">
                        <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} w-[40%]`}>
                            Ressource
                        </TableHead>
                        <TableHead className={ADMIN_TABLE_HEAD_CLASS}>
                            Catégorie
                        </TableHead>
                        <TableHead className={ADMIN_TABLE_HEAD_CLASS}>
                            Statut
                        </TableHead>
                        <TableHead className={ADMIN_TABLE_HEAD_CLASS}>
                            Soumise par
                        </TableHead>
                        <TableHead className={ADMIN_TABLE_HEAD_CLASS}>
                            Date
                        </TableHead>
                        <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} w-12`} />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r) => (
                        <TableRow
                            key={r.id}
                            className="border-b border-[#080807]/5 last:border-0 hover:bg-[#080807]/2"
                        >
                            <TableCell className="py-3">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[13px] font-medium text-[#080807]">
                                        {r.title}
                                    </span>
                                    <a
                                        href={r.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="max-w-md truncate font-mono text-[10px] uppercase tracking-wider text-[#080807]/50 hover:text-[#080807]"
                                    >
                                        {r.type === "file"
                                            ? `Fichier · ${decodeURIComponent(r.url.split("/").pop() ?? "").replace(/^\d+-[a-f0-9-]+-/i, "")}`
                                            : r.url}
                                    </a>
                                </div>
                            </TableCell>
                            <TableCell className="py-3 text-[13px] text-[#080807]/70">
                                {r.category?.name ?? "—"}
                            </TableCell>
                            <TableCell className="py-3">
                                <span className="inline-flex items-center gap-2 text-[12px] text-[#080807]/80">
                                    <span
                                        className={cn(
                                            "size-2 rounded-full",
                                            STATUS_DOT[r.status],
                                        )}
                                    />
                                    {STATUS_LABEL[r.status]}
                                </span>
                            </TableCell>
                            <TableCell className="py-3 text-[12px] text-[#080807]/60">
                                {r.submittedByEmail ?? "anonyme"}
                            </TableCell>
                            <TableCell className={`py-3 ${ADMIN_META_CLASS}`}>
                                {dateFormatter.format(new Date(r.createdAt))}
                            </TableCell>
                            <TableCell className="py-3 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            disabled={isPending}
                                            className="inline-flex size-8 items-center justify-center rounded-none border-0 bg-transparent p-0 text-[#080807] hover:bg-[#080807]/10"
                                        >
                                            <DotsHorizontalIcon className="size-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-40 rounded-none border-0 bg-[#F5F5F5] shadow-2xs"
                                    >
                                        <DropdownMenuItem
                                            disabled={r.status === "approved"}
                                            className="rounded-none text-[12px] focus:bg-[#080807]/5 focus:text-[#080807]"
                                            onClick={() =>
                                                run(
                                                    () => approveResource(r.id),
                                                    "Ressource approuvée",
                                                )
                                            }
                                        >
                                            <CheckIcon className="size-3.5" /> Approuver
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            disabled={r.status === "rejected"}
                                            className="rounded-none text-[12px] focus:bg-[#080807]/5 focus:text-[#080807]"
                                            onClick={() =>
                                                run(
                                                    () => rejectResource(r.id),
                                                    "Ressource rejetée",
                                                )
                                            }
                                        >
                                            <Cross2Icon className="size-3.5" /> Rejeter
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-[#080807]/10" />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            className="rounded-none text-[12px] focus:bg-red-600/10"
                                            onClick={() =>
                                                run(
                                                    () => deleteResource(r.id),
                                                    "Ressource supprimée",
                                                )
                                            }
                                        >
                                            <TrashIcon className="size-3.5" /> Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
