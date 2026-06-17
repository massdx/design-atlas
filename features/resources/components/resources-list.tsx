"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSuperHoverRef } from "super-hover/react";
import { useWebHaptics } from "web-haptics/react";
import type { ResourceRow as ResourceRowType } from "../queries";
import { ResourceRow } from "./resource-row";

const SPRING = { damping: 22, stiffness: 220, mass: 0.6 } as const;
const PREVIEW_W = 220;
const OFFSET_X = 24;
const OFFSET_Y = -40;

export function ResourcesList({
    rows,
    total,
}: {
    rows: ResourceRowType[];
    total: number;
}) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const lastIdRef = useRef<string | null>(null);
    const hasPositionedRef = useRef(false);
    const { trigger } = useWebHaptics({ debug: true });
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, SPRING);
    const sy = useSpring(y, SPRING);

    const rootRef = useSuperHoverRef({
        onEnter(event) {
            const id =
                (event.detail.current as HTMLElement | null)?.dataset
                    .resourceId ?? null;
            if (id !== lastIdRef.current) {
                lastIdRef.current = id;
                if (id) trigger([{ duration: 40 }]);
                setHoveredId(id);
            }
        },
        onLeave() {
            lastIdRef.current = null;
            hasPositionedRef.current = false;
            setHoveredId(null);
        },
    });

    useEffect(() => {
        function move(e: PointerEvent) {
            if (!lastIdRef.current) return;
            const next = e.clientX + OFFSET_X;
            x.set(next);
            y.set(e.clientY + OFFSET_Y);
            if (!hasPositionedRef.current) {
                hasPositionedRef.current = true;
                x.jump(next);
                y.jump(e.clientY + OFFSET_Y);
            }
        }
        window.addEventListener("pointermove", move, { passive: true });
        return () => window.removeEventListener("pointermove", move);
    }, [x, y]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const hovered = hoveredId
        ? rows.find((r) => r.id === hoveredId) ?? null
        : null;

    useEffect(() => {
        const next = hovered?.imageUrl ?? null;
        if (next) setPreviewSrc(next);
    }, [hovered?.imageUrl]);

    const showPreview = !!hovered?.imageUrl;

    return (
        <section>
            <div className="relative z-10 mx-auto mt-10 px-6">
                <p className="font-(--font-dm-mono) text-[12px] uppercase tracking-wider text-[#938F8A]">
                    Browse ({String(total).padStart(4, "0")}) resources_
                </p>
            </div>

            <div className="relative z-10 mx-auto mt-4 px-6 pb-24">
                <ul
                    ref={rootRef}
                    className="group/list divide-y divide-[#080807]/5"
                >
                    {rows.length === 0 ? (
                        <li className="py-10 text-center text-sm text-[#080807]/40">
                            No resources yet.
                        </li>
                    ) : (
                        rows.map((r) => (
                            <li
                                key={r.id}
                                data-super-hover
                                data-resource-id={r.id}
                                className="opacity-100 transition-opacity duration-200 ease-out group-has-data-super-hover-active/list:opacity-60 data-super-hover-active:opacity-100!"
                            >
                                <ResourceRow
                                    resource={r}
                                    active={hoveredId === r.id}
                                />
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {mounted &&
                createPortal(
                    <motion.div
                        initial={false}
                        animate={{
                            opacity: showPreview ? 1 : 0,
                            scale: showPreview ? 1 : 0.92,
                        }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            x: sx,
                            y: sy,
                            width: 250,
                            height: "auto",
                        }}
                        className="pointer-events-none fixed left-0 top-0 z-50 overflow-hidden   shadow-[0_30px_80px_-20px_rgba(8,8,7,0.35)] ring-1 ring-black/5"
                    >
                        {previewSrc && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewSrc}
                                alt=""
                                className="block h-auto w-full object-contain"
                                draggable={false}
                            />
                        )}
                    </motion.div>,
                    document.body,
                )}
        </section>
    );
}
