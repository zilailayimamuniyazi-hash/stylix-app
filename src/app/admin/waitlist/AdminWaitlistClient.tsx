"use client";

import { useEffect, useState } from "react";

interface WaitlistUser {
  id: string;
  email: string;
  name: string | null;
  country: string;
  gender: string;
  source: string | null;
  created_at: string;
}

function formatGender(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function AdminWaitlistClient() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchEmail.trim().toLowerCase())
  );

  function escapeCsv(value: string | null | undefined) {
    const text = value ?? "";
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    const rows = filteredUsers.map((user) => [
      user.name ?? "",
      user.email,
      user.country,
      formatGender(user.gender),
      user.source ?? "",
      user.created_at,
    ]);
    const csv = [
      ["Name", "Email", "Country", "Gender", "Source", "Created Date"].map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stylix-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function loadWaitlist() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/waitlist");
      if (response.status === 401) {
        window.location.href = "/admin/login?next=/admin/waitlist";
        return;
      }
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to load waitlist.");
        return;
      }

      setUsers(data.users ?? []);
      setLoaded(true);
    } catch {
      setError("Unable to load waitlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWaitlist();
  }, []);

  return (
    <div className="ui-page pt-24">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.45em] text-gold/60">
            Stylix Admin
          </p>
          <h1 className="mt-5 font-serif text-4xl text-ivory md:text-5xl">
            Early Access Waitlist
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/50">
            View all submitted waitlist users from Supabase.
          </p>
        </div>

        {!loaded && <div className="border border-ivory/10 bg-ink-soft/30 p-6 text-sm text-ivory/50">{loading ? "Loading waitlist..." : error || "No data available."}</div>}

        {loaded && (
          <div className="border border-ivory/10 bg-ink-soft/25">
            <div className="flex flex-col gap-3 border-b border-ivory/10 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold/60">
                {users.length} waitlist {users.length === 1 ? "user" : "users"}
              </p>
              <button type="button" onClick={() => void loadWaitlist()} className="text-left text-[10px] uppercase tracking-[0.25em] text-ivory/35 transition-colors hover:text-gold sm:text-right">Refresh</button>
            </div>

            {users.length === 0 ? (
              <p className="p-8 text-sm text-ivory/45">No waitlist users yet.</p>
            ) : (
              <div>
                <div className="grid gap-5 border-b border-ivory/10 p-5 lg:grid-cols-[180px_1fr_auto] lg:items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold/45">Total Waitlist</p>
                    <p className="mt-2 font-serif text-4xl text-ivory">{users.length}</p>
                  </div>
                  <label>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gold/45">Search by email</span>
                    <input
                      type="search"
                      value={searchEmail}
                      onChange={(event) => setSearchEmail(event.target.value)}
                      placeholder="customer@example.com"
                      className="mt-3 w-full border-b border-ivory/15 bg-transparent py-3 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none"
                    />
                    <span className="mt-2 block text-[11px] text-ivory/35">
                      Showing {filteredUsers.length} of {users.length}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={exportCsv}
                    disabled={filteredUsers.length === 0}
                    className="inline-flex items-center justify-center border border-gold/35 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-gold transition-colors hover:border-gold hover:text-gold-light disabled:pointer-events-none disabled:opacity-35"
                  >
                    Export CSV
                  </button>
                </div>

                {filteredUsers.length === 0 ? (
                  <p className="p-8 text-sm text-ivory/45">No waitlist users match that email search.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                      <thead>
                        <tr className="border-b border-ivory/10 text-[10px] uppercase tracking-[0.25em] text-ivory/35">
                          <th className="px-5 py-4 font-normal">Name</th>
                          <th className="px-5 py-4 font-normal">Email</th>
                          <th className="px-5 py-4 font-normal">Country</th>
                          <th className="px-5 py-4 font-normal">Gender</th>
                          <th className="px-5 py-4 font-normal">Source</th>
                          <th className="px-5 py-4 font-normal">Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-ivory/5 text-sm text-ivory/70">
                            <td className="px-5 py-4 text-ivory/55">{user.name || "—"}</td>
                            <td className="px-5 py-4">{user.email}</td>
                            <td className="px-5 py-4">{user.country}</td>
                            <td className="px-5 py-4">{formatGender(user.gender)}</td>
                            <td className="px-5 py-4 text-ivory/55">{user.source || "—"}</td>
                            <td className="px-5 py-4 text-ivory/45">{formatDate(user.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
