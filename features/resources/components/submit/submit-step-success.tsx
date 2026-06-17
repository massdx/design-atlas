"use client";

import { DialogTitle } from "@/components/ui/custom-dialog";
import { motion } from "motion/react";
import { useEffect } from "react";
import { AnimatedField } from "./animated-field";
import { STAGGER_CONTAINER } from "./constants";

const FUN_GIFS = [
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjVxOW92NnJidHY2NWN5bGF6cmVubXJwdWNpbThqZ2RmbjV6MjIyYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ORjfgiG9ZtxcQQwZzv/giphy.gif",
    "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif",
    "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif",
] as const;

const AUTO_CLOSE_MS = 8000;

export function SubmitStepSuccess({ onClose }: { onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, AUTO_CLOSE_MS);
        return () => clearTimeout(t);
    }, [onClose]);

    const gif = FUN_GIFS[Math.floor(Math.random() * FUN_GIFS.length)];

    return (
        <motion.div
            key="success"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={STAGGER_CONTAINER}
            className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center"
        >
            <AnimatedField className="w-full">
                <div className="relative mx-auto aspect-video w-full max-w-sm overflow-hidden bg-[#080807]/5 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={gif}
                        alt=""
                        className="size-full object-cover"
                        draggable={false}
                    />
                </div>
            </AnimatedField>

            <AnimatedField>
                <DialogTitle className="font-serif text-[28px] leading-none">
                    Merci pour ta contribution !
                </DialogTitle>
            </AnimatedField>

            <AnimatedField>
                <p className="text-[16px] text-[#080807]/70">
                    Ta ressource est en attente de validation. On la regarde dans
                    les 24-48h. Tu peux fermer cette fenêtre.
                </p>
            </AnimatedField>

            <AnimatedField>
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-9 items-center gap-1.5 bg-[#080807] px-4 text-[13px] font-medium text-white shadow-2xs transition-opacity hover:opacity-90"
                >
                    Fermer
                </button>
            </AnimatedField>
        </motion.div>
    );
}
