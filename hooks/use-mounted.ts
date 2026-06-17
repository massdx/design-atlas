"use client";

import { useEffect, useState } from "react";

/**
 * Returns true after the component has mounted on the client.
 * Use this to gate render of components that produce hydration mismatches
 * (e.g. Radix portals with `useId` drift under React 19 + Turbopack).
 */
export function useMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted;
}
