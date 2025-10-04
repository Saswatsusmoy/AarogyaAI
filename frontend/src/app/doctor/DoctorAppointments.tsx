"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DoctorAppointmentDetails from "./DoctorAppointmentDetails";

type Appointment = {
  id: string;
  scheduledAt: string;
  reason?: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";
  patient: { username: string };
  payment?: {
    payment_status?: string;
    payment_amount?: number;
    payment_method?: string;
    payment_transaction_id?: string;
    payment_paid_at?: string;
  };
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DoctorAppointments({ username }: { username: string }) {
  const [list, setList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [showStartModal, setShowStartModal] = useState(false);
  const [activeApptId, setActiveApptId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsApptId, setDetailsApptId] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?username=${encodeURIComponent(username)}&role=doctor`);
      const data = await res.json();
      
      // Filter out declined appointments and fetch payment information for each appointment
      const validAppointments = (data || []).filter((appointment: any) => appointment.status !== "DECLINED");
      
      const appointmentsWithPayments = await Promise.all(
        validAppointments.map(async (appointment: any) => {
          try {
            const BACKEND_BASE = process.env.NEXT_PUBLIC_STT_BACKEND_URL || "http://localhost:8080";
            const paymentResponse = await fetch(`${BACKEND_BASE}/appointment/${appointment.id}/payment`);
            
            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json();
              if (paymentData.appointment) {
                appointment.payment = {
                  payment_status: paymentData.appointment.payment_status,
                  payment_amount: paymentData.appointment.payment_amount,
                  payment_method: paymentData.appointment.payment_method,
                  payment_transaction_id: paymentData.appointment.payment_transaction_id,
                  payment_paid_at: paymentData.appointment.payment_paid_at,
                };
              }
            }
          } catch (paymentErr) {
            console.log("Payment information not available for appointment:", appointment.id);
          }
          
          return appointment;
        })
      );
      
      setList(appointmentsWithPayments);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [username]);

  const update = async (id: string, status: Appointment["status"]) => {
    try {
      await fetch("/api/appointments", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "AarogyaAI-Frontend/1.0.0",
        },
        body: JSON.stringify({ id, status }),
      });
      fetchList();
    } catch {
      // ignore
    }
  };

  const openStartModal = (id: string) => {
    setActiveApptId(id);
    setShowStartModal(true);
  };
  const closeStartModal = () => {
    setShowStartModal(false);
    setActiveApptId(null);
  };

  const openDetailsModal = (id: string) => {
    setDetailsApptId(id);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsApptId(null);
  };

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const startWeekDay = start.getDay();
    const totalDays = end.getDate();
    const grid: Date[] = [];
    // leading blanks from previous month
    for (let i = 0; i < startWeekDay; i++) {
      grid.push(addDays(start, i - startWeekDay));
    }
    // current month days
    for (let d = 1; d <= totalDays; d++) {
      grid.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    // trailing to complete weeks (42 cells max 6 weeks)
    while (grid.length % 7 !== 0) {
      grid.push(addDays(end, grid.length % 7));
    }
    return grid;
  }, [month]);

  const apptsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of list) {
      const dt = new Date(a.scheduledAt);
      const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    // sort each day's appointments by time
    for (const arr of map.values()) {
      arr.sort((x, y) => new Date(x.scheduledAt).getTime() - new Date(y.scheduledAt).getTime());
    }
    return map;
  }, [list]);

  if (loading) return <div className="text-sm opacity-80">Loading...</div>;

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex items-center gap-2">
        <button className={`px-3 py-1 rounded border border-white/20 ${view === "calendar" ? "bg-white/10" : ""}`} onClick={() => setView("calendar")}>Calendar</button>
        <button className={`px-3 py-1 rounded border border-white/20 ${view === "list" ? "bg-white/10" : ""}`} onClick={() => setView("list")}>List</button>
      </div>

      {view === "list" ? (
        <div className="space-y-3">
          {list.length === 0 && <div className="text-sm opacity-80">No appointments.</div>}
          {list.map(a => (
            <div key={a.id} className="border border-white/10 rounded p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">Patient {a.patient.username}</div>
                  <div className="text-sm opacity-80">{new Date(a.scheduledAt).toLocaleString()} {a.reason ? `• ${a.reason}` : ""}</div>
                  {a.payment && (
                    <div className="text-xs mt-1 flex items-center gap-2">
                      <span className={`px-1 py-0.5 rounded ${
                        a.payment.payment_status === 'COMPLETED' 
                          ? 'bg-green-500/20 text-green-400'
                          : a.payment.payment_status === 'PENDING'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {a.payment.payment_status}
                      </span>
                      {a.payment.payment_amount && (
                        <span className="text-green-400">₹{a.payment.payment_amount}</span>
                      )}
                      {a.payment.payment_method && (
                        <span className="opacity-70">{a.payment.payment_method}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="text-xs px-2 py-1 rounded border border-white/20 hover:bg-white/10 transition-colors"
                    onClick={() => openDetailsModal(a.id)}
                  >
                    View Details
                  </button>
                  <div className="text-xs px-2 py-1 rounded border border-white/20">{a.status}</div>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                {a.status === "PENDING" && (
                  <>
                    <button className="px-3 py-1 rounded border border-white/20" onClick={() => update(a.id, "ACCEPTED")}>Accept</button>
                    <button className="px-3 py-1 rounded border border-white/20" onClick={() => update(a.id, "DECLINED")}>Decline</button>
                  </>
                )}
                {a.status === "ACCEPTED" && (
                  <>
                    <Link href={`/doctor/patient/${encodeURIComponent(a.patient.username)}?appointmentId=${encodeURIComponent(a.id)}`} className="px-3 py-1 rounded border border-white/20">Start</Link>
                    <button className="px-3 py-1 rounded border border-white/20" onClick={() => update(a.id, "CANCELLED")}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button className="px-2 py-1 border border-white/20 rounded" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Prev</button>
            <div className="font-medium">{month.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
            <button className="px-2 py-1 border border-white/20 rounded" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next</button>
          </div>
          <div className="grid grid-cols-7 gap-[6px] text-xs opacity-80">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="px-1 py-1 text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, idx) => {
              const isCurrentMonth = d.getMonth() === month.getMonth();
              const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
              const dayAppts = apptsByDay.get(k) || [];
              const isToday = sameDay(d, new Date());
              return (
                <div key={`${d.toISOString()}-${idx}`} className={`min-h-[90px] border rounded p-2 ${isCurrentMonth ? "border-white/10" : "border-white/10 opacity-40"} ${isToday ? "ring-1 ring-foreground/60" : ""}`}>
                  <div className="text-xs font-medium mb-1 flex items-center justify-between">
                    <span>{d.getDate()}</span>
                    {isToday && <span className="inline-block w-2 h-2 rounded-full bg-foreground" aria-label="Today"></span>}
                  </div>
                  <div className="space-y-1">
                    {dayAppts.slice(0,3).map(a => (
                      <div key={a.id} className="text-[11px] px-2 py-1 rounded border border-white/20 truncate">
                        {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {a.patient.username}
                      </div>
                    ))}
                    {dayAppts.length > 3 && (
                      <div className="text-[11px] opacity-70">+{dayAppts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {detailsApptId && (
        <DoctorAppointmentDetails
          appointmentId={detailsApptId}
          isOpen={showDetailsModal}
          onClose={closeDetailsModal}
        />
      )}
    </div>
  );
}


