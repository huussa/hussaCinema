"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Clock3, Film, Play, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import MovieCard from "@/components/MovieCard";
import Loading from "@/components/Loading";
import ErrorState from "@/components/ErrorState";

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [date, setDate] = useState(localDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getMovies(), api.getShowtimes(date)])
      .then(([movieData, showData]) => {
        setMovies(movieData.movies || []);
        setShowtimes(showData.showTimes || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date]);

  const featured = movies[0];
  const movieMap = useMemo(() => new Map(movies.map((m) => [m.id, m])), [movies]);

  return (
    <main className="w-full px-4 py-5 sm:px-7 lg:px-9">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_285px]">
        <div className="relative min-h-[350px] overflow-hidden rounded-[26px] border border-white/[.06] bg-[#120b0d]">
          {featured?.posterUrl && (
            <img src={featured.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(185,31,49,.35),transparent_40%),linear-gradient(90deg,#12090b_8%,rgba(18,9,11,.9)_45%,rgba(18,9,11,.45))]" />
          <div className="relative flex min-h-[350px] max-w-2xl flex-col justify-end p-6 sm:p-8">
            <span className="w-fit rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.2em] text-red-400">Featured movie</span>
            <h1 className="mt-4 text-4xl font-black leading-none sm:text-5xl">{featured?.title || "Your next movie night"}</h1>
            <p className="mt-4 line-clamp-2 max-w-xl text-sm leading-6 text-zinc-400">{featured?.description || "Discover movies, choose your seats and book in a few clicks."}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {featured && <Link href={`/movies/${featured.id}`} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500"><Play className="h-4 w-4 fill-current" /> View movie</Link>}
              <a href="#movies" className="inline-flex items-center gap-2 rounded-xl border border-white/[.08] bg-black/20 px-4 py-3 text-sm font-semibold text-zinc-300 hover:text-white">Browse all <ArrowRight className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-white/[.06] bg-[#110d0f] p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-[10px] uppercase tracking-[.2em] text-red-500">Quick booking</p><h2 className="mt-1 text-lg font-bold">Today&apos;s shows</h2></div>
            <Ticket className="h-5 w-5 text-zinc-700" />
          </div>
          <div className="mt-5 space-y-2">
            {showtimes.slice(0,5).map((show) => (
              <Link key={show.id} href={`/booking/${show.id}`} className="flex items-center justify-between rounded-xl border border-white/[.05] bg-white/[.02] p-3 hover:border-red-700/40 hover:bg-red-950/10">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{show.movieTitle}</p><p className="mt-1 text-[10px] text-zinc-700">{show.screenName}</p></div>
                <span className="ml-3 shrink-0 text-xs font-semibold text-red-400">{new Date(show.startTime).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</span>
              </Link>
            ))}
            {!showtimes.length && <p className="py-8 text-center text-xs text-zinc-700">No shows today.</p>}
          </div>
          <Link href="/tickets" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/[.07] py-2.5 text-xs text-zinc-500 hover:text-white">My tickets <ChevronRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          [Film, "Movies", `${movies.length} available`],
          [CalendarDays, "Showtimes", `${showtimes.length} today`],
          [Ticket, "Tickets", "Book your seats"],
        ].map(([Icon, title, value]) => (
          <div key={title} className="flex items-center gap-4 rounded-2xl border border-white/[.06] bg-[#110d0f] p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-400"><Icon className="h-5 w-5" /></span>
            <div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-zinc-700">{value}</p></div>
          </div>
        ))}
      </section>

      <section id="movies" className="mt-7">
        <div className="flex flex-col gap-4 border-b border-white/[.06] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-red-500">Cinema library</p><h2 className="mt-1 text-2xl font-bold">Now showing</h2></div>
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-zinc-700" /><input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="h-10 rounded-xl border border-white/[.07] bg-white/[.025] px-3 text-sm text-zinc-300 outline-none focus:border-red-600/50" /></div>
        </div>
        {error ? <div className="mt-5"><ErrorState message={error} /></div> : loading ? <Loading /> : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-white/[.06] bg-[#0d0a0b] p-5">
        <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-red-500">Schedule</p><h2 className="mt-1 text-xl font-bold">Today&apos;s showtimes</h2></div><Clock3 className="h-5 w-5 text-zinc-700" /></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {showtimes.slice(0,12).map((show) => (
            <Link key={show.id} href={`/booking/${show.id}`} className="flex items-center justify-between rounded-xl border border-white/[.05] p-3 hover:border-red-700/40">
              <div className="min-w-0"><p className="truncate text-sm font-medium">{show.movieTitle}</p><p className="mt-1 text-[10px] text-zinc-700">{show.screenName} · {show.duration} min</p></div>
              <span className="ml-3 text-xs font-semibold text-red-400">{new Date(show.startTime).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
