"use client";

import React, { useEffect, useState } from "react";

type Doctor = { username: string };

export default function BookAppointment({ patientUsername }: { patientUsername: string }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorUsername, setDoctorUsername] = useState("");
  const [datetime, setDatetime] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load all doctors from /api/users (simple map), filter role doctor
    fetch("/api/users").then(r => r.json()).then((map: Record<string, { role: string }>) => {
      const list = Object.values(map).filter(u => u.role === "doctor").map(u => ({ username: (u as any).username }));
      setDoctors(list);
      if (list[0]) setDoctorUsername(list[0].username);
    }).catch(() => setDoctors([]));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientUsername, doctorUsername, scheduledAt: datetime ? new Date(datetime).toISOString() : null, reason: reason || null }),
      });
      if (!res.ok) throw new Error("create failed");
      setSaved(true);
      setReason("");
    } catch {
      setError("Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm mb-1">Doctor</label>
          <select className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={doctorUsername} onChange={(e) => setDoctorUsername(e.target.value)}>
            {doctors.map(d => <option key={d.username} value={d.username}>{d.username}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Date & Time</label>
          <input type="datetime-local" className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={datetime} onChange={(e) => setDatetime(e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Reason (optional)</label>
          <input className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe your concern" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-foreground text-background disabled:opacity-60">{submitting ? "Booking..." : "Book"}</button>
        {saved && <span className="text-sm text-green-500">Booked</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  );
}


