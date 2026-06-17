"use client";

import { animate, stagger } from "motion/react";
import { useEffect, useRef } from "react";
import SplitType from "split-type";

export function Hero() {
    const rootRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!rootRef.current) return;

        const split = new SplitType(rootRef.current, {
            types: "words",
            tagName: "span",
        });

        const words = split.words ?? [];
        for (const c of words) {
            (c as HTMLElement).style.display = "inline-block";
            (c as HTMLElement).style.willChange = "transform, opacity";
        }

        const controls = animate(
            words,
            { opacity: [0, 1], y: ["0.6em", "0em"],  filter: ["blur(4px)", "blur(0px)"] },
            {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: stagger(0.05),
            },
        );

        return () => {
            controls.stop();
            split.revert();
        };
    }, []);

    return (
        <section className="relative z-10 mx-auto flex  flex-col items-start gap-3 px-6 pt-20">
            <h1
                ref={rootRef}
                className="font-serif overflow-hidden text-[55px] max-w-lg  leading-[115%] tracking-tight"
            >
                Ressources utiles pour les{" "}
                <span className="italic">créateurs du web</span>
            </h1>
            <p className="text-md  max-w-sm  text-[#080807]">
                Sélectionnées et partagées par des designers, pour des designers.
            </p>
        </section>
    );
}
