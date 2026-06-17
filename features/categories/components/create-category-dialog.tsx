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
} from "@/components/ui/custom-dialog";
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
import { cn } from "@/lib/utils";
import { PlusIcon } from "@radix-ui/react-icons";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

export function CreateCategoryDialog({ trigger }: { trigger?: ReactNode }) {
    const mounted = useMounted();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [isPending, startTransition] = useTransition();

    function handleSubmit() {
        const trimmed = name.trim();
        if (!trimmed) return;
        startTransition(async () => {
            const res = await createCategory(trimmed);
            if ("error" in res) {
                toast.error(res.error);
                return;
            }
            toast.success(`Catégorie « ${res.name} » créée`);
            setName("");
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
                <DialogFooter>
                    <Button
                        type="button"
                        onClick={() => setOpen(false)}
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
                    >
                        {isPending ? "Création..." : "Créer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
