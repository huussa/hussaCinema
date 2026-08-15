"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Field, PageHeader, SelectField } from "@/components/AdminUI";

export default function NewShowtime() {
  const qs = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);
  const [movieId, setMovieId] = useState(qs.get("movieId") || "");
  const [screenId, setScreenId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    Promise.all([api.getMovies(), api.getScreens()]).then(([m, s]) => {
      setMovies(m.movies || []);
      setScreens(s.screens || []);
    });
  }, []);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.createShowtime(movieId, {
        screenId: Number(screenId),
        startTime: new Date(startTime).toISOString(),
      });
      window.location.href = "/admin/showtimes";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <PageHeader
        title="Add showtime"
        description="Creates a showtime through POST /movies/:movieId/showtimes."
      />
      <form
        onSubmit={submit}
        className="max-w-3xl rounded-2xl border border-white/[.06] bg-panel p-5 sm:p-7"
      >
        <div className="grid gap-5">
          <SelectField
            label="Movie"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
          >
            <option value="">Select movie</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Screen"
            value={screenId}
            onChange={(e) => setScreenId(e.target.value)}
          >
            <option value="">Select screen</option>
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <Field
            label="Start time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          {error && (
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Link
              href="/admin/showtimes"
              className="rounded-xl border border-white/[.08] px-5 py-3 text-sm text-zinc-500"
            >
              Cancel
            </Link>
            <button
              disabled={loading || !movieId || !screenId}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create showtime"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
