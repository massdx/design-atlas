"use client";

import { authClient } from "@/features/auth/client";
import { cn } from "@/lib/utils";
import { ExitIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const links = [
    { href: "/manager", label: "Ressources" },
    { href: "/manager/categories", label: "Catégories" },
    { href: "/manager/admins", label: "Admins" },
];

export function ManagerNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isSigningOut, startSignOut] = useTransition();

    function handleSignOut() {
        startSignOut(async () => {
            await authClient.signOut();
            router.replace("/manager/sign-in");
            router.refresh();
        });
    }

    return (
        <nav className="flex items-center gap-5">
            {links.map((l) => {
                const active =
                    l.href === "/manager"
                        ? pathname === "/manager"
                        : pathname.startsWith(l.href);
                return (
                    <Link
                        key={l.href}
                        href={l.href}
                        className={cn(
                            "text-[14px] font-medium transition-opacity hover:opacity-100",
                            active
                                ? "text-[#080807] opacity-100 underline"
                                : "text-[#080807] opacity-50",
                        )}
                    >
                        {l.label}
                    </Link>
                );
            })}
            <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-red-700 cursor-pointer  opacity-50 transition-opacity hover:opacity-100 disabled:opacity-30"
            >
               
                Déconnexion
            </button>
        </nav>
    );
}
