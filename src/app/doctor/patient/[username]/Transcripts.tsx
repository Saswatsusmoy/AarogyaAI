"use client";

import React from "react";

export default function Transcripts({ items }: { items: { text: string; createdAt?: string }[] }) {
  if (!items?.length) {
    return (
      <div className="border border-white/10 rounded p-4 space-y-2">
        <h2 className="font-medium">Transcripts</h2>
        <div className="text-sm opacity-70">No transcripts yet.</div>
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded p-4 space-y-2">
      <h2 className="font-medium">Transcripts</h2>
      <div className="space-y-2 text-sm opacity-90">
        {items.map((t, idx) => (
          <div key={idx} className="p-2 rounded border border-white/10">
            <div>{t.text}</div>
            {t.createdAt && (
              <div className="text-xs opacity-60 mt-1">{new Date(t.createdAt).toLocaleString()}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
