"use client";

import React from "react";

type PatientProfile = {
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
  phone?: string | null;
  allergies?: string | null;
  ailments?: string | null;
};

type Medication = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
};

export default function Prescription({
  patient,
  patientUsername,
  doctorName,
  appointmentId,
}: {
  patient: PatientProfile | null;
  patientUsername: string;
  doctorName?: string | null;
  appointmentId?: string | null;
}) {
  const [clinicName, setClinicName] = React.useState<string>("AarogyaAI Clinic");
  const [clinicAddress, setClinicAddress] = React.useState<string>("123 Health Street, City");
  const [clinicPhone, setClinicPhone] = React.useState<string>("+91-00000-00000");

  const [diagnosis, setDiagnosis] = React.useState<string>("");
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [advice, setAdvice] = React.useState<string>("");
  const [followUp, setFollowUp] = React.useState<string>("");
  const [signature, setSignature] = React.useState<string>(doctorName || "");
  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedMsg, setSavedMsg] = React.useState<string>("");

  // Load doctor signature, clinic details and existing prescription data
  React.useEffect(() => {
    async function loadData() {
      // Load doctor profile data (signature and clinic details)
      if (doctorName) {
        try {
          const res = await fetch(`/api/doctor/profile?username=${encodeURIComponent(doctorName)}`);
          if (res.ok) {
            const profile = await res.json();
            if (profile?.signature) {
              setSignature(profile.signature);
            }
            // Load clinic details from doctor profile
            if (profile?.clinicName) {
              setClinicName(profile.clinicName);
            }
            if (profile?.clinicAddress) {
              setClinicAddress(profile.clinicAddress);
            }
            if (profile?.clinicPhone) {
              setClinicPhone(profile.clinicPhone);
            }
          }
        } catch {}
      }

      // Load existing prescription data
      if (!appointmentId) return;
      try {
        const res = await fetch(`/api/appointments?id=${encodeURIComponent(appointmentId)}`);
        if (res.ok) {
          const appt = await res.json();
          if (appt?.prescription) {
            const data = JSON.parse(appt.prescription);
            setClinicName(data.clinicName || "AarogyaAI Clinic");
            setClinicAddress(data.clinicAddress || "123 Health Street, City");
            setClinicPhone(data.clinicPhone || "+91-00000-00000");
            setDiagnosis(data.diagnosis || "");
            setMedications(data.medications || []);
            setAdvice(data.advice || "");
            setFollowUp(data.followUp || "");
            // Don't override signature if we already loaded it from doctor profile
            if (!profile?.signature) {
              setSignature(data.signature || doctorName || "");
            }
          }
        }
      } catch {}
    }
    loadData();
  }, [appointmentId, doctorName]);

  const savePrescription = async () => {
    if (!appointmentId) return;
    setSaving(true);
    setError(null);
    setSavedMsg("");
    
    try {
      const prescriptionData = {
        clinicName,
        clinicAddress,
        clinicPhone,
        diagnosis,
        medications,
        advice,
        followUp,
        signature,
      };
      
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: appointmentId, 
          prescription: JSON.stringify(prescriptionData) 
        }),
      });
      
      if (!res.ok) throw new Error("Failed to save prescription");
      setSavedMsg("Prescription saved successfully");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (e) {
      setError("Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  const addMedication = () => {
    setMedications((prev) => [
      ...prev,
      { name: "", dosage: "", frequency: "", duration: "", notes: "" },
    ]);
  };

  const removeMedication = (idx: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateMedication = (
    idx: number,
    field: keyof Medication,
    value: string
  ) => {
    setMedications((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  const printAsPDF = async () => {
    const win = window.open("", "_blank");
    if (!win) return;

    const patientName = patient?.name || patientUsername;
    const patientAge = patient?.age != null ? String(patient.age) : "-";
    const patientGender = patient?.gender || "-";
    const patientPhone = patient?.phone || "-";

    const medsHtml = medications
      .map((m, idx) => {
        const safe = (v: string | undefined) => (v ? v : "");
        return `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;">${idx + 1}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${safe(m.name)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${safe(m.dosage)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${safe(m.frequency)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${safe(m.duration)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${safe(m.notes)}</td>
        </tr>`;
      })
      .join("");

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Prescription - ${patientName}</title>
        <style>
          body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; color:#111827;}
          .container{max-width:800px;margin:24px auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;}
          .muted{color:#6b7280}
          .section{margin-top:16px}
          .h1{font-size:20px;font-weight:700}
          .h2{font-size:16px;font-weight:600;margin-top:16px;margin-bottom:8px}
          .row{display:flex;gap:16px;flex-wrap:wrap}
          .badge{display:inline-block;padding:2px 8px;border-radius:9999px;background:#e5e7eb;color:#111827;font-size:12px}
          table{width:100%;border-collapse:collapse;margin-top:8px}
          .footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:32px}
          .sign{border-top:1px solid #9ca3af;padding-top:8px;margin-top:40px;text-align:right}
          @page { size: A4; margin: 20mm; }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div class="h1">${clinicName}</div>
              <div class="muted">${clinicAddress}</div>
              <div class="muted">${clinicPhone}</div>
            </div>
            <div class="badge">Prescription</div>
          </div>

          <div class="section">
            <div class="h2">Patient Details</div>
            <div class="row">
              <div><strong>Name:</strong> ${patientName}</div>
              <div><strong>Age:</strong> ${patientAge}</div>
              <div><strong>Gender:</strong> ${patientGender}</div>
              <div><strong>Phone:</strong> ${patientPhone}</div>
            </div>
          </div>

          <div class="section">
            <div class="h2">Diagnosis</div>
            <div>${diagnosis ? diagnosis.replace(/\n/g, "<br/>") : ""}</div>
          </div>

          <div class="section">
            <div class="h2">Medications</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">#</th>
                  <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Name</th>
                  <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Dosage</th>
                  <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Frequency</th>
                  <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Duration</th>
                  <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Notes</th>
                </tr>
              </thead>
              <tbody>
                ${medsHtml}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="h2">Advice</div>
            <div>${advice ? advice.replace(/\n/g, "<br/>") : ""}</div>
          </div>

          <div class="section">
            <div class="h2">Follow-up</div>
            <div>${followUp ? followUp.replace(/\n/g, "<br/>") : ""}</div>
          </div>

          <div class="footer">
            <div class="muted">Generated via AarogyaAI</div>
            <div class="sign">
              ${signature && signature.startsWith('data:image') 
                ? `<img src="${signature}" alt="Doctor Signature" style="max-height: 40px; max-width: 200px;" />`
                : `<div>${signature || ""}</div>`
              }
              <div class="muted">Signature</div>
            </div>
          </div>
        </div>
        <script>window.onload = () => { window.print(); };</script>
      </body>
    </html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();

    // Save PDF to database if appointmentId is available
    if (appointmentId) {
      try {
        // Convert HTML to base64 for storage (simplified approach)
        const pdfContent = btoa(html);
        await fetch("/api/appointments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: appointmentId, 
            prescriptionPdf: pdfContent 
          }),
        });
      } catch (e) {
        console.error("Failed to save PDF to database:", e);
      }
    }
  };

  return (
    <div className="border border-white/10 rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Prescription</h2>
        <div className="flex items-center gap-2">
          {appointmentId && (
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-60 text-sm"
              onClick={savePrescription}
              disabled={saving}
              title="Save prescription to database"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
          <button
            className="px-3 py-1 rounded bg-foreground text-background disabled:opacity-60 text-sm"
            onClick={printAsPDF}
            title="Download/Print as PDF"
          >
            Download PDF
          </button>
        </div>
      </div>
      
      {error && <div className="text-sm text-red-500">{error}</div>}
      {!error && savedMsg && <div className="text-sm text-green-500">{savedMsg}</div>}

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-300">Clinic Details (Read-only)</div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Clinic Name</label>
            <input
              className="w-full px-3 py-2 rounded border border-white/20 bg-gray-800/50 outline-none cursor-not-allowed opacity-70"
              value={clinicName}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Clinic Address</label>
            <input
              className="w-full px-3 py-2 rounded border border-white/20 bg-gray-800/50 outline-none cursor-not-allowed opacity-70"
              value={clinicAddress}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Clinic Phone</label>
            <input
              className="w-full px-3 py-2 rounded border border-white/20 bg-gray-800/50 outline-none cursor-not-allowed opacity-70"
              value={clinicPhone}
              readOnly
              disabled
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-300">Patient Details (Read-only)</div>
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1">Patient Name</label>
            <input
              className="w-full px-3 py-2 rounded border border-white/20 bg-gray-800/50 outline-none cursor-not-allowed opacity-70"
              value={patient?.name || patientUsername}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Age</label>
            <input
              className="w-full px-3 py-2 rounded border border-white/20 bg-gray-800/50 outline-none cursor-not-allowed opacity-70"
              value={patient?.age ?? ""}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Gender</label>
            <input
              className="w-full px-3 py-2 rounded border border-white/20 bg-gray-800/50 outline-none cursor-not-allowed opacity-70"
              value={patient?.gender || ""}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input
              className="w-full px-3 py-2 rounded border border-white/20 bg-gray-800/50 outline-none cursor-not-allowed opacity-70"
              value={patient?.phone || ""}
              readOnly
              disabled
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Diagnosis</label>
        <textarea
          className="w-full h-28 px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Enter diagnosis notes"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Medications</div>
          <button
            className="text-sm underline"
            onClick={addMedication}
          >
            Add medicine
          </button>
        </div>
        {medications.length === 0 && (
          <div className="text-sm opacity-70">No medicines added yet.</div>
        )}
        {medications.map((m, idx) => (
          <div key={idx} className="grid md:grid-cols-5 gap-3 border border-white/10 rounded p-3">
            <input
              className="px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
              placeholder="Name"
              value={m.name}
              onChange={(e) => updateMedication(idx, "name", e.target.value)}
            />
            <input
              className="px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
              placeholder="Dosage (e.g., 500mg)"
              value={m.dosage}
              onChange={(e) => updateMedication(idx, "dosage", e.target.value)}
            />
            <input
              className="px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
              placeholder="Frequency (e.g., 1-0-1)"
              value={m.frequency}
              onChange={(e) => updateMedication(idx, "frequency", e.target.value)}
            />
            <input
              className="px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
              placeholder="Duration (e.g., 5 days)"
              value={m.duration}
              onChange={(e) => updateMedication(idx, "duration", e.target.value)}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
                placeholder="Notes"
                value={m.notes || ""}
                onChange={(e) => updateMedication(idx, "notes", e.target.value)}
              />
              <button
                className="text-sm underline whitespace-nowrap"
                onClick={() => removeMedication(idx)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Advice</label>
          <textarea
            className="w-full h-28 px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder="Diet, rest, precautions, etc."
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Follow-up</label>
          <textarea
            className="w-full h-28 px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Follow-up date or conditions"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-300">Doctor Signature (Read-only)</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Doctor Signature</label>
            <input
              className="w-full px-3 py-2 rounded border border-white/20 bg-gray-800/50 outline-none cursor-not-allowed opacity-70"
              value={signature}
              readOnly
              disabled
              placeholder="Dr. John Doe, MBBS"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


