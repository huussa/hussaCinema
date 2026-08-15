"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, SearchBox, Status, Table } from "@/components/AdminUI";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .getMovies()
      .then((d) => setMovies(d.movies || []))
      .catch((e) => setError(e.message));
  }, []);
  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase()),
  );
  async function remove(id) {
    if (!confirm("Delete this movie?")) return;
    try {
      await api.deleteMovie(id);
      setMovies((x) => x.filter((m) => m.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div>
      <PageHeader
        title="Movies"
        description="Manage movies using the real movies endpoints."
        action="Add movie"
        href="/admin/movies/new"
      />
      {error && (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="mb-4 max-w-xl">
        <div onChange={(e) => setQuery(e.target.value)}>
          <SearchBox placeholder="Search movies..." />
        </div>
      </div>
      <Table>
        <thead className="border-b border-white/[.06] text-xs uppercase tracking-wider text-zinc-700">
          <tr>
            {["Movie", "Genres", "Duration", "Poster", "Actions"].map((x) => (
              <th key={x} className="px-5 py-4 font-medium">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[.05]">
          {filtered.map((m) => (
            <tr key={m.id} className="hover:bg-white/[.02]">
              <td className="px-5 py-4 font-medium">{m.title}</td>
              <td className="px-5 py-4 text-sm text-zinc-500">
                {m.genres?.map((g) => g.name).join(", ") || "—"}
              </td>
              <td className="px-5 py-4 text-sm text-zinc-500">
                {m.duration} min
              </td>
              <td className="px-5 py-4 text-sm text-zinc-500">
                {m.posterUrl ? "Yes" : "No"}
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/movies/${m.id}/edit`}
                    className="text-sm text-red-400"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(m.id)}
                    className="text-sm text-zinc-600 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
