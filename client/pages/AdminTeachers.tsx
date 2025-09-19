import { AdminTeachers } from "@/components/app/AdminTeachers";

export default function AdminTeachersPage() {
  return (
    <section className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold">Admin — Teachers</h1>
      <div className="mt-6">
        <AdminTeachers />
      </div>
    </section>
  );
}
