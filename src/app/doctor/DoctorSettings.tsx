"use client";

import React, { useEffect, useState } from "react";

type Profile = {
  name?: string | null;
  age?: number | null;
  phone?: string | null;
  department?: string | null;
  speciality?: string | null;
};

export default function DoctorSettings({ username }: { username: string }) {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/doctor/profile?username=${encodeURIComponent(username)}`)
      .then(r => r.json())
      .then((data: Profile | null) => {
        setProfile(data || {});
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [username]);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile(p => ({ ...p, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, ...profile }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaved(true);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm opacity-80">Loading...</div>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="border border-white/10 rounded p-4">
        <h2 className="font-medium mb-2">Doctor Settings</h2>
        <p className="text-sm opacity-80">Please complete your profile information.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={profile.name ?? ""} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Age</label>
          <input type="number" className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={profile.age ?? ""} onChange={(e) => update("age", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone No</label>
          <input className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={profile.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Department</label>
          <input className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={profile.department ?? ""} onChange={(e) => update("department", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Speciality</label>
          <input className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={profile.speciality ?? ""} onChange={(e) => update("speciality", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-foreground text-background disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
        {saved && <span className="text-sm text-green-500">Saved</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  );
}


