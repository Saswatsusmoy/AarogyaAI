"use client";

import React from "react";

export default function Transcripts({ items, partial }: { items: { text: string; createdAt?: string }[]; partial?: string }) {
  const hasItems = items?.length > 0;
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const totalCount = items?.length || 0;
  const headerNote = !expanded
    ? `${totalCount} saved${partial ? ", + live" : ""}`
    : undefined;

  return (
    <div className="border border-white/10 rounded p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Transcripts</h2>
        <div className="flex items-center gap-3">
          {headerNote && (
            <span className="text-xs opacity-70">{headerNote}</span>
          )}
          <button
            className="text-sm underline"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="transcripts-content"
          >
            {expanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {!hasItems && !partial && (
        <div className="text-sm opacity-70">No transcripts yet.</div>
      )}
      {expanded && (
        <div id="transcripts-content" className="space-y-2 text-sm opacity-90">
          {items.map((t, idx) => (
            <div key={idx} className="p-2 rounded border border-white/10">
              <div>{t.text}</div>
              {t.createdAt && (
                <div className="text-xs opacity-60 mt-1">{new Date(t.createdAt).toLocaleString()}</div>
              )}
            </div>
          ))}
          {partial ? (
            <div className="p-2 rounded border border-dashed border-white/10 opacity-80">
              {partial}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
