"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { FIELD_TRANSITION, FIELD_VARIANTS } from "./constants";

type AnimatedFieldProps = HTMLMotionProps<"div">;

export function AnimatedField({
    className,
    children,
    ...props
}: AnimatedFieldProps) {
    return (
        <motion.div
            variants={FIELD_VARIANTS}
            transition={FIELD_TRANSITION}
            className={`will-change-transform ${className ?? ""}`}
            {...props}
        >
            {children}
        </motion.div>
    );
}
