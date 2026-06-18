"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/custom-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    ADMIN_BUTTON_PRIMARY_CLASS,
    ADMIN_DIALOG_CONTENT_CLASS,
    ADMIN_INPUT_CLASS,
    ADMIN_LABEL_CLASS,
    ADMIN_META_CLASS,
    ADMIN_TABLE_HEAD_CLASS,
} from "@/features/admin/components/admin-styles";
import {
    deleteCategory,
    updateCategory,
} from "@/features/categories/actions";
import type { CategoryWithCount } from "@/features/categories/queries";
import { categoryColor } from "@/lib/dot-color";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function CategoriesDataTable({
    categories,
}: {
    categories: CategoryWithCount[];
}) {
    const [renaming, setRenaming] = useState<CategoryWithCount | null>(null);
    const [deleting, setDeleting] = useState<CategoryWithCount | null>(null);

    if (categories.length === 0) {
        return (
            <div className="flex items-center justify-center bg-[#F5F5F5] py-16 text-[12px] text-[#080807]/50 shadow-2xs">
                Aucune catégorie pour le moment. Créez-en une pour commencer.
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#F5F5F5] shadow-2xs">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-[#080807]/10 hover:bg-transparent">
                            <TableHead className={ADMIN_TABLE_HEAD_CLASS}>
                                Nom
                            </TableHead>
                            <TableHead className={ADMIN_TABLE_HEAD_CLASS}>
                                Ressources
                            </TableHead>
                            <TableHead className={ADMIN_TABLE_HEAD_CLASS}>
                                Créée le
                            </TableHead>
                            <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} text-right`}>
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((c) => (
                            <TableRow
                                key={c.id}
                                className="border-b border-[#080807]/5 last:border-0 hover:bg-[#080807]/2"
                            >
                                <TableCell className="py-2 text-[13px] text-[#080807]">
                                    <span className="inline-flex items-center gap-2">
                                        <span
                                            aria-hidden
                                            className="inline-block size-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: categoryColor(c) }}
                                        />
                                        {c.name}
                                    </span>
                                </TableCell>
                                <TableCell className="py-2">
                                    <span className={ADMIN_META_CLASS}>
                                        {c.resourceCount}
                                    </span>
                                </TableCell>
                                <TableCell className="py-2">
                                    <span className={ADMIN_META_CLASS}>
                                        {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                                    </span>
                                </TableCell>
                                <TableCell className="py-2 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="sm"
                                            onClick={() => setRenaming(c)}
                                            className={ADMIN_BUTTON_OUTLINE_CLASS}
                                        >
                                            Renommer
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                                size="sm"
                                            onClick={() => setDeleting(c)}
                                            className=""
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <RenameDialog
                category={renaming}
                onClose={() => setRenaming(null)}
            />
            <DeleteDialog
                category={deleting}
                onClose={() => setDeleting(null)}
            />
        </>
    );
}

function RenameDialog({
    category,
    onClose,
}: {
    category: CategoryWithCount | null;
    onClose: () => void;
}) {
    const [name, setName] = useState("");
    const [isPending, startTransition] = useTransition();

    const open = !!category;

    function handleOpenChange(next: boolean) {
        if (!next) {
            onClose();
            setName("");
        }
    }

    function submit() {
        if (!category) return;
        const trimmed = name.trim();
        if (!trimmed || trimmed === category.name) {
            handleOpenChange(false);
            return;
        }
        startTransition(async () => {
            const res = await updateCategory(category.id, trimmed);
            if ("error" in res) {
                toast.error(res.error);
                return;
            }
            toast.success(`Renommée en « ${res.name} »`);
            setName("");
            onClose();
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (next && category) setName(category.name);
                handleOpenChange(next);
            }}
        >
            <DialogContent className={ADMIN_DIALOG_CONTENT_CLASS}>
                <DialogHeader>
                    <DialogTitle className="font-serif text-[22px] leading-none">
                        Renommer la catégorie
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-[#080807]/60">
                        Les ressources existantes conservent cette catégorie.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor="rename-input" className={ADMIN_LABEL_CLASS}>
                        Nom
                    </Label>
                    <Input
                        id="rename-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                submit();
                            }
                        }}
                        autoFocus
                        disabled={isPending}
                        className={ADMIN_INPUT_CLASS}
                    />
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        onClick={() => handleOpenChange(false)}
                        disabled={isPending}
                        className={ADMIN_BUTTON_OUTLINE_CLASS}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={isPending}
                        className={ADMIN_BUTTON_PRIMARY_CLASS}
                    >
                        {isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteDialog({
    category,
    onClose,
}: {
    category: CategoryWithCount | null;
    onClose: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const open = !!category;

    function submit() {
        if (!category) return;
        startTransition(async () => {
            const res = await deleteCategory(category.id);
            if ("error" in res) {
                toast.error(res.error);
                return;
            }
            toast.success(`« ${category.name} » supprimée`);
            onClose();
        });
    }

    return (
        <Dialog open={open} onOpenChange={(n) => !n && onClose()}>
            <DialogContent className={ADMIN_DIALOG_CONTENT_CLASS}>
                <DialogHeader>
                    <DialogTitle className="font-serif text-[22px] leading-none">
                        Supprimer la catégorie
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-[#080807]/60">
                        {category?.resourceCount
                            ? `${category.resourceCount} ressource(s) seront sans catégorie.`
                            : "Cette action est irréversible."}
                    </DialogDescription>
                </DialogHeader>
                <p className="text-[13px] text-[#080807]">
                    Confirmer la suppression de{" "}
                    <span className="font-medium">{category?.name}</span> ?
                </p>
                <DialogFooter>
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className={ADMIN_BUTTON_OUTLINE_CLASS}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={isPending}
                        className="inline-flex h-9 items-center gap-1.5 rounded-none bg-red-600 px-4 text-[12px] font-medium text-white shadow-2xs transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        {isPending ? "Suppression..." : "Supprimer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
