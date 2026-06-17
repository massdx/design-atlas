"use client";

import { motion } from "motion/react";
import { Children, isValidElement } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function StaggerIn({
    children,
    delay = 0,
    step = 0.08,
    duration = 0.6,
    y = 12,
}: {
    children: React.ReactNode;
    delay?: number;
    step?: number;
    duration?: number;
    y?: number;
}) {
    const items = Children.toArray(children).filter(isValidElement);
    return (
        <>
            {items.map((child, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y, filter: "blur(2px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                        duration,
                        ease: EASE,
                        delay: delay + i * step,
                    }}
                    style={{ willChange: "transform, opacity, filter" }}
                >
                    {child}
                </motion.div>
            ))}
        </>
    );
}
