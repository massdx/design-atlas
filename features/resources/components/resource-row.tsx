"use client";

import { useTapHaptic } from "@/hooks/use-tap-haptic";
import { categoryColor } from "@/lib/dot-color";
import {
    ArrowRightIcon
} from "@radix-ui/react-icons";
import { motion, useAnimationControls } from "motion/react";
import { memo, useEffect, useRef, useState } from "react";
import { formatShortDate } from "../lib/format";
import type { ResourceRow as ResourceRowType } from "../queries";

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.3;

function ResourceRowImpl({
    resource,
    active,
}: {
    resource: ResourceRowType;
    active: boolean;
}) {
    const fill = useAnimationControls();
    const seqRef = useRef(0);
    const hasBeenActiveRef = useRef(false);
    const [copied, setCopied] = useState(false);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tap = useTapHaptic();

    useEffect(() => {
        const seq = ++seqRef.current;
        if (active) {
            hasBeenActiveRef.current = true;
            fill.set({ y: "-100%" });
            fill.start({
                y: "0%",
                transition: { duration: DURATION, ease: EASE },
            });
        } else if (hasBeenActiveRef.current) {
            fill.start({
                y: "100%",
                transition: { duration: DURATION, ease: EASE },
            }).then(() => {
                if (seqRef.current === seq) fill.set({ y: "-100%" });
            });
        }
    }, [active, fill]);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    async function handleCopy(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(resource.url);
            setCopied(true);
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            copyTimeoutRef.current = setTimeout(() => setCopied(false), 1400);
        } catch {
            /* ignore */
        }
    }

    return (
        <div
            data-active={active || undefined}
            className="group/row relative cursor-pointer overflow-hidden"
        >
            <motion.span
                aria-hidden
                initial={{ y: "-100%" }}
                animate={fill}
                className="pointer-events-none absolute inset-0 bg-[#080807]"
            />
            <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={resource.title}
                onClick={tap}
                className="absolute inset-0 z-0"
            />
            <div className="pointer-events-none relative z-10 flex items-center gap-3 px-1.5 py-2 transition-colors duration-100 ease-out group-data-active/row:text-[#E8E8E3]">
                <div className="flex min-w-0 items-center gap-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-active/row:translate-x-2.5">
                    <span
                        aria-hidden
                        className="inline-block size-1.75 shrink-0 rounded-full"
                        style={{ backgroundColor: categoryColor(resource.category) }}
                    />
                    <span className="min-w-0 max-w-full shrink truncate text-[14px] font-medium leading-7 text-[#080807] transition-colors duration-100 ease-out group-data-active/row:text-[#E8E8E3]">
                        {resource.title}
                    </span>
                    <span
                        aria-hidden
                        className="hidden size-1 shrink-0 rounded-full bg-[#91918D] transition-colors duration-100 ease-out group-data-active/row:bg-[#E8E8E3]/40 sm:inline-block"
                    />
                    <span className="hidden truncate font-(--font-dm-mono) text-[14px] leading-7 text-[#080807]/40 transition-colors duration-100 ease-out group-data-active/row:text-[#E8E8E3]/60 sm:inline">
                        <span className="group-data-active/row:hidden">
                            {resource.description}
                        </span>
                        <span className="hidden group-data-active/row:inline">
                            {resource.url}
                        </span>
                    </span>
                </div>
                <span className="ml-auto flex shrink-0 items-center gap-3 font-(--font-dm-mono) text-[12px] uppercase tracking-wide text-[#71717A] transition-colors duration-100 ease-out group-data-active/row:text-[#E8E8E3]/70">



                    <span className="translate-x-8 opacity-100 transition-all duration-150 group-data-active/row:-translate-x-1 group-data-active/row:opacity-0">
                        {formatShortDate(resource.createdAt)}
                    </span>
                    {active && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            aria-label={copied ? "Lien copié" : "Copier le lien"}
                            className="pointer-events-auto relative inline-flex size-5 shrink-0  items-center justify-center  -translate-x-6.5 opacity-0 transition-all duration-150 group-data-active/row:-translate-x-4 group-data-active/row:opacity-100 "
                        >
                            {/* <AnimatePresence mode="wait" initial={false}>
                            {copied ? (
                                <motion.span
                                    key="check"
                                    initial={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
                                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                                    exit={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
                                    transition={{ duration: 0.18, ease: EASE }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <CheckIcon className="size-4" />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="copy"
                                    initial={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
                                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                                    exit={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
                                    transition={{ duration: 0.18, ease: EASE }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <CopyIcon className="size-4" />
                                </motion.span>
                            )}
                        </AnimatePresence> */}
                        </button>
                    )}
                    <ArrowRightIcon className="size-5 -translate-x-4.5 opacity-0 transition-all duration-150 group-data-active/row:-translate-x-2 group-data-active/row:opacity-100" />
                </span>
            </div>
        </div>
    );
}

export const ResourceRow = memo(ResourceRowImpl);
