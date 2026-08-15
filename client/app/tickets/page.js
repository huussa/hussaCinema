"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, Ticket, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorState from "@/components/ErrorState";

export default function TicketsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .getMyReservations()
      .then((d) => setReservations(d.reservations || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  async function cancel(id) {
    if (!confirm("Cancel this reservation?")) return;
    try {
      await api.cancelReservation(id);
      setReservations((r) =>
        r.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)),
      );
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <main className="w-full px-5 py-8 sm:px-10 lg:px-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
      <div className="mt-8">
        <p className="text-xs uppercase tracking-[.2em] text-red-500">
          Account
        </p>
        <h1 className="mt-1 text-4xl font-black">My tickets</h1>
        <p className="mt-2 text-sm text-zinc-600">Your cinema reservations.</p>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="mt-7">
          <ErrorState message={error} />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {reservations.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-white/[.06] bg-panel p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{r.movieTitle}</h2>
                  <p className="mt-1 text-xs text-zinc-700">#{r.id}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${r.status === "cancelled" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}
                >
                  {r.status}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/[.06] py-5 text-sm">
                <div>
                  <p className="text-xs text-zinc-700">Date</p>
                  <p className="mt-1 flex items-center gap-1.5 text-zinc-300">
                    <CalendarDays className="h-3.5 w-3.5 text-red-400" />
                    {new Date(r.startTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-700">Time</p>
                  <p className="mt-1 flex items-center gap-1.5 text-zinc-300">
                    <Clock3 className="h-3.5 w-3.5 text-red-400" />
                    {new Date(r.startTime).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-zinc-700">Seats</p>
                  <p className="mt-1 text-zinc-300">
                    {r.seats?.map((s) => `${s.row}${s.number}`).join(", ") ||
                      "—"}
                  </p>
                </div>
              </div>
              {r.status !== "cancelled" &&
                new Date(r.startTime) > new Date() && (
                  <button
                    onClick={() => cancel(r.id)}
                    className="mt-5 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-red-400"
                  >
                    <XCircle className="h-4 w-4" /> Cancel reservation
                  </button>
                )}
            </article>
          ))}
        </div>
      )}
      {!loading && !error && !reservations.length && (
        <div className="mt-8 rounded-2xl border border-white/[.06] bg-panel p-12 text-center text-sm text-zinc-600">
          You don&apos;t have any reservations yet.
        </div>
      )}
    </main>
  );
}
