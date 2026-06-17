"use client";

import { dotColor } from "@/lib/dot-color";
import { ArrowRightIcon, ArrowTopRightIcon } from "@radix-ui/react-icons";
import { motion, useAnimationControls } from "motion/react";
import { useWebHaptics } from "web-haptics/react";
import { formatShortDate, hostname } from "../lib/format";
import type { ResourceRow as ResourceRowType } from "../queries";

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.3;

export function ResourceRow({ resource }: { resource: ResourceRowType }) {
    const fill = useAnimationControls();
    const { trigger } = useWebHaptics({ debug: true });

    const handleEnter = () => {
        trigger([{ duration: 40 }]);
        fill.set({ y: "-100%" });
        fill.start({ y: "0%", transition: { duration: DURATION, ease: EASE } });
    };

    const handleLeave = async () => {
        await fill.start({ y: "100%", transition: { duration: DURATION, ease: EASE } });
        fill.set({ y: "-100%" });
    };

    return (
        <motion.div
            onHoverStart={handleEnter}
            onHoverEnd={handleLeave}
            className="group relative overflow-hidden "
        >
            <motion.span
                aria-hidden
                initial={{ y: "-100%" }}
                animate={fill}
                className="pointer-events-none absolute inset-0 bg-[#080807]"
            />
            <motion.a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-3 px-1.5 py-2 transition-colors duration-100 ease-out group-hover:text-[#E8E8E3]"
            >
                <div className="flex min-w-0 items-center gap-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2.5">
                    <span
                        aria-hidden
                        className="inline-block size-1.75 shrink-0 rounded-full"
                        style={{ backgroundColor: dotColor(resource.category?.id ?? resource.id) }}
                    />
                    <span className="   whitespace-nowrap   text-[14px] font-medium leading-7 text-[#080807] transition-colors duration-100 ease-out group-hover:text-[#E8E8E3]">
                        {resource.title}
                    </span>
                    <span
                        aria-hidden
                        className="inline-block size-1 shrink-0 rounded-full bg-[#91918D] transition-colors duration-100 ease-out group-hover:bg-[#E8E8E3]/40"
                    />
                    <span className="truncate font-(--font-dm-mono) text-[14px] leading-7 text-[#080807]/40 transition-colors duration-100 ease-out group-hover:text-[#E8E8E3]/60">
                        {resource.description}
                    </span>
                </div>
                <span className="ml-auto flex shrink-0 items-center gap-1.5 font-(--font-dm-mono) text-[12px] uppercase tracking-wide text-[#71717A] transition-colors duration-100 ease-out group-hover:text-[#E8E8E3]/70">

                    <span className="translate-x-8 opacity-100 transition-all duration-150 group-hover:-translate-x-1 group-hover:opacity-0">
                        {formatShortDate(resource.createdAt)}
                    </span>
                    {/* {hostname(resource.url)} */}
                    <ArrowRightIcon className="size-5  -translate-x-4.5 opacity-0 transition-all duration-150 group-hover:-translate-x-2 group-hover:opacity-100" />
                </span>
            </motion.a>
        </motion.div>
    );
}
