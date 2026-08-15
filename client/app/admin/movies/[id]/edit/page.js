"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Field, PageHeader } from "@/components/AdminUI";
import Loading from "@/components/Loading";

export default function EditMovie({params}){
 const [m,setM]=useState(null);const [genreIds,setGenreIds]=useState("");const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 useEffect(()=>{api.getMovie(params.id).then(d=>{setM(d.movie);setGenreIds((d.movie.genres||[]).map(g=>g.id).join(","))}).catch(e=>setError(e.message))},[params.id]);
 if(!m)return <Loading label="Loading movie..."/>;
 async function save(e){e.preventDefault();setLoading(true);setError("");try{await api.updateMovie(params.id,{title:m.title,description:m.description,posterUrl:m.posterUrl,trailerUrl:m.trailerUrl,duration:Number(m.duration),genreIds:genreIds.split(",").map(Number).filter(Boolean)});window.location.href="/admin/movies"}catch(e){setError(e.message)}finally{setLoading(false)}}
 return <div><PageHeader title="Edit movie" description="Update the movie through PATCH /movies/:id."/><form onSubmit={save} className="max-w-5xl space-y-6"><section className="rounded-2xl border border-white/[.06] bg-panel p-5 sm:p-7"><div className="grid gap-5 md:grid-cols-2"><Field label="Title" value={m.title} onChange={e=>setM({...m,title:e.target.value})}/><Field label="Duration (minutes)" type="number" value={m.duration} onChange={e=>setM({...m,duration:e.target.value})}/><div className="md:col-span-2"><label className="block"><span className="mb-2 block text-sm text-zinc-400">Description</span><textarea value={m.description} onChange={e=>setM({...m,description:e.target.value})} rows={5} className="w-full rounded-xl border border-white/[.08] bg-white/[.025] p-3 text-sm outline-none focus:border-red-600/60"/></label></div><Field label="Poster URL" value={m.posterUrl||""} onChange={e=>setM({...m,posterUrl:e.target.value})}/><Field label="Trailer URL" value={m.trailerUrl||""} onChange={e=>setM({...m,trailerUrl:e.target.value})}/><Field label="Genre IDs" value={genreIds} onChange={e=>setGenreIds(e.target.value)}/></div></section>{error&&<div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">{error}</div>}<div className="flex justify-end gap-3"><Link href="/admin/movies" className="rounded-xl border border-white/[.08] px-5 py-3 text-sm text-zinc-500">Cancel</Link><button disabled={loading} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold disabled:opacity-50">{loading?"Saving...":"Save changes"}</button></div></form></div>
}
