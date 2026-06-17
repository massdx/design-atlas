const DOT_COLORS = [
    "#A3E635", // lime
    "#8B5CF6", // violet
    "#FFAB6F", // orange
    "#A197FF", // periwinkle
    "#97FFA8", // mint
    "#EF4444", // red
    "#FBBF24", // amber
    "#60A5FA", // blue
];

/**
 * Deterministic color picked from a small palette, used for category dots
 * and resource bullets so the same id always yields the same color.
 */
export function dotColor(seed: string | null | undefined) {
    if (!seed) return "#91918D";
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return DOT_COLORS[Math.abs(h) % DOT_COLORS.length];
}
