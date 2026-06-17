import type { ResourceRow as ResourceRowType } from "../queries";
import { ResourceRow } from "./resource-row";

export function ResourcesList({
    rows,
    total,
}: {
    rows: ResourceRowType[];
    total: number;
}) {
    return (
        <section>
            <div className="relative z-10 mx-auto mt-10 px-6">
                <p className="font-(--font-dm-mono) text-[12px] uppercase tracking-wider text-[#938F8A]">
                    Browse ({String(total).padStart(4, "0")}) resources_
                </p>
            </div>

            <div className="relative z-10 mx-auto mt-4 px-6 pb-24">
                <ul className="divide-y divide-[#080807]/8">
                    {rows.length === 0 ? (
                        <li className="py-10 text-center text-sm text-[#080807]/40">
                            No resources yet.
                        </li>
                    ) : (
                        rows.map((r) => (
                            <li key={r.id}>
                                <ResourceRow resource={r} />
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </section>
    );
}
