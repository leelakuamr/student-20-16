import { AdminLayout } from "@/components/app/admin/AdminLayout";
import { AdminInstructorRequests } from "@/components/app/admin/AdminInstructorRequests";
import { AdminRoleManager } from "@/components/app/AdminRoleManager";
import { AdminLayout as AdminPanelLayout } from "@/components/app/admin/AdminLayout";

export default function AdminPanel() {
  return (
    <AdminPanelLayout>
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Users", value: 1240 },
            { label: "Courses", value: 86 },
            { label: "Assignments", value: 5320 },
            { label: "Discussions", value: 1740 },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-3xl font-extrabold">
                {m.value.toLocaleString()}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border">
          <div className="border-b p-4 text-sm font-semibold">
            Recent Activity
          </div>
          <ul className="divide-y">
            {[
              "New course created: Biology 101",
              "User promoted to instructor: alice@example.com",
              "Flag resolved in Algebra discussion",
            ].map((i) => (
              <li
                key={i}
                className="flex items-center justify-between p-4 text-sm"
              >
                <span>{i}</span>
                <button className="rounded-md border px-3 py-1 hover:bg-accent">
                  View
                </button>
              </li>
            ))}
          </ul>
        </section>

        <AdminRoleManager />
        <AdminInstructorRequests />
      </div>
    </AdminPanelLayout>
  );
}
