"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/manager", label: "Ressources" },
    { href: "/manager/categories", label: "Catégories" },
    { href: "/manager/admins", label: "Admins" },
];

export function ManagerNav() {
    const pathname = usePathname();
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
                            "text-[12px] font-medium transition-opacity hover:opacity-100",
                            active
                                ? "text-[#080807] opacity-100"
                                : "text-[#080807] opacity-50",
                        )}
                    >
                        {l.label}
                    </Link>
                );
            })}
        </nav>
    );
}
