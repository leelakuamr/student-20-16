import { useEffect, useState } from "react";

type Post = { id: string; author: string; content: string; createdAt: string };

function dedupeAndSort(list: Post[]): Post[] {
  const seen = new Map<string, Post>();
  for (const p of list) {
    if (!seen.has(p.id)) seen.set(p.id, p);
  }
  return Array.from(seen.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function upsert(prev: Post[], added: Post): Post[] {
  const merged = [added, ...prev];
  return dedupeAndSort(merged);
}

export function DiscussionBoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const maxLen = 500;

  const remove = async (id: string) => {
    const ok = window.confirm("Delete this post?");
    if (!ok) return;
    try {
      const res = await fetch(`/api/discussions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/discussions");
        if (res.ok) {
          const data = (await res.json()) as { posts: Post[] };
          setPosts(dedupeAndSort(data.posts));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();

    // open SSE connection for live updates
    const es = new EventSource("/api/discussions/stream");
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data) as { post: Post };
        setPosts((prev) => upsert(prev, payload.post));
      } catch (e) {
        console.error(e);
      }
    };
    let errored = false;
    es.onerror = () => {
      // reconnect handled by browser automatically; avoid noisy logs
      if (!errored) {
        console.warn("SSE connection lost, retrying...");
        errored = true;
      }
    };
    return () => {
      es.close();
    };
  }, []);

  const submit = async () => {
    if (!content.trim()) return;
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { post: Post };
        setPosts((prev) => upsert(prev, data.post));
        setContent("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <label
          htmlFor="discussion-input"
          className="mb-2 block text-sm font-medium"
        >
          Share with your peers
        </label>
        <textarea
          id="discussion-input"
          aria-label="Share with your peers"
          maxLength={maxLen}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-28 w-full resize-none rounded-md border bg-background p-2 outline-none focus:ring-2 focus:ring-ring"
          placeholder="Ask a question, share insights..."
        />

        {/* controls: on md+ show inline, on mobile stack */}
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="hidden items-center justify-between md:flex">
            <span>
              {content.length}/{maxLen}
            </span>
            <button
              className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              onClick={submit}
              disabled={!content.trim()}
            >
              Post
            </button>
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            <div className="flex items-center justify-between">
              <span>
                {content.length}/{maxLen}
              </span>
              <span
                className="text-rose-500 text-xs"
                aria-hidden={content.length <= maxLen}
              />
            </div>
            <button
              className="w-full rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              onClick={submit}
              disabled={!content.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {loading && (
          <li className="text-sm text-muted-foreground">
            Loading discussions...
          </li>
        )}
        {!loading && posts.length === 0 && (
          <li className="text-sm text-muted-foreground">
            No discussions yet — be the first to post.
          </li>
        )}
        {posts.map((p) => (
          <li key={p.id} className="rounded-lg border p-4">
            <div className="mb-2 flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-accent-2 flex items-center justify-center text-sm font-medium text-foreground">
                  {p.author?.charAt(0) ?? "U"}
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {p.author}
                  </span>
                  <div className="flex items-center gap-3">
                    <time dateTime={p.createdAt}>
                      {new Date(p.createdAt).toLocaleString()}
                    </time>
                    <button
                      className="text-rose-600 hover:underline disabled:opacity-50"
                      aria-label="Delete post"
                      onClick={() => remove(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{p.content}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
