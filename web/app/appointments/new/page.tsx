'use client';

import React, { useState } from 'react';
import { createAppointment } from '@/xlib/api';

export default function AppointmentCreatePage() {
  const [clinicianId, setClinicianId] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createAppointment({
        clinician_id: Number(clinicianId),
        scheduled_time: scheduledTime,
        reason,
      }, token);
      setSuccess(true);
      setClinicianId('');
      setScheduledTime('');
      setReason('');
    } catch (err: any) {
      setError(err.message);
    }
  }

  if(success) return <p>Appointment created successfully!</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Create Appointment</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      <label className="block mb-1">Clinician ID:</label>
      <input
        type="number"
        value={clinicianId}
        onChange={e => setClinicianId(e.target.value)}
        required
        className="mb-4 w-full p-2 border rounded"
      />
      <label className="block mb-1">Scheduled Time:</label>
      <input
        type="datetime-local"
        value={scheduledTime}
        onChange={e => setScheduledTime(e.target.value)}
        required
        className="mb-4 w-full p-2 border rounded"
      />
      <label className="block mb-1">Reason:</label>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={4}
        className="mb-4 w-full p-2 border rounded"
        placeholder="Optional reason"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
    </form>
  );
}
