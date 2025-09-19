import { useEffect, useState } from "react";

export default function Instructor() {
  const [courses, setCourses] = useState<
    { id: string; title: string; students: number; assignments: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [students, setStudents] = useState(0);
  const [assignments, setAssignments] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function addCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, students, assignments }),
    });
    if (res.ok) {
      const d = await res.json();
      setCourses((prev) => [d.course, ...prev]);
      setTitle("");
      setStudents(0);
      setAssignments(0);
    }
  }

  const submissions = [
    { id: "s1", student: "Rohan", assignment: "Quadratic HW", status: "submitted" },
    { id: "s2", student: "Aisha", assignment: "Lab Report 1", status: "graded" },
  ];
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Instructor Console</h1>
      <p className="mt-1 text-muted-foreground">
        Create courses, manage students, and review work.
      </p>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Courses</h2>
          <form onSubmit={addCourse} className="hidden md:flex items-center gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course title"
              className="w-56 rounded-md border px-2 py-1 text-sm"
            />
            <input
              type="number"
              min={0}
              value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              placeholder="# students"
              className="w-28 rounded-md border px-2 py-1 text-sm"
            />
            <input
              type="number"
              min={0}
              value={assignments}
              onChange={(e) => setAssignments(Number(e.target.value))}
              placeholder="# assignments"
              className="w-32 rounded-md border px-2 py-1 text-sm"
            />
            <button className="rounded-md border px-3 py-1.5 text-sm">Add</button>
          </form>
        </div>
        <div className="mt-3">
          {/* Mobile add form */}
          <form onSubmit={addCourse} className="md:hidden mb-3 grid grid-cols-2 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course title"
              className="col-span-2 rounded-md border px-2 py-1 text-sm"
            />
            <input
              type="number"
              min={0}
              value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              placeholder="Students"
              className="rounded-md border px-2 py-1 text-sm"
            />
            <input
              type="number"
              min={0}
              value={assignments}
              onChange={(e) => setAssignments(Number(e.target.value))}
              placeholder="Assignments"
              className="rounded-md border px-2 py-1 text-sm"
            />
            <button className="col-span-2 rounded-md border px-3 py-1.5 text-sm">Add</button>
          </form>

          {/* Mobile: cards */}
          <div className="md:hidden space-y-2">
            {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {courses.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="font-medium">{c.title}</div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">{c.students}</span> students
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{c.assignments}</span> assignments
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Course</th>
                  <th className="p-3">Students</th>
                  <th className="p-3">Assignments</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={3}>Loading…</td>
                  </tr>
                )}
                {courses.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.title}</td>
                    <td className="p-3">{c.students}</td>
                    <td className="p-3">{c.assignments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Recent Submissions</h2>
        <div className="mt-3">
          {/* Mobile: cards */}
          <div className="md:hidden space-y-2">
            {submissions.map((s) => (
              <div key={s.id} className="rounded-lg border p-3">
                <div className="font-medium">{s.student}</div>
                <div className="mt-1 text-sm">{s.assignment}</div>
                <div className="mt-2">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Assignment</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3">{s.student}</td>
                    <td className="p-3">{s.assignment}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
