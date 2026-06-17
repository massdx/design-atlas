"use client";

import { useTapHaptic } from "@/hooks/use-tap-haptic";
import { dotColor } from "@/lib/dot-color";
import { CheckIcon } from "@radix-ui/react-icons";

export type Category = { id: string; name: string };

export function CategoryPicker({
    categories,
    value,
    onChange,
}: {
    categories: Category[];
    value: string;
    onChange: (id: string) => void;
}) {
    const tap = useTapHaptic();

    if (categories.length === 0) {
        return (
            <p className="text-xs text-muted-foreground">
                Aucune catégorie disponible.
            </p>
        );
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => {
                const active = value === c.id;
                return (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                            tap();
                            onChange(c.id);
                        }}
                        aria-pressed={active}
                        className={
                            active
                                ? "inline-flex h-9 items-center gap-2 bg-[#080807] px-3 text-[12px] text-white shadow-2xs"
                                : "inline-flex h-9 items-center gap-2 bg-[#F5F5F5] px-3 text-[12px] text-[#080807] shadow-2xs hover:bg-[#080807]/10"
                        }
                    >
                        <span
                            aria-hidden
                            className="relative inline-flex size-3 items-center justify-center"
                        >
                            <span
                                className="absolute inset-0 m-auto block size-[7px] rounded-full transition-opacity"
                                style={{
                                    backgroundColor: dotColor(c.id),
                                    opacity: active ? 0 : 1,
                                }}
                            />
                            <CheckIcon
                                className="absolute inset-0 m-auto size-3 transition-opacity"
                                style={{ opacity: active ? 1 : 0 }}
                            />
                        </span>
                        {c.name}
                    </button>
                );
            })}
        </div>
    );
}
