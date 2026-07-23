"use client";

import { AlertDialogTitle as DialogTitle } from "@/components/ui/custom-alert-dialog";
import { useTapHaptic } from "@/hooks/use-tap-haptic";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Loader } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedField } from "./animated-field";
import { STAGGER_CONTAINER } from "./constants";

export function SubmitStepUrl({
    url,
    onUrlChange,
    onSubmit,
    isLoading,
}: {
    url: string;
    onUrlChange: (v: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}) {
    const tap = useTapHaptic();
    return (
        <motion.div
            key="url"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={STAGGER_CONTAINER}
            className="mx-auto flex max-w-lg flex-col gap-5"
        >
            <AnimatedField>
                <DialogTitle className="font-serif text-[28px] leading-none">
                    Soumettre
                </DialogTitle>
            </AnimatedField>

            <AnimatedField>
                <p className="text-[16px] text-[#080807]/70">
                    Si votre demande est acceptée, votre site web sera publié dans la
                    galerie, dans un delai de 24 à 48h, Merci !
                </p>
            </AnimatedField>

            <motion.form
                variants={{
                    hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                }}
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
                className="relative mt-2 max-w-md flex gap-2 will-change-transform"
            >
                <input
                    type="url"
                    required
                    placeholder="https://votrelien.com"
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                    className="h-10 w-full rounded-none bg-[#F5F5F5] px-3 text-[14px] shadow-2xs placeholder:text-[#757575] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#080807]/50 disabled:opacity-60"
                />
                <button
                    type="submit"
                    disabled={isLoading || !url.trim()}
                    onClick={tap}
                    aria-label="Continuer"
                    className="inline-flex h-10 items-center gap-1.5 bg-[#080807] px-5 text-[13px] font-medium text-white shadow-2xs transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                    {isLoading ? (
                        <Loader className="size-4 animate-spin" />
                    ) : (
                        <ArrowRightIcon className="size-4" />
                    )}
                </button>
            </motion.form>

            <AnimatedField className="-translate-y-2">
                <p className="text-left font-sans text-[12px] text-[#919191]">
                    Titre, description et image récupérés automatiquement
                </p>
            </AnimatedField>
        </motion.div>
    );
}
