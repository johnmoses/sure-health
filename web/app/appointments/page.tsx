'use client';

import React, { useEffect, useState } from 'react';
import { listAppointments, deleteAppointment } from '@/xlib/api';
import { Appointment } from '@/xlib/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const data = await listAppointments(token);
        setAppointments(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    if (token) fetchAppointments();
  }, [token]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this appointment?')) return;
    try {
      await deleteAppointment(id, token);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl mb-6">My Appointments</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map(appt => (
            <li key={appt.id} className="border p-4 rounded-md shadow">
              <p><strong>Clinician ID:</strong> {appt.clinician_id}</p>
              <p><strong>Scheduled Time:</strong> {new Date(appt.scheduled_time).toLocaleString()}</p>
              <p><strong>Reason:</strong> {appt.reason || 'N/A'}</p>
              <div className="mt-2 space-x-2">
                <a href={`/appointments/${appt.id}`} className="text-blue-600 underline">View/Edit</a>
                <button onClick={() => handleDelete(appt.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
