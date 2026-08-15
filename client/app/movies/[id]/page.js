"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorState from "@/components/ErrorState";

function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}

export default function MoviePage({ params }) {
  const [movie,setMovie]=useState(null); const [shows,setShows]=useState([]); const [date,setDate]=useState(today()); const [error,setError]=useState("");
  useEffect(()=>{api.getMovie(params.id).then(d=>setMovie(d.movie)).catch(e=>setError(e.message))},[params.id]);
  useEffect(()=>{api.getMovieShowtimes(params.id,date).then(d=>setShows(d.showTimes||[])).catch(()=>setShows([]))},[params.id,date]);

  if(error) return <main className="w-full p-6 sm:p-10 lg:p-16"><ErrorState message={error}/></main>;
  if(!movie) return <Loading label="Loading movie..." />;

  return <main className="w-full">
    <section className="relative min-h-[470px] overflow-hidden border-b border-white/[.05]">
      {movie.posterUrl && <img src={movie.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm"/>}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080607] via-[#080607]/80 to-[#080607]/40"/>
      <div className="relative flex min-h-[470px] w-full items-end px-5 py-10 sm:px-10 lg:px-16">
        <div className="flex w-full max-w-6xl items-end gap-7">
          <Link href="/" className="absolute left-5 top-7 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white sm:left-10 lg:left-16"><ArrowLeft className="h-4 w-4"/> Back</Link>
          <div className="hidden h-[270px] w-[180px] shrink-0 overflow-hidden rounded-2xl border border-white/[.08] bg-panel shadow-2xl sm:block">{movie.posterUrl ? <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover"/> : null}</div>
          <div><p className="text-xs uppercase tracking-[.25em] text-red-500">Movie details</p><h1 className="mt-2 text-4xl font-black sm:text-6xl">{movie.title}</h1><div className="mt-4 flex flex-wrap gap-2">{movie.genres?.map(g=><span key={g.id} className="rounded-full bg-white/[.05] px-3 py-1 text-xs text-zinc-400">{g.name}</span>)}</div><p className="mt-5 max-w-3xl leading-7 text-zinc-500">{movie.description}</p><div className="mt-5 flex items-center gap-4 text-sm text-zinc-500"><span className="flex items-center gap-1"><Clock3 className="h-4 w-4 text-red-400"/> {movie.duration} min</span>{movie.trailerUrl&&<a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-red-400"><Play className="h-4 w-4"/> Trailer</a>}</div></div>
        </div>
      </div>
    </section>
    <section className="w-full px-5 py-10 sm:px-10 lg:px-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-red-500">Book now</p><h2 className="mt-1 text-3xl font-bold">Choose a showtime</h2></div><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-zinc-600"/><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="h-10 rounded-xl border border-white/[.07] bg-white/[.03] px-3 text-sm text-zinc-300"/></div></div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{shows.map(s=><Link key={s.id} href={`/booking/${s.id}`} className="rounded-2xl border border-white/[.06] bg-panel p-5 hover:border-red-700/50 hover:shadow-red"><p className="text-2xl font-bold text-white">{new Date(s.startTime).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</p><p className="mt-2 text-sm text-zinc-500">{s.screenName}</p><p className="mt-1 text-xs text-zinc-700">{s.duration} minutes</p></Link>)}</div>
      {shows.length===0&&<div className="mt-8 rounded-2xl border border-white/[.06] bg-panel p-8 text-center text-sm text-zinc-600">No showtimes for this date.</div>}
    </section>
  </main>
}
