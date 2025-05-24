"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardPage = pathname?.startsWith('/dashboard');

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {isDashboardPage && <Sidebar />}
      <main className={`flex-1 ${isDashboardPage ? 'ml-64' : ''} p-8`}>
        {children}
      </main>
    </div>
  );
} 