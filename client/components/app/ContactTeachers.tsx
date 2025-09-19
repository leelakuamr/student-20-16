import { useEffect, useState } from "react";

type Teacher = { id: string; name: string; email?: string };

export function ContactTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teachers");
        if (res.ok) {
          const data = await res.json();
          setTeachers(data.teachers || []);
          if (data.teachers && data.teachers.length > 0)
            setSelected(data.teachers[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const send = async () => {
    if (!message.trim()) {
      setStatus("Please enter a message.");
      return;
    }
    setStatus("Sending...");
    try {
      const res = await fetch("/api/contact-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selected,
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
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-semibold">Contact your teacher</h3>
        <p className="text-sm text-muted-foreground">
          Send a message directly to your instructor.
        </p>

        <div className="mt-3 grid gap-2">
          <label className="text-sm">Teacher</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-md border p-2"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.email ? `(${t.email})` : ""}
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
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="font-semibold">Messages (recent)</h4>
        <MessagesList />
      </div>
    </div>
  );
}

function MessagesList() {
  const [messages, setMessages] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <ul className="space-y-2 text-sm">
      {messages.length === 0 && (
        <li className="text-muted-foreground">No messages yet.</li>
      )}
      {messages.map((m) => (
        <li key={m.id} className="border rounded-md p-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              {m.fromName}
              {m.fromEmail ? ` • ${m.fromEmail}` : ""}
            </div>
            <time dateTime={m.createdAt}>
              {new Date(m.createdAt).toLocaleString()}
            </time>
          </div>
          <div className="mt-1">
            <div className="font-medium">{m.subject}</div>
            <div className="whitespace-pre-wrap">{m.message}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
