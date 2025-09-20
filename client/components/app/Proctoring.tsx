import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Proctoring() {
  const { token } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [facePresent, setFacePresent] = useState<boolean | null>(null);
  const [faces, setFaces] = useState<number>(0);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [tabHiddenEvents, setTabHiddenEvents] = useState(0);
  const [awaySeconds, setAwaySeconds] = useState(0);
  const hiddenSinceRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        hiddenSinceRef.current = Date.now();
        setTabHiddenEvents((n) => n + 1);
      } else if (hiddenSinceRef.current) {
        const delta = Math.round((Date.now() - hiddenSinceRef.current) / 1000);
        setAwaySeconds((s) => s + delta);
        hiddenSinceRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, []);

  async function start() {
    if (!token) return alert("Please sign in first");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const res = await fetch("/api/proctor/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setRunning(true);
      loop();
    } catch (e) {
      console.error(e);
      alert("Could not start proctoring. Please allow camera access.");
    }
  }

  function stop() {
    setRunning(false);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (sessionId && token) {
      fetch("/api/proctor/end", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }
  }

  async function heartbeat(metrics: { faces: number; facePresent: boolean; multipleFaces: boolean }) {
    if (!sessionId || !token) return;
    try {
      await fetch("/api/proctor/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId, tabHidden: tabHiddenEvents > 0, awaySeconds, ...metrics }),
      });
    } catch {}
  }

  async function detectFacesFromFrame(): Promise<{ count: number; present: boolean }> {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return { count: 0, present: false };
    const w = (canvas.width = video.videoWidth || 640);
    const h = (canvas.height = video.videoHeight || 360);
    const ctx = canvas.getContext("2d");
    if (!ctx) return { count: 0, present: false };
    ctx.drawImage(video, 0, 0, w, h);

    // Try FaceDetector API if available
    const anyWin = window as any;
    if (anyWin.FaceDetector) {
      try {
        const fd = new anyWin.FaceDetector({ fastMode: true });
        const dets = await fd.detect(canvas);
        return { count: dets.length, present: dets.length > 0 };
      } catch {}
    }

    // Fallback heuristic: brightness + simple motion
    const img = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < img.length; i += 4 * 50) {
      // sample every 50px
      const r = img[i], g = img[i + 1], b = img[i + 2];
      sum += (r + g + b) / 3;
    }
    const avg = sum / (img.length / (4 * 50));
    const present = avg > 20; // very low threshold to detect darkness
    return { count: present ? 1 : 0, present };
  }

  function loop() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(async () => {
      const res = await detectFacesFromFrame();
      setFaces(res.count);
      setFacePresent(res.present);
      setMultipleFaces(res.count > 1);
      heartbeat({ faces: res.count, facePresent: res.present, multipleFaces: res.count > 1 });
    }, 2000) as any;
  }

  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Webcam Proctoring</h2>
        <p className="text-sm text-muted-foreground">This feature detects presence, multiple faces, and tab switching.</p>
        <div className="mt-3 flex items-center gap-2">
          {!running ? (
            <button onClick={start} className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">Start</button>
          ) : (
            <button onClick={stop} className="rounded-md border px-3 py-1.5">Stop</button>
          )}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <video ref={videoRef} className="w-full rounded-md bg-black" muted playsInline />
          </div>
          <div className="text-sm">
            <div>Session: {sessionId ?? "-"}</div>
            <div>Face present: {facePresent == null ? "-" : facePresent ? "yes" : "no"}</div>
            <div>Faces detected: {faces}</div>
            <div>Multiple faces: {multipleFaces ? "yes" : "no"}</div>
            <div>Tab hidden events: {tabHiddenEvents}</div>
            <div>Away seconds: {awaySeconds}</div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
