import { ReactNode } from "react";
import { Sidebar, MobileTabs } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 md:pb-10">
        {children}
      </main>
      <MobileTabs />
    </div>
  );
}
