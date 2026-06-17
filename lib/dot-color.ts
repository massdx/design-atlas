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
 * Palette publique pour les catégories. 12 teintes claires et vives,
 * dans le même style que DOT_COLORS. Chaque catégorie sélectionne une
 * couleur, qui devient indisponible pour les suivantes.
 */
export const CATEGORY_PALETTE = [
    "#A3E635", // lime
    "#8B5CF6", // violet
    "#FFAB6F", // orange
    "#A197FF", // periwinkle
    "#97FFA8", // mint
    "#EF4444", // red
    "#FBBF24", // amber
    "#60A5FA", // blue
    "#F472B6", // pink
    "#22D3EE", // cyan
    "#34D399", // emerald
    "#F87171", // coral
] as const;

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

export function categoryColor(
    c: { id: string; color?: string | null } | null | undefined,
) {
    if (!c) return "#91918D";
    return c.color ?? dotColor(c.id);
}
