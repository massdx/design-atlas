export function hostname(url: string) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

export function formatShortDate(d: Date) {
    const sameYear = d.getFullYear() === new Date().getFullYear();
    if (sameYear) {
        return new Intl.DateTimeFormat("fr-FR", {
            month: "short",
            day: "numeric",
        }).format(d);
    }
    return new Intl.DateTimeFormat("fr-FR", {
        month: "short",
        day: "numeric",
        year: "2-digit",
    }).format(d);
}
