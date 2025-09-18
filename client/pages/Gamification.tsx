import { Leaderboard } from "@/components/app/Leaderboard";
import { useEffect, useState } from "react";

export default function Gamification() {
  const [badges, setBadges] = useState(() => JSON.parse(localStorage.getItem('badges') || '[]'));
  useEffect(() => { localStorage.setItem('badges', JSON.stringify(badges)); }, [badges]);

  function award() {
    const id = `b_${Date.now()}`;
    setBadges((b:any) => [{ id, title: 'Consistency Champ', awardedAt: Date.now() }, ...b]);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Gamification</h1>
      <p className="text-muted-foreground mt-1">Earn badges and climb the leaderboard.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Your badges</h3>
          <ul className="mt-3 space-y-2">
            {badges.length === 0 && <li className="text-sm text-muted-foreground">No badges yet</li>}
            {badges.map((b:any) => (
              <li key={b.id} className="flex items-center gap-3">
                <div className="rounded-full bg-accent/20 px-2 py-1">🏅</div>
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(b.awardedAt).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <button onClick={award} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Award sample badge</button>
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
