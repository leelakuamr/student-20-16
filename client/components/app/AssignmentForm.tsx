import { useState, useEffect } from "react";

type Submission = { id: string; filename: string; submittedAt: string; status: "submitted" | "graded" | "draft"; grade?: number; note?: string; path?: string };

export function AssignmentForm() {
  const [file, setFile] = useState<File | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [note, setNote] = useState("");
  const [filename, setFilename] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (loading) return;
    setLoading(true);
    let contentBase64: string | undefined = undefined;
    if (file) {
      contentBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // result is data:<mime>;base64,AAAA -> strip prefix
          const idx = result.indexOf("base64,");
          const b64 = idx >= 0 ? result.slice(idx + 7) : result;
          resolve(b64);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    }

    const target = "/api/assignments";
    const method = editingId ? "PATCH" : "POST";
    const nameToUse = filename || file?.name || `notes-${Date.now()}.txt`;
    const res = await fetch(target, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId || undefined, filename: nameToUse, contentBase64, note }),
    });
    if (res.ok) {
      const data = (await res.json()) as { submission: Submission };
      setSubmissions((prev) => {
        if (editingId) return prev.map((s) => (s.id === editingId ? data.submission : s));
        return [data.submission, ...prev];
      });
      setFile(null);
      setNote("");
      setFilename("");
      setEditingId(null);
    }
    setLoading(false);
  }

  // fetch existing submissions
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/assignments");
        if (res.ok) {
          const data = (await res.json()) as { submissions: Submission[] };
          setSubmissions(data.submissions);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <label className="mb-2 block text-sm font-medium">Write your assignment</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-secondary-foreground file:hover:bg-secondary/90"
        />
        <input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Filename (optional)"
          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your assignment or notes (optional)"
          className="mt-3 h-28 w-full resize-none rounded-md border bg-background p-2 outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-2 flex items-center justify-end gap-2">
          {editingId && (
            <button
              className="rounded-md border px-3 py-1.5 disabled:opacity-50"
              onClick={() => { setEditingId(null); setFile(null); setNote(""); setFilename(""); }}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            onClick={submit}
            disabled={loading || (!file && !note)}
          >
            {editingId ? "Update Submission" : "Submit"}
          </button>
        </div>
      </div>
      <div className="rounded-lg border">
        <div className="border-b p-3 text-sm font-semibold">Your submissions</div>
        <ul className="divide-y">
          {submissions.map((s) => (
            <li key={s.id} className="p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.filename}</p>
                  <p className="text-muted-foreground">{new Date(s.submittedAt).toLocaleString()}</p>
                  {s.note && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.note}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {s.path && (
                    <a
                      className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                      href={s.path}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  )}
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => { setEditingId(s.id); setNote(s.note || ""); setFilename(s.filename || ""); setFile(null); }}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md border px-2 py-1 text-xs text-destructive"
                    onClick={async () => {
                      if (!confirm("Delete this submission?")) return;
                      await fetch('/api/assignments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id }) });
                      setSubmissions((prev) => prev.filter((x) => x.id !== s.id));
                    }}
                  >
                    Delete
                  </button>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{s.status}</span>
                  {s.grade != null && (
                    <span className="ml-1 text-xs">Grade: {s.grade}%</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
