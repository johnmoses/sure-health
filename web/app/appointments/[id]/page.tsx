'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAppointment, updateAppointment } from '@/xlib/api';
import { Appointment } from '@/xlib/types';

export default function AppointmentDetail() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const pathname = usePathname();
  const appointmentId = pathname.split('/').pop();

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    async function fetchAppointment() {
      if (!appointmentId) return;
      try {
        const data = await getAppointment(+appointmentId, token);
        setAppointment(data);
        setReason(data.reason || '');
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    }
    if (token) fetchAppointment();
  }, [appointmentId, token]);

  async function handleSave() {
    if (!appointmentId) return;
    setError(null);
    try {
      await updateAppointment(+appointmentId, { reason }, token);
      alert('Updated successfully!');
      router.back();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!appointment) return <p>Appointment not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Appointment ID #{appointment.id}</h1>
      <p><strong>Clinician ID:</strong> {appointment.clinician_id}</p>
      <p><strong>Scheduled Time:</strong> {new Date(appointment.scheduled_time).toLocaleString()}</p>
      <textarea
        className="w-full p-2 border border-gray-300 rounded mb-4"
        rows={4}
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Reason for appointment"
      />
      {error && <p className="mb-2 text-red-600">{error}</p>}
      <button onClick={handleSave} className="bg-blue-600 px-4 py-2 text-white rounded">Save</button>
      <button onClick={() => router.back()} className="ml-2 px-4 py-2 border rounded">Back</button>
    </div>
  );
}
