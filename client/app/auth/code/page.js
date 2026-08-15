"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";
import { api } from "@/lib/api";

export default function CodeLoginPage() {
  const [email,setEmail]=useState(""); const [code,setCode]=useState(""); const [sent,setSent]=useState(false);
  const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);

  async function sendCode(e){e.preventDefault();setError("");setMessage("");setLoading(true);try{const d=await api.requestLoginCode(email);setMessage(d.message);setSent(true)}catch(e){setError(e.message)}finally{setLoading(false)}}
  async function verify(e){e.preventDefault();setError("");setLoading(true);try{await api.loginWithCode({email,code});window.location.href="/"}catch(e){setError(e.message)}finally{setLoading(false)}}

  return <main className="flex min-h-screen w-full items-center justify-center bg-ink px-5">
    <div className="w-full max-w-md"><Logo/><div className="mt-10 rounded-3xl border border-white/[.06] bg-panel p-6 sm:p-8"><Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-white"><ArrowLeft className="h-4 w-4"/> Password login</Link><h1 className="mt-7 text-3xl font-bold">Email sign in</h1><p className="mt-2 text-sm text-zinc-600">We&apos;ll send a 6-digit code to your email.</p>
      {error&&<div className="mt-5 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">{error}</div>}
      {message&&<div className="mt-5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-sm text-emerald-300">{message}</div>}
      {!sent ? <form onSubmit={sendCode} className="mt-7 space-y-5"><label><span className="mb-2 block text-sm text-zinc-400">Email</span><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"/><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="h-12 w-full rounded-xl border border-white/[.08] bg-white/[.025] pl-10 text-sm outline-none focus:border-red-600/60" placeholder="you@example.com"/></div></label><button disabled={loading} className="h-12 w-full rounded-xl bg-red-600 font-semibold hover:bg-red-500 disabled:opacity-50">{loading?"Sending...":"Send code"}</button></form>
      : <form onSubmit={verify} className="mt-7 space-y-5"><label><span className="mb-2 block text-sm text-zinc-400">6-digit code</span><input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" maxLength={6} required className="h-14 w-full rounded-xl border border-white/[.08] bg-white/[.025] text-center text-2xl tracking-[.5em] outline-none focus:border-red-600/60"/></label><button disabled={loading||code.length!==6} className="h-12 w-full rounded-xl bg-red-600 font-semibold hover:bg-red-500 disabled:opacity-50">{loading?"Verifying...":"Verify and sign in"}</button><button type="button" onClick={()=>setSent(false)} className="w-full text-sm text-zinc-600 hover:text-white">Use another email</button></form>}
    </div></div>
  </main>
}
