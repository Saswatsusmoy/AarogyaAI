"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PatientDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState<"home" | "appointments" | "store" | "book" | "settings">("home");

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role !== "patient") router.replace("/doctor");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "patient") return null;

  const navItems = useMemo(
    () => [
      { key: "home" as const, label: "Home" },
      { key: "appointments" as const, label: "Appointments" },
      { key: "store" as const, label: "Store" },
      { key: "book" as const, label: "Book Appointment" },
      { key: "settings" as const, label: "Settings" },
    ],
    []
  );

  const renderContent = () => {
    switch (active) {
      case "home":
        return (
          <div className="space-y-4">
            <div className="border border-white/10 rounded p-4">
              <h2 className="font-medium mb-2">Welcome</h2>
              <p className="text-sm opacity-80">Overview of your health, quick links, and updates.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-white/10 rounded p-4">
                <h3 className="font-medium mb-2">Next Appointment</h3>
                <p className="text-sm opacity-80">No appointment scheduled.</p>
              </div>
              <div className="border border-white/10 rounded p-4">
                <h3 className="font-medium mb-2">Recent Activity</h3>
                <p className="text-sm opacity-80">No recent activity.</p>
              </div>
            </div>
          </div>
        );
      case "appointments":
        return (
          <div className="border border-white/10 rounded p-4">
            <h2 className="font-medium mb-2">Appointments</h2>
            <p className="text-sm opacity-80">Your upcoming appointments will show here.</p>
          </div>
        );
      case "store":
        return (
          <div className="border border-white/10 rounded p-4">
            <h2 className="font-medium mb-2">Store</h2>
            <p className="text-sm opacity-80">Browse health products and services.</p>
          </div>
        );
      case "book":
        return (
          <div className="border border-white/10 rounded p-4">
            <h2 className="font-medium mb-2">Book Appointment</h2>
            <p className="text-sm opacity-80">Select a date and time to book your appointment.</p>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4">
            <div className="border border-white/10 rounded p-4">
              <h2 className="font-medium mb-2">Settings</h2>
              <p className="text-sm opacity-80">Manage your profile, security, and preferences.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-white/10 rounded p-4">
                <h3 className="font-medium mb-2">Profile</h3>
                <p className="text-sm opacity-80">Name, contact, and basic info.</p>
              </div>
              <div className="border border-white/10 rounded p-4">
                <h3 className="font-medium mb-2">Security</h3>
                <p className="text-sm opacity-80">Password and device settings.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/10 bg-background/70 backdrop-blur-md transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
            <span className="font-semibold">Patient</span>
            <button className="md:hidden text-sm underline" onClick={() => setSidebarOpen(false)}>Close</button>
          </div>
          <nav className="flex-1 p-2">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { setActive(item.key); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${active === item.key ? "bg-foreground text-background" : "hover:bg-white/5"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button className="underline" onClick={() => { logout(); router.replace("/login"); }}>Logout</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 md:ml-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 py-3 border-b border-white/10 bg-background/70 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button className="md:hidden rounded border border-white/20 px-3 py-1 text-sm" onClick={() => setSidebarOpen(true)}>Menu</button>
            <h1 className="text-xl font-semibold hidden sm:block">Patient Dashboard</h1>
          </div>
          <div className="text-sm opacity-80 truncate">{user.username}</div>
        </header>

        <main className="p-4 md:p-8 space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}


