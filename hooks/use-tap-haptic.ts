"use client";

import { useCallback } from "react";
import { useWebHaptics } from "web-haptics/react";

export function useTapHaptic() {
    const { trigger } = useWebHaptics({ debug: true });
    return useCallback(() => {
        trigger([{ duration: 25 }], { intensity: 0.7 });
    }, [trigger]);
}
