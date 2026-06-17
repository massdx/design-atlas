"use client";

import { useTapHaptic } from "@/hooks/use-tap-haptic";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useRef, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { MAX_TAGS } from "./constants";

export function TagInput({
    value,
    onChange,
    max = MAX_TAGS,
}: {
    value: string[];
    onChange: (next: string[]) => void;
    max?: number;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [draft, setDraft] = useState("");
    const tap = useTapHaptic();

    function add(raw: string) {
        const cleaned = raw.trim().toLowerCase().replace(/^#+/, "");
        if (!cleaned) return;
        if (value.includes(cleaned)) {
            setDraft("");
            return;
        }
        if (value.length >= max) {
            toast.error(`Max ${max} tags`);
            return;
        }
        onChange([...value, cleaned]);
        setDraft("");
    }

    function remove(t: string) {
        onChange(value.filter((x) => x !== t));
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
        } else if (e.key === "Backspace" && !draft && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    }

    return (
        <div
            onClick={() => inputRef.current?.focus()}
            className="flex min-h-9 flex-wrap items-center gap-1.5 bg-[#F5F5F5] px-2 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-[#080807]/50"
        >
            {value.map((t) => (
                <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-white px-2 py-0.5 font-mono text-[11px] lowercase tracking-wide shadow-2xs"
                >
                    #{t}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            tap();
                            remove(t);
                        }}
                        className="text-[#080807]/50 hover:text-[#080807]"
                        aria-label={`Retirer ${t}`}
                    >
                        <Cross2Icon className="size-3" />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => draft && add(draft)}
                placeholder={
                    value.length === 0 ? "ex: typography, free (Entrée)" : ""
                }
                className="min-w-32 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#080807]/40"
            />
        </div>
    );
}
