import Link from "next/link";
import { Clock3, Star } from "lucide-react";

export default function MovieCard({ movie }) {
  return (
    <Link href={`/movies/${movie.id}`} className="group block min-w-0">
      <div className="overflow-hidden rounded-2xl border border-white/[.06] bg-[#110d0f] transition duration-300 group-hover:-translate-y-1 group-hover:border-red-700/40">
        <div className="aspect-[3/4] overflow-hidden bg-[#171012]">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-end bg-gradient-to-t from-black via-[#241216] to-[#120b0d] p-4">
              <span className="text-sm font-bold">{movie.title}</span>
            </div>
          )}
        </div>
        <div className="p-3.5">
          <h3 className="truncate text-sm font-semibold text-white">{movie.title}</h3>
          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {movie.duration} min</span>
            <span className="flex items-center gap-1 text-amber-400"><Star className="h-3 w-3 fill-current" /> Cinema</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(movie.genres || []).slice(0, 2).map((genre) => (
              <span key={genre.id} className="rounded-full bg-white/[.04] px-2 py-1 text-[9px] text-zinc-600">{genre.name}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
