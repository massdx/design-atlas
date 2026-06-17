const SKELETON_ROWS = [
    { title: 28, desc: 56 },
    { title: 40, desc: 44 },
    { title: 32, desc: 60 },
    { title: 24, desc: 48 },
    { title: 36, desc: 52 },
    { title: 28, desc: 40 },
    { title: 44, desc: 56 },
    { title: 32, desc: 36 },
] as const;

export function ResourcesListSkeleton() {
    return (
        <section aria-hidden>
            <div className="relative z-10 mx-auto mt-10 px-6">
                <div className="h-3 w-40 animate-pulse rounded-sm bg-[#080807]/5" />
            </div>

            <div className="relative z-10 mx-auto mt-4 px-6 pb-24">
                <ul className="divide-y divide-[#080807]/5">
                    {SKELETON_ROWS.map((row, i) => (
                        <li
                            key={i}
                            className="flex items-center gap-3 px-1.5 py-3"
                            style={{
                                animationDelay: `${i * 60}ms`,
                            }}
                        >
                            <span className="inline-block size-1.75 shrink-0 rounded-full bg-[#080807]/10" />
                            <div
                                className="h-3 animate-pulse rounded-sm bg-[#080807]/6"
                                style={{ width: `${row.title * 4}px` }}
                            />
                            <span className="inline-block size-1 shrink-0 rounded-full bg-[#080807]/10" />
                            <div
                                className="h-3 animate-pulse rounded-sm bg-[#080807]/4"
                                style={{ width: `${row.desc * 4}px` }}
                            />
                            <div className="ml-auto h-3 w-14 animate-pulse rounded-sm bg-[#080807]/5" />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
