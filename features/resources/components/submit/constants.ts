import type { Variants } from "motion/react";

export const MAX_TAGS = 10;
export const DESC_MAX = 200;

export const FIELD_TRANSITION = {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
};

export const FIELD_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const STAGGER_CONTAINER: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.02 },
    },
};

export const INPUT_BASE_CLASS =
    "h-10 w-full rounded-none border-0 bg-[#F5F5F5] px-3 text-[14px] shadow-2xs placeholder:text-[#757575] focus-visible:ring-1 focus-visible:ring-[#080807]/80";

export const TEXTAREA_BASE_CLASS =
    "w-full rounded-none border-0 bg-[#F5F5F5] pl-3  py-2 text-[14px] shadow-2xs placeholder:text-[#757575] focus-visible:ring-1 focus-visible:ring-[#080807]/80";
