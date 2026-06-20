"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CATEGORY_PALETTE, categoryColor } from "@/lib/dot-color";
import { cn } from "@/lib/utils";
import {
    CheckIcon,
    DotsHorizontalIcon,
    Pencil1Icon,
    TrashIcon,
} from "@radix-ui/react-icons";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

export function CategoriesDataTable({
    categories,
}: {
    categories: CategoryWithCount[];
}) {
    const [renaming, setRenaming] = useState<CategoryWithCount | null>(null);
    const [recoloring, setRecoloring] = useState<CategoryWithCount | null>(null);
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                className="inline-flex size-8 items-center justify-center rounded-none border-0 bg-transparent p-0 text-[#080807] hover:bg-[#080807]/10"
                                            >
                                                <DotsHorizontalIcon className="size-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-40 rounded-none border-0 shadow"
                                        >
                                            <DropdownMenuItem
                                                className="rounded-none text-[12px] focus:bg-[#080807]/5 focus:text-[#080807]"
                                                onClick={() => setRenaming(c)}
                                            >
                                                <Pencil1Icon className="size-3.5" /> Renommer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="rounded-none text-[12px] focus:bg-[#080807]/5 focus:text-[#080807]"
                                                onClick={() => setRecoloring(c)}
                                            >
                                                <span
                                                    aria-hidden
                                                    className="inline-block size-3.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: categoryColor(c) }}
                                                />{" "}
                                                Couleur
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-[#080807]/10" />
                                            <DropdownMenuItem
                                                variant="destructive"
                                                className="rounded-none text-[12px] focus:bg-red-600/10"
                                                onClick={() => setDeleting(c)}
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

            <RenameDialog
                category={renaming}
                onClose={() => setRenaming(null)}
            />
            <ColorDialog
                category={recoloring}
                categories={categories}
                onClose={() => setRecoloring(null)}
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
            const res = await updateCategory(category.id, trimmed, category.color);
            if ("error" in res) {
                toast.error(res.error);
                return;
            }
            toast.success(`Renommée en « ${res.name} »`);
            handleOpenChange(false);
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (next && category) {
                    setName(category.name);
                }
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

function ColorDialog({
    category,
    categories,
    onClose,
}: {
    category: CategoryWithCount | null;
    categories: CategoryWithCount[];
    onClose: () => void;
}) {
    const [color, setColor] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const open = !!category;

    const taken = useMemo(
        () =>
            new Set(
                categories
                    .filter((c) => c.id !== category?.id && c.color)
                    .map((c) => c.color as string),
            ),
        [categories, category?.id],
    );

    function handleOpenChange(next: boolean) {
        if (!next) {
            onClose();
            setColor(null);
        }
    }

    function submit() {
        if (!category) return;
        if (color === category.color) {
            handleOpenChange(false);
            return;
        }
        startTransition(async () => {
            const res = await updateCategory(category.id, category.name, color);
            if ("error" in res) {
                toast.error(res.error);
                return;
            }
            toast.success(`Couleur de « ${res.name} » mise à jour`);
            handleOpenChange(false);
        });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (next && category) {
                    setColor(category.color);
                }
                handleOpenChange(next);
            }}
        >
            <DialogContent className={ADMIN_DIALOG_CONTENT_CLASS}>
                <DialogHeader>
                    <DialogTitle className="font-serif text-[22px] leading-none">
                        Couleur de la catégorie
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-[#080807]/60">
                        Une couleur déjà utilisée n’est pas disponible.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label className={ADMIN_LABEL_CLASS}>Couleur</Label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORY_PALETTE.map((c) => {
                            const isTaken = taken.has(c);
                            const active = color === c;
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() =>
                                        !isTaken && setColor(active ? null : c)
                                    }
                                    disabled={isTaken || isPending}
                                    aria-label={c}
                                    aria-pressed={active}
                                    className={cn(
                                        "relative size-7 rounded-full transition-transform",
                                        !isTaken && "hover:scale-110",
                                        isTaken &&
                                        "cursor-not-allowed opacity-30 grayscale",
                                        active &&
                                        "ring-2 ring-[#080807] ring-offset-2 ring-offset-[#E8E8E3]",
                                    )}
                                    style={{ backgroundColor: c }}
                                >
                                    {active && (
                                        <CheckIcon className="absolute inset-0 m-auto size-4 text-white" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
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
