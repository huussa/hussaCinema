"use client";

import Link from "next/link";
import { ArrowLeft, UserRound, Mail, Lock, CalendarDays } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [form,setForm]=useState({username:"",email:"",password:"",birthdate:"",gender:"other"});
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  function update(k,v){setForm(f=>({...f,[k]:v}))}
  async function submit(e){e.preventDefault();setError("");setLoading(true);try{await api.register(form);window.location.href="/"}catch(e){setError(e.message)}finally{setLoading(false)}}

  return <main className="min-h-screen w-full bg-ink px-5 py-8 sm:px-10">
    <div className="mx-auto w-full max-w-6xl"><Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-white"><ArrowLeft className="h-4 w-4"/> Back</Link>
      <div className="mt-8 grid overflow-hidden rounded-3xl border border-white/[.06] bg-panel lg:grid-cols-[.8fr_1.2fr]">
        <div className="hidden bg-[radial-gradient(circle_at_50%_20%,rgba(159,23,37,.3),transparent_45%),#0d090a] p-10 lg:block"><Logo/><div className="mt-24"><p className="text-xs uppercase tracking-[.25em] text-red-500">Join onCinema</p><h1 className="mt-4 text-5xl font-black leading-none">Book the seat before someone else does.</h1><p className="mt-6 text-zinc-500">Create an account and keep your cinema bookings in one place.</p></div></div>
        <div className="p-6 sm:p-10"><h2 className="text-3xl font-bold">Create account</h2><p className="mt-2 text-sm text-zinc-600">Your account is created as a regular user.</p>
          <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
            {error && <div className="sm:col-span-2 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">{error}</div>}
            <label><span className="mb-2 block text-sm text-zinc-400">Username</span><div className="relative"><UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"/><input value={form.username} onChange={e=>update("username",e.target.value)} required className="h-12 w-full rounded-xl border border-white/[.08] bg-white/[.025] pl-10 text-sm outline-none focus:border-red-600/60"/></div></label>
            <label><span className="mb-2 block text-sm text-zinc-400">Email</span><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"/><input value={form.email} onChange={e=>update("email",e.target.value)} type="email" required className="h-12 w-full rounded-xl border border-white/[.08] bg-white/[.025] pl-10 text-sm outline-none focus:border-red-600/60"/></div></label>
            <label><span className="mb-2 block text-sm text-zinc-400">Password</span><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"/><input value={form.password} onChange={e=>update("password",e.target.value)} type="password" required className="h-12 w-full rounded-xl border border-white/[.08] bg-white/[.025] pl-10 text-sm outline-none focus:border-red-600/60" placeholder="8+ chars, upper/lower/number/symbol"/></div></label>
            <label><span className="mb-2 block text-sm text-zinc-400">Birthdate</span><div className="relative"><CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"/><input value={form.birthdate} onChange={e=>update("birthdate",e.target.value)} type="date" required className="h-12 w-full rounded-xl border border-white/[.08] bg-white/[.025] pl-10 text-sm outline-none focus:border-red-600/60"/></div></label>
            <label><span className="mb-2 block text-sm text-zinc-400">Gender</span><select value={form.gender} onChange={e=>update("gender",e.target.value)} className="h-12 w-full rounded-xl border border-white/[.08] bg-[#151012] px-3 text-sm outline-none focus:border-red-600/60"><option value="other">Other</option><option value="male">Male</option><option value="female">Female</option></select></label>
            <div className="sm:col-span-2"><button disabled={loading} className="h-12 w-full rounded-xl bg-red-600 font-semibold text-white hover:bg-red-500 disabled:opacity-50">{loading?"Creating...":"Create account"}</button></div>
          </form>
          <p className="mt-7 text-center text-sm text-zinc-600">Already have an account? <Link href="/auth/login" className="text-zinc-300 hover:text-white">Sign in</Link></p>
        </div>
      </div>
    </div>
  </main>
}
