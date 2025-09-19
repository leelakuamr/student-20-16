import { Leaderboard } from "@/components/app/Leaderboard";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Gamification() {
  const [badges, setBadges] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/badges");
        if (r.ok) {
          const json = await r.json();
          setBadges(json.badges || []);
        }
      } catch (e) {
        console.error(e);
      }

      // load current user if token present
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const ures = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (ures.ok) setUser(await ures.json());
        } catch (e) {
          console.error(e);
        }
      }
    })();
  }, []);

  async function award() {
    // require login
    if (!user) {
      alert("Please sign in to earn badges.");
      return;
    }

    const payload = { userId: user.id, title: "Consistency Champ" };
    const token = localStorage.getItem("token");
    try {
      const r = await fetch("/api/badges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        const j = await r.json();
        setBadges((b) => [j.badge, ...b]);
      } else {
        const err = await r.json().catch(() => ({}));
        console.error("award failed", err);
        alert(err?.error || "Failed to award badge.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to award badge.");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Gamification</h1>
      <p className="text-muted-foreground mt-1">
        Earn badges and climb the leaderboard.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Your badges</h3>
          <ul className="mt-3 space-y-2">
            {badges.length === 0 && (
              <li className="text-sm text-muted-foreground">No badges yet</li>
            )}
            {badges.map((b: any) => (
              <li key={b.id} className="flex items-center gap-3">
                <div className="rounded-full bg-accent/20 px-2 py-1">🏅</div>
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(
                      b.awardedAt ?? b.createdAt ?? b.createdAt,
                    ).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            {!user ? (
              <Link
                to="/login"
                className="rounded-md bg-muted px-4 py-2 text-muted-foreground"
              >
                Sign in to earn badges
              </Link>
            ) : (
              <button
                onClick={award}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
              >
                Award sample badge
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-semibold">Leaderboard</h3>
          <div className="mt-3">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
