"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function CoverPreview({ src }: { src: string }) {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [src]);

    if (!src || error) return null;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-[#F5F5F5] shadow-2xs">
                <Image
                    src={src}
                    alt="Aperçu"
                    fill
                    unoptimized
                    className="object-cover"
                    onError={() => setError(true)}
                />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#080807]/40">
                Cover image
            </span>
        </div>
    );
}
