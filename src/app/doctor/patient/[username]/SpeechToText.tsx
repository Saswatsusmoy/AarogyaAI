"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SpeechToText({ onAppend }:{ onAppend: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [recognizer, setRecognizer] = useState<SpeechRecognition | null>(null as any);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const toggleMic = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition not supported in this browser");
      return;
    }
    if (!listening) {
      const rec: SpeechRecognition = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (e: any) => {
        let final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += transcript + " ";
        }
        if (final) {
          const text = final.trim();
          onAppend(text);
          // Also persist to transcriptions API if appointmentId is available
          if (appointmentId) {
            fetch("/api/patient/transcriptions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ appointmentId, text }),
            }).catch(() => {});
          }
        }
      };
      rec.onerror = () => setError("Speech recognition error");
      rec.start();
      setRecognizer(rec);
      setListening(true);
    } else {
      recognizer?.stop();
      setListening(false);
    }
  };

  return (
    <div className="border border-white/10 rounded p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Start Conversation (STT)</h2>
        <button className={`px-3 py-1 rounded border border-white/20 text-sm ${listening ? "bg-white/10" : ""}`} onClick={toggleMic}>
          {listening ? "Stop" : "Start"}
        </button>
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <div className="text-xs opacity-70">Speaks will be transcribed and appended to the notes.</div>
    </div>
  );
}


