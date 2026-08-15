"use client";

import { useEffect, useState } from "react";
import { PageHeader, Status, Table } from "@/components/AdminUI";
import { api } from "@/lib/api";
import Loading from "@/components/Loading";

export default function AdminBookings() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .getMyReservations()
      .then((d) => setRows(d.reservations || []))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div>
      <PageHeader
        title="Bookings"
        description="The supplied backend exposes reservations for the authenticated user, not an admin-wide reservations endpoint."
      />
      {error && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {rows === null && !error ? (
        <Loading />
      ) : (
        <Table>
          <thead className="border-b border-white/[.06] text-xs uppercase tracking-wider text-zinc-700">
            <tr>
              {["Reservation", "Movie", "Start", "Seats", "Status"].map((x) => (
                <th key={x} className="px-5 py-4 font-medium">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[.05]">
            {(rows || []).map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-4 text-sm text-zinc-500">{r.id}</td>
                <td className="px-5 py-4 font-medium">{r.movieTitle}</td>
                <td className="px-5 py-4 text-sm text-zinc-500">
                  {new Date(r.startTime).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-sm text-zinc-500">
                  {r.seats?.map((s) => `${s.row}${s.number}`).join(", ")}
                </td>
                <td className="px-5 py-4">
                  <Status tone={r.status === "cancelled" ? "red" : "green"}>
                    {r.status}
                  </Status>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
