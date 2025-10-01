"use client";

import React, { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  patient: { username: string };
};

type PatientRow = {
  username: string;
};

export default function DoctorPatients({ username }: { username: string }) {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, { name?: string | null; age?: number | null; phone?: string | null; gender?: string | null }>>({});

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?username=${encodeURIComponent(username)}&role=doctor`);
      const data = await res.json();
      const slim = (data || []).map((a: any) => ({ id: a.id, patient: { username: a.patient?.username } })) as Appointment[];
      setAppts(slim);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [username]);

  const patients: PatientRow[] = useMemo(() => {
    const set = new Set<string>();
    const rows: PatientRow[] = [];
    for (const a of appts) {
      const u = a.patient?.username;
      if (u && !set.has(u)) {
        set.add(u);
        rows.push({ username: u });
      }
    }
    rows.sort((a, b) => a.username.localeCompare(b.username));
    return rows;
  }, [appts]);

  // Load profiles for the deduped patients
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const result: Record<string, { name?: string | null; age?: number | null; phone?: string | null; gender?: string | null }> = {};
      await Promise.all(
        patients.map(async (p) => {
          try {
            const res = await fetch(`/api/patient/profile?username=${encodeURIComponent(p.username)}`);
            const data = await res.json();
            result[p.username] = {
              name: data?.name ?? null,
              age: data?.age ?? null,
              phone: data?.phone ?? null,
              gender: data?.gender ?? null,
            };
          } catch {
            result[p.username] = {} as any;
          }
        })
      );
      if (!cancelled) setProfiles(result);
    }
    if (patients.length > 0) run(); else setProfiles({});
    return () => { cancelled = true; };
  }, [patients]);

  if (loading) return <div className="text-sm opacity-80">Loading...</div>;

  return (
    <div className="space-y-2">
      {error && <div className="text-sm text-red-500">{error}</div>}
      {patients.length === 0 && <div className="text-sm opacity-80">No patients have booked yet.</div>}
      {patients.length > 0 && (
        <div className="overflow-x-auto border border-white/10 rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-3 py-2">Patient</th>
                <th className="px-3 py-2">Age</th>
                <th className="px-3 py-2">Gender</th>
                <th className="px-3 py-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.username} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2">{profiles[p.username]?.name || p.username}</td>
                  <td className="px-3 py-2">{profiles[p.username]?.age ?? ""}</td>
                  <td className="px-3 py-2">{profiles[p.username]?.gender ?? ""}</td>
                  <td className="px-3 py-2">{profiles[p.username]?.phone ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


