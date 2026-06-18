"use client";

import { animate, stagger } from "motion/react";
import { useEffect, useRef } from "react";
import SplitType from "split-type";

export function Hero() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (!titleRef.current || !subRef.current) return;

        const titleSplit = new SplitType(titleRef.current, {
            types: "words",
            tagName: "span",
            wordClass: "inline-block will-change-[transform,opacity,filter]",
        });
        const words = titleSplit.words ?? [];

        const subSplit = new SplitType(subRef.current, {
            types: "lines",
            tagName: "span",
            lineClass: "block overflow-hidden will-change-transform ",
        });
        const lines = subSplit.lines ?? [];

        const titleAnim = animate(
            words,
            { opacity: [0, 1], y: ["0.6em", "0em"], filter: ["blur(4px)", "blur(0px)"] },
            {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: stagger(0.05),
            },
        );

        const subAnim = animate(
            lines,
            { opacity: [0, 1], y: ["0.6em", "0em"], filter: ["blur(4px)", "blur(0px)"] },
            {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: stagger(0.08, { startDelay: 0.35 }),
            },
        );

        return () => {
            titleAnim.stop();
            subAnim.stop();
            titleSplit.revert();
            subSplit.revert();
        };
    }, []);

    return (
        <section className="relative z-10 mx-auto flex  flex-col items-start gap-3 px-6 pt-14 sm:pt-20">
            <h1
                ref={titleRef}
                className="font-serif overflow-hidden text-[34px] sm:text-[45px] max-w-lg  leading-[115%] tracking-tight"
            >
                Ressources utiles pour les {" "} <br className="hidden sm:block" />
                <span className="italic">créateurs du web</span>
            </h1>
            <p ref={subRef} className="text-[13px] sm:text-[14px] font-normal max-w-sm  text-[#080807]">
                Sélectionnées et partagées par des designers,<br className="hidden sm:block" /> pour des designers.
            </p>
        </section>
    );
}
