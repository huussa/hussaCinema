"use client";

import Link from "next/link";
import { ArrowLeft, Armchair, Check, Clock3, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorState from "@/components/ErrorState";

export default function BookingPage({ params }) {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    api
      .getShowtimeSeats(params.showtimeId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.showtimeId]);

  const grouped = useMemo(() => {
    const map = new Map();
    (data?.seats || []).forEach((s) => {
      if (!map.has(s.seatRow)) map.set(s.seatRow, []);
      map.get(s.seatRow).push(s);
    });
    return [...map.entries()];
  }, [data]);

  function toggle(seat) {
    if (!seat.isAvailable) return;
    setSelected((s) =>
      s.includes(seat.id)
        ? s.filter((x) => x !== seat.id)
        : s.length >= 8
          ? s
          : [...s, seat.id],
    );
  }

  async function book() {
    setError("");
    setSubmitting(true);
    try {
      await api.createReservation(params.showtimeId, selected);
      window.location.href = "/tickets";
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  if (loading) return <Loading label="Loading seats..." />;
  if (error && !data)
    return (
      <main className="w-full p-5 sm:p-10">
        <ErrorState message={error} />
      </main>
    );

  const show = data.showTime;
  return (
    <main className="min-h-[calc(100vh-84px)] w-full bg-[#090708] px-4 py-5 sm:px-7 lg:px-10">
      <Link
        href={`/movies/${show.movieId}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to movie
      </Link>
      <div className="mt-5 grid w-full gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="rounded-3xl border border-white/[.06] bg-panel p-5 sm:p-8">
          <div className="flex flex-col gap-3 border-b border-white/[.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.2em] text-red-500">
                Seat selection
              </p>
              <h1 className="mt-1 text-2xl font-bold">{show.movieTitle}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                <Clock3 className="h-4 w-4" />
                {new Date(show.startTime).toLocaleString()} · Screen{" "}
                {show.screenId}
              </p>
            </div>
            <div className="text-sm text-zinc-600">
              {selected.length}/8 selected
            </div>
          </div>
          <div className="mx-auto mt-10 w-full max-w-5xl">
            <div className="mx-auto h-1.5 w-[72%] rounded-full bg-red-600 screen-glow" />
            <p className="mt-3 text-center text-[10px] uppercase tracking-[.4em] text-zinc-700">
              Screen
            </p>
            <div className="scrollbar-thin mt-12 overflow-x-auto pb-3">
              {grouped.map(([row, seats]) => (
                <div
                  key={row}
                  className="mx-auto mb-3 flex min-w-max items-center justify-center gap-2"
                >
                  <span className="w-6 text-xs text-zinc-700">{row}</span>
                  {seats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => toggle(seat)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[10px] transition sm:h-10 sm:w-10 ${!seat.isAvailable ? "cursor-not-allowed border-white/[.02] bg-zinc-900 text-zinc-800" : selected.includes(seat.id) ? "border-red-500 bg-red-600 text-white shadow-red" : "border-white/[.08] bg-white/[.025] text-zinc-500 hover:border-red-600/60 hover:text-white"}`}
                    >
                      <Armchair className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-zinc-600">
              <span>
                <i className="mr-2 inline-block h-3 w-3 rounded bg-zinc-900" />
                Booked
              </span>
              <span>
                <i className="mr-2 inline-block h-3 w-3 rounded border border-zinc-600" />
                Available
              </span>
              <span>
                <i className="mr-2 inline-block h-3 w-3 rounded bg-red-600" />
                Selected
              </span>
            </div>
          </div>
        </section>
        <aside className="h-fit rounded-3xl border border-white/[.06] bg-panel p-6 xl:sticky xl:top-24">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/10 text-red-400">
              <Ticket className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold">Booking summary</h2>
              <p className="text-xs text-zinc-700">
                Seats are confirmed after checkout
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4 border-y border-white/[.06] py-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-600">Movie</span>
              <span className="text-right">{show.movieTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Time</span>
              <span>
                {new Date(show.startTime).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Seats</span>
              <span>{selected.length ? selected.join(", ") : "None"}</span>
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="mt-5 flex items-end justify-between">
            <span className="text-sm text-zinc-600">Total</span>
            <span className="text-2xl font-bold">
              {selected.length} seat{selected.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={book}
            disabled={!selected.length || submitting}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{" "}
                Booking...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Confirm booking
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-zinc-700">
            Your backend currently confirms reservations immediately; there is
            no payment endpoint in the supplied API.
          </p>
        </aside>
      </div>
    </main>
  );
}
