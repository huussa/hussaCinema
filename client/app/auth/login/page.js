"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [show,setShow]=useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e){
    e.preventDefault(); setError(""); setLoading(true);
    try { await api.login({email,password}); window.location.href="/"; }
    catch(e){ setError(e.message); } finally { setLoading(false); }
  }

  return <main className="flex min-h-screen w-full bg-ink">
    <div className="hidden w-[44%] border-r border-white/[.05] bg-[radial-gradient(circle_at_30%_30%,rgba(159,23,37,.22),transparent_45%),#0c0809] lg:flex lg:flex-col lg:justify-between lg:p-12">
      <Logo />
      <div><p className="text-xs uppercase tracking-[.3em] text-red-500">Welcome back</p><h1 className="mt-4 max-w-lg text-6xl font-black leading-none">Your next movie night is waiting.</h1><p className="mt-6 max-w-md text-zinc-500">Sign in to book seats and manage your tickets.</p></div>
      <p className="text-xs text-zinc-700">onCinema</p>
    </div>
    <div className="flex w-full items-center justify-center px-5 py-10 lg:w-[56%] lg:px-12">
      <div className="w-full max-w-md">
        <div className="lg:hidden"><Logo /></div>
        <div className="mt-12 lg:mt-0"><Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-white"><ArrowLeft className="h-4 w-4"/> Back</Link><h2 className="mt-7 text-3xl font-bold">Sign in</h2><p className="mt-2 text-sm text-zinc-600">Use your email and password.</p></div>
        <form onSubmit={submit} className="mt-8 space-y-5">
          {error && <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">{error}</div>}
          <label className="block"><span className="mb-2 block text-sm text-zinc-400">Email</span><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"/><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="h-12 w-full rounded-xl border border-white/[.08] bg-white/[.025] pl-10 pr-3 text-sm outline-none focus:border-red-600/60" placeholder="you@example.com"/></div></label>
          <label className="block"><span className="mb-2 block text-sm text-zinc-400">Password</span><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"/><input value={password} onChange={e=>setPassword(e.target.value)} type={show?"text":"password"} required className="h-12 w-full rounded-xl border border-white/[.08] bg-white/[.025] pl-10 pr-12 text-sm outline-none focus:border-red-600/60" placeholder="••••••••"/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300">{show?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div></label>
          <button disabled={loading} className="h-12 w-full rounded-xl bg-red-600 font-semibold text-white hover:bg-red-500 disabled:opacity-50">{loading?"Signing in...":"Sign in"}</button>
        </form>
        <Link href="/auth/code" className="mt-4 block text-center text-sm text-red-400 hover:text-red-300">Sign in with an email code instead</Link>
        <p className="mt-8 text-center text-sm text-zinc-600">Don&apos;t have an account? <Link href="/auth/register" className="text-zinc-300 hover:text-white">Create one</Link></p>
      </div>
    </div>
  </main>
}
