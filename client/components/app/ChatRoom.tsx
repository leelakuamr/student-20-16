import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type Msg = { id: string; from: string; text: string; createdAt: string };

export function ChatRoom({ roomName = "Global" }: { roomName?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let es: EventSource | null = new EventSource('/api/chat/stream');
    es.onopen = () => setConnected(true);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as { message: Msg };
        setMessages((m) => [data.message, ...m]);
      } catch (e) {
        console.error('chat parse', e);
      }
    };
    es.onerror = () => {
      setConnected(false);
      // let browser attempt reconnect
    };

    (async () => {
      try {
        const r = await fetch('/api/chat');
        if (r.ok) {
          const j = await r.json();
          setMessages(j.messages || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => { es?.close(); };
  }, []);

  useEffect(() => {
    if (!boxRef.current) return;
    boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const payload = { from: user?.name ?? 'You', text: input.trim() };
    setInput("");
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error('send failed');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed right-6 bottom-20 z-50 w-96 max-w-full rounded-lg border bg-white shadow-lg dark:bg-background">
      <div className="flex items-center justify-between border-b p-3">
        <div className="text-sm font-semibold">{roomName}</div>
        <div className="text-xs text-muted-foreground">{connected ? 'online' : 'connecting...'}</div>
      </div>
      <div ref={boxRef} className="max-h-64 overflow-auto p-3 flex flex-col-reverse gap-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === (user?.name ?? 'You') ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-md p-2 ${m.from === (user?.name ?? 'You') ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
              <div className="text-xs font-medium">{m.from}</div>
              <div className="mt-1 whitespace-pre-wrap">{m.text}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-md border px-3 py-2" placeholder="Say something..." />
          <button onClick={send} className="rounded-md bg-primary px-3 py-2 text-primary-foreground">Send</button>
        </div>
      </div>
    </div>
  );
}
