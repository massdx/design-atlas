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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    ADMIN_BUTTON_OUTLINE_CLASS,
    ADMIN_BUTTON_PRIMARY_CLASS,
    ADMIN_DIALOG_CONTENT_CLASS,
    ADMIN_INPUT_CLASS,
    ADMIN_LABEL_CLASS,
    ADMIN_SELECT_TRIGGER_CLASS,
    ADMIN_TEXTAREA_CLASS,
} from "@/features/admin/components/admin-styles";
import {
    createResourceAsAdmin,
    fetchUrlMetadata,
} from "@/features/resources/actions";
import { CoverPreview } from "@/features/resources/components/submit/cover-preview";
import { useMounted } from "@/hooks/use-mounted";
import { PlusIcon } from "@radix-ui/react-icons";
import { Loader } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

type Category = { id: string; name: string };

const DESC_MAX = 180;

export function CreateResourceDialog({
    categories,
}: {
    categories: Category[];
}) {
    const mounted = useMounted();
    const [open, setOpen] = useState(false);
    const [categoryId, setCategoryId] = useState<string>("");
    const [resourceType, setResourceType] = useState<"external" | "file">(
        "external",
    );
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [isPending, startTransition] = useTransition();
    const lastFetchedUrl = useRef<string>("");

    async function tryFetchMetadata(value: string) {
        const trimmed = value.trim();
        if (!trimmed || trimmed === lastFetchedUrl.current) return;
        try {
            new URL(trimmed);
        } catch {
            return;
        }
        lastFetchedUrl.current = trimmed;
        setIsFetching(true);
        try {
            const res = await fetchUrlMetadata(trimmed);
            if ("error" in res) return;
            const meta = res.data;
            if (!meta) return;
            if (meta.title && !title) setTitle(meta.title.slice(0, 120));
            if (meta.description && !description)
                setDescription(meta.description.slice(0, DESC_MAX));
            if (meta.image && !imageUrl) setImageUrl(meta.image);
        } catch {
            // silent
        } finally {
            setIsFetching(false);
        }
    }

    function reset() {
        setCategoryId("");
        setFile(null);
        setResourceType("external");
        setUrl("");
        setTitle("");
        setDescription("");
        setImageUrl("");
        lastFetchedUrl.current = "";
    }

    function onSubmit(formData: FormData) {
        formData.set("title", title);
        formData.set("description", description);
        if (categoryId) formData.set("categoryId", categoryId);
        formData.set("type", resourceType);
        if (resourceType === "external") {
            formData.set("url", url);
            if (imageUrl) formData.set("imageUrl", imageUrl);
        } else {
            if (!file) {
                toast.error("Un fichier est requis");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Le fichier dépasse la limite de 5 Mo");
                return;
            }
            formData.set("file", file);
            formData.delete("url");
        }
        startTransition(async () => {
            const res = await createResourceAsAdmin(formData);
            if (res?.error) {
                toast.error(res.error);
                return;
            }
            toast.success("Ressource créée");
            setOpen(false);
            reset();
        });
    }

    const triggerButton = (
        <Button type="button" className={ADMIN_BUTTON_PRIMARY_CLASS}>
            <PlusIcon className="size-3.5" />
            Nouvelle ressource
        </Button>
    );

    if (!mounted) return triggerButton;

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) reset();
            }}
        >
            <DialogTrigger asChild>{triggerButton}</DialogTrigger>
            <DialogContent className={ADMIN_DIALOG_CONTENT_CLASS}>
                <DialogHeader>
                    <DialogTitle className="font-serif text-[22px] leading-none">
                        Nouvelle ressource
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-[#080807]/60">
                        Les ressources créées sont approuvées et visibles immédiatement.
                    </DialogDescription>
                </DialogHeader>

                <form action={onSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label className={ADMIN_LABEL_CLASS}>Source</Label>
                        <ToggleGroup
                            type="single"
                            value={resourceType}
                            onValueChange={(v) => {
                                if (v === "external" || v === "file") setResourceType(v);
                            }}
                            variant="outline"
                            className="grid grid-cols-2 gap-2 *:rounded-none *:border-0 *:bg-[#F5F5F5] *:shadow-2xs *:data-[state=on]:bg-[#080807] *:data-[state=on]:text-white"
                        >
                            <ToggleGroupItem
                                value="external"
                                className="h-9 font-mono text-[10px] uppercase tracking-wider"
                            >
                                Lien externe
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="file"
                                className="h-9 font-mono text-[10px] uppercase tracking-wider"
                            >
                                Téléverser un fichier
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    {resourceType === "external" ? (
                        <div className="grid gap-2">
                            <Label htmlFor="url" className={ADMIN_LABEL_CLASS}>
                                URL
                            </Label>
                            <div className="relative">
                                <Input
                                    id="url"
                                    name="url"
                                    type="url"
                                    required
                                    placeholder="https://..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onBlur={(e) => tryFetchMetadata(e.target.value)}
                                    onPaste={(e) => {
                                        const pasted = e.clipboardData.getData("text");
                                        setTimeout(() => tryFetchMetadata(pasted), 0);
                                    }}
                                    className={ADMIN_INPUT_CLASS}
                                />
                                {isFetching ? (
                                    <Loader className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-[#080807]/50" />
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor="file" className={ADMIN_LABEL_CLASS}>
                                Fichier
                            </Label>
                            <Input
                                id="file"
                                type="file"
                                required
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                className={ADMIN_INPUT_CLASS}
                            />
                            <p className="font-mono text-[10px] uppercase tracking-wider text-[#080807]/50">
                                Hébergé sur Filebase · max 5 Mo
                                {file ? ` · ${(file.size / 1024 / 1024).toFixed(2)} Mo` : ""}
                            </p>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="title" className={ADMIN_LABEL_CLASS}>
                            Titre
                        </Label>
                        <Input
                            id="title"
                            required
                            placeholder="Titre de la ressource"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={ADMIN_INPUT_CLASS}
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="description" className={ADMIN_LABEL_CLASS}>
                                Description
                            </Label>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#080807]/40">
                                {description.length}/{DESC_MAX}
                            </span>
                        </div>
                        <Textarea
                            id="description"
                            rows={3}
                            maxLength={DESC_MAX}
                            placeholder="Brève description (optionnel)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={ADMIN_TEXTAREA_CLASS}
                        />
                    </div>

                    {resourceType === "external" && imageUrl ? (
                        <CoverPreview src={imageUrl} />
                    ) : null}

                    <div className="grid gap-2">
                        <Label className={ADMIN_LABEL_CLASS}>Catégorie</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className={ADMIN_SELECT_TRIGGER_CLASS}>
                                <SelectValue placeholder="Sélectionner une catégorie (optionnel)" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-0 bg-[#F5F5F5] shadow-2xs">
                                {categories.length === 0 ? (
                                    <div className="px-2 py-1.5 text-[12px] text-[#080807]/50">
                                        Aucune catégorie
                                    </div>
                                ) : (
                                    categories.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={c.id}
                                            className="rounded-none text-[13px] focus:bg-[#080807]/5 focus:text-[#080807]"
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
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
                            type="submit"
                            disabled={isPending}
                            className={ADMIN_BUTTON_PRIMARY_CLASS}
                        >
                            {isPending ? "Création..." : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
