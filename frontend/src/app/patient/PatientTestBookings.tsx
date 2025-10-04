"use client";

import React, { useEffect, useState } from "react";
import BookTestModal from "./BookTestModal";

type TestBooking = {
  id: string;
  testId: string;
  testName: string;
  appointmentId: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  scheduledAt?: string | null;
  notes?: string | null;
  createdAt: string;
};

type MedicalTest = {
  TestID: string;
  TestName: string;
};

type Appointment = {
  id: string;
  scheduledAt: string;
  doctor: { username: string };
  recommendedTests?: string | null;
};

export default function PatientTestBookings({ username }: { username: string }) {
  const [testBookings, setTestBookings] = useState<TestBooking[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalTests, setMedicalTests] = useState<MedicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | undefined>();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllTests, setShowAllTests] = useState(false);

  useEffect(() => {
    fetchTestBookings();
    fetchAppointments();
    fetchMedicalTests();
  }, [username]);

  const fetchMedicalTests = async () => {
    try {
      const res = await fetch('/api/medical-tests?limit=200');
      if (res.ok) {
        const tests = await res.json();
        setMedicalTests(tests);
      }
    } catch (error) {
      console.error('Failed to fetch medical tests:', error);
    }
  };

  const fetchTestBookings = async () => {
    try {
      const res = await fetch(`/api/test-bookings?patientUsername=${encodeURIComponent(username)}`);
      if (res.ok) {
        const bookings = await res.json();
        setTestBookings(bookings);
      } else {
        setError("Failed to fetch test bookings");
      }
    } catch (error) {
      console.error("Error fetching test bookings:", error);
      setError("Failed to fetch test bookings");
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/appointments?username=${encodeURIComponent(username)}&role=patient`);
      if (res.ok) {
        const appointments = await res.json();
        setAppointments(appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentForTest = (appointmentId: string) => {
    return appointments.find(apt => apt.id === appointmentId);
  };

  const getTestName = (testId: string) => {
    const test = medicalTests.find(t => t.TestID === testId);
    return test ? test.TestName : `Test ID: ${testId}`;
  };

  const handleBookTest = (testId: string, appointmentId?: string) => {
    setSelectedTestId(testId);
    setSelectedAppointmentId(appointmentId);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    fetchTestBookings();
    setShowBookingModal(false);
    setSelectedTestId(undefined);
    setSelectedAppointmentId(undefined);
  };

  // Filter medical tests based on search term
  const filteredMedicalTests = medicalTests.filter(test =>
    test.TestName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get tests that haven't been booked yet
  const availableTests = filteredMedicalTests.filter(test =>
    !testBookings.some(booking => booking.testId === test.TestID)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
      case "CONFIRMED":
        return "bg-blue-600/20 text-blue-400 border-blue-600/30";
      case "COMPLETED":
        return "bg-green-600/20 text-green-400 border-green-600/30";
      case "CANCELLED":
        return "bg-red-600/20 text-red-400 border-red-600/30";
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30";
    }
  };

  if (loading) {
    return (
      <div className="border border-white/10 rounded p-4">
        <div className="text-sm opacity-80">Loading test bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-white/10 rounded p-4">
        <div className="text-sm text-red-500">{error}</div>
        <button
          onClick={fetchTestBookings}
          className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Get recommended tests from appointments that haven't been booked yet
  const recommendedTests = appointments
    .filter(apt => apt.recommendedTests)
    .flatMap(apt => {
      try {
        const tests = JSON.parse(apt.recommendedTests || "[]");
        return tests.map((testId: string) => ({
          testId,
          testName: getTestName(testId),
          appointment: apt
        }));
      } catch {
        return [];
      }
    })
    .filter(({ testId }) => !testBookings.some(booking => booking.testId === testId));

  return (
    <div className="space-y-4">
      {/* Book Any Test Section */}
      <div className="border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium mb-1">Book Medical Tests</h3>
            <p className="text-sm opacity-80">Search and book any medical test from our database.</p>
          </div>
          <button
            onClick={() => setShowAllTests(!showAllTests)}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            {showAllTests ? "Hide Tests" : "Browse All Tests"}
          </button>
        </div>

        {showAllTests && (
          <div className="space-y-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none text-sm"
              />
            </div>

            {/* Available Tests */}
            <div className="max-h-64 overflow-y-auto">
              {availableTests.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-sm opacity-80">
                    {searchTerm ? "No tests found matching your search." : "No available tests to book."}
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  {availableTests.slice(0, 20).map((test) => (
                    <div key={test.TestID} className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{test.TestName}</div>
                      </div>
                      <button
                        onClick={() => handleBookTest(test.TestID)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                  {availableTests.length > 20 && (
                    <div className="text-center py-2">
                      <div className="text-xs opacity-70">
                        Showing 20 of {availableTests.length} tests. Use search to find specific tests.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Tests (Not Yet Booked) */}
      {recommendedTests.length > 0 && (
        <div className="border border-blue-500/30 bg-blue-500/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="font-medium text-blue-400">Recommended by Your Doctor</h3>
          </div>
          <p className="text-sm opacity-80 mb-4">
            Your doctor has recommended the following tests. You can book them directly from here.
          </p>
          <div className="space-y-3">
            {recommendedTests.map(({ testId, testName, appointment }) => (
              <div key={`${testId}-${appointment.id}`} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{testName}</div>
                    <div className="text-xs opacity-70 mt-1">
                      Recommended by Dr. {appointment.doctor.username} on{" "}
                      {new Date(appointment.scheduledAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      Appointment: {new Date(appointment.scheduledAt).toLocaleDateString()} at{" "}
                      {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookTest(testId, appointment.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booked Tests */}
      <div className="border border-white/10 rounded p-4">
        <h3 className="font-medium mb-3">Booked Tests</h3>
        {testBookings.length === 0 ? (
          <div className="text-sm opacity-80">No test bookings found.</div>
        ) : (
          <div className="space-y-3">
            {testBookings.map((booking) => {
              const appointment = getAppointmentForTest(booking.appointmentId);
              return (
                <div key={booking.id} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{booking.testName}</div>
                      <div className="text-xs opacity-70 mt-1">
                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        {appointment && (
                          <span>
                            {" "}• From appointment with Dr. {appointment.doctor.username}
                          </span>
                        )}
                      </div>
                      {booking.scheduledAt && (
                        <div className="text-xs opacity-60 mt-1">
                          Scheduled: {new Date(booking.scheduledAt).toLocaleDateString()} at{" "}
                          {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {booking.notes && (
                        <div className="text-xs opacity-60 mt-1">
                          Notes: {booking.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty State */}
      {testBookings.length === 0 && recommendedTests.length === 0 && (
        <div className="border border-white/10 rounded p-4 text-center">
          <div className="text-sm opacity-80">No recommended tests found.</div>
          <div className="text-xs opacity-60 mt-1">
            Tests recommended by your doctor will appear here.
          </div>
        </div>
      )}

      {/* Book Test Modal */}
      <BookTestModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        patientUsername={username}
        preSelectedTestId={selectedTestId}
        appointmentId={selectedAppointmentId}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}
