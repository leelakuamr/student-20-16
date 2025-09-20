import { useState } from "react";

export default function Instructor() {
  const [courses, setCourses] = useState([
    { id: "c1", title: "Algebra I", students: 28, assignments: 12, description: "Introduction to algebraic concepts" },
    { id: "c2", title: "Chemistry Basics", students: 24, assignments: 10, description: "Fundamental chemistry principles" },
  ]);
  const [submissions, setSubmissions] = useState([
    {
      id: "s1",
      student: "Rohan",
      assignment: "Quadratic HW",
      status: "submitted",
      grade: null,
      submittedAt: "2024-01-15",
    },
    {
      id: "s2",
      student: "Aisha",
      assignment: "Lab Report 1",
      status: "graded",
      grade: "A",
      submittedAt: "2024-01-14",
    },
  ]);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [editingCourse, setEditingCourse] = useState<string | null>(null);

  const createCourse = () => {
    if (newCourse.title.trim()) {
      const course = {
        id: `c${Date.now()}`,
        title: newCourse.title,
        description: newCourse.description,
        students: 0,
        assignments: 0,
      };
      setCourses([...courses, course]);
      setNewCourse({ title: "", description: "" });
      setShowCreateCourse(false);
    }
  };

  const updateCourse = (id: string, updates: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingCourse(null);
  };

  const gradeSubmission = (id: string, grade: string) => {
    setSubmissions(submissions.map(s => 
      s.id === id ? { ...s, status: "graded", grade } : s
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Instructor Console</h1>
      <p className="mt-1 text-muted-foreground">
        Create courses, manage students, and review work.
      </p>

      {/* Create Course Section */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Courses</h2>
          <button
            onClick={() => setShowCreateCourse(true)}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Create New Course
          </button>
        </div>

        {/* Create Course Form */}
        {showCreateCourse && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-4">
            <h3 className="font-medium mb-3">Create New Course</h3>
            <div className="space-y-3">
              <input
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                placeholder="Course Title"
                className="w-full rounded-md border px-3 py-2"
              />
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Course Description"
                className="w-full rounded-md border px-3 py-2"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={createCourse}
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                  Create Course
                </button>
                <button
                  onClick={() => setShowCreateCourse(false)}
                  className="rounded-md border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3">
          {/* Mobile: cards */}
          <div className="md:hidden space-y-2">
            {courses.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.title}</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingCourse(c.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
                {c.description && (
                  <div className="mt-1 text-sm text-muted-foreground">{c.description}</div>
                )}
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
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
                  <th className="p-3">Description</th>
                  <th className="p-3">Students</th>
                  <th className="p-3">Assignments</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3 font-medium">{c.title}</td>
                    <td className="p-3 text-muted-foreground">{c.description}</td>
                    <td className="p-3">{c.students}</td>
                    <td className="p-3">{c.assignments}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCourse(c.id)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
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
                <div className="mt-2 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    s.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {s.status}
                  </span>
                  {s.grade && (
                    <span className="font-semibold text-green-600">Grade: {s.grade}</span>
                  )}
                </div>
                {s.status === 'submitted' && (
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={() => gradeSubmission(s.id, 'A')}
                      className="rounded bg-green-500 px-2 py-1 text-xs text-white"
                    >
                      Grade A
                    </button>
                    <button
                      onClick={() => gradeSubmission(s.id, 'B')}
                      className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                    >
                      Grade B
                    </button>
                    <button
                      onClick={() => gradeSubmission(s.id, 'C')}
                      className="rounded bg-orange-500 px-2 py-1 text-xs text-white"
                    >
                      Grade C
                    </button>
                  </div>
                )}
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
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 font-medium">{s.student}</td>
                    <td className="p-3">{s.assignment}</td>
                    <td className="p-3 text-muted-foreground">{s.submittedAt}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        s.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {s.grade ? (
                        <span className="font-semibold text-green-600">{s.grade}</span>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="p-3">
                      {s.status === 'submitted' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => gradeSubmission(s.id, 'A')}
                            className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                          >
                            A
                          </button>
                          <button
                            onClick={() => gradeSubmission(s.id, 'B')}
                            className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                          >
                            B
                          </button>
                          <button
                            onClick={() => gradeSubmission(s.id, 'C')}
                            className="rounded bg-orange-500 px-2 py-1 text-xs text-white hover:bg-orange-600"
                          >
                            C
                          </button>
                        </div>
                      ) : (
                        <button className="text-blue-600 hover:underline">
                          View
                        </button>
                      )}
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
