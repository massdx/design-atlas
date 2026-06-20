"use client";

import { DialogTitle } from "@/components/ui/custom-dialog";
import { useTapHaptic } from "@/hooks/use-tap-haptic";
import { ImageIcon, Link2Icon } from "@radix-ui/react-icons";
import { Loader } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
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
    email,
    isSubmitting,
    onTitleChange,
    onDescriptionChange,
    onCategoryChange,
    onTagsChange,
    onEmailChange,
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
    email: string;
    isSubmitting: boolean;
    onTitleChange: (v: string) => void;
    onDescriptionChange: (v: string) => void;
    onCategoryChange: (id: string) => void;
    onTagsChange: (tags: string[]) => void;
    onEmailChange: (v: string) => void;
    onBack: () => void;
    onSubmit: () => void;
}) {
    const tap = useTapHaptic();
    const [anonymous, setAnonymous] = useState(!email.trim());

    function toggleAnonymous() {
        tap();
        setAnonymous((prev) => {
            const next = !prev;
            if (next) onEmailChange("");
            return next;
        });
    }
    return (
        <motion.div
            key="details"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={STAGGER_CONTAINER}
            className="mx-auto max-w-3xl items-start justify-center  px-2"
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

            <div className=" flex w-full   items-start justify-start mt-3 gap-6  ">
                <AnimatePresence mode="wait">
                    {imageUrl ? (
                        <motion.div
                            key="cover"
                            initial={{ opacity: 0, scaleX: 0.92, filter: "blur(2px)" }}
                            animate={{ opacity: 1, scaleX: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scaleX: 0.92, filter: "blur(2px)" }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className=" translate-y-6 hidden w-72 origin-left shrink-0 self-start md:block"
                        >
                            <CoverPreview src={imageUrl} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="no-cover"
                            initial={{ opacity: 0, filter: "blur(2px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(2px)" }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="translate-y-6 hidden w-72 shrink-0 self-start md:block"
                        >
                            <div className="flex aspect-[1.91/1] w-full flex-col items-center justify-center gap-1.5 border border-dashed border-[#080807]/15 bg-[#F5F5F5]/50 text-center">
                                <ImageIcon className="size-5 text-[#080807]/30" />
                                <span className="font-mono text-[10px] uppercase tracking-wider text-[#080807]/40">
                                    Pas de cover
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex w-full max-w-md flex-col gap-5 ">

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

                    <AnimatedField className="grid gap-2">
                        <FieldLabel>Tags</FieldLabel>
                        <TagInput value={tags} onChange={onTagsChange} />
                    </AnimatedField>

                    <AnimatedField className="grid gap-2">
                        <label
                            htmlFor="submit-anonymous"
                            className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#080807]"
                        >
                            <input
                                id="submit-anonymous"
                                type="checkbox"
                                checked={anonymous}
                                onChange={toggleAnonymous}
                                className="size-4 cursor-pointer accent-[#080807]"
                            />
                            Soumission anonyme
                        </label>

                        <AnimatePresence initial={false}>
                            {!anonymous && (
                                <motion.div
                                    key="email-field"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid gap-1.5 pt-1">
                                        <FieldLabel htmlFor="submit-email">Email</FieldLabel>
                                        <StyledInput
                                            id="submit-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => onEmailChange(e.target.value)}
                                            placeholder="vous@exemple.com"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </AnimatedField>

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
                </div>

            </div>

        </motion.div>
    );
}
