"use client";

import React, { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  scheduledAt: string;
  reason?: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";
  doctor: { username: string };
};

export default function PatientAppointments({ username }: { username: string }) {
  const [list, setList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?username=${encodeURIComponent(username)}&role=patient`);
      const data = await res.json();
      setList(data || []);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [username]);

  if (loading) return <div className="text-sm opacity-80">Loading...</div>;

  return (
    <div className="space-y-3">
      {error && <div className="text-sm text-red-500">{error}</div>}
      {list.length === 0 && <div className="text-sm opacity-80">No appointments.</div>}
      {list.map(a => (
        <div key={a.id} className="border border-white/10 rounded p-3 flex items-center justify-between">
          <div>
            <div className="font-medium">With Dr. {a.doctor.username}</div>
            <div className="text-sm opacity-80">{new Date(a.scheduledAt).toLocaleString()} {a.reason ? `• ${a.reason}` : ""}</div>
          </div>
          <div className="text-xs px-2 py-1 rounded border border-white/20">{a.status}</div>
        </div>
      ))}
    </div>
  );
}


