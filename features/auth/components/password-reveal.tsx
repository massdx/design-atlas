"use client";

import { useEffect, useRef } from "react";

const EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
const EYE_ON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`;

/**
 * Ajoute un bouton afficher/masquer sur les champs mot de passe rendus par
 * AuthView. Le toggle n'est pas configurable côté lib pour les vues sign-in /
 * reset-password, on l'injecte donc nous-mêmes. Le type est ré-appliqué via un
 * observer car react-hook-form remet `type="password"` à chaque rendu.
 */
export function PasswordReveal({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const cleanups: Array<() => void> = [];

        function enhance(input: HTMLInputElement) {
            if (input.dataset.revealEnhanced) return;
            const wrapper =
                input.closest<HTMLElement>("div.relative") ?? input.parentElement;
            if (!wrapper) return;

            input.dataset.revealEnhanced = "true";
            input.style.paddingRight = "2.5rem";

            let visible = false;

            const applyType = () => {
                const desired = visible ? "text" : "password";
                if (input.getAttribute("type") !== desired) {
                    input.setAttribute("type", desired);
                }
            };

            const typeObserver = new MutationObserver(applyType);
            typeObserver.observe(input, {
                attributes: true,
                attributeFilter: ["type"],
            });

            const btn = document.createElement("button");
            btn.type = "button";
            btn.tabIndex = -1;
            btn.setAttribute("aria-label", "Afficher le mot de passe");
            btn.className =
                "absolute top-0 right-0 flex h-10 w-10 items-center justify-center text-[#080807]/45 transition-colors hover:text-[#080807]";
            btn.innerHTML = EYE_OFF;
            btn.addEventListener("click", () => {
                visible = !visible;
                btn.innerHTML = visible ? EYE_ON : EYE_OFF;
                btn.setAttribute(
                    "aria-label",
                    visible ? "Masquer le mot de passe" : "Afficher le mot de passe",
                );
                applyType();
            });

            wrapper.appendChild(btn);

            cleanups.push(() => {
                typeObserver.disconnect();
                btn.remove();
                delete input.dataset.revealEnhanced;
            });
        }

        const scan = () => {
            root
                .querySelectorAll<HTMLInputElement>('input[type="password"]')
                .forEach(enhance);
        };

        scan();
        const treeObserver = new MutationObserver(scan);
        treeObserver.observe(root, { childList: true, subtree: true });

        return () => {
            treeObserver.disconnect();
            cleanups.forEach((c) => c());
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
}
