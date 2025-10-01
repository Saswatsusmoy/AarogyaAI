"use client";

import React, { useMemo, useState } from "react";

export default function AINotes({
  transcripts,
  onGenerated,
}: {
  transcripts: { text: string }[];
  onGenerated?: (notes: string, prescription?: any) => void;
}) {
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcriptBlob = useMemo(() => {
    return transcripts.map((t) => t.text).join("\n").trim();
  }, [transcripts]);

  const BACKEND_BASE = process.env.NEXT_PUBLIC_STT_BACKEND_URL || "http://localhost:8080";

  const generate = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/ai/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptBlob }),
      });
      if (!res.ok) throw new Error("AI notes generation failed");
      const data = await res.json();
      setNotes(data.notes || "");
      if (onGenerated) onGenerated(data.notes, data.prescription);
    } catch (e) {
      setError("Failed to generate AI notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-white/10 rounded p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">AI Notes</h2>
        <button
          className="px-3 py-1 rounded bg-foreground text-background disabled:opacity-60 text-sm"
          onClick={generate}
          disabled={loading || !transcriptBlob}
          title={!transcriptBlob ? "No transcripts available to generate notes" : undefined}
        >
          {loading ? "Generating..." : "Refresh"}
        </button>
      </div>
      <textarea
        className="w-full h-48 px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Click Refresh to generate AI notes from transcripts."
      />
      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
}


