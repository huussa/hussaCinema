"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import UserNav from "./UserNav";
import { api } from "@/lib/api";

export default function UserAppShell({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.me().then((data) => setUser(data.user)).catch(() => {});
  }, []);

  const bare = pathname?.startsWith("/auth") || pathname?.startsWith("/admin");
  if (bare) return children;

  return (
    <div className="min-h-screen w-full bg-[#080607]">
      <div className="flex min-h-screen w-full">
        <UserNav user={user} />
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex min-h-[72px] items-center gap-3 border-b border-white/[.06] bg-[#080607]/90 px-4 pl-[70px] backdrop-blur-xl sm:px-7 sm:pl-[80px] lg:px-9">
            <div className="hidden min-w-0 flex-1 max-w-xl items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 lg:flex">
              <Search className="h-4 w-4 text-zinc-700" />
              <input className="h-10 w-full bg-transparent text-sm text-zinc-300 outline-none placeholder:text-zinc-700" placeholder="Search movies, showtimes..." />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-xl border border-white/[.06] bg-white/[.025] px-3 py-2 text-xs text-zinc-600 sm:flex">
                <MapPin className="h-3.5 w-3.5 text-red-500" /> Cinema
              </span>
              <button className="rounded-xl border border-white/[.07] bg-white/[.025] p-2.5 text-zinc-500 hover:text-white">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
