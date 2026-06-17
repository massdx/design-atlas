"use client";

import { authClient } from "@/features/auth/client";
import { AuthView, NeonAuthUIProvider } from "@neondatabase/auth/react/ui";
import { use } from "react";

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
        >
            <main className="min-h-screen flex items-center justify-center px-6 py-10">
                <div className="w-full max-w-sm">
                    <AuthView pathname={pathname} />
                </div>
            </main>
        </NeonAuthUIProvider>
    );
}
