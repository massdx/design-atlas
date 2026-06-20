const DOT_COLORS = [
    "#65A30D", // lime
    "#7C3AED", // violet
    "#EA580C", // orange
    "#4F46E5", // indigo
    "#16A34A", // green
    "#DC2626", // red
    "#D97706", // amber
    "#2563EB", // blue
];

/**
 * Palette publique pour les catégories. Teintes vives et saturées,
 * choisies pour rester lisibles sur le fond clair (#E8E8E3). Chaque
 * catégorie sélectionne une couleur, qui devient indisponible pour les
 * suivantes.
 */
export const CATEGORY_PALETTE = [
    "#FA2400",
    "#FFC5E5", // red
    "#F26716", // orange
    "#75522C", // amber
    "#FACC15", // yellow
    "#FAA000",
    "#65A30D", // lime
    "#2D3F54",
    "#0FA69D", // teal
    "#8EFA00",
    "#2C00FA", // blue
    "#3B8DEB",
    "#3BEBD6",
    "#88B6EB",
    "#CA50E6", // purple
    "#7C3AED", // violet
    "#C8B2F5",
    "#F27798", // pink
    "#080807", // black
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
