"use client";

import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/custom-dialog";
import {
    fetchUrlMetadata,
    submitResource,
} from "@/features/resources/actions";
import { useMounted } from "@/hooks/use-mounted";
import { PlusIcon } from "@radix-ui/react-icons";
import { AnimatePresence } from "motion/react";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import type { Category } from "./submit/category-picker";
import { DESC_MAX } from "./submit/constants";
import { SubmitStepDetails } from "./submit/submit-step-details";
import { SubmitStepSuccess } from "./submit/submit-step-success";
import { SubmitStepUrl } from "./submit/submit-step-url";

type Step = "url" | "details" | "success";

export function SubmitResourceDialog({
    categories,
    trigger,
}: {
    categories: Category[];
    trigger?: ReactNode;
}) {
    const mounted = useMounted();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("url");

    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const [isFetching, startFetching] = useTransition();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (open) return;
        setStep("url");
        setUrl("");
        setTitle("");
        setDescription("");
        setImageUrl("");
        setCategoryId("");
        setTags([]);
    }, [open]);

    function handleFetchAndNext() {
        const trimmed = url.trim();
        if (!trimmed) {
            toast.error("Renseigne une URL");
            return;
        }
        try {
            new URL(trimmed);
        } catch {
            toast.error("URL invalide");
            return;
        }
        startFetching(async () => {
            const res = await fetchUrlMetadata(trimmed);
            if (res.error || !res.data) {
                toast.error(res.error ?? "Impossible de récupérer les infos");
                return;
            }
            setTitle(res.data.title ?? "");
            setDescription((res.data.description ?? "").slice(0, DESC_MAX));
            setImageUrl(res.data.image ?? "");
            setStep("details");
        });
    }

    function handleSubmit() {
        if (!title.trim()) {
            toast.error("Le titre est requis");
            return;
        }
        if (!categoryId) {
            toast.error("Choisis une catégorie");
            return;
        }
        const formData = new FormData();
        formData.set("categoryId", categoryId);
        formData.set("title", title.trim());
        formData.set("url", url.trim());
        formData.set("description", description.trim());
        formData.set("imageUrl", imageUrl.trim());
        formData.set("tags", tags.join(","));

        startTransition(async () => {
            const res = await submitResource(formData);
            if (res?.error) {
                toast.error(res.error);
                return;
            }
            setStep("success");
        });
    }

    const fallbackTrigger = (
        <button
            type="button"
            className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-[#080807] underline underline-offset-4 hover:opacity-70"
        >
            <PlusIcon className="size-3.5" />
            Submit resource
        </button>
    );

    if (!mounted) return trigger ?? fallbackTrigger;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger ?? fallbackTrigger}</DialogTrigger>
            <DialogContent className="h-full border-0 bg-transparent p-0 shadow-none sm:max-w-2xl">
                <div className="py-12">
                    <AnimatePresence mode="popLayout" initial>
                        {step === "url" && (
                            <SubmitStepUrl
                                url={url}
                                onUrlChange={setUrl}
                                onSubmit={handleFetchAndNext}
                                isLoading={isFetching}
                            />
                        )}
                        {step === "details" && (
                            <SubmitStepDetails
                                url={url}
                                title={title}
                                description={description}
                                imageUrl={imageUrl}
                                categories={categories}
                                categoryId={categoryId}
                                tags={tags}
                                isSubmitting={isPending}
                                onTitleChange={setTitle}
                                onDescriptionChange={setDescription}
                                onCategoryChange={setCategoryId}
                                onTagsChange={setTags}
                                onBack={() => setStep("url")}
                                onSubmit={handleSubmit}
                            />
                        )}
                        {step === "success" && (
                            <SubmitStepSuccess onClose={() => setOpen(false)} />
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
