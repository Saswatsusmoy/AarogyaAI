"use client";

import React, { useEffect, useState } from "react";

type AppointmentTranscription = {
  id: string;
  text: string;
  createdAt: string;
};

type AppointmentDetails = {
  id: string;
  scheduledAt: string;
  reason?: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";
  notes?: string | null;
  aiNotes?: string | null;
  prescription?: string | null;
  prescriptionPdf?: string | null;
  doctor: { username: string };
  transcriptions: AppointmentTranscription[];
};

type AppointmentDetailsModalProps = {
  appointmentId: string | null;
  onClose: () => void;
};

export default function AppointmentDetailsModal({ appointmentId, onClose }: AppointmentDetailsModalProps) {
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    if (!appointmentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?id=${encodeURIComponent(appointmentId)}`);
      const data = await res.json();
      if (res.ok) {
        setAppointment(data);
      } else {
        setError(data.error || "Failed to load appointment details");
      }
    } catch (err) {
      setError("Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const parsePrescription = (prescriptionJson?: string | null) => {
    if (!prescriptionJson) return null;
    try {
      return JSON.parse(prescriptionJson);
    } catch {
      return null;
    }
  };

  if (!appointmentId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Appointment Details</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="text-sm opacity-80">Loading appointment details...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-sm text-red-500">{error}</div>
              <button
                onClick={fetchAppointmentDetails}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
              >
                Try again
              </button>
            </div>
          )}

          {appointment && (
            <>
              {/* Basic Information */}
              <div className="border border-white/10 rounded p-4">
                <h3 className="font-medium mb-3">Basic Information</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-sm opacity-70">Doctor</div>
                    <div className="font-medium">Dr. {appointment.doctor.username}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">Status</div>
                    <div className="text-xs px-2 py-1 rounded border border-white/20 inline-block">
                      {appointment.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">Date</div>
                    <div className="font-medium">{formatDateTime(appointment.scheduledAt).date}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">Time</div>
                    <div className="font-medium">{formatDateTime(appointment.scheduledAt).time}</div>
                  </div>
                  {appointment.reason && (
                    <div className="md:col-span-2">
                      <div className="text-sm opacity-70">Reason for Visit</div>
                      <div className="font-medium">{appointment.reason}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor's Notes */}
              {appointment.notes && (
                <div className="border border-white/10 rounded p-4">
                  <h3 className="font-medium mb-3">Doctor's Notes</h3>
                  <div className="text-sm whitespace-pre-wrap bg-white/5 p-3 rounded">
                    {appointment.notes}
                  </div>
                </div>
              )}

              {/* AI Notes */}
              {appointment.aiNotes && (
                <div className="border border-white/10 rounded p-4">
                  <h3 className="font-medium mb-3">AI Notes</h3>
                  <div className="text-sm whitespace-pre-wrap bg-white/5 p-3 rounded">
                    {appointment.aiNotes}
                  </div>
                </div>
              )}

              {/* Prescription */}
              {appointment.prescription && (
                <div className="border border-white/10 rounded p-4">
                  <h3 className="font-medium mb-3">Prescription</h3>
                  <div className="text-sm whitespace-pre-wrap bg-white/5 p-3 rounded">
                    {appointment.prescription}
                  </div>
                </div>
              )}

              {/* Prescription PDF */}
              {appointment.prescriptionPdf && (
                <div className="border border-white/10 rounded p-4">
                  <h3 className="font-medium mb-3">Prescription Document</h3>
                  <div className="text-sm">
                    <a
                      href={`data:application/pdf;base64,${appointment.prescriptionPdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      View Prescription PDF
                    </a>
                  </div>
                </div>
              )}

              {/* Transcriptions */}
              {appointment.transcriptions && appointment.transcriptions.length > 0 && (
                <div className="border border-white/10 rounded p-4">
                  <h3 className="font-medium mb-3">Consultation Transcript</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {appointment.transcriptions.map((transcription, index) => (
                      <div key={transcription.id} className="bg-white/5 p-3 rounded">
                        <div className="text-xs opacity-60 mb-1">
                          {formatDateTime(transcription.createdAt).date} at {formatDateTime(transcription.createdAt).time}
                        </div>
                        <div className="text-sm">{transcription.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state for appointments with no additional data */}
              {!appointment.notes && !appointment.aiNotes && !appointment.prescription && 
               !appointment.prescriptionPdf && (!appointment.transcriptions || appointment.transcriptions.length === 0) && (
                <div className="text-center py-8 text-sm opacity-70">
                  No additional details available for this appointment.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
