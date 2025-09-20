import { useEffect, useState } from "react";

type Student = { id: string; name: string; email?: string; role?: string };

export function ContactStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          const list: Student[] = (data.users || []).filter(
            (u: any) => (u.role || "student") === "student",
          );
          setStudents(list);
          if (list.length > 0) setSelected(list[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const send = async () => {
    if (!message.trim() || !selected) {
      setStatus("Please choose a student and enter a message.");
      return;
    }
    setStatus("Sending...");
    try {
      const res = await fetch("/api/contact-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selected,
          subject,
          message,
          fromName,
          fromEmail,
        }),
      });
      if (res.ok) {
        setStatus("Message sent.");
        setMessage("");
        setSubject("");
      } else {
        const data = await res.json();
        setStatus(data?.error || "Failed to send message.");
      }
    } catch (e) {
      console.error(e);
      setStatus("Failed to send message.");
    }
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <label className="text-sm">Student</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-md border p-2"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.email ? `(${s.email})` : ""}
            </option>
          ))}
        </select>

        <label className="text-sm">Your name</label>
        <input
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          className="rounded-md border p-2"
        />

        <label className="text-sm">Your email</label>
        <input
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          className="rounded-md border p-2"
        />

        <label className="text-sm">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-md border p-2"
        />

        <label className="text-sm">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-28 rounded-md border p-2"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={send}
          className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
        >
          Send
        </button>
        {status && (
          <span className="text-sm text-muted-foreground">{status}</span>
        )}
      </div>
    </div>
  );
}
