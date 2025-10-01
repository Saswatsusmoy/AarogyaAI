"use client";

import React, { useMemo, useState } from "react";

// Simple markdown renderer for medical notes
const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-xl font-bold text-white mb-4 mt-6 first:mt-0">
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-lg font-semibold text-blue-300 mb-3 mt-5">
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith('• ')) {
      elements.push(
        <div key={key++} className="ml-4 mb-2 text-gray-200">
          <span className="text-blue-400 mr-2">•</span>
          {line.substring(2)}
        </div>
      );
    } else if (line.trim() === '---') {
      elements.push(
        <hr key={key++} className="border-gray-600 my-4" />
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else if (line.startsWith('*') && line.endsWith('*')) {
      elements.push(
        <div key={key++} className="text-sm text-gray-400 italic text-center mt-4">
          {line.substring(1, line.length - 1)}
        </div>
      );
    } else if (line.trim()) {
      elements.push(
        <div key={key++} className="text-gray-200 mb-2">
          {line}
        </div>
      );
    }
  }

  return <div className="prose prose-invert max-w-none">{elements}</div>;
};

export default function AINotes({
  transcripts,
}: {
  transcripts: { text: string }[];
}) {
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");

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
        <div className="flex items-center gap-2">
          {notes && (
            <div className="flex items-center gap-1">
              <button
                className={`px-2 py-1 rounded text-xs ${
                  viewMode === "formatted" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-600 text-gray-300"
                }`}
                onClick={() => setViewMode("formatted")}
              >
                Formatted
              </button>
              <button
                className={`px-2 py-1 rounded text-xs ${
                  viewMode === "raw" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-600 text-gray-300"
                }`}
                onClick={() => setViewMode("raw")}
              >
                Raw
              </button>
            </div>
          )}
          <button
            className="px-3 py-1 rounded bg-foreground text-background disabled:opacity-60 text-sm"
            onClick={generate}
            disabled={loading || !transcriptBlob}
            title={!transcriptBlob ? "No transcripts available to generate notes" : undefined}
          >
            {loading ? "Generating..." : "Refresh"}
          </button>
        </div>
      </div>
      
      {notes ? (
        <div className="border border-white/20 rounded p-4 bg-gray-900/20">
          {viewMode === "formatted" ? (
            <div className="max-h-96 overflow-y-auto">
              <MarkdownRenderer content={notes} />
            </div>
          ) : (
            <textarea
              className="w-full h-48 px-3 py-2 rounded border border-white/20 bg-transparent outline-none text-sm font-mono"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Click Refresh to generate AI notes from transcripts."
            />
          )}
        </div>
      ) : (
        <div className="border border-white/20 rounded p-4 bg-gray-900/20 h-48 flex items-center justify-center text-gray-500">
          Click Refresh to generate AI notes from transcripts.
        </div>
      )}
      
      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
}


