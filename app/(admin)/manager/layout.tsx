import { Toaster } from "@/components/ui/sonner";
import { ManagerNav } from "@/features/admin/components/manager-nav";
import { auth } from "@/features/auth/server";
import Link from "next/link";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="min-h-screen bg-[#E8E8E3]">
      {isAuthenticated && (
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
          <Link
            href="/manager"
            className="font-serif text-[18px] leading-none tracking-tight"
          >
            Design Atlas
          </Link>
          <ManagerNav />
        </div>
      )}
      {children}
      <Toaster />
    </div>
  );
}