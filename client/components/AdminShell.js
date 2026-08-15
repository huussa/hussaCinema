"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Film,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorPlay,
  Search,
  Ticket,
  X,
  Plus,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import { api } from "@/lib/api";

const links = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/movies", "Movies", Film],
  ["/admin/showtimes", "Showtimes", CalendarDays],
  ["/admin/screens", "Screens", MonitorPlay],
  ["/admin/bookings", "Bookings", Ticket],
];

export default function AdminShell({ children, user }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    try {
      await api.logout();
    } finally {
      window.location.href = "/";
    }
  }

  function Sidebar({ mobile = false }) {
    return (
      <aside
        className={`${mobile ? "h-full w-[285px]" : "hidden w-[255px] lg:flex"} sticky top-0 h-screen shrink-0 border-r border-white/[.06] bg-[#0d0a0b] px-4 py-5`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-2">
            <Logo href="/admin" />
            {mobile && (
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-zinc-600 hover:bg-white/[.04] hover:text-white"
              >
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
                <p className="truncate text-sm font-semibold">
                  {user?.username || "Administrator"}
                </p>
                <p className="truncate text-[11px] text-zinc-600">
                  {user?.email || "Admin account"}
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {links.map(([href, label, Icon]) => {
              const active =
                path === href || (href !== "/admin" && path.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-red-600 text-white shadow-red" : "text-zinc-500 hover:bg-white/[.04] hover:text-white"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 hover:bg-white/[.04] hover:text-white"
            >
              <Home className="h-4 w-4" /> View website
            </Link>
            <Link
              href="/admin/movies/new"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500"
            >
              <Plus className="h-4 w-4" /> Add movie
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-600 hover:bg-white/[.04] hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#080607]">
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/75 transition ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute left-0 top-0 h-full transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar mobile />
        </div>
      </div>

      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex min-h-[72px] items-center gap-3 border-b border-white/[.06] bg-[#080607]/90 px-4 pl-[70px] backdrop-blur-xl sm:px-7 sm:pl-[80px] lg:px-9">
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl border border-white/[.07] bg-white/[.025] p-2.5 text-zinc-300 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden max-w-xl flex-1 items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 lg:flex">
              <Search className="h-4 w-4 text-zinc-700" />
              <input
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-zinc-700"
                placeholder="Search dashboard..."
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="rounded-xl border border-white/[.07] bg-white/[.025] p-2.5 text-zinc-500 hover:text-white">
                <Bell className="h-4 w-4" />
              </button>
              <span className="hidden rounded-xl border border-white/[.06] bg-white/[.025] px-3 py-2 text-xs text-zinc-500 sm:block">
                {user?.username || "Admin"}
              </span>
            </div>
          </header>
          <div className="w-full p-4 sm:p-7 lg:p-9">{children}</div>
        </main>
      </div>
    </div>
  );
}
