import { ContactTeachers } from "@/components/app/ContactTeachers";

export default function ContactTeachersPage() {
  return (
    <section className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold">Contact Teachers</h1>
      <p className="text-muted-foreground">Send messages directly to instructors or school admins.</p>
      <div className="mt-6">
        <ContactTeachers />
      </div>
    </section>
  );
}
