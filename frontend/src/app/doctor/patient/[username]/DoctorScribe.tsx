"use client";

import React from "react";

export default function DoctorScribe({
  notes,
  setNotes,
  onSave,
  saving,
  error,
}: {
  notes: string;
  setNotes: (v: string) => void;
  onSave: () => Promise<void> | void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className="border border-white/10 rounded p-4 space-y-3">
      <h2 className="font-medium">Doctor Scribe (Notes)</h2>
      <textarea
        className="w-full h-48 px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes will appear here."
      />
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-1 rounded bg-foreground text-background disabled:opacity-60"
          disabled={saving}
          onClick={() => onSave()}
        >
          {saving ? "Saving..." : "Save Notes"}
        </button>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </div>
  );
}


