import { getAdmin } from "@/features/auth/require-admin";
import { AdminsDataTable } from "@/features/admins/components/admins-data-table";
import { InviteAdminDialog } from "@/features/admins/components/invite-admin-dialog";
import { listAdmins } from "@/features/admins/queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
    const admin = await getAdmin();
    if (!admin.ok) redirect("/manager/sign-in");

    const admins = await listAdmins();

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <header className="mb-8 flex items-end justify-between pb-6">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#080807]/50">
                        Espace admin
                    </p>
                    <h1 className="mt-1 font-serif text-[32px] leading-none">
                        Administrateurs
                    </h1>
                    <p className="mt-2 text-[13px] text-[#080807]/60">
                        Invitez ou révoquez les personnes qui peuvent modérer la
                        bibliothèque.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <InviteAdminDialog />
                </div>
            </header>

            <AdminsDataTable admins={admins} currentUserId={admin.user.id} />
        </main>
    );
}
