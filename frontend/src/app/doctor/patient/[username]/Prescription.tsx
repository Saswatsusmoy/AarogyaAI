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
}: {
  patient: PatientProfile | null;
  patientUsername: string;
  doctorName?: string | null;
}) {
  const [clinicName, setClinicName] = React.useState<string>("AarogyaAI Clinic");
  const [clinicAddress, setClinicAddress] = React.useState<string>("123 Health Street, City");
  const [clinicPhone, setClinicPhone] = React.useState<string>("+91-00000-00000");

  const [diagnosis, setDiagnosis] = React.useState<string>("");
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [advice, setAdvice] = React.useState<string>("");
  const [followUp, setFollowUp] = React.useState<string>("");
  const [signature, setSignature] = React.useState<string>(doctorName || "");

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

  const printAsPDF = () => {
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
              <div>${signature || ""}</div>
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
  };

  return (
    <div className="border border-white/10 rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Prescription</h2>
        <button
          className="px-3 py-1 rounded bg-foreground text-background disabled:opacity-60 text-sm"
          onClick={printAsPDF}
          title="Download/Print as PDF"
        >
          Download PDF
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Clinic Name</label>
          <input
            className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Clinic Address</label>
          <input
            className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Clinic Phone</label>
          <input
            className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={clinicPhone}
            onChange={(e) => setClinicPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm mb-1">Patient Name</label>
          <input
            className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={patient?.name || patientUsername}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Age</label>
          <input
            className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={patient?.age ?? ""}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <input
            className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={patient?.gender || ""}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={patient?.phone || ""}
            readOnly
          />
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

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Doctor Signature</label>
          <input
            className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Dr. John Doe, MBBS"
          />
        </div>
      </div>
    </div>
  );
}


