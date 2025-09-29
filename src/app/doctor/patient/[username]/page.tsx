"use client";

import React, { useEffect, useMemo, useState } from "react";
import DoctorScribe from "./DoctorScribe";
import SpeechToText from "./SpeechToText";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Profile = {
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
  phone?: string | null;
  allergies?: string | null;
  ailments?: string | null;
  scribeNotes?: string | null;
};

export default function DoctorPatientProfile() {
  const params = useParams();
  const usernameRaw = Array.isArray((params as any).username) ? (params as any).username[0] : (params as any).username as string;
  const username = (() => {
    try {
      // Normalize in case param is still percent-encoded
      return decodeURIComponent(usernameRaw);
    } catch {
      return usernameRaw;
    }
  })();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [recognizer, setRecognizer] = useState<SpeechRecognition | null>(null as any);
  // Editable (except name): keep local state mirrors
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string>("");
  const [weight, setWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [phone, setPhone] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");
  const [ailments, setAilments] = useState<string>("");
  const [editMode, setEditMode] = useState(false);

  const currentWeight = editMode ? weight : (typeof profile?.weight === "number" ? profile!.weight : null);
  const currentHeight = editMode ? height : (typeof profile?.height === "number" ? profile!.height : null);
  const bmi = useMemo(() => {
    if (currentWeight == null || currentHeight == null || currentHeight === 0) return null;
    const hM = currentHeight / 100;
    const val = currentWeight / (hM * hM);
    return Math.round(val * 10) / 10;
  }, [currentWeight, currentHeight]);
  const bmiLabel = useMemo(() => {
    if (bmi == null) return "-";
    if (bmi < 18.5) return `${bmi} (Underweight)`;
    if (bmi < 24.9) return `${bmi} (Normal)`;
    if (bmi < 29.9) return `${bmi} (Overweight)`;
    return `${bmi} (Obese)`;
  }, [bmi]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    async function load() {
      if (!username) return;
      try {
        const res = await fetch(`/api/patient/profile?username=${encodeURIComponent(username)}`);
        let data: any = null;
        if (res.ok) {
          data = await res.json();
        }
        if (!data) {
          // Ensure an empty profile exists, then use empty defaults
          await fetch("/api/patient/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
          setProfile({});
          setNotes("");
        } else {
          setProfile(data);
          setNotes(data?.scribeNotes || "");
          setAge(typeof data?.age === "number" ? data.age : null);
          setGender(data?.gender || "");
          setWeight(typeof data?.weight === "number" ? data.weight : null);
          setHeight(typeof data?.height === "number" ? data.height : null);
          setPhone(data?.phone || "");
          setAllergies(data?.allergies || "");
          setAilments(data?.ailments || "");
          setEditMode(false);
        }
      } catch {
        setProfile({});
      }
    }
    load();
  }, [username]);

  const saveNotes = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, scribeNotes: notes }),
      });
      if (!res.ok) throw new Error("save failed");
    } catch {
      setError("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        username,
        age: age ?? null,
        gender: gender || null,
        weight: weight ?? null,
        height: height ?? null,
        phone: phone || null,
        allergies: allergies || null,
        ailments: ailments || null,
      };
      const res = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
    } catch {
      setError("Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  const toggleMic = () => {
    // Browser SpeechRecognition (experimental)
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
        if (final) setNotes(n => (n ? n + "\n" : "") + final.trim());
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

  if (!profile) return <div className="p-4 text-sm opacity-80">Loading...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patient: {profile.name || username}</h1>
        <button className="text-sm underline" onClick={() => router.back()}>Back</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-white/10 rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Details</h2>
            {!editMode ? (
              <button className="text-sm underline" onClick={() => setEditMode(true)}>Edit</button>
            ) : (
              <div className="flex items-center gap-2">
                <button className="text-sm underline" onClick={() => {
                  // reset to current profile values
                  setAge(typeof profile?.age === "number" ? profile!.age : null);
                  setGender(profile?.gender || "");
                  setWeight(typeof profile?.weight === "number" ? profile!.weight : null);
                  setHeight(typeof profile?.height === "number" ? profile!.height : null);
                  setPhone(profile?.phone || "");
                  setAllergies(profile?.allergies || "");
                  setAilments(profile?.ailments || "");
                  setEditMode(false);
                }}>Cancel</button>
                <button className="px-3 py-1 rounded bg-foreground text-background disabled:opacity-60" disabled={saving} onClick={async () => { await saveProfile(); setEditMode(false); }}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
          <div className="text-xs opacity-70">Name is not editable by doctors.</div>

          {!editMode ? (
            <div className="space-y-2 text-sm opacity-90">
              <div>Age: {profile?.age ?? "-"}</div>
              <div>Gender: {profile?.gender ?? "-"}</div>
              <div>Phone: {profile?.phone ?? "-"}</div>
              <div>Weight/Height: {profile?.weight ?? "-"} / {profile?.height ?? "-"}</div>
              <div>BMI: {bmiLabel}</div>
              <div>Allergies: {profile?.allergies ?? "-"}</div>
              <div>Major Ailments: {profile?.ailments ?? "-"}</div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm mb-1">Age</label>
                <input type="number" className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={age ?? ""} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Gender</label>
                <input className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={gender} onChange={(e) => setGender(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Weight (kg)</label>
                  <input type="number" className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={weight ?? ""} onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Height (cm)</label>
                  <input type="number" className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={height ?? ""} onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)} />
                </div>
              </div>
              <div className="text-sm opacity-90">BMI: {bmiLabel}</div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Allergies</label>
                <textarea className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Major Ailments</label>
                <textarea className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none" value={ailments} onChange={(e) => setAilments(e.target.value)} />
              </div>
            </>
          )}
        </div>
        <DoctorScribe notes={notes} setNotes={setNotes} onSave={saveNotes} saving={saving} error={error} />
      </div>

      <SpeechToText onAppend={(text) => setNotes(n => (n ? n + "\n" : "") + text)} />
    </div>
  );
}


