"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ADMIN_BUTTON_OUTLINE_CLASS,
    ADMIN_META_CLASS,
    ADMIN_TABLE_HEAD_CLASS,
} from "@/features/admin/components/admin-styles";
import { restoreAdmin, revokeAdmin } from "@/features/admins/actions";
import type { AdminRow } from "@/features/admins/queries";
import { cn } from "@/lib/utils";
import { useTransition } from "react";
import { toast } from "sonner";

export function AdminsDataTable({
    admins,
    currentUserId,
}: {
    admins: AdminRow[];
    currentUserId: string;
}) {
    const [isPending, startTransition] = useTransition();

    function run(
        action: () => Promise<{ error?: string } | undefined | void>,
        msg: string,
    ) {
        startTransition(async () => {
            const res = await action();
            if (res?.error) {
                toast.error(res.error);
                return;
            }
            toast.success(msg);
        });
    }

    if (admins.length === 0) {
        return (
            <div className="flex items-center justify-center bg-[#F5F5F5] py-16 text-[12px] text-[#080807]/50 shadow-2xs">
                Aucun admin pour le moment.
            </div>
        );
    }

    return (
        <div className="bg-[#F5F5F5] shadow-2xs">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-[#080807]/10 hover:bg-transparent">
                        <TableHead className={ADMIN_TABLE_HEAD_CLASS}>Email</TableHead>
                        <TableHead className={ADMIN_TABLE_HEAD_CLASS}>Nom</TableHead>
                        <TableHead className={ADMIN_TABLE_HEAD_CLASS}>Statut</TableHead>
                        <TableHead className={ADMIN_TABLE_HEAD_CLASS}>Invité le</TableHead>
                        <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} text-right`}>
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {admins.map((a) => {
                        const isSelf = a.id === currentUserId;
                        return (
                            <TableRow
                                key={a.id}
                                className="border-b border-[#080807]/5 last:border-0 hover:bg-[#080807]/2"
                            >
                                <TableCell className="py-3 text-[13px] text-[#080807]">
                                    {a.email}
                                    {isSelf ? (
                                        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-[#080807]/40">
                                            (vous)
                                        </span>
                                    ) : null}
                                </TableCell>
                                <TableCell className="py-3 text-[13px] text-[#080807]/70">
                                    {a.name ?? "—"}
                                </TableCell>
                                <TableCell className="py-3">
                                    <span className="inline-flex items-center gap-2 text-[12px] text-[#080807]/80">
                                        <span
                                            className={cn(
                                                "size-2 rounded-full",
                                                !a.isAdmin
                                                    ? "bg-red-600"
                                                    : a.linked
                                                        ? "bg-emerald-600"
                                                        : "bg-amber-500",
                                            )}
                                        />
                                        {!a.isAdmin
                                            ? "Révoqué"
                                            : a.linked
                                                ? "Actif"
                                                : "Invité"}
                                    </span>
                                </TableCell>
                                <TableCell className={`py-3 ${ADMIN_META_CLASS}`}>
                                    {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                                </TableCell>
                                <TableCell className="py-3 text-right">
                                    {isSelf ? (
                                        <span className={ADMIN_META_CLASS}>—</span>
                                    ) : a.isAdmin ? (
                                        <Button
                                            type="button"
                                            disabled={isPending}
                                            onClick={() =>
                                                run(() => revokeAdmin(a.id), "Accès révoqué")
                                            }
                                            className="inline-flex h-9 items-center gap-1.5 rounded-none border-0 bg-[#F5F5F5] px-3 text-[12px] font-medium text-red-600 shadow-2xs transition-colors hover:bg-red-600/10"
                                        >
                                            Révoquer
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            disabled={isPending}
                                            onClick={() =>
                                                run(() => restoreAdmin(a.id), "Accès restauré")
                                            }
                                            className={ADMIN_BUTTON_OUTLINE_CLASS}
                                        >
                                            Restaurer
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
