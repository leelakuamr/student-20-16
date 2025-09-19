export default function Instructor() {
  const courses = [
    { id: "c1", title: "Algebra I", students: 28, assignments: 12 },
    { id: "c2", title: "Chemistry Basics", students: 24, assignments: 10 },
  ];
  const submissions = [
    {
      id: "s1",
      student: "Rohan",
      assignment: "Quadratic HW",
      status: "submitted",
    },
    {
      id: "s2",
      student: "Aisha",
      assignment: "Lab Report 1",
      status: "graded",
    },
  ];
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Instructor Console</h1>
      <p className="mt-1 text-muted-foreground">
        Create courses, manage students, and review work.
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Your Courses</h2>
        <div className="mt-3">
          {/* Mobile: cards */}
          <div className="md:hidden space-y-2">
            {courses.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="font-medium">{c.title}</div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">
                      {c.students}
                    </span>{" "}
                    students
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">
                      {c.assignments}
                    </span>{" "}
                    assignments
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
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {s.status}
                  </span>
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
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {s.status}
                      </span>
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
