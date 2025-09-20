import { useState, useEffect } from "react";

export default function Parent() {
  const [children, setChildren] = useState([
    { id: "c1", name: "Sarah Johnson", grade: "10th Grade", school: "Lincoln High School" },
    { id: "c2", name: "Mike Johnson", grade: "8th Grade", school: "Roosevelt Middle School" },
  ]);
  const [selectedChild, setSelectedChild] = useState(children[0]?.id || "");
  const [progress, setProgress] = useState([
    { subject: "Mathematics", grade: "A", progress: 85, assignments: 12, completed: 10 },
    { subject: "Science", grade: "B+", progress: 78, assignments: 8, completed: 6 },
    { subject: "English", grade: "A-", progress: 92, assignments: 10, completed: 9 },
    { subject: "History", grade: "B", progress: 73, assignments: 6, completed: 4 },
  ]);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "assignment", title: "Algebra Quiz", grade: "A", date: "2024-01-15", subject: "Mathematics" },
    { id: 2, type: "assignment", title: "Science Lab Report", grade: "B+", date: "2024-01-14", subject: "Science" },
    { id: 3, type: "achievement", title: "Perfect Attendance", grade: null, date: "2024-01-13", subject: "General" },
    { id: 4, type: "assignment", title: "English Essay", grade: "A-", date: "2024-01-12", subject: "English" },
  ]);

  const currentChild = children.find(c => c.id === selectedChild);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Parent Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Monitor your children's academic progress and stay connected with their learning journey.
      </p>

      {/* Child Selection */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Select Child</h2>
        <div className="flex gap-3">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                selectedChild === child.id 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="font-medium">{child.name}</div>
              <div className="text-sm text-muted-foreground">{child.grade}</div>
              <div className="text-xs text-muted-foreground">{child.school}</div>
            </button>
          ))}
        </div>
      </section>

      {currentChild && (
        <>
          {/* Child Overview */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-3">{currentChild.name}'s Progress</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border p-4">
                <div className="text-sm text-muted-foreground">Overall GPA</div>
                <div className="text-2xl font-bold text-green-600">3.7</div>
                <div className="text-xs text-muted-foreground">Above Average</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm text-muted-foreground">Completed Assignments</div>
                <div className="text-2xl font-bold">29</div>
                <div className="text-xs text-muted-foreground">of 36 total</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm text-muted-foreground">Attendance Rate</div>
                <div className="text-2xl font-bold text-blue-600">96%</div>
                <div className="text-xs text-muted-foreground">Excellent</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm text-muted-foreground">Study Streak</div>
                <div className="text-2xl font-bold text-purple-600">12 days</div>
                <div className="text-xs text-muted-foreground">Keep it up!</div>
              </div>
            </div>
          </section>

          {/* Subject Progress */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Subject Progress</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {progress.map((p) => (
                <div key={p.subject} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{p.subject}</h3>
                    <span className={`font-semibold ${
                      p.grade.startsWith('A') ? 'text-green-600' : 
                      p.grade.startsWith('B') ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {p.grade}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${p.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {p.completed}/{p.assignments} assignments completed
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
            <div className="rounded-lg border overflow-hidden">
              <div className="border-b bg-muted/50 p-3 text-sm font-medium">
                Latest Updates
          </div>
              <ul className="divide-y">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'assignment' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {activity.type === 'assignment' ? '📝' : '🏆'}
            </div>
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.subject} • {activity.date}
            </div>
          </div>
        </div>
                      {activity.grade && (
                        <span className={`font-semibold ${
                          activity.grade.startsWith('A') ? 'text-green-600' : 
                          activity.grade.startsWith('B') ? 'text-blue-600' : 'text-orange-600'
                        }`}>
                          {activity.grade}
                        </span>
                      )}
                    </div>
                </li>
              ))}
            </ul>
          </div>
          </section>

          {/* Teacher Communication */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Teacher Communication</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Quick Message</h3>
                <textarea 
                  placeholder="Send a message to your child's teachers..."
                  className="w-full rounded-md border p-3 text-sm"
                  rows={3}
                />
                <button className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm">
                  Send Message
                </button>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Recent Messages</h3>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">From: Ms. Smith (Math)</div>
                    <div className="text-muted-foreground">Sarah is doing great in algebra!</div>
                    <div className="text-xs text-muted-foreground">2 days ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">From: Mr. Johnson (Science)</div>
                    <div className="text-muted-foreground">Lab report was excellent work.</div>
                    <div className="text-xs text-muted-foreground">1 week ago</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Upcoming Events</h2>
            <div className="rounded-lg border p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Parent-Teacher Conference</div>
                    <div className="text-sm text-muted-foreground">February 15, 2024</div>
                  </div>
                  <button className="rounded-md border px-3 py-1 text-sm">
                    Schedule
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Science Fair</div>
                    <div className="text-sm text-muted-foreground">March 10, 2024</div>
                  </div>
                  <button className="rounded-md border px-3 py-1 text-sm">
                    View Details
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Spring Break</div>
                    <div className="text-sm text-muted-foreground">March 25-29, 2024</div>
                  </div>
                  <span className="text-sm text-muted-foreground">No school</span>
                </div>
              </div>
          </div>
      </section>
        </>
      )}
    </div>
  );
}
