"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, SearchBox, Status, Table } from "@/components/AdminUI";

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Showtimes() {
  const [date, setDate] = useState(today());
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  async function load() {
    try {
      const [s, m] = await Promise.all([
        api.getShowtimes(date),
        api.getMovies(),
      ]);
      setShows(s.showTimes || []);
      setMovies(m.movies || []);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [date]);
  async function remove(id) {
    if (!confirm("Delete this showtime?")) return;
    try {
      await api.deleteShowtime(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  const filtered = shows.filter((s) =>
    s.movieTitle.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div>
      <PageHeader
        title="Showtimes"
        description="The API requires date=YYYY-MM-DD for showtime queries."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-[auto_minmax(260px,1fr)]">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 rounded-xl border border-white/[.07] bg-white/[.025] px-3 text-sm"
        />
        <SearchBox placeholder="Search movie..." />
      </div>
      {error && (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        {movies.slice(0, 12).map((m) => (
          <a
            key={m.id}
            href={`/admin/showtimes/new?movieId=${m.id}`}
            className="rounded-full border border-white/[.07] px-3 py-1.5 text-xs text-zinc-500 hover:border-red-600/50 hover:text-white"
          >
            {m.title}
          </a>
        ))}
      </div>
      <Table>
        <thead className="border-b border-white/[.06] text-xs uppercase tracking-wider text-zinc-700">
          <tr>
            {["Movie", "Date", "Start", "Screen", "Duration", "Actions"].map(
              (x) => (
                <th key={x} className="px-5 py-4 font-medium">
                  {x}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[.05]">
          {filtered.map((s) => (
            <tr key={s.id}>
              <td className="px-5 py-4 font-medium">{s.movieTitle}</td>
              <td className="px-5 py-4 text-sm text-zinc-500">
                {new Date(s.startTime).toLocaleDateString()}
              </td>
              <td className="px-5 py-4 text-sm text-zinc-400">
                {new Date(s.startTime).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-5 py-4 text-sm text-zinc-500">
                {s.screenName}
              </td>
              <td className="px-5 py-4 text-sm text-zinc-500">
                {s.duration} min
              </td>
              <td className="px-5 py-4 text-right">
                <button
                  onClick={() => remove(s.id)}
                  className="text-sm text-zinc-600 hover:text-red-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
