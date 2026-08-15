export default function Loading({ label = "Loading..." }) {
  return <div className="flex min-h-[240px] items-center justify-center text-sm text-zinc-600"><div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-zinc-800 border-t-red-500" />{label}</div>;
}
