import { PropsWithChildren } from "react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="-mx-4 grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border bg-card p-4 md:sticky md:top-20 md:h-[calc(100vh-6rem)] md:self-start">
        <AdminSidebar />
      </aside>
      <section className="space-y-6">{children}</section>
    </div>
  );
}
