"use client";

import { DialogTitle } from "@/components/ui/custom-dialog";
import { useTapHaptic } from "@/hooks/use-tap-haptic";
import { Link2Icon } from "@radix-ui/react-icons";
import { Loader } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedField } from "./animated-field";
import { CategoryPicker, type Category } from "./category-picker";
import { DESC_MAX, STAGGER_CONTAINER } from "./constants";
import { CoverPreview } from "./cover-preview";
import { FieldLabel, StyledInput, StyledTextarea } from "./field-controls";
import { TagInput } from "./tag-input";

export function SubmitStepDetails({
    url,
    title,
    description,
    imageUrl,
    categories,
    categoryId,
    tags,
    isSubmitting,
    onTitleChange,
    onDescriptionChange,
    onCategoryChange,
    onTagsChange,
    onBack,
    onSubmit,
}: {
    url: string;
    title: string;
    description: string;
    imageUrl: string;
    categories: Category[];
    categoryId: string;
    tags: string[];
    isSubmitting: boolean;
    onTitleChange: (v: string) => void;
    onDescriptionChange: (v: string) => void;
    onCategoryChange: (id: string) => void;
    onTagsChange: (tags: string[]) => void;
    onBack: () => void;
    onSubmit: () => void;
}) {
    const tap = useTapHaptic();
    return (
        <motion.div
            key="details"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={STAGGER_CONTAINER}
            className="mx-auto flex max-w-md flex-col gap-5"
        >
            <AnimatedField>
                <DialogTitle className="font-serif text-[22px] leading-none">
                    Details de la ressource
                </DialogTitle>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-[#080807]/60">
                    <Link2Icon className="size-3.5" />
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                    >
                        {url}
                    </a>
                </p>
            </AnimatedField>

            <AnimatedField className="grid gap-1.5">
                <FieldLabel htmlFor="submit-title">Titre</FieldLabel>
                <StyledInput
                    id="submit-title"
                    required
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Nom de la ressource"
                />
            </AnimatedField>

            <AnimatedField className="grid gap-1.5">
                <FieldLabel htmlFor="submit-desc">Description</FieldLabel>
                <div className="relative">
                    <StyledTextarea
                        id="submit-desc"
                        rows={4}
                        maxLength={DESC_MAX}
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Courte description"
                        className=""
                    />
                    <span className="pointer-events-none text-right absolute -bottom-5 right-0 font-mono text-[10px] text-[#080807]/40">
                        {description.length}/{DESC_MAX}
                    </span>
                </div>
            </AnimatedField>

            <AnimatedField className="grid gap-2">
                <FieldLabel>Catégories</FieldLabel>
                <CategoryPicker
                    categories={categories}
                    value={categoryId}
                    onChange={onCategoryChange}
                />
            </AnimatedField>

            {/* <AnimatedField className="grid gap-2">
                <FieldLabel>Tags</FieldLabel>
                <TagInput value={tags} onChange={onTagsChange} />
            </AnimatedField> */}

            {imageUrl && (
                <AnimatedField>
                    <CoverPreview src={imageUrl} />
                </AnimatedField>
            )}

            <AnimatedField className="mt-2 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => {
                        tap();
                        onBack();
                    }}
                    disabled={isSubmitting}
                    className="text-[12px] text-[#080807]/60 underline underline-offset-4 hover:text-[#080807]"
                >
                    Modifier le lien
                </button>
                <button
                    type="button"
                    onClick={() => {
                        tap();
                        onSubmit();
                    }}
                    disabled={isSubmitting || !title.trim() || !categoryId}
                    className="inline-flex h-9 items-center gap-2 bg-[#080807] px-5 text-[13px] font-medium text-white shadow-2xs transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                    {isSubmitting ? (
                        <>
                            <Loader className="size-3.5 animate-spin" />
                            Envoi...
                        </>
                    ) : (
                        "Soumettre"
                    )}
                </button>
            </AnimatedField>
        </motion.div>
    );
}
