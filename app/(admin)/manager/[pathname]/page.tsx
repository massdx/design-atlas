"use client";

import { authClient } from "@/features/auth/client";
import { PasswordReveal } from "@/features/auth/components/password-reveal";
import { AuthView, NeonAuthUIProvider } from "@neondatabase/auth/react/ui";
import Link from "next/link";
import { use } from "react";

const authClassNames = {
    base: "border-0 bg-transparent p-0 shadow-none",
    header: "hidden",
    title: "hidden",
    description: "hidden",
    footer: "mt-6",
    footerLink: "text-[#080807] underline underline-offset-4 hover:opacity-70",
    form: {
        base: "gap-4",
        label: "text-[12px] font-medium text-[#080807]",
        input:
            "h-10 rounded-none border-0 bg-[#F5F5F5] px-3 text-[14px] shadow-2xs placeholder:text-[#757575] focus-visible:ring-1 focus-visible:ring-[#080807]/60",
        button:
            "h-10 rounded-none bg-[#080807] text-[13px] font-medium text-white transition-opacity hover:opacity-90",
        primaryButton:
            "h-10 rounded-none bg-[#080807] text-[13px] font-medium text-white transition-opacity hover:opacity-90",
        forgotPasswordLink:
            "text-[12px] text-[#080807]/60 underline underline-offset-4 hover:text-[#080807]",
        error: "text-[12px] text-red-600",
    },
} as const;

const fr = {
    SIGN_IN: "Connexion",
    SIGN_IN_ACTION: "Se connecter",
    EMAIL: "Email",
    EMAIL_PLACEHOLDER: "vous@exemple.com",
    PASSWORD: "Mot de passe",
    PASSWORD_PLACEHOLDER: "••••••••",
} as const;

export default function AuthPage({
    params,
}: {
    params: Promise<{ pathname: string }>;
}) {
    const { pathname } = use(params);

    return (
        <NeonAuthUIProvider
            authClient={authClient}
            basePath="/manager"
            redirectTo="/manager"
            signUp={false}
        >
            <main className="flex min-h-screen items-center justify-center bg-[#E8E8E3] px-6 py-10">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex flex-col items-center gap-2 text-center">
                        <Link
                            href="/"
                            className="font-serif text-[22px] leading-none tracking-tight text-[#080807]"
                        >
                            Design Atlas
                        </Link>
                        {/* <p className="font-(--font-dm-mono) text-[11px] uppercase tracking-wider text-[#938F8A]">
                            Espace administrateur
                        </p> */}
                    </div>

                    <div className=" p-8  ring-1 ring-black/5">
                        <PasswordReveal>
                            <AuthView
                                pathname={pathname}
                                classNames={authClassNames}
                                localization={fr}
                            />
                        </PasswordReveal>
                    </div>

                    <p className="mt-6 text-center text-[12px] text-[#080807]/40">
                        Accès réservé aux administrateurs.
                    </p>
                </div>
            </main>
        </NeonAuthUIProvider>
    );
}
