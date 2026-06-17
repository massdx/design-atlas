"use client";

import Link from "next/link";
import { useWebHaptics } from "web-haptics/react";

type CategoryPillProps = {
    href: string;
    label: string;
    active: boolean;
    dot?: string;
};

export function CategoryPill({ href, label, active, dot }: CategoryPillProps) {
    const { trigger } = useWebHaptics({ debug: true });

    return (
        <Link
            href={href}
            onClick={() => trigger([
                { duration: 25 },
            ], { intensity: 0.7 })}
            className={
                active
                    ? "inline-flex h-9 items-center gap-2  bg-[#080807] px-3.5 text-[13px] text-[#E8E8E3]"
                    : "inline-flex h-9 items-center gap-2  bg-[#080807]/5 px-3.5 text-[13px] text-[#080807] hover:bg-[#080807]/10"
            }
        >
            {dot && (
                <span
                    aria-hidden
                    className="inline-block size-[7px] shadow-2xs rounded-full"
                    style={{ backgroundColor: dot }}
                />
            )}
            {label}
        </Link>
    );
}
