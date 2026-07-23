"use client";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogTrigger,
} from "@/components/ui/custom-alert-dialog";
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
    const [email, setEmail] = useState("");

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
        setEmail("");
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
        const trimmedEmail = email.trim();
        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            toast.error("Email invalide");
            return;
        }
        const formData = new FormData();
        formData.set("categoryId", categoryId);
        formData.set("title", title.trim());
        formData.set("url", url.trim());
        formData.set("description", description.trim());
        formData.set("imageUrl", imageUrl.trim());
        formData.set("tags", tags.join(","));
        formData.set("email", trimmedEmail);

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
        <AlertDialog open={open} onOpenChange={setOpen} >
            <AlertDialogTrigger asChild>{trigger ?? fallbackTrigger}</AlertDialogTrigger>
            <AlertDialogContent className="h-full border-0 bg-transparent p-0 shadow-none sm:max-w-4xl">
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
                                email={email}
                                isSubmitting={isPending}
                                onTitleChange={setTitle}
                                onDescriptionChange={setDescription}
                                onCategoryChange={setCategoryId}
                                onTagsChange={setTags}
                                onEmailChange={setEmail}
                                onBack={() => setStep("url")}
                                onSubmit={handleSubmit}
                            />
                        )}
                        {step === "success" && (
                            <SubmitStepSuccess onClose={() => setOpen(false)} />
                        )}
                    </AnimatePresence>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
