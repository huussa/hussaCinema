import Link from "next/link";
import { Plus, Search } from "lucide-react";

export function PageHeader({ title, description, action, href }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-red-500">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-black">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-zinc-600">{description}</p>
        )}
      </div>
      {action && href && (
        <Link
          href={href}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500"
        >
          <Plus className="h-4 w-4" />
          {action}
        </Link>
      )}
    </div>
  );
}
export function SearchBox({ placeholder }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700" />
      <input
        placeholder={placeholder || "Search..."}
        className="h-11 w-full rounded-xl border border-white/[.07] bg-white/[.025] pl-10 pr-3 text-sm outline-none focus:border-red-600/60"
      />
    </div>
  );
}
export function Status({ children, tone = "green" }) {
  const s = {
    green: "bg-emerald-500/10 text-emerald-400",
    red: "bg-red-500/10 text-red-400",
    yellow: "bg-amber-500/10 text-amber-400",
    gray: "bg-white/5 text-zinc-500",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs ${s[tone]}`}>
      {children}
    </span>
  );
}
export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      <input
        {...props}
        className="h-11 w-full rounded-xl border border-white/[.08] bg-white/[.025] px-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-600/60"
      />
    </label>
  );
}
export function SelectField({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      <select
        {...props}
        className="h-11 w-full rounded-xl border border-white/[.08] bg-[#151012] px-3 text-sm outline-none focus:border-red-600/60"
      >
        {children}
      </select>
    </label>
  );
}
export function Table({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[.06] bg-panel">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">{children}</table>
      </div>
    </div>
  );
}
