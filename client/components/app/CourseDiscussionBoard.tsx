import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export type CourseDiscussionPost = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

function dedupeAndSort(list: CourseDiscussionPost[]): CourseDiscussionPost[] {
  const seen = new Map<string, CourseDiscussionPost>();
  for (const p of list) if (!seen.has(p.id)) seen.set(p.id, p);
  return Array.from(seen.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function CourseDiscussionBoard({ courseId }: { courseId: string }) {
  const { token } = useAuth();
  const [posts, setPosts] = useState<CourseDiscussionPost[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let es: EventSource | null = null;
    setPosts([]);
    setContent("");
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${courseId}/discussions`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = (await res.json()) as { posts: CourseDiscussionPost[] };
          setPosts(dedupeAndSort(data.posts));
        }
      } finally {
        setLoading(false);
      }
    })();

    es = new EventSource(`/api/courses/${courseId}/discussions/stream`);
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data) as { post: CourseDiscussionPost };
        setPosts((prev) => dedupeAndSort([payload.post, ...prev]));
      } catch {}
    };
    es.onerror = () => {
      // auto-retry by browser
    };
    return () => {
      es?.close();
    };
  }, [courseId]);

  const submit = async () => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { post: CourseDiscussionPost };
        setPosts((prev) => dedupeAndSort([data.post, ...prev]));
        setContent("");
      }
    } catch {}
  };

  const remove = async (id: string) => {
    const ok = window.confirm("Delete this post?");
    if (!ok) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/discussions/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border p-4">
        <label
          htmlFor={`discussion-${courseId}`}
          className="mb-2 block text-sm font-medium"
        >
          Discuss this course
        </label>
        <textarea
          id={`discussion-${courseId}`}
          maxLength={500}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-28 w-full resize-none rounded-md border bg-background p-2 outline-none focus:ring-2 focus:ring-ring"
          placeholder="Ask a question, share insights..."
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{content.length}/500</span>
          <button
            className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            onClick={submit}
            disabled={!content.trim()}
          >
            Post
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {loading && <li className="text-sm text-muted-foreground">Loading…</li>}
        {!loading && posts.length === 0 && (
          <li className="text-sm text-muted-foreground">No posts yet.</li>
        )}
        {posts.map((p) => (
          <li key={p.id} className="rounded-lg border p-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{p.author}</span>
              <div className="flex items-center gap-3">
                <time dateTime={p.createdAt}>
                  {new Date(p.createdAt).toLocaleString()}
                </time>
                <button
                  className="text-rose-600 hover:underline"
                  onClick={() => remove(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm">{p.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
