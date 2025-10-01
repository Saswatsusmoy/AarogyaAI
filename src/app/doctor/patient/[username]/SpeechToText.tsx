"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SpeechToText({ onFinal }:{ onFinal: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [recognizer, setRecognizer] = useState<SpeechRecognition | null>(null as any);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const BACKEND_BASE = process.env.NEXT_PUBLIC_STT_BACKEND_URL || "http://localhost:8080";

  const speechSupported = useMemo(() => {
    const w: any = typeof window !== "undefined" ? window : {};
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  const toggleMic = async () => {
    const w: any = window as any;
    const SR: any = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError("This browser does not support live speech recognition. Please use Chrome or Edge.");
      return;
    }
    if (!listening) {
      try {
        const res = await fetch(`${BACKEND_BASE}/stt/session/start`, { method: "POST" });
        if (!res.ok) throw new Error("failed to start stt session");
        const data = await res.json();
        setSessionId(data.session_id);
      } catch {
        setError("Failed to start backend STT session");
      }

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
          onFinal(text);
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
      if (sessionId) {
        fetch(`${BACKEND_BASE}/stt/session/stop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        }).catch(() => {});
        setSessionId(null);
      }
    }
  };

  return (
    <div className="border border-white/10 rounded p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Start Conversation (STT)</h2>
        <button
          className={`px-3 py-1 rounded border border-white/20 text-sm ${listening ? "bg-white/10" : ""}`}
          onClick={toggleMic}
          disabled={!speechSupported}
          title={!speechSupported ? "Use Chrome or Edge for live speech recognition" : undefined}
        >
          {listening ? "Stop" : "Start"}
        </button>
      </div>
      {!speechSupported && (
        <div className="text-sm opacity-80">Live transcription requires a browser with the Speech API (try Chrome or Edge).</div>
      )}
      {error && <div className="text-sm text-red-500">{error}</div>}
      <div className="text-xs opacity-70">Speaks will be transcribed and appended to the notes.</div>
    </div>
  );
}


