import { Toaster } from "@/components/ui/sonner";
import { ManagerNav } from "@/features/admin/components/manager-nav";
import Link from "next/link";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#E8E8E3]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <Link
          href="/manager"
          className="font-serif text-[18px] leading-none tracking-tight"
        >
          Design Atlas
        </Link>
        <ManagerNav />
      </div>
      {children}
      <Toaster />
    </div>
  );
}