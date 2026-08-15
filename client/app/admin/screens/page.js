"use client";

import { useEffect, useMemo, useState } from "react";
import { Armchair, MonitorPlay } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Status } from "@/components/AdminUI";
import Loading from "@/components/Loading";

export default function Screens() {
  const [screens, setScreens] = useState(null);
  const [seatData, setSeatData] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    api.getScreens()
      .then(async (data) => {
        const list = data.screens || [];
        setScreens(list);
        const results = await Promise.allSettled(list.map((screen) => api.getScreenSeats(screen.id)));
        const next = {};
        results.forEach((result, index) => {
          if (result.status === "fulfilled") next[list[index].id] = result.value.seats || [];
        });
        setSeatData(next);
      })
      .catch((e) => setError(e.message));
  }, []);

  const metrics = useMemo(() => screens?.map((screen) => {
    const seats = seatData[screen.id] || [];
    // Seat occupancy is represented by seats currently booked/reserved in the screen data.
    // The screen endpoint itself does not expose occupancy, so use available seat state only if present.
    const occupied = seats.filter((seat) => seat.isAvailable === false || seat.status === "booked" || seat.status === "reserved").length;
    const total = seats.length;
    const percent = total ? Math.round((occupied / total) * 100) : 0;
    return { screen, seats, occupied, total, percent };
  }) || [], [screens, seatData]);

  if (!screens) return <Loading label="Loading screens..." />;

  return (
    <div>
      <PageHeader title="Screens" description="Monitor each screen and its current seat utilization." />
      {error && <div className="mb-5 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ screen, occupied, total, percent }) => (
          <article key={screen.id} className="rounded-[22px] border border-white/[.06] bg-[#110d0f] p-5 transition hover:border-red-900/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/10 text-red-400"><MonitorPlay className="h-5 w-5"/></span>
                <div><h2 className="font-semibold">{screen.name}</h2><p className="mt-1 text-[11px] text-zinc-700">Screen ID: {screen.id}</p></div>
              </div>
              <Status>Active</Status>
            </div>

            <div className="mt-7 flex items-end justify-between">
              <div><p className="text-[10px] uppercase tracking-[.18em] text-zinc-700">Seat occupancy</p><p className="mt-1 text-2xl font-black">{percent}%</p></div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-600"><Armchair className="h-3.5 w-3.5"/> {occupied}/{total}</div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[.06]">
              <div className="h-full rounded-full bg-red-600 transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>

            <div className="mt-4 flex justify-between text-[11px] text-zinc-700">
              <span>Occupied</span><span>Available {Math.max(total - occupied, 0)}</span>
            </div>
          </article>
        ))}
      </div>

      {!metrics.length && <div className="rounded-2xl border border-white/[.06] bg-[#110d0f] p-12 text-center text-sm text-zinc-600">No screens found.</div>}
    </div>
  );
}
