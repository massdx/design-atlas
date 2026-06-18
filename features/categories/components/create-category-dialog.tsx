"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ADMIN_BUTTON_OUTLINE_CLASS,
    ADMIN_BUTTON_PRIMARY_CLASS,
    ADMIN_DIALOG_CONTENT_CLASS,
    ADMIN_INPUT_CLASS,
    ADMIN_LABEL_CLASS,
} from "@/features/admin/components/admin-styles";
import { createCategory } from "@/features/categories/actions";
import { useMounted } from "@/hooks/use-mounted";
import { CATEGORY_PALETTE } from "@/lib/dot-color";
import { cn } from "@/lib/utils";
import { CheckIcon, PlusIcon } from "@radix-ui/react-icons";
import {
    useEffect,
    useMemo,
    useState,
    useTransition,
    type ReactNode,
} from "react";
import { toast } from "sonner";

export function CreateCategoryDialog({
    trigger,
    usedColors = [],
}: {
    trigger?: ReactNode;
    usedColors?: string[];
}) {
    const mounted = useMounted();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const taken = useMemo(() => new Set(usedColors), [usedColors]);

    useEffect(() => {
        if (!open) return;
        if (color && taken.has(color)) {
            setColor(null);
            return;
        }
        if (!color) {
            const first = CATEGORY_PALETTE.find((c) => !taken.has(c));
            if (first) setColor(first);
        }
    }, [open, color, taken]);

    function handleSubmit() {
        const trimmed = name.trim();
        if (!trimmed) return;
        startTransition(async () => {
            const res = await createCategory(trimmed, color);
            if ("error" in res) {
                toast.error(res.error);
                return;
            }
            toast.success(`Catégorie « ${res.name} » créée`);
            setName("");
            setColor(null);
            setOpen(false);
        });
    }

    const fallbackTrigger = (
        <Button type="button" className={ADMIN_BUTTON_PRIMARY_CLASS}>
            <PlusIcon className="size-3.5" />
            Nouvelle catégorie
        </Button>
    );

    if (!mounted) return trigger ?? fallbackTrigger;

    const allTaken = CATEGORY_PALETTE.every((c) => taken.has(c));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>
            <DialogContent className={ADMIN_DIALOG_CONTENT_CLASS}>
                <DialogHeader>
                    <DialogTitle className="font-serif text-[22px] leading-none">
                        Nouvelle catégorie
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-[#080807]/60">
                        Les catégories organisent la bibliothèque publique.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category-name" className={ADMIN_LABEL_CLASS}>
                            Nom
                        </Label>
                        <Input
                            id="category-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder="ex. Typographie"
                            autoFocus
                            disabled={isPending}
                            className={ADMIN_INPUT_CLASS}
                        />
                    </div>

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
                                        onClick={() => !isTaken && setColor(c)}
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
                                            <CheckIcon className="absolute inset-0 m-auto size-4 text-[#080807]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {allTaken && (
                            <p className="text-[11px] text-[#080807]/50">
                                Toutes les couleurs sont utilisées. La catégorie sera
                                créée sans couleur.
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter className="mt-6">
                    <Button
                        type="button"
                        onClick={() => setOpen(false)}
                        variant="outline"
                        disabled={isPending}
                        className={ADMIN_BUTTON_OUTLINE_CLASS}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending || !name.trim()}
                        className={cn(ADMIN_BUTTON_PRIMARY_CLASS)}
                        variant="default"
                    >
                        {isPending ? "Création..." : "Créer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
