export function hostname(url: string) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

export function formatShortDate(d: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
    }).format(d);
}
