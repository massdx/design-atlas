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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    ADMIN_BUTTON_OUTLINE_CLASS,
    ADMIN_BUTTON_PRIMARY_CLASS,
    ADMIN_DIALOG_CONTENT_CLASS,
    ADMIN_INPUT_CLASS,
    ADMIN_LABEL_CLASS,
    ADMIN_SELECT_TRIGGER_CLASS,
    ADMIN_TEXTAREA_CLASS,
} from "@/features/admin/components/admin-styles";
import { updateResource } from "@/features/resources/actions";
import type { ResourceRow } from "@/features/resources/queries";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type Category = { id: string; name: string };

const DESC_MAX = 180;

const NO_CATEGORY = "__none__";

export function EditResourceDialog({
    resource,
    categories,
    open,
    onOpenChange,
}: {
    resource: ResourceRow | null;
    categories: Category[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (resource) {
            setTitle(resource.title);
            setDescription(resource.description ?? "");
            setCategoryId(resource.category?.id ?? NO_CATEGORY);
        }
    }, [resource]);

    function onSubmit(formData: FormData) {
        if (!resource) return;
        formData.set("id", resource.id);
        formData.set("title", title);
        formData.set("description", description);
        formData.set(
            "categoryId",
            categoryId === NO_CATEGORY ? "" : categoryId,
        );
        startTransition(async () => {
            const res = await updateResource(formData);
            if (res?.error) {
                toast.error(res.error);
                return;
            }
            toast.success("Ressource mise à jour");
            onOpenChange(false);
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={ADMIN_DIALOG_CONTENT_CLASS}>
                <DialogHeader>
                    <DialogTitle className="font-serif text-[22px] leading-none">
                        Modifier la ressource
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-[#080807]/60">
                        Mettez à jour le titre, la description et la catégorie.
                    </DialogDescription>
                </DialogHeader>

                <form action={onSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-title" className={ADMIN_LABEL_CLASS}>
                            Titre
                        </Label>
                        <Input
                            id="edit-title"
                            required
                            placeholder="Titre de la ressource"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={ADMIN_INPUT_CLASS}
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="edit-description"
                                className={ADMIN_LABEL_CLASS}
                            >
                                Description
                            </Label>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#080807]/40">
                                {description.length}/{DESC_MAX}
                            </span>
                        </div>
                        <Textarea
                            id="edit-description"
                            rows={3}
                            maxLength={DESC_MAX}
                            placeholder="Brève description (optionnel)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={ADMIN_TEXTAREA_CLASS}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className={ADMIN_LABEL_CLASS}>Catégorie</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className={ADMIN_SELECT_TRIGGER_CLASS}>
                                <SelectValue placeholder="Sélectionner une catégorie (optionnel)" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-0 bg-[#F5F5F5] shadow-2xs">
                                <SelectItem
                                    value={NO_CATEGORY}
                                    className="rounded-none text-[13px] focus:bg-[#080807]/5 focus:text-[#080807]"
                                >
                                    Aucune catégorie
                                </SelectItem>
                                {categories.map((c) => (
                                    <SelectItem
                                        key={c.id}
                                        value={c.id}
                                        className="rounded-none text-[13px] focus:bg-[#080807]/5 focus:text-[#080807]"
                                    >
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            variant={"outline"}
                            disabled={isPending}
                            className={ADMIN_BUTTON_OUTLINE_CLASS}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className={ADMIN_BUTTON_PRIMARY_CLASS}
                        >
                            {isPending ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
