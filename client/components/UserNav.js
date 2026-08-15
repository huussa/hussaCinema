"use client";

import Link from "next/link";
import { CalendarDays, Film, Home, LogOut, Menu, Ticket, UserRound, X } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import { api } from "@/lib/api";

const links = [
  ["/", "Dashboard", Home],
  ["/#movies", "Movies", Film],
  ["/tickets", "My Tickets", Ticket],
];

export default function UserNav({ user }) {
  const [open, setOpen] = useState(false);

  async function logout() {
    try {
      await api.logout();
    } finally {
      window.location.href = "/";
    }
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? "h-full w-[285px]" : "hidden w-[255px] lg:flex"} sticky top-0 h-screen shrink-0 border-r border-white/[.06] bg-[#0d0a0b] px-4 py-5`}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-2">
          <Logo />
          {mobile && (
            <button onClick={() => setOpen(false)} className="rounded-xl p-2 text-zinc-600 hover:bg-white/[.04] hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-7 rounded-2xl border border-white/[.06] bg-[#141011] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-400">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.username || "Guest"}</p>
              <p className="truncate text-[11px] text-zinc-600">{user?.email || "Sign in to book"}</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                href === "/" ? "bg-red-600 text-white shadow-red" : "text-zinc-500 hover:bg-white/[.04] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link href="/admin" onClick={() => setOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-500 hover:bg-white/[.04] hover:text-white">
              <CalendarDays className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="mt-auto">
          {user ? (
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 hover:bg-white/[.04] hover:text-white">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          ) : (
            <Link href="/auth/login" className="flex w-full items-center gap-3 rounded-xl bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-500">
              <UserRound className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/75 transition ${open ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute left-0 top-0 h-full transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar mobile />
        </div>
      </div>
      <Sidebar />
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl border border-white/[.07] bg-[#0d0a0b]/90 p-3 text-zinc-300 shadow-xl backdrop-blur-lg lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
